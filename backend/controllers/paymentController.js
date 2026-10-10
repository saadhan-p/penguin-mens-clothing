import crypto from 'crypto';
import prisma from '../config/prisma.js';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  getRazorpayKeyId,
} from '../services/razorpay.js';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * Helper to finalize order and atomically decrement product inventory
 */
async function finalizeOrderPayment(orderId, paymentId = null, signature = null) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) return null;
  if (order.paymentStatus === 'success') return order; // Already finalized

  // Atomic stock decrement per item
  for (const item of order.items) {
    if (item.productId) {
      const updated = await prisma.product.updateMany({
        where: {
          id: item.productId,
          stock: { gte: item.quantity },
        },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      if (updated.count === 0) {
        console.warn(`🚨 Stock depleted for productId ${item.productId} (${item.name}) during order ${order.id}.`);
      }
    }
  }

  return await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'paid',
      orderStatus: 'Processing',
      paymentStatus: 'success',
      razorpayPaymentId: paymentId || order.razorpayPaymentId,
      razorpaySignature: signature || order.razorpaySignature,
    },
    include: { items: true },
  });
}

/**
 * Returns Razorpay Public Key ID to client
 */
export const getRazorpayKey = async (req, res) => {
  return res.status(200).json({
    success: true,
    keyId: getRazorpayKeyId(),
  });
};

/**
 * Create Order & Initiate Razorpay Payment / COD
 */
export const createOrderAndInitiatePayment = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod = 'razorpay' } = req.body;
    const customerId = req.customer?.id || null;

    if (!items?.length || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Cart items and shipping address are required.',
      });
    }

    // Recalculate price server-side from PostgreSQL Product table
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      let product = null;
      if (item.productId) {
        product = await prisma.product.findUnique({ where: { id: item.productId } });
      }

      const price = product ? product.price : (Number(item.price) || 0);
      const name = product ? product.name : (item.name || 'Atelier Item');

      if (product && product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is currently out of stock.`,
        });
      }

      const itemQty = Math.max(1, Number(item.quantity || item.qty) || 1);
      subtotal += price * itemQty;

      orderItemsData.push({
        productId: product ? product.id : (item.productId || `prod_${Date.now()}`),
        name,
        price,
        size: item.size || 'M',
        color: item.color || 'Default',
        quantity: itemQty,
      });
    }

    const shippingFee = subtotal >= 1999 ? 0 : 99;
    const discount = subtotal > 1500 ? 100 : 0;
    const total = Math.max(0, subtotal + shippingFee - discount);
    const orderNumber = `PGN-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // If COD, check if enabled by store admin
    if (paymentMethod === 'cod') {
      const siteConfig = await prisma.siteConfig.findFirst();
      if (siteConfig && siteConfig.enableCod === false) {
        return res.status(400).json({
          success: false,
          message: 'Cash on Delivery (COD) is currently disabled. Please select Razorpay online payment.',
        });
      }

      const order = await prisma.order.create({
        data: {
          orderNumber,
          customerId,
          customerName: shippingAddress.name || req.customer?.name || 'Guest Client',
          email: shippingAddress.email || req.customer?.email || 'client@penguin.com',
          phone: shippingAddress.phone || req.customer?.phone || null,
          subtotal,
          shippingFee,
          discount,
          total,
          status: 'pending',
          orderStatus: 'Processing',
          shippingAddress,
          paymentProvider: 'cod',
          paymentMethod: 'cod',
          paymentStatus: 'pending',
          trackingNumber: `EXP-${Math.floor(10000000 + Math.random() * 90000000)}`,
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      // Deduct stock for COD order
      for (const item of order.items) {
        if (item.productId) {
          await prisma.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return res.status(201).json({
        success: true,
        isCod: true,
        orderNumber: order.orderNumber,
        orderId: order.id,
        total: order.total,
        message: 'Order placed successfully with Cash on Delivery.',
      });
    }

    // 1. Create Razorpay Order
    const amountInPaise = Math.round(total * 100);
    const rzpResult = await createRazorpayOrder({
      amountInPaise,
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        customerName: shippingAddress.name || req.customer?.name || 'Penguin Client',
        customerEmail: shippingAddress.email || req.customer?.email || 'client@penguin.com',
        customerPhone: shippingAddress.phone || '',
      },
    });

    const razorpayOrder = rzpResult.order;

    // 2. Persist order in PostgreSQL
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        customerName: shippingAddress.name || req.customer?.name || 'Guest Client',
        email: shippingAddress.email || req.customer?.email || 'client@penguin.com',
        phone: shippingAddress.phone || req.customer?.phone || null,
        subtotal,
        shippingFee,
        discount,
        total,
        status: 'pending',
        orderStatus: 'Processing',
        shippingAddress,
        paymentProvider: 'razorpay',
        paymentMethod: 'razorpay',
        paymentStatus: 'initiated',
        razorpayOrderId: razorpayOrder.id,
        trackingNumber: `EXP-${Math.floor(10000000 + Math.random() * 90000000)}`,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    return res.status(200).json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency || 'INR',
      keyId: getRazorpayKeyId(),
      customer: {
        name: order.customerName,
        email: order.email,
        phone: order.phone,
      },
    });
  } catch (error) {
    console.error('Order/payment initiation error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Something went wrong. Please try again.' });
  }
};

/**
 * Verify Razorpay Payment Signature
 */
export const verifyRazorpayPaymentHandler = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment signature verification parameters.',
      });
    }

    const isValid = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      console.warn(`⚠️ Razorpay signature verification failed for order: ${razorpay_order_id}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Transaction verification failed.',
      });
    }

    // Find the corresponding order
    let order = null;
    if (orderId) {
      order = await prisma.order.findUnique({ where: { id: orderId } });
    }
    if (!order && razorpay_order_id) {
      order = await prisma.order.findUnique({ where: { razorpayOrderId: razorpay_order_id } });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Associated order not found for verification.',
      });
    }

    const finalizedOrder = await finalizeOrderPayment(order.id, razorpay_payment_id, razorpay_signature);

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      orderNumber: finalizedOrder.orderNumber,
      orderId: finalizedOrder.id,
      paymentStatus: finalizedOrder.paymentStatus,
    });
  } catch (error) {
    console.error('Razorpay payment verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during payment verification.',
    });
  }
};

/**
 * Razorpay Server Webhook Callback
 */
export const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (secret && signature) {
      const rawBody = JSON.stringify(req.body);
      const isWebhookValid = verifyWebhookSignature({ rawBody, signature, secret });
      if (!isWebhookValid) {
        console.warn('⚠️ Razorpay webhook signature mismatch');
        return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
      }
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload?.payment?.entity;
    const orderEntity = req.body.payload?.order?.entity;
    const rzpOrderId = paymentEntity?.order_id || orderEntity?.id;

    if (rzpOrderId && (event === 'payment.captured' || event === 'order.paid')) {
      console.log(`📥 Razorpay Webhook [${event}] received for order: ${rzpOrderId}`);
      const order = await prisma.order.findUnique({ where: { razorpayOrderId: rzpOrderId } });
      if (order) {
        await finalizeOrderPayment(order.id, paymentEntity?.id);
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return res.status(500).json({ success: false, message: 'Webhook error' });
  }
};

/**
 * Customer status check upon return/navigation
 */
export const checkOrderStatus = async (req, res) => {
  try {
    const { orderRef } = req.params;

    let order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: orderRef },
          { id: orderRef },
          { razorpayOrderId: orderRef },
          { merchantTxnId: orderRef },
        ],
      },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.status(200).json({
      success: true,
      order: {
        id: order.orderNumber || order.id,
        rawId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentProvider: order.paymentProvider,
        total: order.total,
        trackingNumber: order.trackingNumber,
        items: order.items,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('Order status check error:', error);
    return res.status(500).json({ success: false, message: 'Could not check order status.' });
  }
};
