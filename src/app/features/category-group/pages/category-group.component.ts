import { CommonModule, DatePipe, Location } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { ProductCategory } from '../../product-category/models/product-category-response.model';
import { ProductCategoryService } from '../../product-category/services/product-category.service';
import { BottomMenuComponent } from '../../shared/bottom-menu.component/bottom-menu.component';
import { HeaderCommonComponent } from '../../shared/header-common.component/header-common.component';
import { MenuComponent } from '../../shared/menu.component/menu.component';
import { CategoryGroup, CategoryGroupSaveRequest } from '../models/category-group.model';
import { CategoryGroupService } from '../services/category-group.service';

@Component({
  selector: 'category-group',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzFloatButtonModule,
    NzIconModule,
    NzModalModule,
    NzPaginationModule,
    NzSelectModule,
    NzTableModule,
    BottomMenuComponent,
    HeaderCommonComponent,
    MenuComponent,
  ],
  providers: [DatePipe],
  templateUrl: './category-group.component.html',
  styleUrls: ['./category-group.component.scss'],
})
export class CategoryGroupComponent implements OnInit {
  isLoading = false;
  isSaving = false;
  isMobile = window.innerWidth < 768;
  isDark = false;
  searchKeyword = '';
  pageIndex = 1;
  pageSize = 10;
  readonly pageSizeOptions = [10, 20, 50];
  totalCount = 0;
  listOfData: CategoryGroup[] = [];
  listOfCurrentPageData: CategoryGroup[] = [];
  categories: ProductCategory[] = [];
  showForm = false;
  isEditMode = false;
  form: CategoryGroupSaveRequest = this.createEmptyForm();
  activeDropdown: CategoryGroup | null = null;

  constructor(
    private categoryGroupService: CategoryGroupService,
    private productCategoryService: ProductCategoryService,
    private modal: NzModalService,
    private toastr: ToastrService,
    private location: Location
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.isMobile = event.target.innerWidth < 768;
  }

  ngOnInit(): void {
    this.loadCategories();
    this.fetchData();
  }

  get paginatedMobileList(): CategoryGroup[] {
    return this.listOfData;
  }

  fetchData(pageIndex: number = this.pageIndex, pageSize: number = this.pageSize): void {
    this.isLoading = true;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;

    this.categoryGroupService
      .search({
        keySearch: this.searchKeyword.trim() || null,
        pageIndex,
        pageSize,
      })
      .subscribe({
        next: (res) => {
          this.listOfData = res.CategoryGroups || [];
          this.listOfCurrentPageData = [...this.listOfData];
          this.totalCount = res.TotalCount || 0;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.toastr.error(
            this.toUserMessage(
              err.error?.Message || err.error?.message,
              'Không thể tải danh sách nhóm loại sản phẩm. Vui lòng thử lại.'
            )
          );
        },
      });
  }

  loadCategories(): void {
    this.productCategoryService.GetAll().subscribe({
      next: (res) => {
        this.categories = res.ProductCategories || [];
      },
      error: () => {
        this.toastr.warning('Không thể tải danh sách loại sản phẩm để gán nhóm.');
      },
    });
  }

  onSearch(): void {
    this.pageIndex = 1;
    this.fetchData(1, this.pageSize);
  }

  onPageChange(page: number): void {
    this.fetchData(page, this.pageSize);
  }

  onPageSizeChange(size: number): void {
    this.fetchData(1, size);
  }

  onCurrentPageDataChange(data: readonly CategoryGroup[]): void {
    this.listOfCurrentPageData = [...data];
  }

  goBack(): void {
    this.location.back();
  }

  openCreate(): void {
    this.isEditMode = false;
    this.form = this.createEmptyForm();
    this.showForm = true;
  }

  openUpdate(item: CategoryGroup): void {
    this.isEditMode = true;
    this.form = {
      Id: item.Id,
      RowVersion: item.RowVersion,
      Name: item.Name,
      Description: item.Description || '',
      IsActive: item.IsActive,
      ProductCategoryIds: [...(item.ProductCategoryIds || [])],
    };
    this.showForm = true;
    this.activeDropdown = null;
  }

  closeForm(): void {
    this.showForm = false;
    this.isSaving = false;
  }

  save(): void {
    if (this.isSaving) return;

    const name = this.form.Name?.trim();
    if (!name) {
      this.toastr.warning('Tên nhóm loại sản phẩm không được để trống.');
      return;
    }

    this.isSaving = true;
    const request = {
      ...this.form,
      Name: name,
      Description: this.form.Description?.trim() || '',
      ProductCategoryIds: this.form.ProductCategoryIds || [],
    };

    const action$ = this.isEditMode
      ? this.categoryGroupService.update(request)
      : this.categoryGroupService.create(request);

    action$
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (res) => {
          this.toastr.success(
            res.Message ||
              (this.isEditMode
                ? 'Cập nhật nhóm loại sản phẩm thành công.'
                : 'Tạo nhóm loại sản phẩm thành công.')
          );
          this.closeForm();
          this.fetchData();
          this.loadCategories();
        },
        error: (err) => {
          this.toastr.error(
            this.toUserMessage(
              err.error?.Message || err.error?.message,
              this.isEditMode
                ? 'Không thể cập nhật nhóm loại sản phẩm. Vui lòng thử lại.'
                : 'Không thể tạo nhóm loại sản phẩm. Vui lòng thử lại.'
            )
          );
        },
      });
  }

  deleteItem(item: CategoryGroup): void {
    this.modal.confirm({
      nzTitle: `Bạn có chắc muốn xóa nhóm loại sản phẩm "<b>${item.Name}</b>" không?`,
      nzOkText: 'Xóa',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.categoryGroupService.delete(item.Id).subscribe({
          next: (res) => {
            this.toastr.success(res.Message || 'Xóa nhóm loại sản phẩm thành công.');
            this.fetchData();
            this.loadCategories();
          },
          error: (err) => {
            this.toastr.error(
              this.toUserMessage(
                err.error?.Message || err.error?.message,
                'Không thể xóa nhóm loại sản phẩm. Vui lòng thử lại.'
              )
            );
          },
        });
      },
    });
  }

  toggleDropdown(item: CategoryGroup): void {
    this.activeDropdown = this.activeDropdown === item ? null : item;
  }

  closeDropdown(): void {
    this.activeDropdown = null;
  }

  trackById(index: number, item: CategoryGroup): string {
    return item.Id;
  }

  private createEmptyForm(): CategoryGroupSaveRequest {
    return {
      Name: '',
      Description: '',
      IsActive: false,
      ProductCategoryIds: [],
    };
  }

  private toUserMessage(apiMessage: string | undefined, fallback: string): string {
    if (!apiMessage || apiMessage.startsWith('BACKEND.')) {
      return fallback;
    }

    return apiMessage;
  }
}
