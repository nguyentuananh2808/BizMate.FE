import { Product } from './../product.component/models/product-response.model';
import { InventoryDetail } from './../../inventory-receipt/models/warehouse-receipt-detail.model';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
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
import { ToastrService } from 'ngx-toastr';

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
  @Input() shouldDisableProduct: boolean = true;
  @Input() ProductQuantity: boolean = true;
  @Input() existingProducts: string[] = [];
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
  disabledProductIds = new Set<string>();
  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  onSaveSelectedProducts(): void {
    const selectedInventoryDetails: InventoryDetail[] = this.listOfData
      .filter(
        (p) =>
          this.setOfCheckedId.has(p.Id) &&
          (!this.shouldDisableProduct || !this.disabledProductIds.has(p.Id))
      )
      .map((p) => ({
        Id: p.Id,
        ProductId: p.Id,
        ProductName: p.Name,
        ProductCode: p.Code,
        Unit: p.Unit,
        Quantity: 0,
        SalePrice: p.SalePrice,
        InventoryReceiptId: '',
        Available:p.Available
      }));

    // Nếu không có sản phẩm hợp lệ được chọn
    if (selectedInventoryDetails.length === 0) {
      // Có thể hiện thông báo nếu muốn
      this.toastr.warning('Không có sản phẩm hợp lệ được chọn!');
      this.closePopup.emit();
      return;
    }

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
          console.log('API raw response:', res);
          console.log('Products[0]:', res.Products?.[0]);
          this.disabledProductIds.clear();

          const existingIds = new Set(this.existingProducts);

          // Lọc sản phẩm trước khi bind vào listOfData
          let products = (res.Products || []).reduce((acc, p) => {
            if (existingIds.has(p.Id)) return acc;
            if (!this.ProductQuantity && p.Quantity === 0) return acc;
            acc.push(p); // giữ nguyên object p (không mất SalePrice)
            return acc;
          }, [] as Product[]);

          this.originalData = products;
          console.log('res product:', res.Products);
          console.log('products:', products);

          this.listOfData = products;
          console.log('listOfData:', this.listOfData);
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
    this.listOfCurrentPageData.forEach((item) => {
      //   if (!this.disabledProductIds.has(item.Id)) {
      this.updateCheckedSet(item.Id, val);
      // }
    });
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
