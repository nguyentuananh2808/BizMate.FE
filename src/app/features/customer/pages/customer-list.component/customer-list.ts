import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  ChangeDetectorRef,
  OnInit,
  HostListener,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { buffer } from 'rxjs';
import { BottomMenuComponent } from '../../../shared/bottom-menu.component/bottom-menu.component';
import { HeaderCommonComponent } from '../../../shared/header-common.component/header-common.component';
import { MenuComponent } from '../../../shared/menu.component/menu.component';
import { Customer } from '../../models/customer-response.model';
import { CustomerService } from '../../services/customer-service';
import { CustomerPopupCreateComponent } from '../customer-popup-create.component/customer-popup-create.component';
import { CustomerPopupUpdateComponent } from '../customer-detail-popup.component/customer-popup-update.component';

@Component({
  selector: 'customer-list',
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
    NzDropDownModule,
    NzMenuModule,
    MenuComponent,
    NzPaginationModule,
    CustomerPopupCreateComponent,
    CustomerPopupUpdateComponent,
  ],
  providers: [DatePipe],
  templateUrl: './customer-list.html',
  styleUrls: ['./customer-list.scss'],
})
export class CustomerList implements OnInit {
  isLoading = false;
  activeDropdown: any = null;
  listOfData: Customer[] = [];
  originalData: Customer[] = [];
  listOfCurrentPageData: Customer[] = [];
  setOfCheckedId = new Set<string>();
  checked = false;
  indeterminate = false;
  searchKeyword = '';
  isMobile = window.innerWidth < 768;
  selectedItem!: Customer;
  isDark = false;
  showPopup = false;
  showPopupCreate = false;
  pageIndex = 1;
  pageSize = 10;
  totalCount = 0;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 768;
    this.cdr.detectChanges();
  }

  constructor(
    private CustomerService: CustomerService,
    private cdr: ChangeDetectorRef,
    private modal: NzModalService,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private location: Location
  ) {}

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  onRefetch(): void {
    this.fetchData();
  }

  ngOnInit(): void {
    this.fetchData();
  }

  goBack(): void {
    this.location.back();
  }

  toggleDropdown(item: any) {
    this.activeDropdown = this.activeDropdown === item ? null : item;
  }
  closeProductPopupCreate() {
    this.showPopupCreate = false;
    this.fetchData();
    setTimeout(() => (this.showPopup = false), 300);
  }

  closeDropdown() {
    this.activeDropdown = null;
  }

  createCustomer() {
    this.showPopupCreate = true;
  }
  viewDetail(item: Customer) {
    this.selectedItem = item;
    this.showPopup = true;
  }
  closeCustomerDetailPopup() {
    this.showPopup = false;
    setTimeout(() => (this.showPopup = false), 300);
  }
  closeCustomerPopupCreate() {
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
    this.CustomerService.SearchCustomer(
      this.searchKeyword || null,
      pageSize,
      pageIndex,
      undefined
    ).subscribe({
      next: (res) => {
        this.originalData = res.Customers || [];
        this.totalCount = res.TotalCount || 0;

        setTimeout(() => {
          this.listOfData = [...this.originalData].sort((a, b) =>
            a.Code.localeCompare(b.Code)
          );

          if (this.isMobile) {
            this.listOfCurrentPageData = [...this.listOfData];
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        });
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

  onCurrentPageDataChange(data: readonly Customer[]): void {
    this.listOfCurrentPageData = [...data];
  }

  refreshCheckedStatus() {
    this.checked = this.listOfCurrentPageData.every((i) =>
      this.setOfCheckedId.has(i.Id)
    );
    this.indeterminate =
      this.listOfCurrentPageData.some((i) => this.setOfCheckedId.has(i.Id)) &&
      !this.checked;
  }
  trackById(index: number, item: Customer): string {
    return item.Id;
  }

  deleteCustomer(item: Customer): void {
    this.modal.confirm({
      nzTitle: `Bạn có chắc muốn xóa khách hàng "<b>${item.Name}</b>" này ?`,
      // nzContent: `<b>${item.Name}</b> sẽ bị xóa khỏi hệ thống.`,
      nzOkText: 'Xóa',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.CustomerService.DeleteCustomer(item.Id).subscribe({
          next: () => {
            this.fetchData();
            this.toastr.success('Đã xóa thành công');
          },
          error: (err) => {
            const apiMessage = err.error?.Message;
            let userMessage = 'Xóa khách hàng thất bại.';

            if (apiMessage === 'BACKEND.APP_MESSAGE.DATA_NOT_EXIST') {
              userMessage = 'khách hàng không tồn tại trong hệ thống.';
            } else if (apiMessage) {
              userMessage = apiMessage;
            }
            this.toastr.error(userMessage);
          },
        });
      },
    });
  }
}
