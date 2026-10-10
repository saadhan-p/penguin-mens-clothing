import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { checkOrderStatus } from '../services/api';
import { useCart } from '../context/CartContext';

export default function OrderStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const orderRef = searchParams.get('txn') || searchParams.get('orderId') || searchParams.get('id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const [error, setError] = useState('');
  const cartClearedRef = useRef(false);

  useEffect(() => {
    if (!orderRef) {
      setLoading(false);
      setError('No transaction or order reference found.');
      return;
    }

    let isMounted = true;
    let timer = null;

    const fetchStatus = async () => {
      try {
        const res = await checkOrderStatus(orderRef);
        if (!isMounted) return;

        if (res?.success && res.order) {
          setOrder(res.order);

          if (res.order.paymentStatus === 'success' || res.order.status === 'paid' || res.order.paymentProvider === 'cod') {
            if (!cartClearedRef.current) {
              clearCart();
              cartClearedRef.current = true;
            }
            setLoading(false);
            return;
          }

          if (res.order.paymentStatus === 'failed' || res.order.status === 'cancelled') {
            setLoading(false);
            return;
          }

          // If still pending/initiated, poll up to 5 times (every 3 seconds)
          if (pollCount < 5) {
            timer = setTimeout(() => {
              setPollCount((prev) => prev + 1);
            }, 3000);
          } else {
            setLoading(false);
          }
        } else {
          setError(res?.message || 'Order details could not be retrieved.');
          setLoading(false);
        }
      } catch (err) {
        if (!isMounted) return;
        if (pollCount >= 4) {
          setError(err.response?.data?.message || 'Failed to verify transaction status.');
          setLoading(false);
        } else {
          timer = setTimeout(() => {
            setPollCount((prev) => prev + 1);
          }, 3000);
        }
      }
    };

    fetchStatus();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [orderRef, pollCount, clearCart]);

  if (loading) {
    return (
      <div style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        textAlign: 'center',
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          border: '3px solid var(--border-light)',
          borderTopColor: 'var(--brand-accent)',
          animation: 'spin 1s linear infinite',
          marginBottom: 24,
        }} />
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 20,
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 8,
        }}>
          Verifying Order Details...
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 360, lineHeight: 1.5 }}>
          Securely validating transaction confirmation with Razorpay. Please do not refresh.
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        textAlign: 'center',
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 36 }}>search_off</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>
          Order Not Found
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 400, lineHeight: 1.6, marginBottom: 24 }}>
          {error || 'We could not find an active transaction associated with this reference.'}
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/cart')} className="btn-outline" style={{ height: 44, fontSize: 12 }}>
            Return to Cart
          </button>
          <button onClick={() => navigate('/')} className="btn-solid-primary" style={{ height: 44, fontSize: 12 }}>
            Go to Storefront
          </button>
        </div>
      </div>
    );
  }

  // Payment Success or COD Placed
  if (order.paymentStatus === 'success' || order.status === 'paid' || order.paymentProvider === 'cod') {
    const isCod = order.paymentProvider === 'cod';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '40px 16px 80px' }}>
        <div className="content-container" style={{ maxWidth: 640 }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: 'var(--brand-green-bg, rgba(34, 197, 94, 0.15))',
              color: 'var(--brand-green, #22c55e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 44 }}>check_circle</span>
            </div>

            <span style={{
              fontSize: 11,
              letterSpacing: '0.2em',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: 'var(--brand-accent)',
              display: 'block',
              marginBottom: 8,
            }}>
              {isCod ? 'Cash on Delivery Verified' : 'Payment Verified • Razorpay Secure'}
            </span>

            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 26,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              marginBottom: 10,
            }}>
              Order Confirmed
            </h1>

            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 440, margin: '0 auto 24px' }}>
              Your order has been placed with Penguin Atelier. An email receipt and dispatch details have been sent.
            </p>

            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 6,
              padding: '20px',
              textAlign: 'left',
              marginBottom: 28,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: 12, marginBottom: 12, fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Order ID</span>
                <span style={{ fontWeight: 800 }}>{order.orderNumber || order.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: 12, marginBottom: 12, fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>{isCod ? 'Payable on Delivery' : 'Amount Paid'}</span>
                <span style={{ fontWeight: 900, color: 'var(--brand-green, #22c55e)' }}>₹{Math.round(order.total).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: 12, marginBottom: 12, fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method</span>
                <span style={{ fontWeight: 800, textTransform: 'uppercase' }}>{isCod ? 'Cash on Delivery' : 'Razorpay Secure'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Courier Dispatch</span>
                <span style={{ fontWeight: 800 }}>BlueDart Express ({order.trackingNumber || 'EXP-98234710'})</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/account"
                className="btn-outline"
                style={{
                  height: 46,
                  padding: '0 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                View in Account
              </Link>
              <Link
                to="/"
                className="btn-solid-accent"
                style={{
                  height: 46,
                  padding: '0 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Payment Failed
  if (order.paymentStatus === 'failed' || order.status === 'cancelled') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '40px 16px 80px' }}>
        <div className="content-container" style={{ maxWidth: 560 }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 44 }}>cancel</span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 24,
              fontWeight: 900,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              Payment Not Completed
            </h1>

            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 28 }}>
              The payment was cancelled or declined. No amount has been deducted.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link
                to="/cart"
                className="btn-solid-primary"
                style={{
                  height: 46,
                  padding: '0 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}
              >
                Return to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Payment Pending
  return (
    <div style={{
      minHeight: '75vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
      textAlign: 'center',
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        backgroundColor: 'var(--brand-gold-bg, rgba(212, 163, 115, 0.15))',
        color: 'var(--brand-gold, #d4a373)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 36 }}>hourglass_top</span>
      </div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>
        Payment Confirmation Pending
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 440, lineHeight: 1.6, marginBottom: 24 }}>
        We are awaiting final status confirmation. Once the transaction completes, your order will automatically update in your account.
      </p>
      <Link
        to="/account"
        className="btn-outline"
        style={{
          height: 44,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          fontSize: 12,
          fontWeight: 800,
          textTransform: 'uppercase',
        }}
      >
        Go to Account Orders
      </Link>
    </div>
  );
}
