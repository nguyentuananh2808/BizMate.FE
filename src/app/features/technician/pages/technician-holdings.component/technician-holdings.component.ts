import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import {
  SaveTechnicianRequest,
  Technician,
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
  ],
  templateUrl: './technician-holdings.component.html',
  styleUrls: ['./technician-holdings.component.scss'],
})
export class TechnicianHoldingsComponent implements OnInit {
  technicians: Technician[] = [];
  holdings: TechnicianHoldingGroup[] = [];
  selectedTechnicianId = '';
  keyword = '';
  mode: HoldingViewMode = 'all';
  isLoading = false;
  isSavingTechnician = false;
  isTechnicianModalOpen = false;
  editingTechnician: Technician | null = null;
  isMobile = window.innerWidth < 768;
  returnQuantities: Record<string, number> = {};
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
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.loadTechnicians();
    this.loadHoldings();
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

  get selectedTechnicianName(): string {
    if (!this.selectedTechnicianId) return 'Tất cả kỹ thuật viên';

    return (
      this.technicians.find((item) => item.Id === this.selectedTechnicianId)
        ?.Name || this.selectedTechnicianId
    );
  }

  loadTechnicians(): void {
    this.technicianService.getTechnicians(this.keyword, false).subscribe({
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
    const request =
      this.mode === 'overdue'
        ? this.holdingService.getOverdue()
        : this.holdingService.getHoldings(this.selectedTechnicianId || undefined);

    request.subscribe({
      next: (response) => {
        this.holdings = response.Technicians || [];
        this.seedReturnQuantities();
        this.isLoading = false;
      },
      error: () => {
        this.holdings = [];
        this.isLoading = false;
        this.toastr.error('Không thể tải danh sách hàng kỹ thuật đang giữ.');
      },
    });
  }

  onTechnicianFilterChange(): void {
    if (this.mode === 'overdue') {
      this.mode = 'all';
    }

    this.loadHoldings();
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
    const request = this.editingTechnician
      ? this.technicianService.updateTechnician(this.editingTechnician.Id, payload)
      : this.technicianService.createTechnician(payload);

    request.subscribe({
      next: () => {
        this.isSavingTechnician = false;
        this.isTechnicianModalOpen = false;
        this.toastr.success(
          this.editingTechnician
            ? 'Cập nhật kỹ thuật viên thành công.'
            : 'Tạo kỹ thuật viên thành công.'
        );
        this.loadTechnicians();
      },
      error: (err) => {
        this.isSavingTechnician = false;
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
    return `${group.TechnicianId}:${item.ProductId}`;
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
    this.returnQuantities[this.getReturnKey(group, item)] = Number(value) || 0;
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
    return item.ProductId || `${index}`;
  }

  private seedReturnQuantities(): void {
    const next: Record<string, number> = {};

    for (const group of this.holdings) {
      for (const item of group.Items) {
        next[this.getReturnKey(group, item)] = Math.min(1, item.Quantity);
      }
    }

    this.returnQuantities = next;
  }
}
