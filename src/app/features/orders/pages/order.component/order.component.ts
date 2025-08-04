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
import { WarehouseReceiptService } from '../../../inventory-receipt/services/warehouse-receipt.service';
import { MenuComponent } from '../../../shared/menu.component/menu.component';
import { NzPaginationComponent } from 'ng-zorro-antd/pagination';
import { WarehouseReceipt } from '../../../inventory-receipt/models/warehouse-receipt.model';
import { SearchWarehouseRequest } from '../../../inventory-receipt/models/warehouse-receipt-search-request.model';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

@Component({
  selector: 'order',
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
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  providers: [DatePipe],
})
export class OrderComponent implements OnInit {
  isLoading = false;
  activeDropdown: any = null;
  listOfData: WarehouseReceipt[] = [];
  originalData: WarehouseReceipt[] = [];
  listOfCurrentPageData: WarehouseReceipt[] = [];
  setOfCheckedId = new Set<string>();
  checked = false;
  indeterminate = false;
  searchKeyword = '';
  isMobile = window.innerWidth < 768;
  selectedItem!: WarehouseReceipt;
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
    private WarehouseReceiptService: WarehouseReceiptService,
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

  createWarehouseReceipt() {
    this.showPopupCreate = true;
  }
  viewDetail(item: WarehouseReceipt) {
    this.selectedItem = item;
    this.showPopup = true;
    this.router.navigate(['/order-update', item.Id]);
  }
  closeWarehouseReceiptDetailPopup() {
    this.showPopup = false;
    setTimeout(() => (this.showPopup = false), 300);
  }
  closeWarehouseReceiptPopupCreate() {
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
    dateTo?: Date
  ): void {
    this.isLoading = true;
    const fromDate = dateFrom
      ? new Date(dateFrom.setHours(0, 0, 0, 0))
      : undefined;
    const toDate = dateTo
      ? new Date(dateTo.setHours(23, 59, 59, 999))
      : undefined;
    const request: SearchWarehouseRequest = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      keySearch: this.searchKeyword.trim(),
      type: 2, //phiếu xuất
      dateFrom: fromDate,
      dateTo: toDate,
    };

    this.WarehouseReceiptService.SearchWarehouseReceipt(request).subscribe({
      next: (res) => {
        this.originalData = (res.InventoryReceipts || []).map((item) => ({
          ...item,
          CreatedDate: new Date(item.CreatedDate),
          
          UpdatedDate: new Date(item.UpdatedDate),
        }));
        console.log("data",this.originalData);
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
    this.pageIndex = 1;
    this.fetchData();
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
  onCurrentPageDataChange(data: readonly WarehouseReceipt[]) {
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
  trackById(index: number, item: WarehouseReceipt): string {
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
    this.fetchData(
      this.pageIndex,
      this.pageSize,
      this.dateRange?.[0],
      this.dateRange?.[1]
    );
  }

  clearDateFilter() {
    this.dateRange = null;
    this.hideTooltip();
    this.fetchData(this.pageIndex, this.pageSize);
  }
}
