import { Product } from './../../../product/product.component/models/product-response.model';
import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { HeaderCommonComponent } from '../../../shared/header-common.component/header-common.component';
import { NzInputModule } from 'ng-zorro-antd/input';
import { BottomMenuComponent } from '../../../shared/bottom-menu.component/bottom-menu.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { Router, RouterModule } from '@angular/router';
import { UnitTextPipe } from '../../../../shared/pipes/unit-text-pipe';
import { ProductPopupSearchComponent } from '../../../product/product-popup-search.component/product-popup-search.component';
import { MenuComponent } from '../../../shared/menu.component/menu.component';
import { ToastrService } from 'ngx-toastr';
import { NgxPrintModule } from 'ngx-print';
import { InventoryDetail } from '../../../inventory-receipt/models/warehouse-receipt-detail.model';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { Subject, of } from 'rxjs';
import { CustomerService } from '../../../customer/services/customer-service';
import {
  Customer,
  CustomerResponse,
} from '../../../customer/models/customer-response.model';
import { PricePipe } from '../../../../shared/pipes/price-pice';
import { forkJoin } from 'rxjs';
import { CreateOrderRequest } from '../../models/create-order-request.model';
import { OrderService } from '../../services/order.service';
import { DealerLevelService } from '../../../dealer-level/services/dealer-level-service';
import { DealerPriceDetail } from '../../../dealer-level/models/dealer-level-detail.models';
import { ProductService } from '../../../product/product.component/services/product-service';

@Component({
  standalone: true,
  selector: 'order-create',
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
    NzTabsModule,
  ],
  templateUrl: './order-create.component.html',
  styleUrls: ['./order-create.component.scss'],
})
export class OrderCreateComponent {
  selectedTabIndex = 0;
  searchCustomerKeyword = '';
  customers: Customer[] = [];
  private searchSubject = new Subject<string>();
  orderForm: FormGroup;
  isDark = false;
  customerId: string = '';
  dateToday = new Date();
  dealerLevelId: string = '';
  customerType: number = 1;
  existingProductIds: string[] = [];
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
    private customerService: CustomerService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private modal: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private productService: ProductService,
    private orderService: OrderService,
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

  get details(): FormArray {
    return this.orderForm.get('details') as FormArray;
  }

  get isSubmitDisabled(): boolean {
    return (
      this.listOfData.length === 0 ||
      this.listOfData.some((item) => item.Quantity <= 0)
    );
  }
  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    console.log('Tab changed:', index);
    if (index === 1) {
      this.orderForm.get('phoneNumber')?.disable();
      this.orderForm.get('deliveryAddress')?.disable();
    } else {
      this.orderForm.get('phoneNumber')?.enable();
      this.orderForm.get('deliveryAddress')?.enable();
      this.applyOriginalProductPrices();
    }
    this.orderForm.patchValue({
      customerName: '',   
      phoneNumber: '',
      deliveryAddress: '', 
      customerSearch: '',
    });
  }
  private applyOriginalProductPrices(): void {
    if (!this.listOfData || this.listOfData.length === 0) {
      return;
    }

    // Tạo danh sách request lấy chi tiết sản phẩm theo Id
    const requests = this.listOfData.map((item) =>
      this.productService.ReadById(item.ProductId ?? item.Id)
    );

    // Gọi tất cả request song song
    forkJoin(requests).subscribe({
      next: (products) => {
        // Cập nhật lại giá cho từng sản phẩm
        this.listOfData = this.listOfData.map((item, idx) => {
          const product = products[idx];
          const basePrice = product.Product.SalePrice ?? 0;
          const qty = item.Quantity > 0 ? item.Quantity : 1;
          console.log('product', product);
          console.log('basePrice', basePrice);

          return {
            ...item,
            SalePrice: basePrice,
            TotalPrice: basePrice * qty,
          };
        });

        // Cập nhật data và tổng tiền
        this.allData = [...this.listOfData];
        this.updateTotalAmount();

        // Cập nhật lại UI
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Lấy giá sản phẩm thất bại:', err);
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
    this.customerId = customer.Id;

    if (this.customerId) {
      this.customerService.ReadByIdCustomer(this.customerId).subscribe({
        next: (cusRes) => {
          this.dealerLevelId = cusRes.Customer.DealerLevelId ?? '';
          console.log('cusRes:', cusRes);

          if (this.dealerLevelId) {
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

                  this.applyDealerLevelPrices(dealerPrices);
                  this.allData = [...this.listOfData];
                  this.updateTotalAmount();
                  this.cdr.detectChanges();
                },
                error: (err) => {
                  console.error('Load dealer level failed:', err);
                },
              });
          } else {
            // Khách lẻ thì giữ nguyên giá
            this.allData = [...this.listOfData];
            this.updateTotalAmount();
          }
        },
        error: (err) => {
          console.error('Load customer failed:', err);
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

        // 👉 Tính lại tổng sau khi xóa
        this.updateTotalAmount();

        this.cdr.detectChanges();
      },
    });
  }

  onSearch(): void {
    this.searchKeyword = this.searchKeyword.trim().toLowerCase();
    if (!this.searchKeyword) {
      this.listOfData = [...this.allData];
    } else {
      console.log('allData :', this.allData);

      this.listOfData = this.allData.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(this.searchKeyword)
        )
      );
    }
    this.cdr.detectChanges();
  }

  onSelectedProducts(productList: InventoryDetail[]) {
    if (!productList || productList.length === 0) {
      this.closeProductPopup();
      return;
    }

    this.listOfData = [...this.listOfData, ...productList];
    this.existingProductIds = this.listOfData.map((p) => p.Id);
    // Loại bỏ trùng
    this.listOfData = this.listOfData.filter(
      (item, index, self) => index === self.findIndex((t) => t.Id === item.Id)
    );
    console.log('productList:', productList);
    console.log('check:', this.listOfData);
    // Gán SalePrice (giá bán), Quantity mặc định = 1 nếu chưa có
    this.listOfData = this.listOfData.map((item) => ({
      ...item,
      Quantity: item.Quantity && item.Quantity > 0 ? item.Quantity : 1,
      SalePrice: item.SalePrice ?? 0,
      TotalPrice:
        (item.SalePrice ?? 0) *
        (item.Quantity && item.Quantity > 0 ? item.Quantity : 1),
    }));

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

            this.applyDealerLevelPrices(dealerPrices);
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

  submitForm(isDraft: boolean): void {
    const formValues = this.orderForm.getRawValue();

    const payload: CreateOrderRequest = {
      CustomerId: this.selectedTabIndex === 1 ? this.customer.id : undefined,
      CustomerType: this.selectedTabIndex === 0 ? 1 : 2,
      IsDraft: isDraft,
      CustomerName: formValues.customerName,
      CustomerPhone: formValues.phoneNumber,
      DeliveryAddress: formValues.deliveryAddress,
      Description: formValues.description,
      TotalAmount: this.totalAmount,
      Details: this.listOfData.map((item) => ({
        ProductId: item.ProductId ?? item.Id,
        Quantity: item.Quantity,
        UnitPrice: item.SalePrice ?? 0,
      })),
    };

    this.isSubmitting = true;
    this.orderService.CreateOrder(payload).subscribe({
      next: () => {
        this.toastr.success(
          isDraft ? 'Lưu nháp thành công!' : 'Tạo đơn hàng thành công!'
        );
        this.router.navigateByUrl('/order');
      },
      error: (err) => {
        const userMessage = err.error?.Message || 'Cập nhật thất bại';
        this.toastr.error(userMessage);
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
