import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Product } from '../../product/product.component/models/product-response.model';
import { ProductService } from '../../product/product.component/services/product-service';
import { HeaderCommonComponent } from '../../shared/header-common.component/header-common.component';
import { MenuComponent } from '../../shared/menu.component/menu.component';
import { BottomMenuComponent } from '../../shared/bottom-menu.component/bottom-menu.component';
import { DarkModeService } from '../../shared/dark-mode/services/dark-mode.service';
import { ProductItem, ProductItemService } from '../product-item.service';

@Component({
  standalone: true,
  selector: 'product-item-list',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzPaginationModule,
    HeaderCommonComponent,
    MenuComponent,
    BottomMenuComponent,
  ],
  templateUrl: './product-item-list.component.html',
  styleUrls: ['./product-item-list.component.scss'],
})
export class ProductItemListComponent implements OnInit, OnDestroy {
  isDark = false;
  isMobile = window.innerWidth < 768;
  isLoading = false;
  isProductLoading = false;
  productKeyword = '';
  keyword = '';
  status: number | null = null;
  pageIndex = 1;
  pageSize = 20;
  totalCount = 0;
  products: Product[] = [];
  selectedProduct: Product | null = null;
  productItems: ProductItem[] = [];
  private sub = new Subscription();

  statusOptions = [
    { label: 'Tất cả trạng thái', value: null },
    { label: 'Trong kho', value: 1 },
    { label: 'Đã bán', value: 2 },
    { label: 'Khác', value: 3 },
  ];

  constructor(
    private productService: ProductService,
    private productItemService: ProductItemService,
    private darkModeService: DarkModeService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.darkModeService.isDark$.subscribe((value) => {
        this.isDark = value;
      })
    );

    this.sub.add(
      this.route.queryParamMap.subscribe((params) => {
        const productId = params.get('productId');
        if (productId) {
          this.loadProductFromQuery(productId);
        } else {
          this.searchProducts();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.isMobile = event.target.innerWidth < 768;
  }

  goBack(): void {
    this.location.back();
  }

  searchProducts(): void {
    this.isProductLoading = true;
    this.productService
      .SearchProduct(this.productKeyword || null, 10, 1, false)
      .subscribe({
        next: (res) => {
          this.products = res.Products || [];
          this.isProductLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isProductLoading = false;
          this.toastr.error('Không thể tải danh sách sản phẩm');
        },
      });
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
    this.productKeyword = product.Name;
    this.pageIndex = 1;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { productId: product.Id },
      queryParamsHandling: 'merge',
    });
    this.fetchProductItems();
  }

  clearProduct(): void {
    this.selectedProduct = null;
    this.productItems = [];
    this.totalCount = 0;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { productId: null },
      queryParamsHandling: 'merge',
    });
  }

  onFilterChange(): void {
    this.pageIndex = 1;
    this.fetchProductItems();
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.fetchProductItems();
  }

  fetchProductItems(): void {
    if (!this.selectedProduct) {
      return;
    }

    this.isLoading = true;
    this.productItemService
      .GetByProduct(
        this.selectedProduct.Id,
        this.status,
        this.keyword.trim() || null,
        this.pageIndex,
        this.pageSize
      )
      .subscribe({
        next: (res) => {
          this.productItems =
            res.ProductItems || (res as any).productItems || [];
          this.totalCount = res.TotalCount ?? (res as any).totalCount ?? 0;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.toastr.error('Không thể tải danh sách Serial');
        },
      });
  }

  trackById(index: number, item: ProductItem): string {
    return item.Id || item.SerialNumber;
  }

  private loadProductFromQuery(productId: string): void {
    if (this.selectedProduct?.Id === productId) {
      this.fetchProductItems();
      return;
    }

    this.productService.ReadById(productId).subscribe({
      next: (res) => {
        this.selectedProduct = res.Product;
        this.productKeyword = res.Product.Name;
        this.fetchProductItems();
      },
      error: () => {
        this.toastr.error('Không tìm thấy sản phẩm');
        this.searchProducts();
      },
    });
  }
}
