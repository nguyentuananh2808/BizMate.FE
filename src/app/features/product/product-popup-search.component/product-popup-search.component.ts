import { Product } from './../product.component/models/product-response.model';
import { InventoryDetail } from './../../inventory-receipt/models/warehouse-receipt-detail.model';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { ProductService } from '../product.component/services/product-service';
import { ProductResponse } from '../product.component/models/product-response.model';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NzTableComponent, NzTableModule } from 'ng-zorro-antd/table';
import { UnitTextPipe } from '../../../shared/pipes/unit-text-pipe';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'product-popup-search',
  imports: [
    CommonModule,
    FormsModule,
    NzTableComponent,
    UnitTextPipe,
    NzCheckboxModule,
    NzTableModule,
    NzIconModule,
  ],
  templateUrl: './product-popup-search.component.html',
  styleUrls: ['./product-popup-search.component.scss'],
})
export class ProductPopupSearchComponent implements OnInit {
  @Output() closePopup = new EventEmitter<void>();
  @Output() selectProducts = new EventEmitter<InventoryDetail[]>();
  isClosing = false;
  isDark = false;
  listOfData: InventoryDetail[] = [];
  originalData: Product[] = [];
  listOfCurrentPageData: InventoryDetail[] = [];
  setOfCheckedId = new Set<string>();
  checked = false;
  indeterminate = false;
  searchKeyword = '';
  isLoading = false;
  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService
      .SearchProduct('', 10, 1, false)
      .pipe(
        map((res: ProductResponse) =>
          res.Products.map((p) => ({
            Id: '',
            InventoryReceiptId: '',
            ProductId: p.Id,
            ProductName: p.Name,
            ProductCode: p.Code,
            Unit: p.Unit || 0,
            Quantity: 0,
          }))
        )
      )
      .subscribe((products: InventoryDetail[]) => {
        this.listOfData = [...this.listOfData, ...products];
        this.listOfData = this.listOfData.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.ProductId === item.ProductId)
        );
        this.listOfData.sort((a, b) =>
          a.ProductCode.localeCompare(b.ProductCode)
        );
        this.isLoading = false;
        this.refreshCheckedStatus();
        this.cdr.detectChanges();
      });
  }

  onSaveSelectedProducts(): void {
    this.selectProducts.emit(this.listOfData);
    this.closePopup.emit();
  }

  close() {
    this.isClosing = true;
    setTimeout(() => {
      this.closePopup.emit();
    }, 200);
  }

  onSearch(): void {
    const keySearch = this.searchKeyword.trim();
    this.isLoading = true;
    this.productService
      .SearchProduct(keySearch, 10, 1, false)
      .pipe(
        map((res: ProductResponse) =>
          res.Products.map((p) => ({
            Id: '',
            InventoryReceiptId: '',
            ProductId: p.Id,
            ProductName: p.Name,
            ProductCode: p.Code,
            Unit: p.Unit || 0,
            Quantity: 0,
          }))
        )
      )
      .subscribe((products: InventoryDetail[]) => {
        this.listOfData = [...products];
        this.listOfData = this.listOfData.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.ProductId === item.ProductId)
        );
        this.listOfData.sort((a, b) =>
          a.ProductCode.localeCompare(b.ProductCode)
        );
        this.isLoading = false;
        this.refreshCheckedStatus();
        this.cdr.detectChanges();
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
  onCurrentPageDataChange(data: readonly InventoryDetail[]) {
    this.listOfCurrentPageData = [...data];
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus() {
    setTimeout(() => {
      this.checked = this.listOfCurrentPageData.every((i) =>
        this.setOfCheckedId.has(i.Id)
      );
      this.indeterminate =
        this.listOfCurrentPageData.some((i) => this.setOfCheckedId.has(i.Id)) &&
        !this.checked;
    });
  }

  trackById(index: number, item: InventoryDetail): string {
    return item.Id;
  }
}
