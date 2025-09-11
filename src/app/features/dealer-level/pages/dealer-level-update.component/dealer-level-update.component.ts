import { ProductPopupSearchComponent } from './../../../product/product-popup-search.component/product-popup-search.component';
import { DealerLevel } from './../../models/dealer-level.model';
import { CommonModule, Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { HeaderCommonComponent } from '../../../shared/header-common.component/header-common.component';
import { BottomMenuComponent } from '../../../shared/bottom-menu.component/bottom-menu.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UnitTextPipe } from '../../../../shared/pipes/unit-text-pipe';
import { MenuComponent } from '../../../shared/menu.component/menu.component';
import { ToastrService } from 'ngx-toastr';
import { NgxPrintModule } from 'ngx-print';
import { DealerPrice } from '../../../dealer-price/models/dealer-price.model';
import { DealerLevelService } from '../../services/dealer-level-service';
import { DealerLevelUpdateRequest } from '../../models/dealer-level-update-request.model';
import { mapInventoryDetailToDealerPrice } from '../../../../shared/helper/mapInventoryToDealerPrice';
import { InventoryDetail } from '../../../inventory-receipt/models/warehouse-receipt-detail.model';
import { pipe } from 'rxjs';
import { PricePipe } from '../../../../shared/pipes/price-pice';
import { DealerPriceService } from '../../../dealer-price/services/dealer-price-service';
import { DealerPriceCreateRequest } from '../../../dealer-price/models/dealer-price-create-request.models';
import { DealerPriceUpdateRequest } from '../../../dealer-price/models/dealer-price-update-request.models';

@Component({
  standalone: true,
  selector: 'dealer-level-update',
  imports: [
    NgxPrintModule,
    CommonModule,
    FormsModule,
    NzTableModule,
    NzCheckboxModule,
    NzButtonModule,
    BottomMenuComponent,
    NzIconModule,
    RouterModule,
    ReactiveFormsModule,
    HeaderCommonComponent,
    NzModalModule,
    NzFloatButtonModule,
    UnitTextPipe,
    MenuComponent,
    ProductPopupSearchComponent,
    PricePipe,
  ],
  templateUrl: './dealer-level-update.component.html',
  styleUrls: ['./dealer-level-update.component.scss'],
})
export class DealerLevelUpdateComponent implements OnInit {
  dealerLevelForm: FormGroup;
  isDark = false;
  id: string = '';
  rowVersion: string = '';
  existingProductIds: string[] = [];
  isActive: boolean = false;
  editingOriginalPrice: number | null = null;
  isSaveEnabled: boolean = true;
  dateToday = new Date();
  isPopupSearchProducts = false;
  isPopupSearchDealerLevels = false;
  indeterminate = false;
  isSubmitting = false;
  showPrint = false;
  checked = false;
  setOfCheckedId = new Set<string>();
  isMobile = window.innerWidth < 768;
  listOfData: DealerPrice[] = [];
  listOfCurrentPageData: DealerLevel[] = [];
  editingId: string | null = null;
  inputError = false;
  allData: DealerPrice[] = [];
  editingPrice: number | null = null;
  message: any;
  searchKeyword = '';

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private modal: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: ActivatedRoute,
    private dealerLevelService: DealerLevelService,
    private dealerPriceService: DealerPriceService
  ) {
    this.dealerLevelForm = this.fb.group({
      dealerLevelName: [''],
      details: this.fb.array([]),
    });

    this.addProduct();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 768;
  }

  ngOnInit(): void {
    this.id = this.router.snapshot.paramMap.get('id')!;
    if (this.id) {
      this.getDealerLevelDetail(this.id);
    }
  }
  updateExistingProductIds(): void {
    this.existingProductIds = this.listOfData.map((item) => item.ProductId);
  }
  getDealerLevelDetail(id: string): void {
    this.dealerLevelService.ReadByIdDealerLevel(id).subscribe({
      next: (res) => {
        this.dealerLevelForm.patchValue({
          dealerLevelName: res.DealerLevel.Name,
        });
        console.log('dealerPrice:', res.DealerLevel.DealerPriceForDealerLevel);
        this.listOfData = res.DealerLevel.DealerPriceForDealerLevel;
        this.allData = [...this.listOfData];
        this.updateExistingProductIds();
        this.rowVersion = res.DealerLevel.RowVersion;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi gọi ReadByIdDealerLevel:', err);
      },
    });
  }

  get details(): FormArray {
    return this.dealerLevelForm.get('details') as FormArray;
  }
  onPriceChange(): void {
    this.isSaveEnabled = this.editingPrice !== this.editingOriginalPrice;
  }

  startEdit(item: DealerPrice): void {
    console.log('editingId', this.editingId);
    console.log('ProductId', item.ProductId);

    if (!item || !item.ProductId) {
      console.warn('startEdit called with invalid item:', item);
      return;
    }

    if (this.editingId === item.ProductId) return;

    this.editingId = item.ProductId;
    this.editingPrice = item.Price;
    this.editingOriginalPrice = item.Price; // Lưu lại giá gốc
    this.isSaveEnabled = false; // Disable save khi mới vào edit
  }

  saveEdit(item: DealerPrice): void {
    if (this.editingPrice === null || this.editingPrice < 1) {
      this.inputError = true;
      setTimeout(() => {
        this.inputError = false;
      }, 300);
      return;
    }
    this.confirmSave(item, this.editingPrice);
    item.Price = this.editingPrice;
    this.editingId = null;
    this.editingPrice = null;
  }

  stopEdit(): void {
    this.editingId = null;
  }

  deleteItem(itemToDelete: DealerPrice): void {
    this.modal.confirm({
      nzTitle: `Bạn có chắc muốn xóa sản phẩm "<b>${itemToDelete.ProductName}</b>" này?`,
      nzOkText: 'Xóa',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.dealerPriceService
          .DeleteDealerPrice(itemToDelete.DealerPriceId)
          .subscribe({
            next: () => {
              this.toastr.success('Xóa sản phẩm thành công!');
              this.listOfData = this.listOfData.filter(
                (item) => item.Id !== itemToDelete.DealerPriceId
              );
              this.updateExistingProductIds(); // cập nhật lại danh sách ProductId đang tồn tại
              this.getDealerLevelDetail(this.id);
              this.cdr.detectChanges();
            },
            error: (err) => {
              const apiMessage = err.error?.Message;
              let userMessage = 'Xóa thất bại';
              if (apiMessage) {
                userMessage = apiMessage;
              }
              this.toastr.error(userMessage);
            },
          });
      },
    });
  }

  onSearch(): void {
    this.searchKeyword = this.searchKeyword.trim().toLowerCase();
    if (!this.searchKeyword) {
      this.listOfData = [...this.allData];
    } else {
      this.listOfData = this.allData.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(this.searchKeyword)
        )
      );
    }
    this.updateExistingProductIds();
    this.cdr.detectChanges();
  }
  onSelectedProducts(productList: InventoryDetail[]) {
    if (!productList || productList.length === 0) {
      this.closeProductPopup();
      return;
    }

    const productIds = productList.map((item) => item.ProductId);

    this.createDealerPrices(productIds);

    // Map từ InventoryDetail sang DealerPrice
    const mappedList: DealerPrice[] =
      mapInventoryDetailToDealerPrice(productList);

    this.listOfData = [...this.listOfData, ...mappedList];
    this.listOfData = this.listOfData.filter(
      (item, index, self) => index === self.findIndex((t) => t.Id === item.Id)
    );

    this.listOfData.sort((a, b) => a.ProductCode.localeCompare(b.ProductCode));

    this.allData = [...this.listOfData];
    this.updateExistingProductIds();
    this.details.clear();

    for (const item of this.listOfData) {
      this.details.push(
        this.fb.group({
          productId: [item.ProductId ?? item.Id, Validators.required],
          Price: [
            item.Price > 0 ? item.Price : 1,
            [Validators.required, Validators.min(1)],
          ],
        })
      );
    }

    this.dealerLevelForm.updateValueAndValidity();
    this.cdr.detectChanges();
    this.closeProductPopup();
  }

  private createDealerPrices(productIds: string[]): void {
    const request: DealerPriceCreateRequest = {
      ProductIds: productIds,
      DealerLevelId: this.id,
    };

    this.dealerPriceService.CreateDealerPrice(request).subscribe({
      next: (res) => {
        this.toastr.success('Thêm giá đại lý thành công!');
        this.getDealerLevelDetail(this.id);
        this.closeProductPopup();
      },

      error: (err) => {
        const apiMessage = err.error?.Message;
        let userMessage = 'Cập nhật thất bại';
        this.closeProductPopup();
        if (apiMessage === 'BACKEND.VALIDATION.MESSAGE.ALREADY_EXIST') {
          userMessage = 'Sản phẩm đã tồn tại trong đại lý.';
        } else if (apiMessage) {
          userMessage = apiMessage;
        }
        this.toastr.error(userMessage);
      },
    });
  }

  closeProductPopup(): void {
    this.isPopupSearchProducts = false;
  }

  addProducts(): void {
    this.isPopupSearchProducts = true;
  }

  addProduct(): void {
    this.details.push(
      this.fb.group({
        productId: ['', Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]],
      })
    );
  }

  removeProduct(index: number): void {
    this.details.removeAt(index);
  }

  goBack(): void {
    this.location.back();
  }

  trackById(index: number, item: DealerPrice): string {
    return item.Id;
  }

  submitForm(): void {
    const payload: DealerLevelUpdateRequest = {
      Id: this.id,
      Name: this.dealerLevelForm.get('dealerLevelName')?.value,
      RowVersion: this.rowVersion,
      IsActive: this.isActive,
    };

    this.dealerLevelService.UpdateDealerLevel(payload).subscribe({
      next: () => {
        this.getDealerLevelDetail(this.id);
        this.toastr.success('Cập nhật đại lý cấp thành công!');
      },
      error: (err) => {
        const apiMessage = err.error?.Message;
        let userMessage = 'Cập nhật thất bại';

        if (apiMessage === 'BACKEND.APP_MESSAGE.DATA_NOT_EXIST') {
          userMessage = 'Khách hàng không tồn tại trong hệ thống.';
        } else if (
          apiMessage === 'BACKEND.VALIDATION.MESSAGE.NOT_VALID_ROWVERSION'
        ) {
          userMessage =
            'Dữ liệu đã được cập nhật bởi người dùng khác. Vui lòng tải lại trang để tiếp tục.';
        } else if (apiMessage) {
          userMessage = apiMessage;
        }
        this.toastr.error(userMessage);
      },
    });
  }

  private confirmSave(item: DealerPrice, newPrice: number): void {
    const dealerPriceUpdateRequest: DealerPriceUpdateRequest = {
      Id: item.DealerPriceId,
      Price: newPrice,
      RowVersion: item.RowVersionDealerPrice,
    };

    this.dealerPriceService
      .UpdateDealerPrice(dealerPriceUpdateRequest)
      .subscribe({
        next: () => {
          item.Price = newPrice; // chỉ update khi API ok
          this.toastr.success('Cập nhật giá thành công!');
          this.isSaveEnabled = false;
          this.editingId = null;
          this.editingPrice = null;
          this.getDealerLevelDetail(this.id);
        },
        error: (err) => {
          const apiMessage = err.error?.Message;
          let userMessage = 'Cập nhật thất bại';

          if (apiMessage === 'BACKEND.APP_MESSAGE.DATA_NOT_EXIST') {
            userMessage = 'Khách hàng không tồn tại trong hệ thống.';
          } else if (
            apiMessage === 'BACKEND.VALIDATION.MESSAGE.NOT_VALID_ROWVERSION'
          ) {
            userMessage =
              'Dữ liệu đã được cập nhật bởi người dùng khác. Vui lòng tải lại trang để tiếp tục.';
          } else if (apiMessage) {
            userMessage = apiMessage;
          }
          this.toastr.error(userMessage);
        },
      });
  }
}
