import { ProductCategoryPopupCreateComponent } from '../product-category-popup-create.component/product-category-popup-create.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { ProductCategoryService } from '../../services/product-category.service';
import { ProductCategory } from '../../models/product-category-response.model';
import { BottomMenuComponent } from '../../../shared/bottom-menu.component/bottom-menu.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProductCategoryDetailPopup } from '../product-category-detail-popup/product-category-detail-popup';
import { HeaderCommonComponent } from '../../../shared/header-common.component/header-common.component';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'product-category',
  standalone: true,
  templateUrl: './product-category.component.html',
  styleUrls: ['./product-category.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzCheckboxModule,
    NzButtonModule,
    BottomMenuComponent,
    NzIconModule,
    RouterModule,
    ProductCategoryDetailPopup,
    ProductCategoryPopupCreateComponent,
    HeaderCommonComponent,
    NzModalModule,
    NzFloatButtonModule,
  ],
})
export class ProductCategoryComponent implements OnInit {
  isLoading = false;
  listOfData: ProductCategory[] = [];
  originalData: ProductCategory[] = [];
  listOfCurrentPageData: ProductCategory[] = [];
  setOfCheckedId = new Set<string>();
  checked = false;
  indeterminate = false;
  searchKeyword = '';
  isMobile = window.innerWidth < 768;
  selectedItem!: ProductCategory;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 768;
  }

  constructor(
    private productService: ProductCategoryService,
    private cdr: ChangeDetectorRef,
    private modal: NzModalService,
    private toastr: ToastrService
  ) {}

  showPopup = false;
  showPopupCreate = false;
  onRefetch(): void {
    this.fetchData();
  }

  createProductCategory() {
    this.showPopupCreate = true;
  }

  viewDetail(item: ProductCategory) {
    this.selectedItem = item;
    this.showPopup = true;
  }
  closeProductCategoryDetailPopup() {
    this.showPopup = false;
    setTimeout(() => {
      this.showPopup = false;
    }, 300);
  }

  closeProductCategoryPopupCreate() {
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
    this.productService.GetAll().subscribe({
      next: (res) => {
        this.originalData = res.ProductCategories ?? [];
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
        item.ProductCategoryCode.toLowerCase().includes(keyword) ||
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

  onCurrentPageDataChange(data: readonly ProductCategory[]): void {
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

  trackById(index: number, item: ProductCategory): string {
    return item.Id;
  }

  //delete product category
  deleteItem(item: ProductCategory): void {
    this.modal.confirm({
      nzTitle: `Bạn có chắc muốn xóa loại sản phẩm "<b>${item.Name}</b>" này ?`,
     // nzContent: `<b>${item.Name}</b> sẽ bị xóa khỏi hệ thống.`,
      nzOkText: 'Xóa',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.productService.DeleteProductCategory(item.Id).subscribe({
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
