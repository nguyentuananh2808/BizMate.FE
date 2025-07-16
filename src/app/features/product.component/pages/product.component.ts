import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { HeaderCommonComponent } from '../../shared/header-common.component/header-common.component';
import { RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { BottomMenuComponent } from '../../shared/bottom-menu.component/bottom-menu.component';
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
  isDark = false;

  showPopup = false;
  showPopupCreate = false;

  toggleDarkMode(): void {
    this.isDark = !this.isDark;
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

  goBack(): void {
    this.location.back();
  }

  onRefetch(): void {
    this.fetchData();
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
    setTimeout(() => {
      this.showPopup = false;
    }, 300);
  }

  closeProductPopupCreate() {
    this.showPopupCreate = false;
    setTimeout(() => {
      this.showPopup = false;
    }, 300);
  }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.isLoading = true;

    this.productService.SearchProduct(null, 10, 1).subscribe({
      next: (res) => {
        this.originalData = res.Products ?? [];
        this.listOfData = [...this.originalData];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSearch(): void {
    const keyword = this.searchKeyword.trim().toLowerCase();
    this.listOfData = this.originalData.filter(
      (item) =>
        item.Code.toLowerCase().includes(keyword) ||
        item.Name.toLowerCase().includes(keyword)
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

  updateCheckedSet(id: string, checked: boolean): void {
    checked ? this.setOfCheckedId.add(id) : this.setOfCheckedId.delete(id);
  }

  onItemChecked(id: string, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach((item) =>
      this.updateCheckedSet(item.Id, value)
    );
    this.refreshCheckedStatus();
  }

  onCurrentPageDataChange(data: readonly Product[]): void {
    this.listOfCurrentPageData = [...data];
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every((item) =>
      this.setOfCheckedId.has(item.Id)
    );
    this.indeterminate =
      this.listOfCurrentPageData.some((item) =>
        this.setOfCheckedId.has(item.Id)
      ) && !this.checked;
  }

  trackById(index: number, item: Product): string {
    return item.Id;
  }

  //delete product category
  // deleteItem(item: Product): void {
  //   this.modal.confirm({
  //     nzTitle: `Bạn có chắc muốn xóa loại sản phẩm "<b>${item.Name}</b>" này ?`,
  //     // nzContent: `<b>${item.Name}</b> sẽ bị xóa khỏi hệ thống.`,
  //     nzOkText: 'Xóa',
  //     nzCancelText: 'Hủy',
  //     nzOnOk: () => {
  //       this.productService.DeleteProduct(item.Id).subscribe({
  //         next: () => {
  //           this.fetchData();
  //           this.toastr.success('Đã xóa thành công');
  //         },
  //         error: () => {
  //           this.toastr.error('Xóa thất bại');
  //         },
  //       });
  //     },
  //   });
  // }

  //export excel
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
    saveAs(data, `${fileName}.xlsx`);
  }

  exportToExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([]);

    // 1. Thêm hàng tiêu đề (header) với định dạng đẹp
    const header = [
      'Mã sản phẩm',
      'Tên sản phẩm',
      'Số lượng',
      'Đơn vị',
      'Loại sản phẩm',
      'Mô tả',
      'Ngày tạo',
      'Ngày cập nhật',
      'Trạng thái',
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });

    // 2. Thêm dữ liệu
    const data = this.listOfData.map((item) => [
      item.Code,
      item.Name,
      item.Quantity,
      item.Unit,
      item.ProductCategoryName,
      item.Description ?? '',
      this.datePipe.transform(item.CreatedDate, 'dd/MM/yyyy'),
      this.datePipe.transform(item.UpdatedDate, 'dd/MM/yyyy'),
      item.IsActive ? 'Hoạt động' : 'Ngưng hoạt động',
    ]);
    XLSX.utils.sheet_add_aoa(worksheet, data, { origin: -1 }); // Thêm vào sau header

    // 3. Tạo workbook
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Danh sách sản phẩm': worksheet },
      SheetNames: ['Danh sách sản phẩm'],
    };

    // 4. Export
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.saveAsExcelFile(excelBuffer, 'danh_sach_san_pham');
  }
}
