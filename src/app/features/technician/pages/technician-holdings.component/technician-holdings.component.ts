import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { BottomMenuComponent } from '../../../shared/bottom-menu.component/bottom-menu.component';
import { HeaderCommonComponent } from '../../../shared/header-common.component/header-common.component';
import { MenuComponent } from '../../../shared/menu.component/menu.component';
import { InventoryDetail } from '../../../inventory-receipt/models/warehouse-receipt-detail.model';
import { ProductPopupSearchComponent } from '../../../product/product-popup-search.component/product-popup-search.component';
import { ProductQrScanButtonComponent } from '../../../product/product-qr-scan-button.component/product-qr-scan-button.component';
import {
  CreateBorrowRequest,
  SaveTechnicianRequest,
  Technician,
  TechnicianBorrowRequest,
  TechnicianBorrowRequestStatus,
  TechnicianBorrowType,
  TechnicianHoldingGroup,
  TechnicianHoldingItem,
} from '../../models/technician.model';
import { TechnicianHoldingService } from '../../services/technician-holding.service';
import { TechnicianService } from '../../services/technician.service';

type HoldingViewMode = 'all' | 'overdue';

@Component({
  standalone: true,
  selector: 'technician-holdings',
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzEmptyModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSpinModule,
    NzTagModule,
    MenuComponent,
    HeaderCommonComponent,
    BottomMenuComponent,
    ProductPopupSearchComponent,
    ProductQrScanButtonComponent,
  ],
  templateUrl: './technician-holdings.component.html',
  styleUrls: ['./technician-holdings.component.scss'],
})
export class TechnicianHoldingsComponent implements OnInit {
  readonly isTechnicianUser =
    (localStorage.getItem('role') || '').toLowerCase() === 'technician';
  technicians: Technician[] = [];
  holdings: TechnicianHoldingGroup[] = [];
  borrowRequests: TechnicianBorrowRequest[] = [];
  allBorrowRequests: TechnicianBorrowRequest[] = [];
  selectedTechnicianId = '';
  keyword = '';
  mode: HoldingViewMode = 'all';
  isLoading = false;
  isLoadingRequests = false;
  isSavingTechnician = false;
  isSavingBorrowRequest = false;
  isTechnicianModalOpen = false;
  isBorrowRequestModalOpen = false;
  isBorrowProductPopupOpen = false;
  editingTechnician: Technician | null = null;
  isMobile = window.innerWidth < 768;
  returnQuantities: Record<string, number> = {};
  requestStatusFilter: TechnicianBorrowRequestStatus | null =
    TechnicianBorrowRequestStatus.Pending;
  readonly requestStatus = TechnicianBorrowRequestStatus;
  readonly borrowTypeEnum = TechnicianBorrowType;
  readonly borrowTypes = [
    {
      value: TechnicianBorrowType.Daily,
      label: 'Mượn trong ngày',
      hint: 'Không trừ tồn thực tế, chỉ giữ chỗ cho đến khi trả hoặc sử dụng.',
    },
    {
      value: TechnicianBorrowType.Assigned,
      label: 'Cấp giữ kỹ thuật',
      hint: 'Trừ tồn ngay khi thủ kho duyệt.',
    },
  ];
  borrowForm = this.createEmptyBorrowForm();
  borrowItems: Array<{
    ProductId: string;
    ProductName: string;
    ProductCode?: string;
    Quantity: number;
    Available?: number;
  }> = [];
  technicianForm: SaveTechnicianRequest = {
    Name: '',
    Phone: '',
    ZaloPhone: '',
    IsActive: true,
  };

  constructor(
    private technicianService: TechnicianService,
    private holdingService: TechnicianHoldingService,
    private toastr: ToastrService,
    private modal: NzModalService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.isTechnicianUser) {
      this.requestStatusFilter = null;
      this.loadBorrowRequests();
      return;
    }

    this.loadTechnicians();
    this.loadHoldings();
    this.loadBorrowRequests();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isMobile = (event.target as Window).innerWidth < 768;
  }

  get totalQuantity(): number {
    return this.holdings.reduce(
      (sum, group) => sum + Number(group.TotalQuantity || 0),
      0
    );
  }

  get overdueItemCount(): number {
    return this.holdings.reduce(
      (sum, group) =>
        sum + group.Items.filter((item) => item.IsOverdue).length,
      0
    );
  }

  get pendingRequestCount(): number {
    return this.allBorrowRequests.filter(
      (item) => item.RequestStatus === TechnicianBorrowRequestStatus.Pending
    ).length;
  }

  get selectedBorrowProductIds(): string[] {
    return this.borrowItems.map((item) => item.ProductId);
  }

  get selectedBorrowTypeHint(): string {
    return (
      this.borrowTypes.find((item) => item.value === this.borrowForm.BorrowType)
        ?.hint || ''
    );
  }

  get selectedTechnicianName(): string {
    if (!this.selectedTechnicianId) return 'Tất cả kỹ thuật viên';

    return (
      this.technicians.find((item) => item.Id === this.selectedTechnicianId)
        ?.Name || this.selectedTechnicianId
    );
  }

  loadTechnicians(): void {
    this.technicianService
      .getTechnicians(this.keyword, false)
      .pipe(finalize(() => this.refreshView()))
      .subscribe({
        next: (response) => {
          this.technicians = response.Technicians || [];
        },
        error: () => {
          this.toastr.error('Không thể tải danh sách kỹ thuật viên.');
        },
      });
  }

  searchTechnicians(): void {
    this.loadTechnicians();
  }

  changeMode(mode: HoldingViewMode): void {
    this.mode = mode;
    this.loadHoldings();
  }

  loadHoldings(): void {
    this.isLoading = true;
    this.refreshView();
    const request =
      this.mode === 'overdue'
        ? this.holdingService.getOverdue()
        : this.holdingService.getHoldings(this.selectedTechnicianId || undefined);

    request
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.refreshView();
        })
      )
      .subscribe({
        next: (response) => {
          this.holdings = response.Technicians || [];
          this.seedReturnQuantities();
        },
        error: () => {
          this.holdings = [];
          this.toastr.error('Không thể tải danh sách hàng kỹ thuật đang giữ.');
        },
      });
  }

  loadBorrowRequests(): void {
    this.isLoadingRequests = true;
    this.refreshView();

    this.holdingService
      .getBorrowRequests(
        undefined,
        this.selectedTechnicianId || undefined
      )
      .pipe(
        finalize(() => {
          this.isLoadingRequests = false;
          this.refreshView();
        })
      )
      .subscribe({
        next: (response) => {
          this.allBorrowRequests = response.Requests || [];
          this.filterBorrowRequests();
        },
        error: () => {
          this.allBorrowRequests = [];
          this.borrowRequests = [];
          this.toastr.error('Không thể tải danh sách đề xuất mượn hàng.');
        },
      });
  }

  filterBorrowRequests(): void {
    this.borrowRequests = this.requestStatusFilter === null
      ? [...this.allBorrowRequests]
      : this.allBorrowRequests.filter(
          (item) => item.RequestStatus === this.requestStatusFilter
        );
    this.refreshView();
  }

  onTechnicianFilterChange(): void {
    if (this.mode === 'overdue') {
      this.mode = 'all';
    }

    this.loadHoldings();
    this.loadBorrowRequests();
  }

  openBorrowRequestModal(): void {
    this.borrowForm = this.createEmptyBorrowForm();
    this.borrowForm.TechnicianId = this.selectedTechnicianId || '';
    this.borrowItems = [];
    this.isBorrowRequestModalOpen = true;
  }

  closeBorrowRequestModal(): void {
    if (this.isSavingBorrowRequest) return;
    this.isBorrowRequestModalOpen = false;
    this.isBorrowProductPopupOpen = false;
  }

  openBorrowProductPopup(): void {
    this.isBorrowProductPopupOpen = true;
  }

  closeBorrowProductPopup(): void {
    this.isBorrowProductPopupOpen = false;
  }

  onSelectedBorrowProducts(products: InventoryDetail[]): void {
    const existingIds = new Set(this.borrowItems.map((item) => item.ProductId));
    const nextItems = products
      .filter((product) => !existingIds.has(product.ProductId))
      .map((product) => ({
        ProductId: product.ProductId,
        ProductName: product.ProductName,
        ProductCode: product.ProductCode,
        Quantity: 1,
        Available: Number(product.Available || 0),
      }));

    this.borrowItems = [...this.borrowItems, ...nextItems];
    this.closeBorrowProductPopup();
  }

  setBorrowQuantity(productId: string, value: number): void {
    const quantity = Math.max(1, Math.trunc(Number(value) || 1));
    this.borrowItems = this.borrowItems.map((item) =>
      item.ProductId === productId ? { ...item, Quantity: quantity } : item
    );
  }

  removeBorrowItem(productId: string): void {
    this.borrowItems = this.borrowItems.filter(
      (item) => item.ProductId !== productId
    );
  }

  submitBorrowRequest(): void {
    if (!this.isTechnicianUser && !this.borrowForm.TechnicianId) {
      this.toastr.warning('Vui lòng chọn kỹ thuật viên cần mượn hàng.');
      return;
    }

    if (!this.borrowItems.length) {
      this.toastr.warning('Vui lòng chọn ít nhất một sản phẩm cần mượn.');
      return;
    }

    if (
      this.borrowItems.some(
        (item) => !Number.isInteger(item.Quantity) || item.Quantity <= 0
      )
    ) {
      this.toastr.warning('Số lượng mượn phải là số nguyên lớn hơn 0.');
      return;
    }

    const insufficientItem = this.borrowItems.find(
      (item) => item.Quantity > Number(item.Available || 0)
    );
    if (insufficientItem) {
      this.toastr.warning(
        `${insufficientItem.ProductName} chỉ còn ${insufficientItem.Available || 0} sản phẩm khả dụng.`
      );
      return;
    }

    const payload: CreateBorrowRequest = {
      TechnicianId: this.borrowForm.TechnicianId,
      BorrowType: this.borrowForm.BorrowType,
      NeededDate: this.borrowForm.NeededDate,
      Description: this.borrowForm.Description?.trim() || null,
      Items: this.borrowItems.map((item) => ({
        ProductId: item.ProductId,
        Quantity: item.Quantity,
      })),
    };

    this.isSavingBorrowRequest = true;
    this.refreshView();
    this.holdingService
      .createBorrowRequest(payload)
      .pipe(
        finalize(() => {
          this.isSavingBorrowRequest = false;
          this.refreshView();
        })
      )
      .subscribe({
        next: () => {
          this.toastr.success('Đã gửi đề xuất mượn hàng.');
          if (this.isTechnicianUser) {
            this.borrowForm = this.createEmptyBorrowForm();
            this.borrowItems = [];
          } else {
            this.closeBorrowRequestModal();
          }
          this.loadBorrowRequests();
        },
        error: (err) => {
          this.toastr.error(
            err.error?.Message ||
              err.error?.message ||
              'Gửi đề xuất mượn hàng thất bại.'
          );
        },
      });
  }

  approveBorrowRequest(request: TechnicianBorrowRequest): void {
    this.modal.confirm({
      nzTitle: `Duyệt đề xuất ${request.Code}?`,
      nzOkText: 'Duyệt và xuất',
      nzCancelText: 'Đóng',
      nzOnOk: () => {
        this.holdingService.approveBorrowRequest(request.Id).subscribe({
          next: () => {
            this.toastr.success('Đã duyệt đề xuất mượn hàng.');
            this.loadBorrowRequests();
            this.loadHoldings();
          },
          error: (err) => {
            this.toastr.error(
              err.error?.Message ||
                err.error?.message ||
                'Duyệt đề xuất thất bại.'
            );
          },
        });
      },
    });
  }

  rejectBorrowRequest(request: TechnicianBorrowRequest): void {
    this.modal.confirm({
      nzTitle: `Từ chối đề xuất ${request.Code}?`,
      nzOkText: 'Từ chối',
      nzCancelText: 'Đóng',
      nzOnOk: () => {
        this.holdingService.rejectBorrowRequest(request.Id).subscribe({
          next: () => {
            this.toastr.success('Đã từ chối đề xuất.');
            this.loadBorrowRequests();
          },
          error: (err) => {
            this.toastr.error(
              err.error?.Message ||
                err.error?.message ||
                'Từ chối đề xuất thất bại.'
            );
          },
        });
      },
    });
  }

  openCreateTechnician(): void {
    this.editingTechnician = null;
    this.technicianForm = {
      Name: '',
      Phone: '',
      ZaloPhone: '',
      IsActive: true,
    };
    this.isTechnicianModalOpen = true;
  }

  openEditTechnician(technician: Technician): void {
    this.editingTechnician = technician;
    this.technicianForm = {
      Name: technician.Name,
      Phone: technician.Phone || '',
      ZaloPhone: technician.ZaloPhone || '',
      IsActive: technician.IsActive,
    };
    this.isTechnicianModalOpen = true;
  }

  openEditHoldingTechnician(group: TechnicianHoldingGroup): void {
    const technician =
      this.technicians.find((item) => item.Id === group.TechnicianId) || null;

    if (!technician) {
      this.toastr.warning('Không tìm thấy thông tin kỹ thuật viên để sửa.');
      return;
    }

    this.openEditTechnician(technician);
  }

  closeTechnicianModal(): void {
    if (this.isSavingTechnician) return;
    this.isTechnicianModalOpen = false;
  }

  saveTechnician(): void {
    const name = this.technicianForm.Name.trim();

    if (!name) {
      this.toastr.warning('Vui lòng nhập tên kỹ thuật viên.');
      return;
    }

    const payload: SaveTechnicianRequest = {
      Name: name,
      Phone: this.technicianForm.Phone?.trim() || null,
      ZaloPhone: this.technicianForm.ZaloPhone?.trim() || null,
      IsActive: this.technicianForm.IsActive,
    };

    this.isSavingTechnician = true;
    this.refreshView();
    const request = this.editingTechnician
      ? this.technicianService.updateTechnician(this.editingTechnician.Id, payload)
      : this.technicianService.createTechnician(payload);

    request
      .pipe(
        finalize(() => {
          this.isSavingTechnician = false;
          this.refreshView();
        })
      )
      .subscribe({
        next: () => {
          this.isTechnicianModalOpen = false;
          this.toastr.success(
            this.editingTechnician
              ? 'Cập nhật kỹ thuật viên thành công.'
              : 'Tạo kỹ thuật viên thành công.'
          );
          this.loadTechnicians();
        },
        error: (err) => {
          this.toastr.error(
            err.error?.Message ||
              err.error?.message ||
              'Lưu kỹ thuật viên thất bại.'
          );
        },
      });
  }

  getReturnKey(
    group: TechnicianHoldingGroup,
    item: TechnicianHoldingItem
  ): string {
    return `${group.TechnicianId}:${item.ProductId}:${item.BorrowType}`;
  }

  getReturnQuantity(
    group: TechnicianHoldingGroup,
    item: TechnicianHoldingItem
  ): number {
    return this.returnQuantities[this.getReturnKey(group, item)] || item.Quantity;
  }

  setReturnQuantity(
    group: TechnicianHoldingGroup,
    item: TechnicianHoldingItem,
    value: number
  ): void {
    const quantity = Number(value);
    const safeQuantity = Number.isFinite(quantity)
      ? Math.min(Math.max(Math.trunc(quantity), 0), item.Quantity)
      : 0;

    this.returnQuantities[this.getReturnKey(group, item)] = safeQuantity;
  }

  returnItem(group: TechnicianHoldingGroup, item: TechnicianHoldingItem): void {
    const quantity = this.getReturnQuantity(group, item);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > item.Quantity) {
      this.toastr.warning(`Số lượng trả phải từ 1 đến ${item.Quantity}.`);
      return;
    }

    this.modal.confirm({
      nzTitle: `Trả ${quantity} sản phẩm "${item.ProductName}"?`,
      nzOkText: 'Trả hàng',
      nzCancelText: 'Đóng',
      nzOnOk: () => {
        this.holdingService
          .returnItems({
            TechnicianId: group.TechnicianId,
            Items: [
              {
                ProductId: item.ProductId,
                BorrowType: item.BorrowType,
                Quantity: quantity,
              },
            ],
          })
          .subscribe({
            next: () => {
              this.toastr.success('Đã ghi nhận trả hàng vào kho.');
              this.loadHoldings();
            },
            error: (err) => {
              this.toastr.error(
                err.error?.Message || err.error?.message || 'Trả hàng thất bại.'
              );
            },
          });
      },
    });
  }

  useItem(group: TechnicianHoldingGroup, item: TechnicianHoldingItem): void {
    const quantity = this.getReturnQuantity(group, item);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > item.Quantity) {
      this.toastr.warning(`Số lượng sử dụng phải từ 1 đến ${item.Quantity}.`);
      return;
    }

    this.modal.confirm({
      nzTitle: `Ghi nhận đã sử dụng ${quantity} sản phẩm "${item.ProductName}"?`,
      nzOkText: 'Đã sử dụng',
      nzCancelText: 'Đóng',
      nzOnOk: () => {
        this.holdingService
          .useHolding({
            TechnicianId: group.TechnicianId,
            ProductId: item.ProductId,
            BorrowType: item.BorrowType,
            Quantity: quantity,
            Note: 'Technician marked item as used',
          })
          .subscribe({
            next: () => {
              this.toastr.success('Đã ghi nhận kỹ thuật sử dụng hàng.');
              this.loadHoldings();
            },
            error: (err) => {
              this.toastr.error(
                err.error?.Message ||
                  err.error?.message ||
                  'Ghi nhận sử dụng thất bại.'
              );
            },
          });
      },
    });
  }

  getBorrowTypeName(type?: TechnicianBorrowType, fallback?: string): string {
    if (fallback) return fallback;

    return (
      this.borrowTypes.find((item) => item.value === type)?.label ||
      'Không xác định'
    );
  }

  copyReminder(group: TechnicianHoldingGroup, item: TechnicianHoldingItem): void {
    const message =
      item.ReminderMessage ||
      `Anh/chị ${group.TechnicianName} vui lòng kiểm tra và trả hàng còn giữ: ${item.ProductName} - SL ${item.Quantity}.`;

    navigator.clipboard
      ?.writeText(message)
      .then(() => this.toastr.success('Đã copy nội dung nhắc.'))
      .catch(() => this.toastr.info(message));
  }

  openZalo(phone?: string): void {
    if (!phone) {
      this.toastr.warning('Kỹ thuật viên chưa có số Zalo.');
      return;
    }

    window.open(`https://zalo.me/${phone}`, '_blank');
  }

  trackGroup(index: number, group: TechnicianHoldingGroup): string {
    return group.TechnicianId || `${index}`;
  }

  trackItem(index: number, item: TechnicianHoldingItem): string {
    return `${item.ProductId}:${item.BorrowType}` || `${index}`;
  }

  trackRequest(index: number, item: TechnicianBorrowRequest): string {
    return item.Id || `${index}`;
  }

  private seedReturnQuantities(): void {
    const next: Record<string, number> = {};

    for (const group of this.holdings) {
      for (const item of group.Items) {
        next[this.getReturnKey(group, item)] = item.Quantity;
      }
    }

    this.returnQuantities = next;
  }

  private createEmptyBorrowForm(): {
    TechnicianId: string;
    BorrowType: TechnicianBorrowType;
    NeededDate: string;
    Description: string;
  } {
    return {
      TechnicianId: '',
      BorrowType: TechnicianBorrowType.Daily,
      NeededDate: new Date().toISOString().slice(0, 10),
      Description: '',
    };
  }

  private refreshView(): void {
    this.cdr.markForCheck();
  }
}
