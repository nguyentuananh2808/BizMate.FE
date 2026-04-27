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
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  forkJoin,
  Subject,
  switchMap,
  take,
} from 'rxjs';
import { CustomerService } from '../../../customer/services/customer-service';
import {
  Customer,
  CustomerResponse,
} from '../../../customer/models/customer-response.model';
import { PricePipe } from '../../../../shared/pipes/price-pice';
import { CreateOrderRequest } from '../../models/create-order-request.model';
import { OrderService } from '../../services/order.service';
import { DealerLevelService } from '../../../dealer-level/services/dealer-level-service';
import { DealerPriceDetail } from '../../../dealer-level/models/dealer-level-detail.models';
import { ProductService } from '../../../product/product.component/services/product-service';
import { Html5Qrcode } from 'html5-qrcode';

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
  isScanning = false;
  scannerTitle = 'Quét Serial';
  lastScan = '';
  private scanner?: Html5Qrcode;
  private scanLocked = false;
  private scanTargetItem:
    | (InventoryDetail & { SalePrice?: number; TotalPrice?: number })
    | null = null;
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
      this.listOfData.some((item) =>
        this.isSerialTracked(item)
          ? this.getSerialNumbers(item).length === 0
          : item.Quantity <= 0
      )
    );
  }

  isSerialTracked(item: InventoryDetail): boolean {
    return item.IsSerialTracked ?? (item as any).isSerialTracked ?? false;
  }

  getSerialNumbers(item: InventoryDetail): string[] {
    return item.SerialNumbers ?? [];
  }

  private getProductId(item: InventoryDetail): string {
    return item.ProductId || item.Id;
  }

  private getOrderQuantity(item: InventoryDetail): number {
    return this.isSerialTracked(item)
      ? this.getSerialNumbers(item).length
      : Number(item.Quantity) || 0;
  }

  private isCommandSuccess(response: any): boolean {
    const value =
      response?.Success ??
      response?.success ??
      response?.IsSuccess ??
      response?.isSuccess ??
      response?.Succeeded ??
      response?.succeeded;

    if (value === undefined || value === null) {
      return true;
    }

    if (typeof value === 'string') {
      return ['true', '1', 'success', 'succeeded'].includes(
        value.toLowerCase()
      );
    }

    return Boolean(value);
  }

  private getCommandMessage(response: any, fallback: string): string {
    return response?.Message ?? response?.message ?? fallback;
  }

  private normalizeSerialNumber(value: string): string {
    return value.trim();
  }

  private hasSerialInOrder(serialNumber: string, targetItem: InventoryDetail): boolean {
    const normalized = serialNumber.toLowerCase();

    return this.listOfData.some((item) => {
      if (item.ProductId === targetItem.ProductId) {
        return false;
      }

      return this.getSerialNumbers(item).some(
        (sn) => sn.toLowerCase() === normalized
      );
    });
  }

  private syncSerialQuantity(
    item: InventoryDetail & { SalePrice?: number; TotalPrice?: number }
  ): void {
    if (!this.isSerialTracked(item)) {
      return;
    }

    item.Quantity = this.getSerialNumbers(item).length;
    item.TotalPrice = (item.SalePrice ?? 0) * item.Quantity;
    this.allData = [...this.listOfData];
    this.updateTotalAmount();
    this.cdr.detectChanges();
  }

  addSerialToItem(
    item: InventoryDetail & { SalePrice?: number; TotalPrice?: number },
    value: string
  ): void {
    if (!this.isSerialTracked(item)) {
      this.toastr.warning('Sản phẩm này bán theo số lượng, không cần SN.');
      return;
    }

    const serialNumber = this.normalizeSerialNumber(value);
    if (!serialNumber) {
      return;
    }

    const currentSerials = this.getSerialNumbers(item);
    const duplicatedInProduct = currentSerials.some(
      (sn) => sn.toLowerCase() === serialNumber.toLowerCase()
    );

    if (duplicatedInProduct || this.hasSerialInOrder(serialNumber, item)) {
      this.toastr.warning(`SN ${serialNumber} đã có trong đơn.`);
      return;
    }

    if (item.Available !== undefined && currentSerials.length >= item.Available) {
      this.toastr.warning(
        `Không thể vượt quá số lượng khả dụng (${item.Available}).`
      );
      return;
    }

    item.SerialNumbers = [...currentSerials, serialNumber];
    this.lastScan = serialNumber;
    this.toastr.success(`Đã thêm SN ${serialNumber}`);
    navigator.vibrate?.(120);
    this.syncSerialQuantity(item);
  }

  removeSerialFromItem(
    item: InventoryDetail & { SalePrice?: number; TotalPrice?: number },
    serialNumber: string
  ): void {
    item.SerialNumbers = this.getSerialNumbers(item).filter(
      (sn) => sn !== serialNumber
    );
    this.syncSerialQuantity(item);
  }

  openSerialTextModal(
    item: InventoryDetail & { SalePrice?: number; TotalPrice?: number }
  ): void {
    if (!this.isSerialTracked(item)) {
      return;
    }

    const existing = this.getSerialNumbers(item).join('\n');

    this.modal.create({
      nzTitle: `Chọn Serial xuất kho - ${item.ProductName}`,
      nzContent: `
        <textarea id="orderSnInput"
          style="width:100%;height:220px;border:1px solid #d9d9d9;border-radius:12px;padding:12px;outline:none"
          placeholder="Mỗi dòng 1 serial">${existing}</textarea>
      `,
      nzOkText: 'Lưu SN',
      nzCancelText: 'Đóng',
      nzOnOk: () => {
        const textarea = document.getElementById(
          'orderSnInput'
        ) as HTMLTextAreaElement | null;

        if (!textarea) {
          return;
        }

        const serials = textarea.value
          .split('\n')
          .map((x) => this.normalizeSerialNumber(x))
          .filter((x) => x);
        const uniqueSerials = [...new Set(serials)];

        if (
          item.Available !== undefined &&
          uniqueSerials.length > item.Available
        ) {
          this.toastr.warning(
            `Không thể vượt quá số lượng khả dụng (${item.Available}).`
          );
          return;
        }

        item.SerialNumbers = uniqueSerials;
        this.syncSerialQuantity(item);
      },
    });
  }

  async openCameraScanner(
    item: InventoryDetail & { SalePrice?: number; TotalPrice?: number }
  ): Promise<void> {
    if (!this.isSerialTracked(item)) {
      this.toastr.info('Sản phẩm này bán theo số lượng, không cần quét SN.');
      return;
    }

    this.scanTargetItem = item;
    this.scannerTitle = `Quét SN xuất kho - ${item.ProductName}`;
    this.isScanning = true;
    this.cdr.detectChanges();

    setTimeout(() => void this.startScanner(), 150);
  }

  private async startScanner(): Promise<void> {
    try {
      this.scanner = new Html5Qrcode('order-serial-qr-reader');
      const cameras = await Html5Qrcode.getCameras();

      if (!cameras.length) {
        this.toastr.warning('Không tìm thấy camera khả dụng.');
        this.isScanning = false;
        return;
      }

      const cameraId =
        cameras.find((c) => c.label.toLowerCase().includes('back'))?.id ||
        cameras[0].id;

      await this.scanner.start(
        cameraId,
        {
          fps: 12,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => this.handleScannedSerial(decodedText),
        () => {}
      );
    } catch (error) {
      console.error('Cannot start order serial scanner:', error);
      this.toastr.error('Không thể bật camera quét SN.');
      this.isScanning = false;
    }
  }

  private handleScannedSerial(decodedText: string): void {
    if (this.scanLocked || !this.scanTargetItem) {
      return;
    }

    this.scanLocked = true;
    this.addSerialToItem(this.scanTargetItem, decodedText);

    setTimeout(() => {
      this.scanLocked = false;
    }, 900);
  }

  async closeScanner(): Promise<void> {
    try {
      if (this.scanner) {
        await this.scanner.stop();
        await this.scanner.clear();
      }
    } catch (error) {
      console.warn('Cannot stop order serial scanner:', error);
    }

    this.scanner = undefined;
    this.scanTargetItem = null;
    this.scanLocked = false;
    this.isScanning = false;
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    if (index === 1) {
      this.orderForm.get('phoneNumber')?.disable();
      this.orderForm.get('deliveryAddress')?.disable();
      this.customerType = 2;
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

  updateExistingProductIds(): void {
    this.existingProductIds = this.listOfData.map((item) => item.ProductId);
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
    if (this.isSerialTracked(item)) {
      this.openSerialTextModal(item);
      return;
    }

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

  calculateTotalPrice(): number {
    return this.listOfData.reduce((sum, item) => sum + (item.TotalPrice ?? 0), 0);
  }

  saveEdit(
    item: InventoryDetail & { SalePrice?: number; TotalPrice?: number }
  ): void {
    if (this.isSerialTracked(item)) {
      this.syncSerialQuantity(item);
      this.editingId = null;
      this.editingQuantity = null;
      return;
    }

    const qty = this.editingQuantity;

    // Kiểm tra hợp lệ
    const isInvalid =
      qty === null ||
      qty < 1 ||
      (item.Available !== undefined && qty > item.Available);

    if (isInvalid) {
      this.inputError = true;
      setTimeout(() => (this.inputError = false), 300);
      return;
    }

    item.Quantity = qty;
    item.TotalPrice = (item.SalePrice ?? 0) * qty;

    this.editingId = null;
    this.editingQuantity = null;

    this.updateTotalAmount();
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
        this.allData = this.allData.filter(
          (item) => item.Id !== itemToDelete.Id
        );

        // 👉 Tính lại tổng sau khi xóa
        this.updateTotalAmount();
        this.updateExistingProductIds();
        this.cdr.detectChanges();
      },
    });
  }

  onSearch(): void {
    this.searchKeyword = this.searchKeyword.trim().toLowerCase();
    if (!this.searchKeyword) {
      this.listOfData = [...this.allData];
    } else {
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

    // Gộp sản phẩm mới vào danh sách hiện tại
    this.listOfData = [...this.listOfData, ...productList];
    this.existingProductIds = this.listOfData.map((p) => p.Id);
    // Loại bỏ trùng theo Id
    this.listOfData = this.listOfData.filter(
      (item, index, self) => index === self.findIndex((t) => t.Id === item.Id)
    );

    // Chuẩn hóa dữ liệu: Quantity không vượt quá Available
    this.listOfData = this.listOfData.map((item) => {
      const isSerialTracked = this.isSerialTracked(item);
      const serialNumbers = item.SerialNumbers ?? [];
      // Quantity mặc định = 1
      let qty = isSerialTracked
        ? serialNumbers.length
        : item.Quantity && item.Quantity > 0
          ? item.Quantity
          : 1;

      // Nếu có Available thì Quantity không được vượt quá
      if (!isSerialTracked && item.Available !== undefined && qty > item.Available) {
        qty = item.Available;
      }
      const firstNew = productList[0];
      if (firstNew && !this.isSerialTracked(firstNew)) {
        this.editingId = firstNew.Id;
        this.editingQuantity =
          firstNew.Quantity && firstNew.Quantity > 0 ? firstNew.Quantity : 1;
      }
      return {
        ...item,
        Quantity: qty,
        SerialNumbers: serialNumbers,
        SalePrice: item.SalePrice ?? 0,
        TotalPrice: (item.SalePrice ?? 0) * qty,
      };
    });
    // Nếu là khách đại lý thì áp giá DealerLevel
    if (this.customerType === 2 && this.dealerLevelId) {
      this.dealerLevelService
        .ReadByIdDealerLevel(this.dealerLevelId)
        .subscribe({
          next: (res) => {
            const dealerPrices =
              res.DealerLevel.DealerPriceForDealerLevel || [];

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
    if (this.isSubmitting) {
      return;
    }

    const formValues = this.orderForm.getRawValue();
    const isDealerOrder = this.selectedTabIndex === 1;

    if (this.isSubmitDisabled) {
      this.toastr.warning('Vui lòng chọn sản phẩm và nhập số lượng/SN hợp lệ.');
      return;
    }

    if (isDealerOrder && !this.customer.id) {
      this.toastr.warning('Vui lòng chọn đại lý trước khi tạo đơn hàng.');
      return;
    }

    const missingSerialItem = this.listOfData.find(
      (item) => this.isSerialTracked(item) && this.getSerialNumbers(item).length === 0
    );

    if (missingSerialItem) {
      this.toastr.warning(
        `Vui lòng quét hoặc nhập SN cho ${missingSerialItem.ProductName}.`
      );
      return;
    }

    const payload: CreateOrderRequest = {
      OrderDate: new Date().toISOString(),
      CustomerId: isDealerOrder ? this.customer.id : null,
      CustomerType: isDealerOrder ? 2 : 1,
      IsDraft: isDraft,
      CustomerName: formValues.customerName,
      CustomerPhone: formValues.phoneNumber,
      DeliveryAddress: formValues.deliveryAddress,
      Description: formValues.description || null,
      Details: this.listOfData.map((item) => {
        const serialNumbers = this.isSerialTracked(item)
          ? this.getSerialNumbers(item)
          : [];

        return {
          ProductId: this.getProductId(item),
          Quantity: this.getOrderQuantity(item),
          SerialNumbers: serialNumbers,
        };
      }),
    };

    this.isSubmitting = true;
    this.cdr.detectChanges();

    this.orderService
      .CreateOrder(payload)
      .pipe(
        take(1),
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          if (!this.isCommandSuccess(response)) {
            this.toastr.error(
              this.getCommandMessage(response, 'Tạo đơn hàng thất bại')
            );
            return;
          }

          this.toastr.success(
            isDraft ? 'Lưu nháp thành công!' : 'Tạo đơn hàng thành công!'
          );
          this.router.navigateByUrl('/order');
        },
        error: (err) => {
          const userMessage =
            err.error?.Message || err.error?.message || 'Tạo đơn hàng thất bại';
          this.toastr.error(userMessage);
        },
      });
  }
}
