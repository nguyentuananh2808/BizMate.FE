import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ProductService } from '../../product.component/services/product-service';
import { ToastrService } from 'ngx-toastr';
import { ProductCategory } from '../../../product-category/models/product-category-response.model';
import { ProductCategoryService } from '../../../product-category/services/product-category.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';

@Component({
  selector: 'product-popup-create',
  standalone: true,
  imports: [CommonModule, FormsModule, NzSelectModule, NzFormModule],
  templateUrl: './product-popup-create.component.html',
})
export class ProductPopupCreateComponent implements OnInit {
  name: string = '';
  productCategoryId: string = '';
  unit: number = 1;
  imageUrl: string = '';
  description: string = '';
  categories: ProductCategory[] = [];

  searchTerm: string = '';
  filteredCategories: ProductCategory[] = [];
  showDropdown: boolean = false;

  @Output() closePopupCreate = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();

  isClosing: boolean = false;
  isSaving: boolean = false;

  constructor(
    private productService: ProductService,
    private categoryService: ProductCategoryService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.categoryService.GetAll().subscribe({
      next: (res) => {
        this.categories = (res.ProductCategories || []).filter(
          (cat) => cat.IsActive == false
        );
        this.filteredCategories = [...this.categories];
        console.log('Categories loaded:', this.categories);
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastr.error('Không thể load loại sản phẩm');
      },
    });
  }
  filterCategories(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredCategories = this.categories.filter((cat) =>
      cat.Name.toLowerCase().includes(term)
    );

    const matched = this.categories.find(
      (cat) => cat.Name.toLowerCase() === term
    );
    if (!matched) this.productCategoryId = '';
  }

  selectCategory(cat: ProductCategory): void {
    this.productCategoryId = cat.Id;
    this.searchTerm = cat.Name;
    this.showDropdown = false;
  }

  onBlur(): void {
    setTimeout(() => {
      this.showDropdown = false;

      const match = this.categories.find((cat) => cat.Name === this.searchTerm);
      if (!match) {
        this.productCategoryId = '';
        this.searchTerm = '';
      }
    }, 200);
  }

  close(): void {
    this.closePopupCreate.emit();
  }

  onSubmit(): void {
    if (this.isSaving) return;

    if (!this.productCategoryId) {
      this.toastr.warning('Vui lòng chọn loại sản phẩm');
      return;
    }

    this.isSaving = true;
    this.productService
      .CreateProduct(
        this.name,
        this.productCategoryId,
        this.unit,
        this.imageUrl,
        this.description || ''
      )
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.toastr.success('Tạo mới thành công');
          this.create.emit();
          this.close();
        },
        error: (err) => {
          const code = err.error?.Message;
          const messages: Record<string, string> = {
            MUST_NOT_EMPTY: 'Bắt buộc nhập tên sản phẩm !',
            COMMON_CONCURRENCY_CONFLICT:
              'Dữ liệu đã bị thay đổi bởi người dùng khác. Vui lòng tải lại và thử lại.',
            COMMON_DUPLICATE: 'Tên sản phẩm đã tồn tại !',
          };
          const userMessage = messages[code] || 'Tạo mới thất bại';
          this.toastr.error(userMessage);
        },
      });
  }
}
