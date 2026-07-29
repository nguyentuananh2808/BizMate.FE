import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCategory } from '../../models/product-category-response.model';
import { ProductCategoryService } from '../../services/product-category.service';
import { finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CategoryGroup } from '../../../category-group/models/category-group.model';
import { CategoryGroupService } from '../../../category-group/services/category-group.service';

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
export class ProductCategoryDetailPopup implements OnInit {
  @Input() data!: ProductCategory;
  @Output() closePopup = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();
  isClosing = false;
  isSaving = false;
  categoryGroups: CategoryGroup[] = [];

  constructor(
    private productCategoryService: ProductCategoryService,
    private categoryGroupService: CategoryGroupService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCategoryGroups();
  }

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
        this.data.Description.trim() || '',
        this.data.CategoryGroupId || null
      )
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.toastr.success('Cập nhật thành công');
          this.updated.emit();
          this.close();
        },
        error: (err) => {
          const apiMessage = err.error?.Message;
          let userMessage = 'Cập nhật loại sản phẩm thất bại.';

          if (apiMessage === 'BACKEND.APP_MESSAGE.DATA_NOT_EXIST') {
            userMessage = 'Loại sản phẩm không tồn tại trong hệ thống.';
          } else if (apiMessage === 'BACKEND.APP_MESSAGE.DATA_DUPLICATE') {
            userMessage = 'Tên Loại sản phẩm đã tồn tại trong hệ thống.';
          } else if (apiMessage === 'BACKEND.VALIDATION.MESSAGE.NOT_VALID_ROWVERSION') {
            userMessage = 'Dữ liệu đã được cập nhật bởi người dùng khác. Vui lòng tải lại trang để tiếp tục.';
          } else if (apiMessage) {
            userMessage = apiMessage;
          }
          this.toastr.error(userMessage);
        },
      });
  }

  private loadCategoryGroups(): void {
    this.categoryGroupService.getAll().subscribe({
      next: (res) => {
        this.categoryGroups = (res.CategoryGroups || []).filter(
          (group) => !group.IsActive || group.Id === this.data?.CategoryGroupId
        );
      },
      error: () => {
        this.toastr.warning('Không thể tải danh sách nhóm loại sản phẩm.');
      },
    });
  }
}
