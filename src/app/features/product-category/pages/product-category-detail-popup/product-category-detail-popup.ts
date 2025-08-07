import { Component, Output, EventEmitter, Input } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCategory } from '../../models/product-category-response.model';
import { ProductCategoryService } from '../../services/product-category.service';
import { finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'product-category-detail-popup',
  standalone: true,
  imports: [CommonModule, FormsModule, NzSelectModule],
  templateUrl: './product-category-detail-popup.html',
  styleUrl: './product-category-detail-popup.scss',
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
        this.data.Code.trim(),
        this.data.Name.trim(),
        this.data.RowVersion,
        this.data.IsActive,
        this.data.Description.trim() || ''
      )
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.toastr.success('Cập nhật thành công');
          this.updated.emit();
          this.close();
        },
        error: (err) => {
          const userMessage = err.error?.Message || 'Cập nhật thất bại';
          this.toastr.error(userMessage);
        },
      });
  }
}
