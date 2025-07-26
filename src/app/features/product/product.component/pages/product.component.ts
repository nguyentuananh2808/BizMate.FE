import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { HeaderCommonComponent } from '../../../shared/header-common.component/header-common.component';
import { RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { BottomMenuComponent } from '../../../shared/bottom-menu.component/bottom-menu.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTableModule } from 'ng-zorro-antd/table';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { Product } from '../models/product-response.model';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from '../services/product-service';
import { Location } from '@angular/common';
import * as XLSX from 'xlsx';
import saveAs from 'file-saver';
import { ProductPopupCreateComponent } from '../../product-popup-create.component/pages/product-popup-create.component';
import { ProductPopupUpdateComponent } from '../../product-popup-update.component/product-popup-update.component';
import { UnitTextPipe } from '../../../../shared/pipes/unit-text-pipe';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { MenuComponent } from '../../../shared/menu.component/menu.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

@Component({
  selector: 'product',
  standalone: true,
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
    ProductPopupCreateComponent,
    ProductPopupUpdateComponent,
    UnitTextPipe,
    NzDropDownModule,
    NzMenuModule,
    MenuComponent,
    NzPaginationModule,
  ],
  providers: [DatePipe],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit {
  isLoading = false;
  activeDropdown: any = null;
  listOfData: Product[] = [];
  originalData: Product[] = [];
  listOfCurrentPageData: Product[] = [];
  setOfCheckedId = new Set<string>();
  checked = false;
  indeterminate = false;
  searchKeyword = '';
  isMobile = window.innerWidth < 768;
  selectedItem!: Product;
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
    private productService: ProductService,
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

  closeDropdown() {
    this.activeDropdown = null;
  }

  createProduct() {
    this.showPopupCreate = true;
  }
  viewDetail(item: Product) {
    this.selectedItem = item;
    this.showPopup = true;
  }
  closeProductDetailPopup() {
    this.showPopup = false;
    setTimeout(() => (this.showPopup = false), 300);
  }
  closeProductPopupCreate() {
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
    this.productService
      .SearchProduct(this.searchKeyword || null, pageSize, pageIndex, undefined)
      .subscribe({
        next: (res) => {
          this.originalData = res.Products || [];
          this.totalCount = res.TotalCount || 0;

          setTimeout(() => {
            this.listOfData = [...this.originalData].sort((a, b) =>
              a.Code.localeCompare(b.Code)
            );
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        },
        error: () => (this.isLoading = false),
      });
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.searchKeyword = this.searchKeyword.trim();
    this.fetchData(this.pageIndex, this.pageSize);
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

  onCurrentPageDataChange(data: readonly Product[]): void {
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
  trackById(index: number, item: Product): string {
    return item.Id;
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
    saveAs(data, `${fileName}.xlsx`);
  }
  exportToExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([]);
    const header = [
      'Mã sản phẩm',
      'Tên sản phẩm',
      'Số lượng',
      'Đơn vị',
      'Loại sản phẩm',
      'Nhà cung cấp',
      'Mô tả',
      'Ngày tạo',
      'Ngày cập nhật',
      'Trạng thái',
    ];
    XLSX.utils.sheet_add_aoa(ws, [header], { origin: 'A1' });
    const data = this.listOfData.map((i) => [
      i.Code,
      i.Name,
      i.Quantity,
      i.Name,
      i.SupplierName,
      i.Description || '',
      this.datePipe.transform(i.CreatedDate, 'dd/MM/yyyy'),
      this.datePipe.transform(i.UpdatedDate, 'dd/MM/yyyy'),
      i.IsActive == false ? 'Hoạt động' : 'Ngưng hoạt động',
    ]);
    XLSX.utils.sheet_add_aoa(ws, data, { origin: -1 });
    const wb: XLSX.WorkBook = {
      Sheets: { 'Danh sách sản phẩm': ws },
      SheetNames: ['Danh sách sản phẩm'],
    };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'danh_sach_san_pham');
  }

  deleteProduct(item: Product): void {
    this.modal.confirm({
      nzTitle: `Bạn có chắc muốn xóa sản phẩm "<b>${item.Name}</b>" này ?`,
      // nzContent: `<b>${item.Name}</b> sẽ bị xóa khỏi hệ thống.`,
      nzOkText: 'Xóa',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.productService.DeleteProduct(item.Id).subscribe({
          next: () => {
            this.fetchData();
            this.toastr.success('Đã xóa thành công');
          },
          error: () => {
            this.toastr.error('Xóa thất bại');
          },
        });
      },
    });
  }
}
