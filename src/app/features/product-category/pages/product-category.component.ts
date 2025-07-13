import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { ChangeDetectorRef } from '@angular/core';
import { ProductCategoryService } from '../services/product-category.service';
import { ProductCategory } from '../models/product-category-response.model';
import { BottomMenuComponent } from '../../shared/bottom-menu.component/bottom-menu.component';
import { TopMenuComponent } from '../../shared/top-menu.component/top-menu.component';

@Component({
  selector: 'product-category',
  standalone: true,
  templateUrl: './product-category.component.html',
  styleUrls: ['./product-category.component.scss'],
  imports: [
    CommonModule,
    BottomMenuComponent,
    TopMenuComponent,
    NzTableModule,
    NzCheckboxModule,
  ],
})
export class ProductCategoryComponent implements OnInit {
  isLoading = false;
  listOfData: readonly ProductCategory[] = [];
  listOfCurrentPageData: readonly ProductCategory[] = [];
  setOfCheckedId = new Set<string>();
  checked = false;
  indeterminate = false;

  constructor(
    private productService: ProductCategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.isLoading = true;
    this.productService.GetAll().subscribe({
      next: (res) => {
        this.listOfData = res.ProductCategories ?? [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
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
      text: 'Chọn hàng lẻ',
      onSelect: () => {
        this.listOfCurrentPageData.forEach((data, index) =>
          this.updateCheckedSet(data.Id, index % 2 !== 0)
        );
        this.refreshCheckedStatus();
      },
    },
    {
      text: 'Chọn hàng chẵn',
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
    this.listOfCurrentPageData = data;
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
}
