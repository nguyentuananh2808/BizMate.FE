import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Directive,
  OnInit,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
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
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { OrderService } from '../../services/order.service';
import { SearchOrderRequest } from '../../models/search-order-request.model';
import { OrderDto } from '../../models/order-dto.model';
import { StatusService } from '../../../status/services/status.service';
import { StatusDto } from '../../../status/models/status-dto.model';
import { StatusColorPipe } from '../../../../shared/pipes/status-color.pipe';

@Component({
  selector: 'order',
  imports: [
    NzDatePickerModule,
    CommonModule,
    FormsModule,
    NzTableModule,
    NzCheckboxModule,
    NzSelectModule,
    NzButtonModule,
    BottomMenuComponent,
    NzIconModule,
    RouterModule,
    HeaderCommonComponent,
    NzModalModule,
    NzFloatButtonModule,
    MenuComponent,
    NzPaginationComponent,
    StatusColorPipe,
  ],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  providers: [DatePipe],
})
export class OrderComponent implements OnInit {
  isLoading = false;
  activeDropdown: any = null;
  listOfData: OrderDto[] = [];
  originalData: OrderDto[] = [];
  listOfCurrentPageData: OrderDto[] = [];
  setOfCheckedId = new Set<string>();
  checked = false;
  indeterminate = false;
  searchKeyword = '';
  isMobile = window.innerWidth < 768;
  selectedItem!: OrderDto;
  isDark = false;
  showPopup = false;
  showPopupCreate = false;
  sidebarVisible = false;
  isCollapsed = true;
  pageSize = 10;
  pageIndex = 1;
  totalCount = 0;
  statuses: string[] = [];
  showTooltip = false;
  dateRange: [Date, Date] | null = null;
  statusList: StatusDto[] = [];
  selectedStatuses: string[] = [];
  placement: 'bottomLeft' | 'bottomRight' = 'bottomLeft';

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 768;
  }

  constructor(
    private orderService: OrderService,
    private statusService: StatusService,
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
    this.loadStatuses();
    this.fetchData();
  }

  loadStatuses() {
    this.statusService.SearchStatus('Order').subscribe({
      next: (res) => {
        this.statusList = res.Statuses;
        this.statuses = this.statusList.map((s) => s.Id);
        console.log('statuses111:', this.statuses);
      },
      error: (err) => console.error(err),
    });
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

  createOrder() {
    this.showPopupCreate = true;
  }
  viewDetail(item: OrderDto) {
    this.selectedItem = item;
    this.showPopup = true;
    this.router.navigate(['/order-update', item.Id]);
  }
  closeOrderDetailPopup() {
    this.showPopup = false;
    setTimeout(() => (this.showPopup = false), 300);
  }
  closeOrderPopupCreate() {
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
    pageSize: number = this.pageSize,
    dateFrom?: Date,
    dateTo?: Date,
    statuses?: string[]
  ): void {
    this.isLoading = true;
    // Lấy ngày đầu tháng hiện tại (00:00:00.000)
    const fromDate = dateFrom
      ? new Date(dateFrom.setHours(0, 0, 0, 0))
      : new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1,
          0,
          0,
          0,
          0
        );

    // Lấy ngày cuối tháng hiện tại (23:59:59.999)
    const toDate = dateTo
      ? new Date(dateTo.setHours(23, 59, 59, 999))
      : new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );

    const request: SearchOrderRequest = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      keySearch: this.searchKeyword.trim(),
      dateFrom: fromDate,
      dateTo: toDate,
      statusIds: statuses,
    };

    this.orderService.SearchOrder(request).subscribe({
      next: (res) => {
        this.originalData = (res.Orders || []).map((item) => ({
          ...item,
          CreatedDate: item.CreatedDate ? new Date(item.CreatedDate) : null,
          UpdatedDate: item.UpdatedDate ? new Date(item.UpdatedDate) : null,
        }));
        console.log('data', this.originalData);
        this.totalCount = res.TotalCount || 0;

        this.listOfData = [...this.originalData].sort((a, b) =>
          a.Code.localeCompare(b.Code)
        );

        this.listOfCurrentPageData = this.listOfData;
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
  onCurrentPageDataChange(data: readonly OrderDto[]) {
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
  trackById(index: number, item: OrderDto): string {
    return item.Id;
  }

  toggleTooltip() {
    this.showTooltip = !this.showTooltip;
  }

  hideTooltip() {
    this.showTooltip = false;
  }

  applyDateFilter() {
    console.log('Áp dụng filter:', {
      dateRange: this.dateRange,
      statuses: this.selectedStatuses,
    });
    this.hideTooltip();
    this.fetchData(
      this.pageIndex,
      this.pageSize,
      this.dateRange?.[0],
      this.dateRange?.[1],
      this.selectedStatuses
    );
  }

  clearDateFilter() {
    this.dateRange = null;
    this.selectedStatuses = [];
    this.hideTooltip();
    this.fetchData(this.pageIndex, this.pageSize);
  }
}
