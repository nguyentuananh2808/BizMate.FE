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
import { NzPaginationComponent } from 'ng-zorro-antd/pagination';

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
    NzPaginationComponent,
  ],
  templateUrl: './product-popup-search.component.html',
  styleUrls: ['./product-popup-search.component.scss'],
})
export class ProductPopupSearchComponent implements OnInit {
  @Output() closePopup = new EventEmitter<void>();
  @Output() selectProducts = new EventEmitter<InventoryDetail[]>();
  isClosing = false;
  isDark = false;
  listOfData: Product[] = [];
  originalData: Product[] = [];
  listOfCurrentPageData: Product[] = [];
  setOfCheckedId = new Set<string>();
  checked = false;
  indeterminate = false;
  pageIndex = 1;
  pageSize = 10;
  totalCount = 0;
  searchKeyword = '';
  isLoading = false;
  isMobile = window.innerWidth <= 768;

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }
  onSaveSelectedProducts(): void {
    const selectedInventoryDetails: InventoryDetail[] = this.listOfData
      .filter((p) => this.setOfCheckedId.has(p.Id))
      .map((p) => ({
        Id: p.Id,
        ProductId: p.Id,
        ProductName: p.Name,
        ProductCode: p.Code,
        Unit: p.Unit,
        Quantity: 0,
        InventoryReceiptId: '',
      }));

    this.selectProducts.emit(selectedInventoryDetails);
    this.closePopup.emit();
  }

  close() {
    this.isClosing = true;
    setTimeout(() => {
      this.closePopup.emit();
    }, 800);
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
      .SearchProduct(this.searchKeyword || null, pageSize, pageIndex, false)
      .subscribe({
        next: (res) => {
          this.originalData = res.Products || [];
          this.totalCount = res.TotalCount || 0;

          setTimeout(() => {
            this.listOfData = [...this.originalData].sort((a, b) =>
              a.Code.localeCompare(b.Code)
            );
            this.listOfCurrentPageData = [...this.listOfData];
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
}
