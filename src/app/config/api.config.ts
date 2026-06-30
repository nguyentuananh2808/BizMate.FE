const browserHost =
  typeof window !== 'undefined' && window.location.hostname
    ? window.location.hostname
    : 'localhost';
const normalizedHost = browserHost === '0.0.0.0' ? 'localhost' : browserHost;
const apiHost = normalizedHost.includes(':')
  ? `[${normalizedHost}]`
  : normalizedHost;
const apiProtocol =
  typeof window !== 'undefined' && window.location.protocol === 'https:'
    ? 'https'
    : 'http';
const apiPort = apiProtocol === 'https' ? '5052' : '5051';
const apiBaseUrl = `${apiProtocol}://${apiHost}:${apiPort}/v1`;

export const ApiUrls = {
  baseUrl: apiBaseUrl,

  productCategory: {
    getAll: '/product-category/GetAll',
    getById: (id: string) => `/product-category/${id}`,
    create: '/product-category',
    update: `/product-category`,
    delete: (id: string) => `/product-category/${id}`,
  },

  product: {
    search: '/product/search',
    create: '/product',
    update: '/product',
    delete: (id: string) => `/product/${id}`,
    readById: (id: string) => `/product/${id}`,
  },

  status: {
    getByGroup: '/status/getbygroup',
  },

  auth: {
    login: '/auth/login',
    register: '/user/register',
    verifyOtp: '/user/verify',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },

  warehouseReceipt: {
    search: '/import-receipt/search',
    readById: '/import-receipt',
    create: '/import-receipt',
    update: '/import-receipt',
    updateStatus: '/import-receipt/update_status',
  },

  order: {
    search: '/order/search',
    readById: '/order',
    create: '/order',
    update: '/order',
    updateStatus: '/order/update_status',
    export: (id: string) => `/order/${id}/export`,
    useBorrowed: (id: string) => `/order/${id}/use-borrowed`,
  },

  notification: {
    get: '/notification/get-notification',
    update: '/notification',
  },

  customer: {
    search: '/customer/search',
    getById: (id: string) => `/customer/${id}`,
    create: '/customer',
    update: `/customer`,
    delete: (id: string) => `/customer/${id}`,
  },

  dealerLevel: {
    search: '/dealer-level/search',
    readById: `/dealer-level`,
    create: '/dealer-level',
    update: `/dealer-level`,
    delete: (id: string) => `/dealer-level/${id}`,
  },

  dealerPrice: {
    create: '/dealer-price',
    update: `/dealer-price`,
    delete: (id: string) => `/dealer-price/${id}`,
  },

  // ── MỚI THÊM: Quản lý sản phẩm theo serial number ─────────────────────────
  permission: {
    getAll: '/permission',
  },

  role: {
    getAll: '/role',
    getById: (id: string) => `/role/${id}`,
    create: '/role',
    update: (id: string) => `/role/${id}`,
    delete: (id: string) => `/role/${id}`,
  },

  userRole: {
    roles: (userId: string) => `/user/${userId}/role`,
    role: (userId: string, roleId: string) => `/user/${userId}/role/${roleId}`,
  },

  userPermission: {
    get: (userId: string) => `/user/${userId}/permissions`,
    permissions: (userId: string) => `/user/${userId}/permissions`,
    permission: (userId: string, permissionId: string) =>
      `/user/${userId}/permissions/${permissionId}`,
  },

  user: {
    search: '/user/search',
    create: '/user',
    update: (id: string) => `/user/${id}`,
    delete: (id: string) => `/user/${id}`,
  },

  technician: {
    getAll: '/technician',
  },

  technicianHolding: {
    getAll: '/technician-holdings',
    overdue: '/technician-holdings/overdue',
    return: '/technician-holdings/return',
    requests: '/technician-holdings/requests',
    approveRequest: (id: string) => `/technician-holdings/requests/${id}/approve`,
    rejectRequest: (id: string) => `/technician-holdings/requests/${id}/reject`,
    use: '/technician-holdings/use',
  },

  report: {
    salesByProduct: '/report/sales-by-product',
  },

  productItem: {
    getByProduct: '/product-item',
    getBySN:      (sn: string) => `/product-item/sn/${encodeURIComponent(sn)}`,
    getHistory:   (sn: string) => `/product-item/sn/${encodeURIComponent(sn)}/history`,
    import:       '/product-item/import',
    export:       '/product-item/export',
    return:       '/product-item/return',
    adjust:       '/product-item/adjust',
  },
};
