import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
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
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'scale(0.90)' })
        ),
      ]),
    ]),
  ],
})
export class ProductPopupCreateComponent implements OnInit {
  name: string = '';
  productCategoryId: string = '';
  unit: number = 6;
  unitOptions = [
    { value: 1, label: 'Cái' },
    { value: 2, label: 'Hộp' },
    { value: 3, label: 'Thùng' },
    { value: 4, label: 'Kg' },
    { value: 5, label: 'Lít' },
    { value: 6, label: 'Cây' },
  ];
  salePrice: number = 0;
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
  isSerialTracked: boolean = false;

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
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastr.error('Không thể tải danh sách loại sản phẩm. Vui lòng thử lại.');
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
      this.toastr.warning('Vui lòng chọn loại sản phẩm.');
      return;
    }

    this.isSaving = true;
    this.productService
  .CreateProduct(
    this.name,
    this.productCategoryId,
    this.unit,
    this.salePrice,
    this.imageUrl,
    this.description || '',
    this.isSerialTracked 
  )
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.toastr.success('Tạo sản phẩm thành công.');
          this.create.emit();
          this.close();
        },
        error: (err) => {
          const apiMessage = err.error?.Message;
          let userMessage = 'Không thể tạo sản phẩm. Vui lòng thử lại.';

          if (apiMessage === 'BACKEND.VALIDATION.MESSAGE.ALREADY_EXIST') {
            userMessage = 'Sản phẩm đã tồn tại trong hệ thống.';
          } else if (apiMessage && !apiMessage.startsWith('BACKEND.')) {
            userMessage = apiMessage;
          }
          this.toastr.error(userMessage);
        },
      });
  }
}
