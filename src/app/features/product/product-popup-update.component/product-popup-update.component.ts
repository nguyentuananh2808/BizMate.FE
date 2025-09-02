import { Product } from './../product.component/models/product-response.model';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from '../product.component/services/product-service';
import { finalize } from 'rxjs';
import { ProductCategoryService } from '../../product-category/services/product-category.service';
import { ProductCategory } from '../../product-category/models/product-category-response.model';

@Component({
  selector: 'product-popup-update',
  standalone: true,
  imports: [CommonModule, FormsModule, NzSelectModule],
  templateUrl: './product-popup-update.component.html',
  styleUrls: ['./product-popup-update.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'scale(0.95)' })
        ),
      ]),
    ]),
  ],
})
export class ProductPopupUpdateComponent implements OnInit {
  @Input() data!: Product;
  @Output() closePopup = new EventEmitter<void>();
  @Output() update = new EventEmitter<void>();

  categories: ProductCategory[] = [];
  filteredCategories: ProductCategory[] = [];
  searchTerm: string = '';
  showDropdown: boolean = false;
  isClosing = false;
  isSaving = false;

  constructor(
    private productService: ProductService,
    private categoryService: ProductCategoryService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.searchTerm = this.data.ProductCategoryName || '';
    }
    this.loadCategories();
  }

  private loadCategories(): void {
    this.categoryService.GetAll().subscribe({
      next: (res) => {
        this.categories = (res.ProductCategories || []).filter(
          (cat) => cat.IsActive
        );
        this.filteredCategories = [...this.categories];
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
    if (!matched || matched.Name !== this.searchTerm) {
      this.data.ProductCategoryId = '';
    }
  }

  selectCategory(cat: ProductCategory): void {
    this.data.ProductCategoryId = cat.Id;
    console.log('catID 1:', cat.Id);
    this.searchTerm = cat.Name;
    this.showDropdown = false;
  }

  onBlur(): void {
    setTimeout(() => {
      this.showDropdown = false;

      const match = this.categories.find((cat) => cat.Name === this.searchTerm);
      if (!match) {
        this.data.ProductCategoryId = '';
        this.searchTerm = '';
      }

      this.cdr.detectChanges();
    }, 200);
  }

  close() {
    this.isClosing = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.closePopup.emit();
      this.isClosing = false;
      this.cdr.detectChanges();
    }, 200);
  }

  onSubmit() {
    if (this.isSaving) return;
    console.log('Submitting data:', this.data.ProductCategoryId);
    this.isSaving = true;
    console.log('catID 2:', this.data.ProductCategoryId);

    this.productService
      .UpdateProduct(
        this.data.Id,
        this.data.RowVersion,
        this.data.ProductCategoryId,
        this.data.Name.trim(),
        this.data.Unit,
        this.data.IsActive,
        this.data.ImageUrl,
        this.data.SupplierId,
        this.data.Description.trim() || ''
      )
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.isSaving = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: () => {
          this.toastr.success('Cập nhật thành công');
          this.update.emit();
          this.close();
        },
        error: (err) => {
          const apiMessage = err.error?.Message;
          let userMessage = 'Cập nhật thất bại';

          if (apiMessage === 'BACKEND.APP_MESSAGE.DATA_NOT_EXIST') {
            userMessage = 'Sản phẩm không tồn tại trong hệ thống.';
          } else if (
            apiMessage === 'BACKEND.VALIDATION.MESSAGE.NOT_VALID_ROWVERSION'
          ) {
            userMessage =
              'Dữ liệu đã được cập nhật bởi người dùng khác. Vui lòng tải lại trang để tiếp tục.';
          } else if (apiMessage === 'BACKEND.APP_MESSAGE.DATA_DUPLICATE') {
            userMessage = 'Tên sản phẩm đã tồn tại.';
          } else if (apiMessage) {
            userMessage = apiMessage;
          }
          this.toastr.error(userMessage);
        },
      });
  }
}
