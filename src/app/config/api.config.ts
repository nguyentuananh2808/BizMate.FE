export const ApiUrls = {
  baseUrl: 'http://192.168.1.130:8088/v1',

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
