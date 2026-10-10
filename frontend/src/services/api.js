import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== PRODUCTS API ====================
export const getProducts = async (params = {}) => {
  try {
    const res = await api.get('/products', { params });
    return res.data;
  } catch (err) {
    console.warn('API getProducts fallback:', err.message);
    return { success: false, data: [] };
  }
};

export const getProductById = async (id) => {
  try {
    const res = await api.get(`/products/${id}`);
    return res.data;
  } catch (err) {
    console.warn('API getProductById fallback:', err.message);
    return { success: false, data: null };
  }
};

export const createProduct = async (productData) => {
  const res = await api.post('/products', productData);
  return res.data;
};

export const updateProduct = async (id, productData) => {
  const res = await api.put(`/products/${id}`, productData);
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};

export const bulkDeleteProducts = async (ids) => {
  const res = await api.post('/products/bulk-delete', { ids });
  return res.data;
};

export const bulkUpdateProducts = async (ids, updates) => {
  const res = await api.post('/products/bulk-update', { ids, updates });
  return res.data;
};

export const seedInitialProducts = async () => {
  const res = await api.post('/products/seed/initial');
  return res.data;
};

// ==================== CATEGORIES API ====================
export const getCategories = async () => {
  try {
    const res = await api.get('/categories');
    return res.data;
  } catch (err) {
    console.warn('API getCategories fallback:', err.message);
    const fallbackCats = [
      { name: 'Shirts', slug: 'shirts', _id: 'cat_1', isActive: true },
      { name: 'Jackets', slug: 'jackets', _id: 'cat_2', isActive: true },
      { name: 'Tees', slug: 'tees', _id: 'cat_3', isActive: true },
      { name: 'Tailoring', slug: 'tailoring', _id: 'cat_4', isActive: true },
      { name: 'Jeans', slug: 'jeans', _id: 'cat_5', isActive: true },
      { name: 'Footwear', slug: 'footwear', _id: 'cat_6', isActive: true },
      { name: 'Knitwear', slug: 'knitwear', _id: 'cat_7', isActive: true },
      { name: 'Accessories', slug: 'accessories', _id: 'cat_8', isActive: true },
      { name: 'Formals', slug: 'formals', _id: 'cat_9', isActive: true },
    ];
    return { success: true, data: fallbackCats };
  }
};

export const getAdminCategories = async () => {
  try {
    const res = await api.get('/categories/admin/list');
    return res.data;
  } catch (err) {
    console.warn('API getAdminCategories fallback:', err.message);
    let saved = [];
    try {
      const raw = localStorage.getItem('penguin_categories');
      if (raw) saved = JSON.parse(raw);
    } catch (_) {}

    if (saved.length > 0) return { success: true, data: saved };

    const fallbackCats = [
      { name: 'Shirts', slug: 'shirts', _id: 'cat_1', description: 'Curated tailored and casual shirts in luxury poplin and linen', productCount: 10, isActive: true, sortOrder: 1 },
      { name: 'Jackets', slug: 'jackets', _id: 'cat_2', description: 'Architectural outerwear, bombers, and structured overcoats', productCount: 8, isActive: true, sortOrder: 2 },
      { name: 'Tees', slug: 'tees', _id: 'cat_3', description: 'Heavyweight organic cotton tees with relaxed proportions', productCount: 6, isActive: true, sortOrder: 3 },
      { name: 'Tailoring', slug: 'tailoring', _id: 'cat_4', description: 'Precision trousers and minimal structured tailoring', productCount: 4, isActive: true, sortOrder: 4 },
      { name: 'Jeans', slug: 'jeans', _id: 'cat_5', description: 'Japanese selvedge denim and straight-leg cuts', productCount: 4, isActive: true, sortOrder: 5 },
      { name: 'Footwear', slug: 'footwear', _id: 'cat_6', description: 'Monolith lug derbies, minimal leather boots, and loafers', productCount: 3, isActive: true, sortOrder: 6 },
      { name: 'Knitwear', slug: 'knitwear', _id: 'cat_7', description: 'Heavyweight ribbed merino wool and brushed mohair', productCount: 3, isActive: true, sortOrder: 7 },
      { name: 'Accessories', slug: 'accessories', _id: 'cat_8', description: 'Full-grain leather belts, silk scarves, and minimalist goods', productCount: 2, isActive: true, sortOrder: 8 },
      { name: 'Formals', slug: 'formals', _id: 'cat_9', description: 'Evening formalwear and black-tie essentials', productCount: 0, isActive: true, sortOrder: 9 },
    ];
    return { success: true, data: fallbackCats };
  }
};

export const createCategory = async (categoryData) => {
  try {
    const res = await api.post('/categories/admin', categoryData);
    return res.data;
  } catch (err) {
    if (err.response?.data) return err.response.data;
    // Local fallback
    const newCat = {
      _id: `cat_${Date.now()}`,
      name: categoryData.name,
      slug: categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: categoryData.description || '',
      isActive: categoryData.isActive !== false,
      productCount: 0,
      sortOrder: categoryData.sortOrder || 10,
    };
    return { success: true, data: newCat, message: `Category "${newCat.name}" created` };
  }
};

export const updateCategory = async (id, updateData) => {
  try {
    const res = await api.put(`/categories/admin/${id}`, updateData);
    return res.data;
  } catch (err) {
    if (err.response?.data) return err.response.data;
    return { success: true, data: { _id: id, ...updateData }, message: 'Category updated' };
  }
};

export const deleteCategory = async (id) => {
  try {
    const res = await api.delete(`/categories/admin/${id}`);
    return res.data;
  } catch (err) {
    if (err.response?.data) return err.response.data;
    return { success: false, message: err.message || 'Failed to delete category' };
  }
};

// ==================== SITE CONFIG API ====================
export const getSiteConfig = async () => {
  try {
    const res = await api.get('/config');
    if (res.data?.data) {
      try {
        localStorage.setItem('penguin_site_config', JSON.stringify(res.data.data));
      } catch (_) {}
      return res.data;
    }
  } catch (err) {
    console.warn('API getSiteConfig fallback:', err.message);
  }
  let savedData = {};
  try {
    const saved = localStorage.getItem('penguin_site_config');
    if (saved) savedData = JSON.parse(saved);
  } catch (_) {}
  return {
    success: true,
    data: {
      marqueeText: 'FW25 Drop 01 Available Worldwide • Complimentary Express Atelier Shipping',
      archiveText: 'Archive Curated // FW25',
      heroHeadline: 'New Season Drop',
      heroSubheadline: 'Minimalist silhouettes engineered for modern architectural movement. Double-faced wool, tech poplin, and structured forms.',
      heroImage: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop',
      heroDropTag: 'Drop 01 // Autumn Winter 2025',
      showWinterDrop: true,
      enableCod: savedData.enableCod !== undefined ? savedData.enableCod : true,
      winterDropTitle: 'WINTER DROP 01',
      winterDropSubtitle: 'Limited capsule — Structured outerwear, heavyweight knitwear & tech bombers. Only 100 units per style.',
      winterDropCta: 'Shop Winter Drop',
      winterDropImage: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop',
      ...savedData,
    },
  };
};

export const updateSiteConfig = async (configData) => {
  try {
    localStorage.setItem('penguin_site_config', JSON.stringify(configData));
  } catch (_) {}
  const res = await api.put('/config', configData);
  return res.data;
};

// ==================== ORDERS API ====================
export const getOrders = async () => {
  try {
    const res = await api.get('/orders');
    return res.data;
  } catch (err) {
    console.warn('API getOrders fallback:', err.message);
    return { success: false, data: [] };
  }
};

export const createOrder = async (orderData) => {
  try {
    const res = await api.post('/orders', orderData);
    return res.data;
  } catch (err) {
    console.warn('API createOrder fallback (local creation):', err.message);
    return {
      success: true,
      data: {
        orderNumber: `PGN-FW25-${Math.floor(1000 + Math.random() * 9000)}`,
        ...orderData,
        createdAt: new Date().toISOString(),
      },
    };
  }
};

export const getOrderById = async (id) => {
  try {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  } catch (err) {
    if (err.response?.data) return err.response.data;
    return { success: false, message: 'Could not fetch order details' };
  }
};

export const trackOrder = async (query) => {
  try {
    const res = await api.get(`/orders/track/${encodeURIComponent(query)}`);
    return res.data;
  } catch (err) {
    if (err.response?.data) return err.response.data;
    return { success: false, message: 'Could not connect to tracking server' };
  }
};

export const updateOrderStatus = async (id, updateData) => {
  const res = await api.put(`/orders/${id}`, updateData);
  return res.data;
};

// ==================== AUTHENTICATION & SUPERADMIN API ====================
export const adminLogin = (creds) =>
  api.post('/auth/admin/login', creds).then((r) => r.data).catch((err) => err.response?.data || { success: false, message: 'Authentication error' });

export const adminChangeTempPassword = (changeToken, newPassword) =>
  api.post('/auth/admin/change-temp-password', { changeToken, newPassword }).then((r) => r.data).catch((err) => err.response?.data || { success: false, message: 'Failed to update password' });

export const adminMfaSetup = (setupToken) =>
  api.post('/auth/admin/mfa/setup', { setupToken }).then((r) => r.data).catch((err) => err.response?.data || { success: false, message: 'Failed to initialize MFA' });

export const adminMfaVerifySetup = (setupToken, token) =>
  api.post('/auth/admin/mfa/verify-setup', { setupToken, token }).then((r) => r.data).catch((err) => err.response?.data || { success: false, message: 'Failed to verify MFA' });

export const adminLoginVerifyMfa = (tempToken, token, isBackupCode) =>
  api.post('/auth/admin/mfa/verify-code', { tempToken, token, isBackupCode }).then((r) => r.data).catch((err) => err.response?.data || { success: false, message: 'Verification failed' });

export const adminLogout = () =>
  api.post('/auth/admin/logout').then((r) => r.data).catch(() => ({ success: true }));

export const getAdminProfile = () =>
  api.get('/auth/admin/me').then((r) => r.data);

export const listAdminUsers = () =>
  api.get('/auth/superadmin/users').then((r) => r.data).catch(() => ({ success: false, data: [] }));

export const createAdminUser = (data) =>
  api.post('/auth/superadmin/users', data).then((r) => r.data).catch((err) => err.response?.data || { success: false, message: 'Failed to create admin' });

export const updateAdminUser = (id, data) =>
  api.put(`/auth/superadmin/users/${id}`, data).then((r) => r.data).catch((err) => err.response?.data || { success: false, message: 'Failed to update admin' });

export const deleteAdminUser = (id) =>
  api.delete(`/auth/superadmin/users/${id}`).then((r) => r.data).catch((err) => err.response?.data || { success: false, message: 'Failed to delete admin' });

export const resetAdminMfa = (id) =>
  api.post(`/auth/superadmin/users/${id}/reset-mfa`).then((r) => r.data).catch((err) => err.response?.data || { success: false, message: 'Failed to reset MFA' });

export const resetAdminPassword = (id) =>
  api.post(`/auth/superadmin/users/${id}/reset-password`).then((r) => r.data).catch((err) => err.response?.data || { success: false, message: 'Failed to reset password' });


// ==================== IMAGE UPLOAD API ====================
export const uploadProductImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await axios.post(`${API_BASE}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const uploadMultipleProductImages = async (files) => {
  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('images', files[i]);
  }
  const res = await axios.post(`${API_BASE}/upload/multiple`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// ==================== CUSTOMER AUTHENTICATION API ====================
export const customerSignup = (data) =>
  api.post('/customer/signup', data).then((r) => r.data);

export const customerLogin = (data) =>
  api.post('/customer/login', data).then((r) => r.data);

export const customerLogout = () =>
  api.post('/customer/logout').then((r) => r.data).catch(() => ({ success: true }));

export const getCustomerProfile = () =>
  api.get('/customer/me').then((r) => r.data);

export const getCustomerOrders = () =>
  api.get('/customer/orders').then((r) => r.data);

export const saveCustomerAddress = (data) =>
  api.post('/customer/address', data).then((r) => r.data);

export const deleteCustomerAddress = (id) =>
  api.delete(`/customer/address/${id}`).then((r) => r.data);

export const verifyCustomerEmail = (token) =>
  api.get(`/customer/verify-email/${token}`).then((r) => r.data);

export const resendCustomerVerification = (email) =>
  api.post('/customer/resend-verification', { email }).then((r) => r.data);

export const requestPasswordReset = (email) =>
  api.post('/customer/forgot-password', { email }).then((r) => r.data);

export const resetPassword = (token, newPassword) =>
  api.post('/customer/reset-password', { token, newPassword }).then((r) => r.data);

export const getAdminCustomers = (params = {}) =>
  api.get('/customer/admin/list', { params }).then((r) => r.data);

// ==================== RAZORPAY / CHECKOUT API ====================
export const getRazorpayKey = () =>
  api.get('/payments/razorpay/key').then((r) => r.data);

export const initiateCheckout = (payload) =>
  api.post('/payments/checkout', payload).then((r) => r.data);

export const verifyRazorpayPayment = (payload) =>
  api.post('/payments/razorpay/verify', payload).then((r) => r.data);

// Backward compatible alias
export const initiatePhonePeCheckout = initiateCheckout;

export const checkOrderStatus = (orderRef) =>
  api.get(`/payments/status/${orderRef}`).then((r) => r.data);

export default api;

