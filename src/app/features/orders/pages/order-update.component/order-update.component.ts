import { OrderService } from './../../services/order.service';
import { Product } from '../../../product/product.component/models/product-response.model';
import { CommonModule, Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { HeaderCommonComponent } from '../../../shared/header-common.component/header-common.component';
import { BottomMenuComponent } from '../../../shared/bottom-menu.component/bottom-menu.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UnitTextPipe } from '../../../../shared/pipes/unit-text-pipe';
import { ProductPopupSearchComponent } from '../../../product/product-popup-search.component/product-popup-search.component';
import { MenuComponent } from '../../../shared/menu.component/menu.component';
import { ToastrService } from 'ngx-toastr';
import { NgxPrintModule } from 'ngx-print';
import { InventoryDetail } from '../../../inventory-receipt/models/warehouse-receipt-detail.model';
import { UpdateOrderRequest } from '../../models/update-order-request.model';
import { PricePipe } from '../../../../shared/pipes/price-pice';
import {
  Customer,
  CustomerResponse,
} from '../../../customer/models/customer-response.model';
import { Subject } from 'rxjs';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzInputModule } from 'ng-zorro-antd/input';
import { StatusColorPipe } from '../../../../shared/pipes/status-color.pipe';
import { UpdateStatusOrderRequest } from '../../models/update-status-order-request.model';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
} from 'rxjs/operators';
import { CustomerService } from '../../../customer/services/customer-service';
import { DealerLevelService } from '../../../dealer-level/services/dealer-level-service';
import { DealerPriceDetail } from '../../../dealer-level/models/dealer-level-detail.models';

@Component({
  standalone: true,
  selector: 'order-update',
  imports: [
    NgxPrintModule,
    NzInputModule,
    NzAutocompleteModule,
    CommonModule,
    FormsModule,
    NzTableModule,
    NzTableModule,
    NzCheckboxModule,
    NzButtonModule,
    BottomMenuComponent,
    NzIconModule,
    RouterModule,
    ReactiveFormsModule,
    HeaderCommonComponent,
    NzModalModule,
    NzTableModule,
    NzFloatButtonModule,
    UnitTextPipe,
    ProductPopupSearchComponent,
    MenuComponent,
    PricePipe,
    StatusColorPipe,
    NzTabsModule,
  ],
  templateUrl: './order-update.component.html',
  styleUrls: ['./order-update.component.scss'],
})
export class OrderUpdateComponent implements OnInit {
  id: string = '';
  orderCode: string = '';
  statusName: string = '';
  rowVersion: string = '';
  statusId: string = '';
  dealerLevelId: string = '';
  selectedTabIndex = 0;
  searchCustomerKeyword = '';
  customers: Customer[] = [];
  private searchSubject = new Subject<string>();
  orderForm: FormGroup;
  isDark = false;
  dateToday = new Date();
  existingProductIds: string[] = [];
  customerType: number = 1;
  isPopupSearchProducts = false;
  indeterminate = false;
  isSubmitting = false;
  showPrint = false;
  checked = false;
  setOfCheckedId = new Set<string>();
  isMobile = window.innerWidth < 768;
  listOfData: (InventoryDetail & {
    SalePrice?: number;
    TotalPrice?: number;
  })[] = [];
  totalAmount: number = 0;
  customerId: string = '';
  listOfCurrentPageData: Product[] = [];
  editingId: string | null = null;
  editingQuantity: number | null = null;
  inputError = false;
  allData: any[] = [];
  message: any;
  selectedCustomer!: Customer | string;
  searchKeyword = '';
  customer = {
    id: '',
    name: '',
    phone: '',
    address: '',
    description: '',
  };

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private modal: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: ActivatedRoute,
    private orderService: OrderService,
    private customerService: CustomerService,
    private dealerLevelService: DealerLevelService
  ) {
    this.orderForm = this.fb.group({
      customerName: [''],
      phoneNumber: [''],
      deliveryAddress: [''],
      description: [''],
      customerSearch: [''],
      details: this.fb.array([], Validators.required),
    });
    this.orderForm
      .get('customerSearch')
      ?.valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        filter(
          (keyword: any) => typeof keyword === 'string' && keyword.length >= 2
        ),
        switchMap((keyword: string) =>
          this.customerService.SearchCustomer(keyword, 10, 1, false)
        )
      )
      .subscribe((res: CustomerResponse) => {
        this.customers = res.Customers || [];
        this.cdr.detectChanges();
      });

    this.addProduct();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 768;
  }

  ngOnInit(): void {
    this.id = this.router.snapshot.paramMap.get('id')!;
    if (this.id) {
      this.getOrderDetail(this.id);
    }
  }

  statusActions: Record<
    string,
    { type: string; label: string; icon: string; class: string }[]
  > = {
    Nháp: [
      {
        type: 'create',
        label: 'Tạo mới',
        icon: 'plus-circle',
        class: 'bg-blue-500 hover:bg-blue-600 text-white',
      },
      {
        type: 'cancel',
        label: 'Hủy',
        icon: 'close-circle',
        class: 'bg-red-500 hover:bg-red-600 text-white',
      },
    ],
    Hủy: [
      {
        type: 'create',
        label: 'Tạo mới',
        icon: 'plus-circle',
        class: 'bg-blue-500 hover:bg-blue-600 text-white',
      },
      {
        type: 'cancel',
        label: 'Hủy',
        icon: 'close-circle',
        class: 'bg-red-500 hover:bg-red-600 text-white',
      },
    ],
    'Tạo mới': [
      {
        type: 'packing',
        label: 'Bắt đầu đóng hàng',
        icon: 'gift',
        class: 'bg-green-500 hover:bg-green-600 text-white hover:text-white',
      },
      {
        type: 'cancel',
        label: 'Hủy',
        icon: 'close-circle',
        class: 'bg-red-500 hover:bg-red-600 text-white hover:text-white',
      },
    ],
    'Đang đóng hàng': [
      {
        type: 'donePacking',
        label: 'Đã đóng hàng',
        icon: 'check-circle',
        class: 'bg-purple-500 hover:bg-purple-600 text-white hover:text-white',
      },
      {
        type: 'cancel',
        label: 'Hủy',
        icon: 'close-circle',
        class: 'bg-red-500 hover:bg-red-600 text-white hover:text-white',
      },
    ],
    'Đã đóng hàng': [
      {
        type: 'finish',
        label: 'Hoàn thành',
        icon: 'check-circle',
        class: 'bg-green-600 hover:bg-green-700 text-white hover:text-white',
      },
      {
        type: 'cancel',
        label: 'Hủy',
        icon: 'close-circle',
        class: 'bg-red-500 hover:bg-red-600 text-white hover:text-white',
      },
    ],
    'Hoàn thành': [],
  };

  // Xử lý hành động
  handleAction(action: string): void {
    switch (action) {
      case 'create':
        this.createOrder();
        break;
      case 'packing':
        this.packingOrder();
        break;
      case 'donePacking':
        this.completePacking();
        break;
      case 'finish':
        this.finishOrder();
        break;
      case 'cancel':
        this.cancelOrder();
        break;
    }
  }

  createOrder(): void {
    const payload: UpdateStatusOrderRequest = {
      Id: this.id,
      RowVersion: this.rowVersion,
      StatusCode: 'NEW',
      StatusId: this.statusId,
    };
    this.orderService.UpdateStatusOrder(payload).subscribe({
      next: () => {
        this.toastr.success('Cập nhật trạng thái đơn hàng thành công!');
        this.cdr.detectChanges();
        this.getOrderDetail(this.id);
      },
      error: (err) => {
        console.error('Lỗi khi gọi ReadByIdWarehouseReceipt:', err);
        this.toastr.error('Cập nhật trạng thái đơn hàng thất bại!');
      },
    });
  }

  finishOrder(): void {
    const payload: UpdateStatusOrderRequest = {
      Id: this.id,
      RowVersion: this.rowVersion,
      StatusCode: 'COMPLETED',
      StatusId: this.statusId,
    };
    this.orderService.UpdateStatusOrder(payload).subscribe({
      next: () => {
        this.toastr.success('Cập nhật trạng thái đơn hàng thành công!');
        this.cdr.detectChanges();
        this.getOrderDetail(this.id);
      },
      error: (err) => {
        console.error('Lỗi khi gọi ReadByIdWarehouseReceipt:', err);
        this.toastr.error('Cập nhật trạng thái đơn hàng thất bại!');
      },
    });
  }

  cancelOrder(): void {
    const payload: UpdateStatusOrderRequest = {
      Id: this.id,
      RowVersion: this.rowVersion,
      StatusCode: 'CANCELLED',
      StatusId: this.statusId,
    };
    this.orderService.UpdateStatusOrder(payload).subscribe({
      next: () => {
        this.toastr.success('Cập nhật trạng thái đơn hàng thành công!');
        this.cdr.detectChanges();
        this.getOrderDetail(this.id);
      },
      error: (err) => {
        console.error('Lỗi khi gọi ReadByIdWarehouseReceipt:', err);
        this.toastr.error('Cập nhật trạng thái đơn hàng thất bại!');
      },
    });
  }

  completePacking(): void {
    const payload: UpdateStatusOrderRequest = {
      Id: this.id,
      RowVersion: this.rowVersion,
      StatusCode: 'PACKED',
      StatusId: this.statusId,
    };
    this.orderService.UpdateStatusOrder(payload).subscribe({
      next: () => {
        this.toastr.success('Cập nhật trạng thái đơn hàng thành công!');
        this.cdr.detectChanges();
        this.getOrderDetail(this.id);
      },
      error: (err) => {
        console.error('Lỗi khi gọi ReadByIdWarehouseReceipt:', err);
        this.toastr.error('Cập nhật trạng thái đơn hàng thất bại!');
      },
    });
  }

  packingOrder(): void {
    const payload: UpdateStatusOrderRequest = {
      Id: this.id,
      RowVersion: this.rowVersion,
      StatusCode: 'PACKING',
      StatusId: this.statusId,
    };
    this.orderService.UpdateStatusOrder(payload).subscribe({
      next: () => {
        this.toastr.success('Cập nhật trạng thái đơn hàng thành công!');
        this.cdr.detectChanges();
        this.getOrderDetail(this.id);
      },
      error: (err) => {
        console.error('Lỗi khi gọi ReadByIdWarehouseReceipt:', err);
        this.toastr.error('Cập nhật trạng thái đơn hàng thất bại!');
      },
    });
  }

  private applyDealerLevelPrices(dealerPrices: DealerPriceDetail[]): void {
    const priceMap = new Map(dealerPrices.map((p) => [p.ProductId, p.Price]));

    this.listOfData = this.listOfData.map((item) => {
      const newPrice =
        priceMap.get(item.ProductId ?? item.Id) ?? item.SalePrice ?? 0;
      return {
        ...item,
        SalePrice: newPrice,
        TotalPrice: newPrice * (item.Quantity > 0 ? item.Quantity : 1),
      };
    });

    this.allData = [...this.listOfData];
    this.updateTotalAmount();
    this.cdr.detectChanges();
  }

  onCustomerSelected(customer: Customer | undefined): void {
    if (!customer) {
      return;
    }

    this.orderForm.patchValue({
      customerName: customer.Name ?? '',
      phoneNumber: customer.Phone ?? '',
      deliveryAddress: customer.Address ?? '',
      customerSearch: customer.Name ?? '',
    });

    this.customer = {
      id: customer.Id,
      name: customer.Name ?? '',
      phone: customer.Phone ?? '',
      address: customer.Address ?? '',
      description: '',
    };

    //  Nếu customer có DealerLevelId thì gọi API lấy giá
    if (customer.DealerLevelId) {
      this.dealerLevelService
        .ReadByIdDealerLevel(customer.DealerLevelId)
        .subscribe({
          next: (res) => {
            const dealerPrices =
              res.DealerLevel.DealerPriceForDealerLevel || [];
            this.dealerLevelId = res.DealerLevel.Id;
            this.applyDealerLevelPrices(dealerPrices);
          },
          error: (err) => {
            console.error('Load dealer level failed:', err);
          },
        });
    }
  }

  onSearchCustomer(keyword: string): void {
    this.searchSubject.next(keyword);
    if (!keyword) {
      this.customers = [];
    }
  }

  selectCustomer(customer: Customer): void {
    if (!customer) return;
    this.orderForm.patchValue({
      customerName: customer.Name,
      phoneNumber: customer.Phone,
      deliveryAddress: customer.Address,
      description: '',
    });
    this.customer = {
      id: customer.Id,
      name: customer.Name,
      phone: customer.Phone,
      address: customer.Address,
      description: '',
    };
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    console.log('Tab changed:', index);

    this.orderForm.patchValue({
      customerName: '',
      phoneNumber: '',
      deliveryAddress: '',
      customerSearch: '',
    });
  }

  updateExistingProductIds(): void {
    this.existingProductIds = this.listOfData.map((item) => item.ProductId);
  }
  getOrderDetail(id: string): void {
    this.orderService.ReadByIdOrder(id).subscribe({
      next: (res) => {
        console.log('res.Order.Order', res.Order.Order);
        this.customerId = res.Order.Order.CustomerId;
        this.customerType = res.Order.Order.CustomerType;
        if (res.Order.Order.CustomerType === 2) {
          this.orderForm.get('customerName')?.disable();
          this.orderForm.get('phoneNumber')?.disable();
          this.orderForm.get('deliveryAddress')?.disable();
        }
        //  gọi thêm API để lấy DealerLevelId từ Customer
        if (this.customerId) {
          this.customerService.ReadByIdCustomer(this.customerId).subscribe({
            next: (cusRes) => {
              this.dealerLevelId = cusRes.Customer.DealerLevelId ?? '';
              console.log('cusRes:', cusRes);
              console.log(
                'cusRes.Customer.DealerLevelId:',
                cusRes.Customer.DealerLevelId
              );
            },
            error: (err) => {
              console.error('Load customer failed:', err);
            },
          });
        }

        this.orderCode = res.Order.Order.Code;
        this.rowVersion = res.Order.Order.RowVersion;
        this.existingProductIds = res.Order.Order.Details.map(
          (d: any) => d.ProductId
        );
        this.customerId = res.Order.Order.CustomerId;

        this.statusId = res.Order.Order.StatusId;
        this.statusName = res.Order.Order.StatusName;
        (this.totalAmount = res.Order.Order.TotalAmount),
          this.orderForm.patchValue({
            customerName: res.Order.Order.CustomerName || '',
            phoneNumber: res.Order.Order.CustomerPhone || '',
            deliveryAddress: res.Order.Order.DeliveryAddress || '',
            description: res.Order.Order.Description || '',
          });

        // ======= ĐỒNG BỘ DETAILS FORMARRAY =======
        const detailsFormArray = this.orderForm.get('details') as FormArray;
        detailsFormArray.clear();
        console.log(res.Order.Order.Details);

        (res.Order.Order.Details || []).forEach((item: any) => {
          const detailGroup = this.fb.group({
            Id: [item.Id],
            ProductId: [item.ProductId],
            ProductName: [item.ProductName],
            ProductCode: [item.ProductCode],
            Unit: [item.Unit],
            Quantity: [item.Quantity],
            SalePrice: [item.UnitPrice],
            TotalPrice: [item.Total],
          });
          detailsFormArray.push(detailGroup);
          console.log('Pushed detail', detailGroup.value);
        });

        // listOfData = sync với formArray
        this.listOfData = detailsFormArray.controls.map((c) => c.value);
        console.log('listOfData:', this.listOfData);

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi gọi ReadByIdWarehouseReceipt:', err);
      },
    });
  }

  get details(): FormArray {
    return this.orderForm.get('details') as FormArray;
  }

  get isSubmitDisabled(): boolean {
    return (
      this.listOfData.length === 0 ||
      this.listOfData.some((item) => item.Quantity <= 0)
    );
  }

  startEdit(item: InventoryDetail): void {
    this.editingId = item.Id;
    this.editingQuantity = item.Quantity;
  }
  onPrint() {
    const { customerName, phoneNumber, description, deliveryAddress } =
      this.orderForm.value;

    this.customer = {
      id: '',
      name: customerName,
      phone: phoneNumber,
      address: deliveryAddress,
      description: description,
    };

    this.showPrint = true;

    setTimeout(() => {
      window.print();
      this.showPrint = false;
    }, 100);
  }

  // Hàm tính tổng tiền
  updateTotalAmount() {
    this.totalAmount = this.listOfData.reduce(
      (sum, item) => sum + (item.TotalPrice ?? 0),
      0
    );
  }

  saveEdit(
    item: InventoryDetail & { SalePrice?: number; TotalPrice?: number }
  ): void {
    if (this.editingQuantity === null || this.editingQuantity < 1) {
      this.inputError = true;
      setTimeout(() => (this.inputError = false), 300);
      return;
    }

    // Cập nhật số lượng
    item.Quantity = this.editingQuantity;

    // Tính lại thành tiền
    item.TotalPrice = (item.SalePrice ?? 0) * item.Quantity;

    this.editingId = null;
    this.editingQuantity = null;

    // 👉 Cập nhật tổng tiền đơn hàng
    this.updateTotalAmount();

    // Cập nhật lại UI
    this.cdr.detectChanges();
  }

  stopEdit(): void {
    this.editingId = null;
  }

  deleteItem(itemToDelete: any): void {
    this.modal.confirm({
      nzTitle: `Bạn có chắc muốn xóa sản phẩm "<b>${itemToDelete.ProductName}</b>" này?`,
      nzOkText: 'Xóa',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.listOfData = this.listOfData.filter(
          (item) => item.Id !== itemToDelete.Id
        );
        this.updateExistingProductIds();

        this.cdr.detectChanges();
      },
    });
  }

  onSearch(): void {
    this.searchKeyword = this.searchKeyword.trim().toLowerCase();
    if (!this.searchKeyword) {
      this.listOfData = [...this.allData];
      this.updateExistingProductIds();
    } else {
      console.log('allData :', this.allData);

      this.listOfData = this.allData.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(this.searchKeyword)
        )
      );
      this.updateExistingProductIds();
    }
    this.cdr.detectChanges();
  }

  onSelectedProducts(productList: InventoryDetail[]) {
    if (!productList || productList.length === 0) {
      this.closeProductPopup();
      return;
    }

    // Gộp sản phẩm mới vào list
    this.listOfData = [...this.listOfData, ...productList];
    this.existingProductIds = this.listOfData.map((p) => p.Id);

    // Loại bỏ trùng sản phẩm
    this.listOfData = this.listOfData.filter(
      (item, index, self) => index === self.findIndex((t) => t.Id === item.Id)
    );

    // Set giá mặc định (trước khi check DealerLevel)
    this.listOfData = this.listOfData.map((item) => ({
      ...item,
      Quantity: item.Quantity && item.Quantity > 0 ? item.Quantity : 1,
      SalePrice: item.SalePrice ?? 0,
      TotalPrice:
        (item.SalePrice ?? 0) *
        (item.Quantity && item.Quantity > 0 ? item.Quantity : 1),
    }));
    console.log('this.dealerLevelId', this.dealerLevelId);

    // ✅ Nếu customerType = 2 (Đại lý) thì lấy bảng giá DealerLevel
    if (this.customerType === 2 && this.dealerLevelId) {
      this.dealerLevelService
        .ReadByIdDealerLevel(this.dealerLevelId)
        .subscribe({
          next: (res) => {
            const dealerPrices =
              res.DealerLevel.DealerPriceForDealerLevel || [];
            console.log(
              'res.DealerLevel.DealerPriceForDealerLevel',
              res.DealerLevel.DealerPriceForDealerLevel
            );

            this.applyDealerLevelPrices(dealerPrices); // đã có sẵn
            this.allData = [...this.listOfData];
            this.updateTotalAmount();
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Load dealer level failed:', err);
          },
        });
    } else {
      // Nếu khách lẻ thì giữ nguyên giá
      this.allData = [...this.listOfData];
      this.updateTotalAmount();
    }

    this.closeProductPopup();
  }

  closeProductPopup(): void {
    this.isPopupSearchProducts = false;
  }

  addProducts(): void {
    this.isPopupSearchProducts = true;
  }

  addProduct(): void {
    this.details.push(
      this.fb.group({
        productId: ['', Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]],
      })
    );
    this.editingQuantity = 1;
  }

  removeProduct(index: number): void {
    this.details.removeAt(index);
  }

  goBack(): void {
    this.location.back();
  }

  listOfSelection = [
    {
      text: 'Chọn tất cả hàng',
      onSelect: () => {
        this.onAllChecked(true);
      },
    },
    {
      text: 'Chọn hàng chẵn',
      onSelect: () => {
        this.listOfCurrentPageData.forEach((data, index) =>
          this.updateCheckedSet(data.Id, index % 2 !== 0)
        );
        this.refreshCheckedStatus();
      },
    },
    {
      text: 'Chọn hàng lẻ',
      onSelect: () => {
        this.listOfCurrentPageData.forEach((data, index) =>
          this.updateCheckedSet(data.Id, index % 2 === 0)
        );
        this.refreshCheckedStatus();
      },
    },
  ];

  updateCheckedSet(id: string, chk: boolean) {
    chk ? this.setOfCheckedId.add(id) : this.setOfCheckedId.delete(id);
  }
  onItemChecked(id: string, chk: boolean) {
    this.updateCheckedSet(id, chk);
    this.refreshCheckedStatus();
  }
  onAllChecked(val: boolean) {
    this.listOfCurrentPageData.forEach((item) =>
      this.updateCheckedSet(item.Id, val)
    );
    this.refreshCheckedStatus();
  }
  onCurrentPageDataChange(data: readonly Product[]) {
    this.listOfCurrentPageData = [...data];
    this.refreshCheckedStatus();
  }
  refreshCheckedStatus() {
    this.checked = this.listOfCurrentPageData.every((i) =>
      this.setOfCheckedId.has(i.Id)
    );
    this.indeterminate =
      this.listOfCurrentPageData.some((i) => this.setOfCheckedId.has(i.Id)) &&
      !this.checked;
  }
  trackById(index: number, item: InventoryDetail): string {
    return item.Id;
  }

  submitForm(): void {
    const formValues = this.orderForm.getRawValue();

    const payload: UpdateOrderRequest = {
      Id: this.id,
      StatusId: this.statusId,
      RowVersion: this.rowVersion,
      CustomerId: this.customerId,
      CustomerType: this.selectedTabIndex === 0 ? 1 : 2,
      CustomerName: formValues.customerName,
      CustomerPhone: formValues.phoneNumber,
      DeliveryAddress: formValues.deliveryAddress,
      Description: formValues.description,
      Details: this.listOfData.map((item) => ({
        ProductId: item.ProductId ?? item.Id,
        Quantity: item.Quantity,
      })),
    };

    this.orderService.UpdateOrder(payload).subscribe({
      next: () => {
        this.toastr.success('Cập nhật đơn hàng thành công!');
        this.getOrderDetail(this.id);
      },
      error: (err) => {
        const userMessage = err.error?.Message || 'Cập nhật thất bại';
        this.toastr.error(userMessage);
      },
    });
  }
}
