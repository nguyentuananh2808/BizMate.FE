import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { HeaderCommonComponent } from '../../../shared/header-common.component/header-common.component';
import { Router, RouterModule } from '@angular/router';
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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ProductCategoryService } from '../../../product-category/services/product-category.service';
import { ProductCategory } from '../../../product-category/models/product-category-response.model';

type ProductStockFilter = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';

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
    NzSelectModule,
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
  categories: ProductCategory[] = [];
  selectedCategoryId: string | null = null;
  stockFilter: ProductStockFilter = 'all';
  readonly lowStockThreshold = 2;
  readonly stockFilterOptions: { value: ProductStockFilter; label: string }[] = [
    { value: 'all', label: 'Tất cả tồn kho' },
    { value: 'in-stock', label: 'Còn tồn kho' },
    { value: 'low-stock', label: 'Tồn dưới 2' },
    { value: 'out-of-stock', label: 'Hết hàng' },
  ];

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 768;
    this.cdr.detectChanges();
  }

  constructor(
    private productService: ProductService,
    private categoryService: ProductCategoryService,
    private cdr: ChangeDetectorRef,
    private modal: NzModalService,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private location: Location,
    private router: Router
  ) {}

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  onRefetch(): void {
    this.fetchData();
  }

  ngOnInit(): void {
    this.loadProductCategories();
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

  viewSerials(item: Product): void {
    this.router.navigate(['/product-items'], {
      queryParams: { productId: item.Id },
    });
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

  onFilterChange(): void {
    this.pageIndex = 1;
    this.fetchData(1, this.pageSize);
  }

  resetFilters(): void {
    this.searchKeyword = '';
    this.selectedCategoryId = null;
    this.stockFilter = 'all';
    this.onFilterChange();
  }

  fetchData(
    pageIndex: number = this.pageIndex,
    pageSize: number = this.pageSize
  ): void {
    this.isLoading = true;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    const stockFilter =
      this.stockFilter === 'all' ? null : this.stockFilter;

    this.productService
      .SearchProduct(
        this.searchKeyword || null,
        pageSize,
        pageIndex,
        undefined,
        this.selectedCategoryId,
        stockFilter,
        stockFilter === 'low-stock' ? this.lowStockThreshold : null
      )
      .subscribe({
        next: (res) => {
          this.originalData = res.Products || [];
          this.totalCount = res.TotalCount || 0;

          if (!this.originalData.length && this.totalCount > 0 && pageIndex > 1) {
            this.pageIndex = 1;
            this.fetchData(1, pageSize);
            return;
          }

          setTimeout(() => {
            this.listOfData = [...this.originalData].sort((a, b) =>
              a.Code.localeCompare(b.Code)
            );

            this.listOfCurrentPageData = [...this.listOfData];
            this.setOfCheckedId.clear();
            this.refreshCheckedStatus();
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error(
            this.toUserMessage(
              err.error?.Message || err.error?.message,
              'Không thể tải danh sách sản phẩm.'
            )
          );
        },
      });
  }

  onSearch(): void {
    this.searchKeyword = this.searchKeyword.trim();
    this.pageIndex = 1;
    this.fetchData(1, this.pageSize);
    this.cdr.detectChanges();
  }

  private loadProductCategories(): void {
    this.categoryService.GetAll().subscribe({
      next: (res) => {
        this.categories = (res.ProductCategories || []).filter(
          (category) => !category.IsActive
        );
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastr.warning(
          'Không thể tải bộ lọc loại sản phẩm. Bạn vẫn có thể xem danh sách sản phẩm.'
        );
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

  isSerialTracked(item: Product): boolean {
    return item.IsSerialTracked ?? (item as any).isSerialTracked ?? false;
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
      'Quản lý SN',
      'Nhà cung cấp',
      'Mô tả',
      'Ngày cập nhật',
      'Trạng thái',
    ];
    XLSX.utils.sheet_add_aoa(ws, [header], { origin: 'A1' });
    const data = this.listOfData.map((i) => [
      i.Code,
      i.Name,
      i.Quantity,
      this.getUnitText(i.Unit),
      this.isSerialTracked(i) ? 'Có' : 'Không',
      i.SupplierName,
      i.Description || '',
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

  private getUnitText(unit: number): string {
    switch (unit) {
      case 1:
        return 'Cái';
      case 2:
        return 'Hộp';
      case 3:
        return 'Thùng';
      case 4:
        return 'Kg';
      case 5:
        return 'Lít';
      case 6:
        return 'Cây';
      default:
        return 'Khác';
    }
  }

  deleteProduct(item: Product): void {
    this.modal.confirm({
      nzTitle: `Bạn có chắc muốn xóa sản phẩm "<b>${item.Name}</b>" không?`,
      nzOkText: 'Xóa sản phẩm',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.productService.DeleteProduct(item.Id).subscribe({
          next: () => {
            this.fetchData();
            this.toastr.success('Đã xóa sản phẩm.');
          },
          error: (err) => {
            const apiMessage = err.error?.Message;
            let userMessage = 'Không thể xóa sản phẩm. Vui lòng thử lại.';

            if (apiMessage === 'BACKEND.APP_MESSAGE.DATA_NOT_EXIST') {
              userMessage = 'Sản phẩm không tồn tại trong hệ thống.';
            } else if (apiMessage && !apiMessage.startsWith('BACKEND.')) {
              userMessage = apiMessage;
            }
            this.toastr.error(userMessage);
          },
        });
      },
    });
  }

  private toUserMessage(apiMessage: string | undefined, fallback: string): string {
    if (!apiMessage || apiMessage.startsWith('BACKEND.')) {
      return fallback;
    }

    return apiMessage;
  }
}
