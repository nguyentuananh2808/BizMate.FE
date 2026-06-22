import { NzListModule } from 'ng-zorro-antd/list';
import {
  ExportOrderForTechnicianRequest,
  OrderService,
} from './../../services/order.service';
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
import { ProductQrScanButtonComponent } from '../../../product/product-qr-scan-button.component/product-qr-scan-button.component';
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
import { Subject, take } from 'rxjs';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
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
import { Html5Qrcode } from 'html5-qrcode';
import { Technician } from '../../../technician/models/technician.model';
import { TechnicianService } from '../../../technician/services/technician.service';

interface ExportBorrowUiItem {
  ProductId: string;
  ProductName: string;
  ProductCode?: string;
  OrderedQuantity: number;
  BorrowedQuantity: number;
  IsSerialTracked?: boolean;
  IsExtraBorrow?: boolean;
}

interface ExportBorrowGroup {
  TechnicianId: string;
  Items: ExportBorrowUiItem[];
}

type OrderInventoryItem = InventoryDetail & {
  SalePrice?: number;
  TotalPrice?: number;
  BorrowedQuantity?: number;
  UsedBorrowedQuantity?: number;
  IsExtraBorrow?: boolean;
};

@Component({
  standalone: true,
  selector: 'order-update',
  imports: [
    NgxPrintModule,
    NzInputModule,
    NzSelectModule,
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
    ProductQrScanButtonComponent,
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
  createdDate: Date | null = new Date();
  existingProductIds: string[] = [];
  customerType: number = 1;
  isPopupSearchProducts = false;
  indeterminate = false;
  isSubmitting = false;
  showPrint = false;
  checked = false;
  setOfCheckedId = new Set<string>();
  isMobile = window.innerWidth < 768;
  listOfData: OrderInventoryItem[] = [];
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
  isScanning = false;
  scannerTitle = 'Quét Serial';
  lastScan = '';
  technicians: Technician[] = [];
  selectedTechnicianIds: string[] = [];
  technicianName = '';
  installationDate: string | null = null;
  technicianExportedAt: string | null = null;
  isLoadingTechnicians = false;
  isExportBorrowVisible = false;
  isExportingBorrowed = false;
  isBorrowProductPopupVisible = false;
  exportBorrowGroups: ExportBorrowGroup[] = [];
  activeBorrowTechnicianId = '';
  isUseBorrowedVisible = false;
  isSavingUseBorrowed = false;
  useBorrowedTechnicianId = '';
  selectedUseBorrowedItem: OrderInventoryItem | null = null;
  useBorrowedQuantity = 1;
  private scanner?: Html5Qrcode;
  private scanLocked = false;
  private scanTargetItem: OrderInventoryItem | null = null;
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
    private dealerLevelService: DealerLevelService,
    private technicianService: TechnicianService
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
    this.loadTechnicians();
    this.id = this.router.snapshot.paramMap.get('id')!;
    if (this.id) {
      this.getOrderDetail(this.id);
    }
  }

  loadTechnicians(keyword: string = ''): void {
    this.isLoadingTechnicians = true;
    this.technicianService
      .getTechnicians(keyword, false)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.technicians = response.Technicians || [];
          this.isLoadingTechnicians = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoadingTechnicians = false;
          this.toastr.error('Không thể tải danh sách kỹ thuật viên.');
          this.cdr.detectChanges();
        },
      });
  }

  get canEditOrder(): boolean {
    return !this.isOrderClosed;
  }

  get canEditProducts(): boolean {
    return this.canEditOrder && !this.isDescriptionOnlyOrder;
  }

  get canUseBorrowedProducts(): boolean {
    return !this.isOrderClosed;
  }

  get isOrderClosed(): boolean {
    const closedStatuses = new Set([
      'Ho\u00e0n th\u00e0nh',
      'H\u1ee7y',
      '\u0110\u00e3 duy\u1ec7t',
    ]);

    return closedStatuses.has((this.statusName || '').trim());
  }

  get isDescriptionOnlyOrder(): boolean {
    const contentLockedStatuses = new Set([
      'Ho\u00e0n th\u00e0nh',
      'H\u1ee7y',
      '\u0110\u00e3 duy\u1ec7t',
      '\u0110\u00e3 l\u1eafp \u0111\u1eb7t',
    ]);

    return (
      contentLockedStatuses.has((this.statusName || '').trim()) ||
      !!this.technicianExportedAt
    );
  }

  get isBorrowMoreMode(): boolean {
    return !!this.technicianExportedAt;
  }

  get canExportForTechnician(): boolean {
    const exportableStatuses = ['Tạo mới', 'Đang lắp đặt', 'Đã lắp đặt'];

    return (
      this.orderLineItems.length > 0 &&
      this.selectedTechnicianIds.length > 0 &&
      exportableStatuses.includes(this.statusName)
    );
  }

  get orderLineItems(): OrderInventoryItem[] {
    return this.listOfData.filter((item) => !this.isExtraBorrowItem(item));
  }

  get extraBorrowedItems(): OrderInventoryItem[] {
    return this.listOfData.filter((item) => this.isExtraBorrowItem(item));
  }

  get borrowExistingProductIds(): string[] {
    return this.exportBorrowItems.map((item) => item.ProductId);
  }

  get activeExportBorrowGroup(): ExportBorrowGroup | null {
    return this.exportBorrowGroups[0] || null;
  }

  get exportBorrowItems(): ExportBorrowUiItem[] {
    return this.activeExportBorrowGroup?.Items || [];
  }

  getSelectedTechnicianLabel(): string {
    const labels = this.selectedTechnicianIds
      .map((id) => this.getTechnicianLabel(id))
      .filter(Boolean);

    return labels.length ? labels.join(', ') : this.technicianName;
  }

  getExportTechnicianLabel(): string {
    const technicianId = this.activeExportBorrowGroup?.TechnicianId;
    return technicianId ? this.getTechnicianLabel(technicianId) : '';
  }

  getTechnicianLabel(technicianId: string): string {
    const selected = this.technicians.find(
      (technician) => technician.Id === technicianId
    );

    if (!selected) return technicianId;

    return `${selected.Name}${selected.Phone ? ' - ' + selected.Phone : ''}`;
  }

  private toDateInputValue(value?: string | null): string | null {
    if (!value) return null;

    return value.includes('T') ? value.split('T')[0] : value.slice(0, 10);
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
        label: 'Lắp đặt',
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
    'Đang lắp đặt': [
      {
        type: 'donePacking',
        label: 'Đã lắp đặt',
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
    'Đã lắp đặt': [
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

  get visibleStatusActions(): { type: string; label: string; icon: string; class: string }[] {
    const actions = this.statusActions[this.statusName] || [];

    if (!this.technicianExportedAt) {
      return actions;
    }

    return actions.filter((action) => action.type !== 'cancel');
  }

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
        this.toastr.error(this.getHttpErrorMessage(err, 'Cập nhật trạng thái đơn hàng thất bại!'));
      },
    });
  }

  finishOrder(): void {
    this.modal.confirm({
      nzTitle: `Bạn có chắc muốn hoàn thành đơn hàng này?`,
      nzOkText: 'Hoàn thành',
      nzCancelText: 'Đóng',
      nzOnOk: () => {
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
            this.toastr.error(this.getHttpErrorMessage(err, 'Cập nhật trạng thái đơn hàng thất bại!'));
          },
        });
      },
    });
  }

  cancelOrder(): void {
    this.modal.confirm({
      nzTitle: `Bạn có chắc muốn hủy đơn hàng này?`,
      nzOkText: 'Hủy đơn',
      nzCancelText: 'Đóng',
      nzOnOk: () => {
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
            this.toastr.error(this.getHttpErrorMessage(err, 'Hủy đơn hàng thất bại!'));
          },
        });
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
        this.toastr.error(this.getHttpErrorMessage(err, 'Cập nhật trạng thái đơn hàng thất bại!'));
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
        this.toastr.error(this.getHttpErrorMessage(err, 'Cập nhật trạng thái đơn hàng thất bại!'));
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
    this.customerType = 2;

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

    if (this.isDescriptionOnlyOrder) {
      this.toastr.info('\u0110\u01a1n h\u00e0ng \u0111\u00e3 kh\u00f3a, ch\u1ec9 c\u00f3 th\u1ec3 c\u1eadp nh\u1eadt ghi ch\u00fa.');
      return;
    }

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
    this.customerId = customer.Id;
    this.customerType = 2;
  }

  //đổi tab
  onTabChange(index: number): void {
    if (this.isDescriptionOnlyOrder) {
      this.applyOrderFormState();
      return;
    }

    this.selectedTabIndex = index;
    this.customerType = index === 1 ? 2 : 1;
    this.customerId = '';
    this.customer = {
      id: '',
      name: '',
      phone: '',
      address: '',
      description: '',
    };

    if (index === 1) {
      this.orderForm.get('phoneNumber')?.disable();
      this.orderForm.get('deliveryAddress')?.disable();
    } else {
      this.orderForm.get('phoneNumber')?.enable();
      this.orderForm.get('deliveryAddress')?.enable();
    }

    this.orderForm.patchValue({
      customerName: '',
      phoneNumber: '',
      deliveryAddress: '',
      customerSearch: '',
    });
    this.applyOrderFormState();
  }

  private applyOrderFormState(): void {
    const lockInfoControls = this.isDescriptionOnlyOrder;
    const controls = ['customerName', 'phoneNumber', 'deliveryAddress'];

    for (const controlName of controls) {
      const control = this.orderForm.get(controlName);
      if (!control) {
        continue;
      }

      if (lockInfoControls || this.customerType === 2) {
        control.disable({ emitEvent: false });
      } else {
        control.enable({ emitEvent: false });
      }
    }

    const customerSearchControl = this.orderForm.get('customerSearch');
    if (customerSearchControl) {
      if (lockInfoControls) {
        customerSearchControl.disable({ emitEvent: false });
      } else {
        customerSearchControl.enable({ emitEvent: false });
      }
    }

    this.orderForm.get('description')?.enable({ emitEvent: false });
  }

  updateExistingProductIds(): void {
    this.existingProductIds = this.orderLineItems.map((item) =>
      this.getProductId(item)
    );
  }
  getOrderDetail(id: string): void {
    this.orderService.ReadByIdOrder(id).subscribe({
      next: (res) => {
        this.createdDate = res.Order.Order.CreatedDate;
        const orderTechnicians = res.Order.Order.Technicians || [];
        this.selectedTechnicianIds = orderTechnicians.length
          ? orderTechnicians
              .map((technician) => technician.TechnicianId)
              .filter(Boolean)
          : res.Order.Order.TechnicianId
            ? [res.Order.Order.TechnicianId]
            : [];
        this.technicianName = res.Order.Order.TechnicianName || '';
        this.installationDate = this.toDateInputValue(
          res.Order.Order.InstallationDate
        );
        this.technicianExportedAt = res.Order.Order.TechnicianExportedAt || null;
        this.customerId = res.Order.Order.CustomerId;
        this.customerType = res.Order.Order.CustomerType;
        this.selectedTabIndex = this.customerType === 2 ? 1 : 0;
        if (res.Order.Order.CustomerType === 2) {
          this.orderForm.get('customerName')?.disable();
          this.orderForm.get('phoneNumber')?.disable();
          this.orderForm.get('deliveryAddress')?.disable();
        } else {
          this.orderForm.get('customerName')?.enable();
          this.orderForm.get('phoneNumber')?.enable();
          this.orderForm.get('deliveryAddress')?.enable();
        }
        //  gọi thêm API để lấy DealerLevelId từ Customer
        if (this.customerId) {
          this.customerService.ReadByIdCustomer(this.customerId).subscribe({
            next: (cusRes) => {
              this.dealerLevelId = cusRes.Customer.DealerLevelId ?? '';
            },
            error: (err) => {
              console.error('Load customer failed:', err);
            },
          });
        }

        this.orderCode = res.Order.Order.Code;
        this.rowVersion = res.Order.Order.RowVersion;
        this.existingProductIds = (res.Order.Order.Details || [])
          .filter((d: any) => !this.isExtraBorrowResponse(d))
          .map((d: any) => d.ProductId);
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
        this.applyOrderFormState();

        // ======= ĐỒNG BỘ DETAILS FORMARRAY =======
        const detailsFormArray = this.orderForm.get('details') as FormArray;
        detailsFormArray.clear();
        this.allData = [...res.Order.Order.Details].sort((a, b) =>
          a.ProductName.localeCompare(b.ProductName)
        );
        (res.Order.Order.Details || []).forEach((item: any) => {
          const availableAfterReserve =
            (item.Available ?? 0) + (item.Quantity ?? 0);
          const detailGroup = this.fb.group({
            Id: [item.Id],
            ProductId: [item.ProductId],
            ProductName: [item.ProductName],
            ProductCode: [item.ProductCode],
            Unit: [item.Unit],
            Quantity: [item.Quantity],
            SalePrice: [item.UnitPrice],
            TotalPrice: [item.Total],
            Available: [availableAfterReserve >= 0 ? availableAfterReserve : 0],
            IsSerialTracked: [
              item.IsSerialTracked ?? item.isSerialTracked ?? false,
            ],
            SerialNumbers: [item.SerialNumbers ?? item.serialNumbers ?? []],
            BorrowedQuantity: [
              item.BorrowedQuantity ?? item.borrowedQuantity ?? 0,
            ],
            UsedBorrowedQuantity: [
              item.UsedBorrowedQuantity ?? item.usedBorrowedQuantity ?? 0,
            ],
          });
          detailsFormArray.push(detailGroup);
        });

        //sắp xếp theo tên
        this.listOfData = detailsFormArray.controls
          .map((c) => c.value)
          .sort((a, b) => {
            // 1️⃣ Tách phần tên và phần thông số
            const [nameA, ...restA] = a.ProductName.split(' - ').map(
              (s: string) => s.trim()
            );
            const [nameB, ...restB] = b.ProductName.split(' - ').map(
              (s: string) => s.trim()
            );

            // 2️⃣ So sánh theo tên cụm sản phẩm trước
            const nameCompare = nameA.localeCompare(nameB);
            if (nameCompare !== 0) return nameCompare;

            // 3️⃣ Hàm tách thông số (ví dụ "5H - 3M6" => [5, 3, 6])
            const parseSpecs = (arr: string[]): number[] => {
              const regex = /(\d+)H.*?(\d+)M(\d+)/i;
              const joined = arr.join(' - ');
              const match = joined.match(regex);
              if (!match) return [0, 0, 0];
              return match.slice(1).map((n: string) => Number(n)); // ép kiểu an toàn
            };

            const [hA, mA, dA] = parseSpecs(restA);
            const [hB, mB, dB] = parseSpecs(restB);

            // 4️⃣ So sánh lần lượt theo giá trị số học
            if (hA !== hB) return hA - hB;
            if (mA !== mB) return mA - mB;
            return dA - dB;
          });
        this.allData = [...this.listOfData];
        this.updateExistingProductIds();

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error(this.getHttpErrorMessage(err, 'Không thể tải chi tiết đơn hàng.'));
      },
    });
  }

  get details(): FormArray {
    return this.orderForm.get('details') as FormArray;
  }

  get isSubmitDisabled(): boolean {
    if (this.isDescriptionOnlyOrder) {
      return false;
    }

    return (
      this.orderLineItems.length === 0 ||
      this.orderLineItems.some((item) =>
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

  getBorrowedQuantity(item: InventoryDetail): number {
    return Number(
      (item as any).BorrowedQuantity ?? (item as any).borrowedQuantity ?? 0
    );
  }

  getUsedBorrowedQuantity(item: InventoryDetail): number {
    return Number(
      (item as any).UsedBorrowedQuantity ?? (item as any).usedBorrowedQuantity ?? 0
    );
  }

  getBorrowedRemaining(item: InventoryDetail): number {
    return Math.max(
      this.getBorrowedQuantity(item) - this.getUsedBorrowedQuantity(item),
      0
    );
  }

  isExtraBorrowItem(item: InventoryDetail): boolean {
    return Number(item.Quantity ?? 0) === 0 && this.getBorrowedQuantity(item) > 0;
  }

  private isExtraBorrowResponse(item: any): boolean {
    const quantity = Number(item?.Quantity ?? item?.quantity ?? 0);
    const borrowedQuantity = Number(
      item?.BorrowedQuantity ?? item?.borrowedQuantity ?? 0
    );

    return quantity === 0 && borrowedQuantity > 0;
  }

  get selectedUseBorrowedRemaining(): number {
    return this.selectedUseBorrowedItem
      ? this.getBorrowedRemaining(this.selectedUseBorrowedItem)
      : 0;
  }

  openTechnicianExportModal(): void {
    if (!this.selectedTechnicianIds.length) {
      this.toastr.warning('Vui lòng chọn ít nhất một kỹ thuật viên trước khi xuất hàng.');
      return;
    }

    if (!this.orderLineItems.length) {
      this.toastr.warning('Đơn hàng chưa có sản phẩm để xuất.');
      return;
    }

    if (!this.canExportForTechnician) {
      this.toastr.warning('Đơn hàng đã hoàn thành hoặc đã hủy nên không thể xuất/mượn thêm.');
      return;
    }

    if (!this.isBorrowMoreMode) {
      const serialTrackedItem = this.orderLineItems.find((item) =>
        this.isSerialTracked(item)
      );

      if (serialTrackedItem) {
        this.toastr.warning(
          `Flow mượn hàng hiện chưa hỗ trợ sản phẩm quản lý serial: ${serialTrackedItem.ProductName}.`
        );
        return;
      }
    }

    const initialItems: ExportBorrowUiItem[] = this.isBorrowMoreMode
      ? []
      : this.orderLineItems.map((item) => ({
          ProductId: this.getProductId(item),
          ProductName: item.ProductName,
          ProductCode: item.ProductCode,
          OrderedQuantity: this.getOrderQuantity(item),
          BorrowedQuantity: 0,
          IsSerialTracked: this.isSerialTracked(item),
          IsExtraBorrow: false,
        }));

    this.exportBorrowGroups = [{
      TechnicianId: this.selectedTechnicianIds[0],
      Items: initialItems,
    }];
    this.isExportBorrowVisible = true;
  }

  closeTechnicianExportModal(): void {
    if (this.isExportingBorrowed) return;
    this.isExportBorrowVisible = false;
    this.isBorrowProductPopupVisible = false;
  }

  openBorrowProductPopup(): void {
    this.isBorrowProductPopupVisible = true;
  }

  closeBorrowProductPopup(): void {
    this.isBorrowProductPopupVisible = false;
  }

  onSelectedBorrowProducts(productList: InventoryDetail[]): void {
    if (!productList?.length) {
      this.closeBorrowProductPopup();
      return;
    }

    const targetGroup = this.exportBorrowGroups[0];

    if (!targetGroup) {
      this.toastr.warning('Vui lòng chọn kỹ thuật viên cần mượn thêm sản phẩm.');
      this.closeBorrowProductPopup();
      return;
    }

    const serialTrackedItem = productList.find((item) =>
      this.isSerialTracked(item)
    );

    if (serialTrackedItem) {
      this.toastr.warning(
        `Flow mượn hàng hiện chưa hỗ trợ sản phẩm quản lý serial: ${serialTrackedItem.ProductName}.`
      );
      this.closeBorrowProductPopup();
      return;
    }

    const existingIds = new Set(targetGroup.Items.map((item) => item.ProductId));
    const extraItems = productList
      .filter((item) => !existingIds.has(this.getProductId(item)))
      .map((item) => {
        const productId = this.getProductId(item);

        return {
          ProductId: productId,
          ProductName: item.ProductName,
          ProductCode: item.ProductCode,
          OrderedQuantity: 0,
          BorrowedQuantity: 1,
          IsSerialTracked: this.isSerialTracked(item),
          IsExtraBorrow: !this.isProductInOriginalOrder(productId),
        };
      });

    if (!extraItems.length) {
      this.toastr.info('Các sản phẩm chọn thêm đã có trong danh sách xuất.');
      this.closeBorrowProductPopup();
      return;
    }

    targetGroup.Items = [...targetGroup.Items, ...extraItems];
    this.closeBorrowProductPopup();
  }

  removeExtraBorrowItem(item: ExportBorrowUiItem): void {
    if (!item.IsExtraBorrow && !this.isBorrowMoreMode) return;

    const group = this.exportBorrowGroups[0];
    if (!group) return;

    group.Items = group.Items.filter(
      (current) => current.ProductId !== item.ProductId
    );
  }

  submitTechnicianExport(): void {
    if (this.isExportingBorrowed) return;

    if (!this.exportBorrowGroups.length) {
      this.toastr.warning('Vui lòng chọn ít nhất một kỹ thuật viên.');
      return;
    }

    if (this.exportBorrowGroups.some((group) => !group.TechnicianId)) {
      this.toastr.warning('Vui lòng chọn kỹ thuật viên nhận hàng.');
      return;
    }

    const allExportItems = this.exportBorrowGroups.flatMap(
      (group) => group.Items
    );

    if (!allExportItems.length) {
      this.toastr.warning(
        this.isBorrowMoreMode
          ? 'Vui lòng thêm ít nhất một sản phẩm cần mượn.'
          : 'Danh sách xuất/mượn chưa có sản phẩm.'
      );
      return;
    }

    if (
      this.isBorrowMoreMode &&
      allExportItems.some((item) => Number(item.OrderedQuantity) > 0)
    ) {
      this.toastr.warning('Đơn hàng đã xuất cho kỹ thuật; lần này chỉ nhập SL mượn thêm.');
      return;
    }

    if (
      this.isBorrowMoreMode &&
      !allExportItems.some((item) => Number(item.BorrowedQuantity) > 0)
    ) {
      this.toastr.warning('Vui lòng nhập SL mượn thêm lớn hơn 0.');
      return;
    }

    const invalidItem = allExportItems.find(
        (item) =>
          item.OrderedQuantity < 0 ||
          item.BorrowedQuantity < 0 ||
          !Number.isInteger(Number(item.OrderedQuantity)) ||
          !Number.isInteger(Number(item.BorrowedQuantity)) ||
          (Number(item.OrderedQuantity) === 0 && Number(item.BorrowedQuantity) === 0)
    );

    if (invalidItem) {
      this.toastr.warning(
        'Số lượng chưa hợp lệ: mỗi dòng phải là số nguyên >= 0; dòng trong đơn cần SL bán hoặc SL mượn > 0; dòng mượn ngoài đơn phải có SL mượn > 0.'
      );
      return;
    }

    if (!this.isBorrowMoreMode) {
      const invalidAllocation = this.orderLineItems.find((orderItem) => {
        const productId = this.getProductId(orderItem);
        const expectedQuantity = this.getOrderQuantity(orderItem);
        const allocatedQuantity = this.exportBorrowGroups.reduce((sum, group) => {
          const item = group.Items.find(
            (current) => current.ProductId === productId && !current.IsExtraBorrow
          );

          return sum + (Number(item?.OrderedQuantity) || 0);
        }, 0);

        return allocatedQuantity !== expectedQuantity;
      });

      if (invalidAllocation) {
        this.toastr.warning(
          `Tổng SL bán phân bổ cho ${invalidAllocation.ProductName} phải bằng ${this.getOrderQuantity(invalidAllocation)}.`
        );
        return;
      }
    }

    const payload: ExportOrderForTechnicianRequest = {
      TechnicianExports: this.exportBorrowGroups
        .map((group) => ({
          TechnicianId: group.TechnicianId,
          Items: group.Items
            .map((item) => ({
              ProductId: item.ProductId,
              OrderedQuantity: Number(item.OrderedQuantity) || 0,
              BorrowedQuantity: Number(item.BorrowedQuantity) || 0,
            }))
            .filter(
              (item) => item.OrderedQuantity > 0 || item.BorrowedQuantity > 0
            ),
        }))
        .filter((group) => group.Items.length > 0),
    };

    const successMessage = this.isBorrowMoreMode
      ? 'Mượn thêm sản phẩm thành công.'
      : 'Xuất hàng cho kỹ thuật thành công.';
    const errorMessage = this.isBorrowMoreMode
      ? 'Mượn thêm sản phẩm thất bại.'
      : 'Xuất hàng cho kỹ thuật thất bại.';

    this.isExportingBorrowed = true;
    this.orderService.ExportForTechnician(this.id, payload).subscribe({
      next: (response) => {
        this.isExportingBorrowed = false;
        if (!this.isCommandSuccess(response)) {
          this.toastr.error(
            this.getCommandMessage(response, errorMessage)
          );
          return;
        }

        this.toastr.success(
          this.getCommandMessage(response, successMessage)
        );
        this.isExportBorrowVisible = false;
        this.getOrderDetail(this.id);
      },
      error: (err) => {
        this.isExportingBorrowed = false;
        const message =
          err.error?.Message ||
          err.error?.message ||
          errorMessage;

        this.toastr.error(
          message
        );

        if (message.includes('vừa thay đổi')) {
          this.isExportBorrowVisible = false;
          this.getOrderDetail(this.id);
        }
      },
    });
  }

  private isProductInOriginalOrder(productId: string): boolean {
    return this.orderLineItems.some(
      (item) => this.getProductId(item) === productId
    );
  }
  openUseBorrowedModal(item: InventoryDetail): void {
    if (!this.canUseBorrowedProducts) {
      this.toastr.info('\u0110\u01a1n h\u00e0ng \u0111\u00e3 ho\u00e0n th\u00e0nh ho\u1eb7c \u0111\u00e3 h\u1ee7y, kh\u00f4ng th\u1ec3 ghi nh\u1eadn d\u00f9ng h\u00e0ng m\u01b0\u1ee3n.');
      return;
    }

    const remaining = this.getBorrowedRemaining(item);

    if (remaining <= 0) {
      this.toastr.info('Sản phẩm này không còn hàng mượn để dùng.');
      return;
    }

    this.selectedUseBorrowedItem = item;
    this.useBorrowedTechnicianId =
      this.selectedTechnicianIds.length === 1 ? this.selectedTechnicianIds[0] : '';
    this.useBorrowedQuantity = 1;
    this.isUseBorrowedVisible = true;
  }

  closeUseBorrowedModal(): void {
    if (this.isSavingUseBorrowed) return;

    this.isUseBorrowedVisible = false;
    this.selectedUseBorrowedItem = null;
    this.useBorrowedTechnicianId = '';
    this.useBorrowedQuantity = 1;
  }

  submitUseBorrowedFromModal(): void {
    if (!this.canUseBorrowedProducts) {
      this.toastr.info('\u0110\u01a1n h\u00e0ng \u0111\u00e3 ho\u00e0n th\u00e0nh ho\u1eb7c \u0111\u00e3 h\u1ee7y, kh\u00f4ng th\u1ec3 ghi nh\u1eadn d\u00f9ng h\u00e0ng m\u01b0\u1ee3n.');
      this.closeUseBorrowedModal();
      return;
    }

    if (!this.selectedUseBorrowedItem) {
      return;
    }

    const quantity = Number(this.useBorrowedQuantity || 0);
    const remaining = this.selectedUseBorrowedRemaining;

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > remaining) {
      this.toastr.warning(`Số lượng phải từ 1 đến ${remaining}.`);
      return;
    }

    if (this.selectedTechnicianIds.length > 1 && !this.useBorrowedTechnicianId) {
      this.toastr.warning('Vui lòng chọn kỹ thuật viên đã dùng hàng mượn.');
      return;
    }

    this.submitUseBorrowed(this.selectedUseBorrowedItem, quantity);
  }

  private submitUseBorrowed(
    item: InventoryDetail,
    quantity: number
  ): void {
    this.isSavingUseBorrowed = true;
    this.orderService
      .UseBorrowed(this.id, {
        TechnicianId: this.useBorrowedTechnicianId || this.selectedTechnicianIds[0],
        ProductId: this.getProductId(item),
        Quantity: quantity,
      })
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.isSavingUseBorrowed = false;
          if (!this.isCommandSuccess(response)) {
            this.toastr.error(
              this.getCommandMessage(response, 'Ghi nhận dùng hàng mượn thất bại.')
            );
            return;
          }

          this.toastr.success(
            this.getCommandMessage(response, 'Đã ghi nhận dùng hàng mượn.')
          );
          this.isUseBorrowedVisible = false;
          this.selectedUseBorrowedItem = null;
          this.useBorrowedTechnicianId = '';
          this.useBorrowedQuantity = 1;
          this.getOrderDetail(this.id);
        },
        error: (err) => {
          this.isSavingUseBorrowed = false;
          this.toastr.error(
            err.error?.Message ||
              err.error?.message ||
              'Ghi nhận dùng hàng mượn thất bại.'
          );
        },
      });
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

  private getHttpErrorMessage(error: any, fallback: string): string {
    return error?.error?.Message ?? error?.error?.message ?? fallback;
  }

  private normalizeSerialNumber(value: string): string {
    return value.trim();
  }

  private hasSerialInOrder(serialNumber: string, targetItem: InventoryDetail): boolean {
    const normalized = serialNumber.toLowerCase();

    return this.orderLineItems.some((item) => {
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
    if (!this.canEditProducts) {
      this.toastr.info('Đơn đã xuất hàng cho kỹ thuật, không thể sửa serial.');
      return;
    }

    if (!this.isSerialTracked(item)) {
      return;
    }

    const existing = this.getSerialNumbers(item).join('\n');

    this.modal.create({
      nzTitle: `Chọn Serial xuất kho - ${item.ProductName}`,
      nzContent: `
        <textarea id="orderUpdateSnInput"
          style="width:100%;height:220px;border:1px solid #d9d9d9;border-radius:12px;padding:12px;outline:none"
          placeholder="Mỗi dòng 1 serial">${existing}</textarea>
      `,
      nzOkText: 'Lưu SN',
      nzCancelText: 'Đóng',
      nzOnOk: () => {
        const textarea = document.getElementById(
          'orderUpdateSnInput'
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
    if (!this.canEditProducts) {
      this.toastr.info('Đơn đã xuất hàng cho kỹ thuật, không thể quét serial.');
      return;
    }

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
      this.scanner = new Html5Qrcode('order-update-serial-qr-reader');
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

  startEdit(item: InventoryDetail): void {
    if (!this.canEditProducts) {
      this.toastr.info('Đơn đã xuất hàng cho kỹ thuật, không thể sửa sản phẩm.');
      return;
    }

    if (this.isSerialTracked(item)) {
      this.openSerialTextModal(item);
      return;
    }

    this.editingId = item.Id;
    this.editingQuantity = item.Quantity;
  }

  onPrint() {
    const { customerName, phoneNumber, description, deliveryAddress } =
      this.orderForm.getRawValue();

    this.customer = {
      id: '',
      name: customerName,
      phone: phoneNumber,
      address: deliveryAddress,
      description: description,
    };

    // ✅ Sắp xếp theo cụm tên sản phẩm rồi theo thông số
    this.allData = [...this.listOfData].sort((a, b) => {
      // 1️⃣ Tách phần tên và phần thông số
      const [nameA, ...restA] = a.ProductName.split(' - ').map((s: string) =>
        s.trim()
      );
      const [nameB, ...restB] = b.ProductName.split(' - ').map((s: string) =>
        s.trim()
      );

      // 2️⃣ So sánh cụm tên
      const nameCompare = nameA.localeCompare(nameB);
      if (nameCompare !== 0) return nameCompare;

      // 3️⃣ Hàm parse thông số: ví dụ "5H - 3M6" → [5, 3, 6]
      const parseSpecs = (arr: string[]): number[] => {
        const regex = /(\d+)H.*?(\d+)M(\d+)/i;
        const joined = arr.join(' - ');
        const match = joined.match(regex);
        if (!match) return [0, 0, 0];
        return match.slice(1).map((n: string) => Number(n));
      };

      const [hA, mA, dA] = parseSpecs(restA);
      const [hB, mB, dB] = parseSpecs(restB);

      // 4️⃣ So sánh lần lượt H, M, số sau M
      if (hA !== hB) return hA - hB;
      if (mA !== mB) return mA - mB;
      return dA - dB;
    });

    // ✅ Thực hiện in
    this.showPrint = true;

    setTimeout(() => {
      this.showPrint = true;
      setTimeout(() => {
        window.print();
        this.showPrint = false;
      }, 100);
    }, 0);
  }

  // Hàm tính tổng tiền
  updateTotalAmount() {
    this.totalAmount = this.orderLineItems.reduce(
      (sum, item) => sum + (item.TotalPrice ?? 0),
      0
    );
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
    if (!this.canEditProducts) {
      this.toastr.info('Đơn đã xuất hàng cho kỹ thuật, không thể xóa sản phẩm.');
      return;
    }

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
        this.updateExistingProductIds();
        this.updateTotalAmount();
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
    if (!this.canEditProducts) {
      this.toastr.info('Đơn đã xuất hàng cho kỹ thuật, không thể thêm sản phẩm.');
      return;
    }

    if (!productList || productList.length === 0) {
      this.closeProductPopup();
      return;
    }

    // Gộp sản phẩm mới vào list
    this.listOfData = [...this.listOfData, ...productList];
    this.updateExistingProductIds();

    // Loại bỏ trùng sản phẩm
    this.listOfData = this.listOfData.filter(
      (item, index, self) =>
        index ===
        self.findIndex((t) => this.getProductId(t) === this.getProductId(item))
    );
    this.listOfData = [...this.listOfData].sort((a, b) =>
      a.ProductName.localeCompare(b.ProductName)
    );

    // Set giá mặc định (trước khi check DealerLevel)
    this.listOfData = this.listOfData.map((item) => ({
      ...item,
      SerialNumbers: item.SerialNumbers ?? [],
      Quantity: this.isSerialTracked(item)
        ? (item.SerialNumbers ?? []).length
        : item.Quantity && item.Quantity > 0
          ? item.Quantity
          : 1,
      SalePrice: item.SalePrice ?? 0,
      TotalPrice:
        (item.SalePrice ?? 0) *
        (this.isSerialTracked(item)
          ? (item.SerialNumbers ?? []).length
          : item.Quantity && item.Quantity > 0
            ? item.Quantity
            : 1),
    }));

    // ✅ Nếu customerType = 2 (Đại lý) thì lấy bảng giá DealerLevel
    if (this.customerType === 2 && this.dealerLevelId) {
      this.dealerLevelService
        .ReadByIdDealerLevel(this.dealerLevelId)
        .subscribe({
          next: (res) => {
            const dealerPrices =
              res.DealerLevel.DealerPriceForDealerLevel || [];

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

    this.updateExistingProductIds();
    this.closeProductPopup();
  }

  closeProductPopup(): void {
    this.isPopupSearchProducts = false;
  }

  addProducts(): void {
    if (!this.canEditProducts) {
      this.toastr.info('Đơn đã xuất hàng cho kỹ thuật, không thể thêm sản phẩm.');
      return;
    }

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
    return item.Id || this.getProductId(item);
  }

  submitForm(): void {
    const formValues = this.orderForm.getRawValue();
    const isDealerOrder = this.customerType === 2;
    const isDescriptionOnlyUpdate = this.isDescriptionOnlyOrder;

    if (!isDescriptionOnlyUpdate && isDealerOrder && !this.customerId) {
      this.toastr.warning('Vui lòng chọn đại lý trước khi cập nhật đơn hàng.');
      return;
    }

    const missingSerialItem = isDescriptionOnlyUpdate
      ? undefined
      : this.orderLineItems.find(
          (item) => this.isSerialTracked(item) && this.getSerialNumbers(item).length === 0
        );

    if (missingSerialItem) {
      this.toastr.warning(
        `Vui lòng quét hoặc nhập SN cho ${missingSerialItem.ProductName}.`
      );
      return;
    }

    const payload: UpdateOrderRequest = {
      Id: this.id,
      StatusId: this.statusId,
      RowVersion: this.rowVersion,
      CustomerType: isDealerOrder ? 2 : 1,
      CustomerName: formValues.customerName,
      CustomerPhone: formValues.phoneNumber,
      DeliveryAddress: formValues.deliveryAddress,
      Description: formValues.description || null,
      Details: this.orderLineItems.map((item) => {
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

    if (isDealerOrder && this.customerId) {
      payload.CustomerId = this.customerId;
    }

    if (this.selectedTechnicianIds.length) {
      payload.TechnicianIds = [...this.selectedTechnicianIds];
    }

    if (this.installationDate) {
      payload.InstallationDate = this.installationDate;
    }

    this.isSubmitting = true;
    this.orderService.UpdateOrder(payload).subscribe({
      next: (response) => {
        if (!this.isCommandSuccess(response)) {
          this.toastr.error(
            this.getCommandMessage(response, 'Cập nhật đơn hàng thất bại')
          );
          this.isSubmitting = false;
          return;
        }

        this.toastr.success('Cập nhật đơn hàng thành công!');
        this.getOrderDetail(this.id);
      },
      error: (err) => {
        const userMessage =
          err.error?.Message ||
          err.error?.message ||
          'Cập nhật đơn hàng thất bại';
        this.toastr.error(userMessage);
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
