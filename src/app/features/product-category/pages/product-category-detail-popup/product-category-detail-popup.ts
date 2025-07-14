import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCategory } from '../../models/product-category-response.model';
import { ProductCategoryService } from '../../services/product-category.service';
import { finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'product-category-detail-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-category-detail-popup.html',
  styleUrl: './product-category-detail-popup.scss',
})
export class ProductCategoryDetailPopup {
  @Input() data!: ProductCategory;
  @Output() closePopup = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();
  isClosing = false;
  isSaving = false;

  constructor(
    private productCategoryService: ProductCategoryService,
    private toastr: ToastrService
  ) {}

  close() {
    this.isClosing = true;
    setTimeout(() => this.closePopup.emit(), 200);
  }

  onSubmit() {
    if (this.isSaving) return;
    this.isSaving = true;

    this.productCategoryService
      .UpdateProductCategory(
        this.data.Id,
        this.data.ProductCategoryCode,
        this.data.Name,
        this.data.RowVersion,
        this.data.Description || ''
      )
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.toastr.success('Cập nhật thành công');
          this.updated.emit();
          this.close();
        },
        error: (err) => {
          const messages: Record<string, string> = {
            MUST_NOT_EMPTY: 'Bắt nhập tên loại sản phẩm !',
            COMMON_CONCURRENCY_CONFLICT:
              'Dữ liệu đã bị thay đổi bởi người dùng khác. Vui lòng tải lại và thử lại.',
          };

          const messageCode = err.error?.Message || 'UNKNOWN_ERROR';
          const userMessage = messages[messageCode] || 'Cập nhật thất bại';

          this.toastr.error(userMessage);
        },
      });
  }
}
