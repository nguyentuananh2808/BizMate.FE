export const ApiUrls = {
 baseUrl: 'http://103.163.118.228/v1',
 //baseUrl: 'https://localhost:44349/v1',
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
  },
  auth: {
    login: '/auth/login',
    register: '/user/register',
    verifyOtp: '/user/verify',
  },
  warehouseReceipt: {
    search: '/inventory-receipt/search',
    readById: '/inventory-receipt',
    create: '/inventory-receipt',
    update: '/inventory-receipt',
  },
};
