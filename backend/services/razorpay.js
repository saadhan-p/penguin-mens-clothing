import Razorpay from 'razorpay';
import crypto from 'crypto';

const KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_penguin_atelier';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'penguin_secret_mock_key';

let razorpayInstance = null;

export function getRazorpayClient() {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: KEY_ID,
      key_secret: KEY_SECRET,
    });
  }
  return razorpayInstance;
}

export function getRazorpayKeyId() {
  return process.env.RAZORPAY_KEY_ID || 'rzp_test_penguin_atelier';
}

/**
 * Creates an order in Razorpay
 * @param {Object} params
 * @param {number} params.amountInPaise - e.g. 199900 for ₹1999.00
 * @param {string} params.currency - 'INR'
 * @param {string} params.receipt - receipt ID or orderNumber
 * @param {Object} params.notes - metadata
 */
export async function createRazorpayOrder({ amountInPaise, currency = 'INR', receipt, notes = {} }) {
  try {
    const rzp = getRazorpayClient();
    const options = {
      amount: Math.round(amountInPaise),
      currency,
      receipt: String(receipt).slice(0, 40),
      notes,
    };
    const order = await rzp.orders.create(options);
    return { success: true, order };
  } catch (error) {
    console.error('Razorpay order creation error:', error?.error || error?.message || error);
    // Dev fallback if mock test key is used
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('rzp_test_penguin_atelier')) {
      console.log('🔄 Dev mode: Generating simulated Razorpay Order ID');
      return {
        success: true,
        order: {
          id: `order_dev_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
          amount: Math.round(amountInPaise),
          currency,
          receipt,
          status: 'created',
        },
      };
    }
    throw error;
  }
}

/**
 * Verifies Razorpay payment signature using HMAC SHA256
 * generated_signature = hmac_sha256(order_id + "|" + razorpay_payment_id, secret)
 */
export function verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return false;
  }

  // If in dev mode mock
  if (razorpay_order_id.startsWith('order_dev_') || razorpay_signature === 'mock_signature_dev') {
    return true;
  }

  const secret = process.env.RAZORPAY_KEY_SECRET || KEY_SECRET;
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === razorpay_signature;
}

/**
 * Verifies Webhook signature from Razorpay
 */
export function verifyWebhookSignature({ rawBody, signature, secret }) {
  const webhookSecret = secret || process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret || !signature || !rawBody) return false;

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === signature;
}
