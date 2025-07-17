export const ApiUrls = {
  baseUrl: 'https://localhost:44349/v1',

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
  },
  auth: {
    login: '/auth/login',
    register: '/user/register',
    verifyOtp: '/user/verify',
  },
};
