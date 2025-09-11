import { DealerLevel } from './../../models/dealer-level.model';
import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Directive,
  OnInit,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTableModule } from 'ng-zorro-antd/table';
import { BottomMenuComponent } from '../../../shared/bottom-menu.component/bottom-menu.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Router, RouterModule } from '@angular/router';
import { HeaderCommonComponent } from '../../../shared/header-common.component/header-common.component';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuComponent } from '../../../shared/menu.component/menu.component';
import { NzPaginationComponent } from 'ng-zorro-antd/pagination';
import { SearchWarehouseRequest } from '../../../inventory-receipt/models/warehouse-receipt-search-request.model';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { DealerLevelService } from '../../services/dealer-level-service';
import { DealerLevelSearchRequest } from '../../models/dealer-level-search-request.model';

@Component({
  selector: 'dealer-level',
  imports: [
    NzDatePickerModule,
    CommonModule,
    FormsModule,
    NzTableModule,
    NzCheckboxModule,
    NzButtonModule,
    BottomMenuComponent,
    NzIconModule,
    RouterModule,
    HeaderCommonComponent,
    NzModalModule,
    NzFloatButtonModule,
    MenuComponent,
    NzPaginationComponent,
  ],
  templateUrl: './dealer-level.component.html',
  styleUrls: ['./dealer-level.component.scss'],
  providers: [DatePipe],
})
export class DealerLevelComponent implements OnInit {
  isLoading = false;
  activeDropdown: any = null;
  listOfData: DealerLevel[] = [];
  originalData: DealerLevel[] = [];
  listOfCurrentPageData: DealerLevel[] = [];
  setOfCheckedId = new Set<string>();
  checked = false;
  indeterminate = false;
  searchKeyword = '';
  isMobile = window.innerWidth < 768;
  selectedItem!: DealerLevel;
  isDark = false;
  showPopup = false;
  showPopupCreate = false;
  sidebarVisible = false;
  isCollapsed = true;
  pageSize = 10;
  pageIndex = 1;
  totalCount = 0;
  showTooltip = false;
  dateRange: [Date, Date] | null = null;
  placement: 'bottomLeft' | 'bottomRight' = 'bottomLeft';

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 768;
  }

  constructor(
    private DealerLevelService: DealerLevelService,
    private cdr: ChangeDetectorRef,
    private modal: NzModalService,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private location: Location,
    private router: Router
  ) {}

  onRefetch(): void {
    this.fetchData();
  }

  ngOnInit(): void {
    this.checkIsMobile();
    window.addEventListener('resize', () => this.checkIsMobile());
    this.fetchData();
  }
  checkIsMobile() {
    this.isMobile = window.innerWidth <= 768;
    if (this.isMobile) {
      this.sidebarVisible = false;
    }
  }
  goBack(): void {
    this.location.back();
  }

  toggleDropdown(item: any) {
    this.activeDropdown = this.activeDropdown === item ? null : item;
  }

  closeDropdown() {
    this.activeDropdown = null;
  }

  createDealerLevel() {
    this.showPopupCreate = true;
  }
  viewDetail(item: DealerLevel) {
    this.selectedItem = item;
    this.showPopup = true;
    this.router.navigate(['/dealer-level-update', item.Id]);
  }
  closeDealerLevelDetailPopup() {
    this.showPopup = false;
    setTimeout(() => (this.showPopup = false), 300);
  }
  closeDealerLevelPopupCreate() {
    this.showPopupCreate = false;
    this.fetchData();
    setTimeout(() => (this.showPopup = false), 300);
  }
  onPageChange(page: number): void {
    this.pageIndex = page;
    this.fetchData(this.pageIndex, this.pageSize);
  }
  fetchData(
    pageIndex: number = this.pageIndex,
    pageSize: number = this.pageSize
  ): void {
    this.isLoading = true;

    const request: DealerLevelSearchRequest = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      keySearch: this.searchKeyword.trim(),
    };

    this.DealerLevelService.SearchDealerLevel(request).subscribe({
      next: (res) => {
        this.originalData = (res.DealerLevels || []).map((item) => ({
          ...item,
          CreatedDate: new Date(item.CreatedDate),

          UpdatedDate: new Date(item.UpdatedDate),
        }));
        console.log('data', this.originalData);
        this.totalCount = res.TotalCount || 0;

        this.listOfCurrentPageData = this.originalData;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => (this.isLoading = false),
    });
  }

  onSearch(): void {
    this.searchKeyword = this.searchKeyword.trim();
    this.fetchData(this.pageIndex, this.pageSize);
    this.cdr.detectChanges();
  }
  deleteDealerLevel(item: DealerLevel): void {
    this.modal.confirm({
      nzTitle: `Bạn có chắc muốn xóa khách hàng "<b>${item.Name}</b>" này ?`,
      // nzContent: `<b>${item.Name}</b> sẽ bị xóa khỏi hệ thống.`,
      nzOkText: 'Xóa',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.DealerLevelService.DeleteDealerLevel(item.Id).subscribe({
          next: () => {
            this.fetchData();
            this.toastr.success('Đã xóa thành công');
          },
          error: (err) => {
            const apiMessage = err.error?.Message;
            let userMessage = 'Xóa khách hàng thất bại.';

            if (apiMessage === 'BACKEND.APP_MESSAGE.DATA_NOT_EXIST') {
              userMessage = 'Đại lý không tồn tại trong hệ thống.';
            } else if (apiMessage) {
              userMessage = apiMessage;
            }
            this.toastr.error(userMessage);
          },
        });
      },
    });
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
  onCurrentPageDataChange(data: readonly DealerLevel[]) {
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
  trackById(index: number, item: DealerLevel): string {
    return item.Id;
  }

  toggleTooltip() {
    this.showTooltip = !this.showTooltip;
  }

  hideTooltip() {
    this.showTooltip = false;
  }

  applyDateFilter() {
    console.log('Áp dụng filter:', this.dateRange);
    this.hideTooltip();
    this.fetchData(this.pageIndex, this.pageSize);
  }

  clearDateFilter() {
    this.dateRange = null;
    this.hideTooltip();
    this.fetchData(this.pageIndex, this.pageSize);
  }
}
