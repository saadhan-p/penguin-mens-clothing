import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import {
  initiateCheckout,
  verifyRazorpayPayment,
  getSiteConfig,
  saveCustomerAddress,
} from '../services/api';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, subtotal, clearCart } = useCart();
  const { customer, isLoggedIn, fetchProfile } = useCustomerAuth();

  const [isCodEnabled, setIsCodEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('penguin_site_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.enableCod !== undefined) return parsed.enableCod !== false;
      }
    } catch (_) {}
    return true;
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Saved Addresses State
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isUsingNewAddress, setIsUsingNewAddress] = useState(false);
  const [shouldSaveAddress, setShouldSaveAddress] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState('Home');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Karnataka',
    pincode: '',
  });

  useEffect(() => {
    loadRazorpayScript();
    if (fetchProfile) fetchProfile();

    getSiteConfig()
      .then((res) => {
        if (res?.data && res.data.enableCod !== undefined) {
          const codAllowed = res.data.enableCod !== false;
          setIsCodEnabled(codAllowed);
          if (!codAllowed) {
            setPaymentMethod('razorpay');
          }
        }
      })
      .catch(() => {});
  }, [fetchProfile]);

  // Sync addresses whenever customer object loads/changes
  useEffect(() => {
    if (customer) {
      const addresses = customer.addresses || [];
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];

      if (defaultAddr && !isUsingNewAddress) {
        setSelectedAddressId(defaultAddr.id);
        setFormData({
          name: defaultAddr.fullName || customer.name || '',
          email: customer.email || '',
          phone: defaultAddr.phone || customer.phone || '',
          address: defaultAddr.line1 ? `${defaultAddr.line1}${defaultAddr.line2 ? `, ${defaultAddr.line2}` : ''}` : '',
          city: defaultAddr.city || '',
          state: defaultAddr.state || 'Karnataka',
          pincode: defaultAddr.pincode || '',
        });
      } else if (!defaultAddr) {
        setIsUsingNewAddress(true);
        setFormData((prev) => ({
          ...prev,
          name: prev.name || customer.name || '',
          email: customer.email || '',
          phone: prev.phone || customer.phone || '',
        }));
      }
    }
  }, [customer]);

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setIsUsingNewAddress(false);
    setFormData({
      name: addr.fullName || customer?.name || '',
      email: customer?.email || formData.email || '',
      phone: addr.phone || customer?.phone || '',
      address: addr.line1 ? `${addr.line1}${addr.line2 ? `, ${addr.line2}` : ''}` : '',
      city: addr.city || '',
      state: addr.state || 'Karnataka',
      pincode: addr.pincode || '',
    });
  };

  const handleToggleNewAddress = () => {
    setIsUsingNewAddress(true);
    setSelectedAddressId(null);
    setFormData({
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: '',
      city: '',
      state: 'Karnataka',
      pincode: '',
    });
  };

  const shippingFee = subtotal >= 1999 ? 0 : 99;
  const discount = subtotal > 1500 ? 100 : 0;
  const finalTotal = Math.max(0, subtotal + shippingFee - discount);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (cartItems.length === 0) {
      setError('Your shopping bag is empty.');
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.pincode) {
      setError('Please complete all shipping address fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      // If customer requested saving the new address to profile
      if (isLoggedIn && isUsingNewAddress && shouldSaveAddress) {
        try {
          await saveCustomerAddress({
            label: newAddressLabel || 'Home',
            fullName: formData.name,
            phone: formData.phone,
            line1: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            isDefault: !(customer?.addresses?.length > 0),
          });
          if (fetchProfile) fetchProfile();
        } catch (saveErr) {
          console.warn('Could not save address to profile:', saveErr);
        }
      }

      const payload = {
        shippingAddress: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          line1: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        items: cartItems.map((item) => ({
          productId: item.id || item._id,
          name: item.name,
          color: item.color || 'Nocturne Black',
          size: item.size || 'M',
          price: item.price,
          quantity: item.qty || 1,
        })),
        paymentMethod: paymentMethod === 'cod' && isCodEnabled ? 'cod' : 'razorpay',
      };

      const res = await initiateCheckout(payload);

      if (res?.isCod) {
        clearCart();
        navigate(`/order/status?txn=${res.orderNumber || res.orderId}`);
        return;
      }

      if (res?.razorpayOrderId) {
        const scriptLoaded = await loadRazorpayScript();

        // Dev mock environment fallback
        if (res.razorpayOrderId.startsWith('order_dev_') || !scriptLoaded || !window.Razorpay) {
          try {
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: res.razorpayOrderId,
              razorpay_payment_id: `pay_dev_${Date.now()}`,
              razorpay_signature: 'mock_signature_dev',
              orderId: res.orderId,
            });
            clearCart();
            navigate(`/order/status?txn=${verifyRes.orderNumber || res.orderNumber || res.orderId}`);
            return;
          } catch (mockErr) {
            console.error('Dev mock verification error:', mockErr);
          }
        }

        const options = {
          key: res.keyId || 'rzp_test_penguin_atelier',
          amount: res.amount,
          currency: res.currency || 'INR',
          name: "Penguin Atelier",
          description: `Order ${res.orderNumber}`,
          image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=120&auto=format&fit=crop&q=80",
          order_id: res.razorpayOrderId,
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
          theme: {
            color: '#111111',
          },
          handler: async function (response) {
            try {
              setIsSubmitting(true);
              const verifyRes = await verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: res.orderId,
              });

              if (verifyRes.success) {
                clearCart();
                navigate(`/order/status?txn=${verifyRes.orderNumber || res.orderNumber || res.orderId}`);
              } else {
                setError(verifyRes.message || 'Payment verification failed.');
                setIsSubmitting(false);
              }
            } catch (verErr) {
              console.error('Signature verification error:', verErr);
              setError(verErr.response?.data?.message || 'Payment verification failed.');
              setIsSubmitting(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (failureResponse) {
          setError(failureResponse.error?.description || 'Payment was declined. Please try again.');
          setIsSubmitting(false);
        });
        rzp.open();
      } else {
        setError(res?.message || 'Could not initiate payment.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || 'Payment initiation failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="content-container" style={{ textAlign: 'center', padding: '100px 16px', minHeight: '65vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 12 }}>Your Bag is Empty</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Explore our atelier collection to add items.</p>
        <button onClick={() => navigate('/collection')} className="btn-solid-accent" style={{ height: 44, padding: '0 24px', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em' }}>
          Explore Collection
        </button>
      </div>
    );
  }

  const inputStyle = {
    width: '100%',
    height: 44,
    padding: '0 14px',
    borderRadius: 8,
    border: '1px solid var(--border-light)',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-primary)',
    outline: 'none',
    fontSize: 13,
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: 6,
    display: 'block',
  };

  const savedAddresses = customer?.addresses || [];

  return (
    <div style={{ width: '100%', padding: '32px 0 90px' }}>
      <div className="content-container" style={{ maxWidth: 1060 }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border-light)', paddingBottom: 18, marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.15em', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
              Atelier Checkout
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '0.02em', margin: 0, textTransform: 'uppercase' }}>
              Shipping & Payment
            </h1>
          </div>
          {!isLoggedIn && (
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login', { state: { from: '/checkout' } })}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              >
                Sign in
              </button>
            </div>
          )}
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 8,
            color: '#ef4444',
            fontSize: 13,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} style={{
          display: 'grid',
          gridTemplateColumns: '1fr minmax(320px, 380px)',
          gap: 40,
          alignItems: 'start',
        }}>
          {/* Left Column: Delivery Details & Payment Choice */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Delivery Address Section */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 12, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  1. Delivery Address
                </div>
                {isLoggedIn && savedAddresses.length > 0 && (
                  <button
                    type="button"
                    onClick={isUsingNewAddress ? () => setIsUsingNewAddress(false) : handleToggleNewAddress}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--brand-accent, #d4a373)',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {isUsingNewAddress ? '← Use Saved Address' : '+ Add New Address'}
                  </button>
                )}
              </div>

              {/* Saved Addresses List (when logged in and has addresses) */}
              {isLoggedIn && savedAddresses.length > 0 && !isUsingNewAddress ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectSavedAddress(addr)}
                        style={{
                          padding: '16px 18px',
                          borderRadius: 8,
                          border: isSelected ? '1.5px solid var(--text-primary)' : '1px solid var(--border-light)',
                          backgroundColor: isSelected ? 'var(--bg-card)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 14,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 20, marginTop: 2, color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 800 }}>{addr.fullName}</span>
                            <span style={{
                              fontSize: 9,
                              padding: '2px 6px',
                              borderRadius: 4,
                              textTransform: 'uppercase',
                              fontWeight: 800,
                              letterSpacing: '0.06em',
                              backgroundColor: 'var(--surface-container-highest, rgba(255,255,255,0.08))',
                              color: 'var(--text-secondary)',
                            }}>
                              {addr.label || 'Home'}
                            </span>
                            {addr.isDefault && (
                              <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.06em', backgroundColor: 'rgba(34,197,94,0.15)', color: '#16a34a' }}>
                                Default
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                            Phone: {addr.phone}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Manual Input Form (for guest or when adding new address) */
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="name@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Mobile Number</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Street Address</label>
                    <input
                      type="text"
                      name="address"
                      required
                      placeholder="Building, street, flat or suite"
                      value={formData.address}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>City</label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="City"
                      value={formData.city}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>State</label>
                    <input
                      type="text"
                      name="state"
                      required
                      placeholder="State"
                      value={formData.state}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>PIN Code</label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      maxLength={6}
                      placeholder="560001"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                  </div>

                  {/* Optional: Save address checkbox if logged in */}
                  {isLoggedIn && (
                    <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)' }}>
                        <input
                          type="checkbox"
                          checked={shouldSaveAddress}
                          onChange={(e) => setShouldSaveAddress(e.target.checked)}
                          style={{ accentColor: 'var(--brand-accent, #d4a373)' }}
                        />
                        Save this address to my profile
                      </label>
                      {shouldSaveAddress && (
                        <select
                          value={newAddressLabel}
                          onChange={(e) => setNewAddressLabel(e.target.value)}
                          style={{
                            height: 28,
                            padding: '0 8px',
                            fontSize: 11,
                            borderRadius: 4,
                            border: '1px solid var(--border-light)',
                            backgroundColor: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                          }}
                        >
                          <option value="Home">Home</option>
                          <option value="Office">Office</option>
                          <option value="Other">Other</option>
                        </select>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 12, padding: 24, border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
                2. Payment Method
              </div>

              {isCodEnabled ? (
                /* When both Razorpay and COD are available: minimal sleek cards */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div
                    onClick={() => setPaymentMethod('razorpay')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: 8,
                      border: paymentMethod === 'razorpay' ? '1px solid var(--text-primary)' : '1px solid var(--border-light)',
                      backgroundColor: paymentMethod === 'razorpay' ? 'var(--bg-card)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: paymentMethod === 'razorpay' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {paymentMethod === 'razorpay' ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>Razorpay Secure</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>UPI, Cards, NetBanking & Wallets</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Instant</span>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('cod')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: 8,
                      border: paymentMethod === 'cod' ? '1px solid var(--text-primary)' : '1px solid var(--border-light)',
                      backgroundColor: paymentMethod === 'cod' ? 'var(--bg-card)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: paymentMethod === 'cod' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {paymentMethod === 'cod' ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>Cash On Delivery</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Pay upon doorstep delivery</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Doorstep</span>
                  </div>
                </div>
              ) : (
                /* When COD is disabled: clean single payment banner */
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 8,
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-card)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--text-primary)' }}>lock</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>Razorpay Secure Checkout</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>UPI (GPay, PhonePe, Paytm), Cards & NetBanking</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--brand-green, #22c55e)', textTransform: 'uppercase' }}>Encrypted</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 12, padding: 24, border: '1px solid var(--border-light)', position: 'sticky', top: 90 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Summary</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 220, overflowY: 'auto', marginBottom: 16 }} className="no-scrollbar">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.size}`} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <img src={item.img} alt={item.name} style={{ width: 42, height: 52, borderRadius: 6, objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Size {item.size} • Qty {item.qty || 1}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>₹{((item.price || 1999) * (item.qty || 1)).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--border-light)', paddingTop: 16, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--brand-green, #22c55e)' }}>
                  <span>Voucher</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Shipping</span>
                <span>{shippingFee === 0 ? <strong style={{ color: 'var(--brand-green, #22c55e)' }}>FREE</strong> : `₹${shippingFee}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: 14, fontSize: 16, fontWeight: 800 }}>
                <span>Total Payable</span>
                <span>₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                height: 48,
                borderRadius: 8,
                backgroundColor: 'var(--text-primary, #ffffff)',
                color: 'var(--bg-primary, #0f0f0f)',
                border: 'none',
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginTop: 20,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                transition: 'opacity 0.2s, transform 0.1s',
              }}
            >
              {isSubmitting
                ? 'Processing…'
                : paymentMethod === 'cod' && isCodEnabled
                  ? `Place Order • ₹${finalTotal.toLocaleString('en-IN')}`
                  : `Pay with Razorpay • ₹${finalTotal.toLocaleString('en-IN')}`}
            </button>

            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
              🔒 256-Bit Encrypted Secure Checkout
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
