export const AppPermission = {
  order: {
    view: 'order.view',
    create: 'order.create',
    edit: 'order.edit',
  },
  product: {
    view: 'product.view',
  },
  productCategory: {
    view: 'productcategory.view',
  },
  stock: {
    view: 'stock.view',
  },
  customer: {
    view: 'customer.view',
  },
  importReceipt: {
    view: 'importreceipt.view',
    create: 'importreceipt.create',
    edit: 'importreceipt.edit',
  },
  dealerLevel: {
    view: 'dealerlevel.view',
    create: 'dealerlevel.create',
    edit: 'dealerlevel.edit',
  },
  user: {
    view: 'user.view',
  },
  role: {
    view: 'role.view',
  },
} as const;
