import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTableModule } from 'ng-zorro-antd/table';
import { BottomMenuComponent } from '../../../shared/bottom-menu.component/bottom-menu.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { RouterModule } from '@angular/router';
import { HeaderCommonComponent } from '../../../shared/header-common.component/header-common.component';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';
import { WarehouseReceiptService } from '../../services/warehouse-receipt.service';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WarehouseReceipt } from '../../models/warehouse-receipt.model';
import { SearchWarehouseRequest } from '../../models/warehouse-receipt-search-request.model';
import { MenuComponent } from '../../../shared/menu.component/menu.component';
import { NzPaginationComponent } from 'ng-zorro-antd/pagination';

@Component({
  selector: 'warehouse-receipt',
  imports: [
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
  templateUrl: './warehouse-receipt.component.html',
  styleUrls: ['./warehouse-receipt.component.scss'],
  providers: [DatePipe],
})
export class WarehouseReceiptComponent implements OnInit {
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
    private location: Location
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

  fetchData(): void {
    this.isLoading = true;
    const request: SearchWarehouseRequest = {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      keySearch: this.searchKeyword.trim(),
      type: 1,
    };

    this.WarehouseReceiptService.SearchWarehouseReceipt(request).subscribe({
      next: (res) => {
        this.originalData = res.InventoryReceipts || [];
        this.totalCount = res.TotalCount || 0;

        this.listOfData = [...this.originalData].sort((a, b) =>
          a.Code.localeCompare(b.Code)
        );
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => (this.isLoading = false),
    });
  }
  onPageIndexChange(index: number) {
    this.pageIndex = index;
    this.fetchData();
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
}
