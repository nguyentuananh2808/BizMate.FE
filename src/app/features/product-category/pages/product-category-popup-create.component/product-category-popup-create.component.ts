import { trigger, transition, style, animate } from '@angular/animations';
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
          const userMessage = err.error?.Message || 'Cập nhật thất bại';
          this.toastr.error(userMessage);
        },
      });
  }
}
