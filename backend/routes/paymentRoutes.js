import express from 'express';
import { attachCustomerIfPresent } from '../middleware/customerAuth.js';
import {
  createOrderAndInitiatePayment,
  verifyRazorpayPaymentHandler,
  razorpayWebhook,
  getRazorpayKey,
  checkOrderStatus,
} from '../controllers/paymentController.js';

const router = express.Router();

// Razorpay Public Key ID endpoint
router.get('/razorpay/key', getRazorpayKey);

// Customer checkout route (attaches customer if logged in)
router.post('/checkout', attachCustomerIfPresent, createOrderAndInitiatePayment);

// Razorpay Payment Verification
router.post('/razorpay/verify', verifyRazorpayPaymentHandler);

// Razorpay S2S Webhook
router.post('/razorpay/webhook', razorpayWebhook);

// Order status check route (used by frontend on redirect / status page)
router.get('/status/:orderRef', checkOrderStatus);

export default router;
