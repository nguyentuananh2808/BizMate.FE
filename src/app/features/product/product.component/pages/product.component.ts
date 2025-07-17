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
  ],
  providers: [DatePipe],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit {
  isLoading = false;
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

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 768;
  }

  constructor(
    private productService: ProductService,
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
    this.fetchData();
  }

  goBack(): void {
    this.location.back();
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
    setTimeout(() => (this.showPopup = false), 300);
  }

  fetchData(): void {
    this.isLoading = true;
    this.productService.SearchProduct(null, 10, 1).subscribe({
      next: (res) => {
        this.originalData = res.Products || [];
        this.listOfData = [...this.originalData];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => (this.isLoading = false),
    });
  }

  onSearch(): void {
    const kw = this.searchKeyword.trim().toLowerCase();
    this.listOfData = this.originalData.filter(
      (i) =>
        i.Code.toLowerCase().includes(kw) || i.Name.toLowerCase().includes(kw)
    );
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
  trackById(index: number, item: Product): string {
    return item.Id;
  }

  getUnitText(unit: number): string {
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
      default:
        return 'Khác';
    }
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
      this.getUnitText(i.Unit),
      i.ProductCategoryName,
      i.SupplierName,
      i.Description || '',
      this.datePipe.transform(i.CreatedDate, 'dd/MM/yyyy'),
      this.datePipe.transform(i.UpdatedDate, 'dd/MM/yyyy'),
      i.IsActive ? 'Hoạt động' : 'Ngưng hoạt động',
    ]);
    XLSX.utils.sheet_add_aoa(ws, data, { origin: -1 });
    const wb: XLSX.WorkBook = {
      Sheets: { 'Danh sách sản phẩm': ws },
      SheetNames: ['Danh sách sản phẩm'],
    };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'danh_sach_san_pham');
  }
}
