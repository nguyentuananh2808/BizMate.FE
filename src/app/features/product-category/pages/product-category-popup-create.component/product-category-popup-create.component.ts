import { CreateProductCategoryRequest } from '../../models/product-category-create-request.model';
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ProductCategoryService } from '../../services/product-category.service';

@Component({
  selector: 'product-category-popup-create',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-category-popup-create.component.html',
  styleUrl: './product-category-popup-create.component.scss',
})
export class ProductCategoryPopupCreateComponent {
  name: string = '';
  description: string = '';

  @Output() closePopupCreate = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();
  isClosing = false;
  isSaving = false;

  constructor(
    private productCategoryService: ProductCategoryService,
    private toastr: ToastrService
  ) {}

  close() {
    this.closePopupCreate.emit();
  }

  onSubmit() {
    if (this.isSaving) return;
    this.isSaving = true;

    this.productCategoryService
      .CreateProductCategory(this.name, this.description || '')
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.toastr.success('Tạo mới thành công');
          this.create.emit();
          this.close();
        },
        error: (err) => {
          const messages: Record<string, string> = {
            MUST_NOT_EMPTY: 'Bắt buộc nhập tên loại sản phẩm !',
            COMMON_CONCURRENCY_CONFLICT:
              'Dữ liệu đã bị thay đổi bởi người dùng khác. Vui lòng tải lại và thử lại.',
            COMMON_DUPLICATE: 'Tên loại sản phẩm đã tồn tại !',
          };

          const messageCode = err.error?.Message || 'UNKNOWN_ERROR';
          const userMessage = messages[messageCode] || 'Tạo mới thất bại';

          this.toastr.error(userMessage);
        },
      });
  }
}

