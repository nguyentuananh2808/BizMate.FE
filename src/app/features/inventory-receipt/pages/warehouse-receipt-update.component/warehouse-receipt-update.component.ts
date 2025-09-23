import { WarehouseReceiptService } from './../../services/warehouse-receipt.service';
import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { HeaderCommonComponent } from '../../../shared/header-common.component/header-common.component';
import { ToastrService } from 'ngx-toastr';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { Location } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import {
  FormGroup,
  FormsModule,
  FormBuilder,
  FormArray,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { BottomMenuComponent } from '../../../shared/bottom-menu.component/bottom-menu.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { UnitTextPipe } from '../../../../shared/pipes/unit-text-pipe';
import { Product } from '../../../product/product.component/models/product-response.model';
import { UpdateReceiptRequestRequest } from '../../models/warehouse-receipt-update.model';
import { NgxPrintModule } from 'ngx-print';
import { ProductPopupSearchComponent } from '../../../product/product-popup-search.component/product-popup-search.component';
import { MenuComponent } from '../../../shared/menu.component/menu.component';
import { InventoryDetail } from '../../models/warehouse-receipt-detail.model';
import { UpdateStatusOrderRequest } from '../../../orders/models/update-status-order-request.model';
import { UpdateStatusWarehouseReceiptRequest } from '../../models/update-status-model';
import { StatusColorPipe } from '../../../../shared/pipes/status-color.pipe';

@Component({
  selector: 'warehouse-receipt-update',
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
    StatusColorPipe,
    HeaderCommonComponent,
    NzModalModule,
    NzFloatButtonModule,
    UnitTextPipe,
    ProductPopupSearchComponent,
    MenuComponent,
  ],
  templateUrl: './warehouse-receipt-update.component.html',
  styleUrls: ['./warehouse-receipt-update.component.scss'],
  providers: [DatePipe],
})
export class WarehouseReceiptUpdateComponent implements OnInit {
  id: string = '';
  rowVersion: string = '';
  receiptForm: FormGroup;
  isDark = false;
  dateToday = new Date();
  isPopupSearchProducts = false;
  statusName: string = '';
  existingProductIds: string[] = [];
  indeterminate = false;
  isSubmitting = false;
  showPrint = false;
  checked = false;
  setOfCheckedId = new Set<string>();
  isMobile = window.innerWidth < 768;
  listOfData: InventoryDetail[] = [];
  listOfCurrentPageData: Product[] = [];
  importCode: string = '';
  editingId: string | null = null;
  editingQuantity: number | null = null;
  inputError = false;
  message: any;
  allData: any[] = [];
  searchKeyword = '';
  supplier = {
    name: '',
    deliveryAddress: '',
    description: '',
  };

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private modal: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: ActivatedRoute,
    private receiptService: WarehouseReceiptService
  ) {
    this.receiptForm = this.fb.group({
      supplierName: [''],
      deliveryAddress: [''],
      description: [''],
      details: this.fb.array([], Validators.required),
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
      this.getWarehouseReceiptDetail(this.id);
    }
  }

  finishOrder(): void {
    const payload: UpdateStatusWarehouseReceiptRequest = {
      Id: this.id,
      RowVersion: this.rowVersion,
      CodeStatus: 'APPROVED',
    };
    this.receiptService.UpdateStatusWarehouseReceipt(payload).subscribe({
      next: () => {
        this.toastr.success('Cập nhật trạng thái đơn hàng thành công!');
        this.cdr.detectChanges();
        this.getWarehouseReceiptDetail(this.id);
      },
      error: (err) => {
        console.error('Lỗi khi gọi ReadByIdWarehouseReceipt:', err);
        this.toastr.error('Cập nhật trạng thái đơn hàng thất bại!');
      },
    });
  }
  updateExistingProductIds(): void {
    this.existingProductIds = this.listOfData.map((item) => item.ProductId);
  }

  getWarehouseReceiptDetail(id: string): void {
    this.receiptService.ReadByIdWarehouseReceipt(id).subscribe({
      next: (res) => {
        this.receiptForm.patchValue({
          supplierName: res.ImportReceipt.ImportReceipt.SupplierName || '',
          deliveryAddress:
            res.ImportReceipt.ImportReceipt.DeliveryAddress || '',
          description: res.ImportReceipt.ImportReceipt.Description || '',
        });
        this.existingProductIds = res.ImportReceipt.ImportReceipt.Details.map(
          (d: any) => d.ProductId
        );
        this.statusName = res.ImportReceipt.ImportReceipt.StatusName;
        this.importCode = res.ImportReceipt.ImportReceipt.Code;
        // Gán dữ liệu sản phẩm
        this.listOfData = res.ImportReceipt.ImportReceipt.Details || [];
        this.listOfData = (res.ImportReceipt.ImportReceipt.Details || []).map(
          (d: any) => ({
            ...d,
            ProductCode: d.ProductCode ?? d.Code,
          })
        );

        this.allData = [...this.listOfData];
        this.rowVersion = res.ImportReceipt.ImportReceipt.RowVersion;

        // Gán ngày
        this.dateToday =
          res.ImportReceipt.ImportReceipt.CreatedDate || new Date();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi gọi ReadByIdWarehouseReceipt:', err);
      },
    });
  }

  get details(): FormArray {
    return this.receiptForm.get('details') as FormArray;
  }

  get isSubmitDisabled(): boolean {
    return (
      this.listOfData.length === 0 ||
      this.listOfData.some((item) => item.Quantity <= 0)
    );
  }

  startEdit(item: InventoryDetail): void {
    this.editingId = item.Id;
    this.editingQuantity = item.Quantity;
  }
  onPrint() {
    const { supplierName, deliveryAddress, description } =
      this.receiptForm.value;

    this.supplier = {
      name: supplierName,
      deliveryAddress: deliveryAddress,
      description: description,
    };

    this.showPrint = true;

    setTimeout(() => {
      window.print();
      this.showPrint = false;
    }, 100);
  }
  saveEdit(item: InventoryDetail): void {
    if (this.editingQuantity === null || this.editingQuantity < 1) {
      this.inputError = true;
      // Tự động bỏ hiệu ứng sau khi shake xong
      setTimeout(() => {
        this.inputError = false;
      }, 300);

      return;
    }

    item.Quantity = this.editingQuantity;
    this.editingId = null;
    this.editingQuantity = null;
  }

  stopEdit(): void {
    this.editingId = null;
  }

  onSearch(): void {
    this.searchKeyword = this.searchKeyword.trim().toLowerCase();
    if (!this.searchKeyword) {
      this.listOfData = [...this.allData];
      this.updateExistingProductIds();
    } else {
      console.log('allData :', this.allData);
      this.listOfData = this.allData.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(this.searchKeyword)
        )
      );
      this.updateExistingProductIds();
    }
    this.cdr.detectChanges();
  }

  deleteItem(itemToDelete: InventoryDetail): void {
    this.modal.confirm({
      nzTitle: `Bạn có chắc muốn xóa sản phẩm "<b>${itemToDelete.ProductName}</b>" này?`,
      nzOkText: 'Xóa',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.listOfData = this.listOfData.filter(
          (item) => item.ProductId !== itemToDelete.ProductId
        );
        console.log('Sau khi xóa:', this.listOfData);
        this.updateExistingProductIds();
        this.cdr.detectChanges();
      },
    });
  }

  onSelectedProducts(productList: InventoryDetail[]) {
    if (!productList || productList.length === 0) {
      this.updateExistingProductIds();
      this.closeProductPopup();
      return;
    }
    const uniqueNewProducts = productList.filter(
      (newItem) =>
        !this.listOfData.some(
          (existingItem) => existingItem.ProductId === newItem.ProductId
        )
    );

    if (uniqueNewProducts.length === 0) {
      this.toastr.warning('Sản phẩm được chọn đã tồn tại trong danh sách!');
      this.closeProductPopup();
      return;
    }

    this.listOfData = [...this.listOfData, ...productList];

    this.listOfData = this.listOfData.filter(
      (item, index, self) => index === self.findIndex((t) => t.Id === item.Id)
    );

    this.listOfData.sort((a, b) => a.ProductCode.localeCompare(b.ProductCode));

    this.allData = [...this.listOfData];

    this.details.clear();
    console.log('this.listOfData:', this.listOfData);

    for (const item of this.listOfData) {
      this.details.push(
        this.fb.group({
          productId: [item.ProductId ?? item.Id, Validators.required],
          quantity: [
            item.Quantity > 0 ? item.Quantity : 1,
            [Validators.required, Validators.min(1)],
          ],
        })
      );
    }

    this.receiptForm.updateValueAndValidity();
    this.cdr.detectChanges();
    this.closeProductPopup();
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

  listOfSelection = [
    {
      text: 'Chọn tất cả hàng',
      onSelect: () => {
        this.onAllChecked(true);
      },
    },
    {
      text: 'Chọn hàng chẵn',
      onSelect: () => {
        this.listOfCurrentPageData.forEach((data, index) =>
          this.updateCheckedSet(data.Id, index % 2 !== 0)
        );
        this.refreshCheckedStatus();
      },
    },
    {
      text: 'Chọn hàng lẻ',
      onSelect: () => {
        this.listOfCurrentPageData.forEach((data, index) =>
          this.updateCheckedSet(data.Id, index % 2 === 0)
        );
        this.refreshCheckedStatus();
      },
    },
  ];

  updateCheckedSet(id: string, chk: boolean) {
    chk ? this.setOfCheckedId.add(id) : this.setOfCheckedId.delete(id);
  }
  onItemChecked(id: string, chk: boolean) {
    this.updateCheckedSet(id, chk);
    this.refreshCheckedStatus();
  }
  onAllChecked(val: boolean) {
    this.listOfCurrentPageData.forEach((item) =>
      this.updateCheckedSet(item.Id, val)
    );
    this.refreshCheckedStatus();
  }
  onCurrentPageDataChange(data: readonly Product[]) {
    this.listOfCurrentPageData = [...data];
    this.refreshCheckedStatus();
  }
  refreshCheckedStatus() {
    this.checked = this.listOfCurrentPageData.every((i) =>
      this.setOfCheckedId.has(i.Id)
    );
    this.indeterminate =
      this.listOfCurrentPageData.some((i) => this.setOfCheckedId.has(i.Id)) &&
      !this.checked;
  }
  trackById(index: number, item: InventoryDetail): string {
    return item.Id;
  }

  submitForm(): void {
    const formValues = this.receiptForm.value;

    const payload: UpdateReceiptRequestRequest = {
      id: this.id,
      supplierName: formValues.supplierName,
      IsDraft: false,
      IsCancelled: false,
      rowVersion: this.rowVersion,
      deliveryAddress: formValues.deliveryAddress,
      description: formValues.description,
      Details: this.listOfData.map((item) => ({
        productId: item.ProductId ?? item.Id,
        quantity: item.Quantity,
      })),
    };

    this.receiptService.UpdateWarehouseReceipt(payload).subscribe({
      next: () => {
        this.toastr.success('Câp nhật phiếu nhập thành công!');
        // this.router.navigateByUrl('/warehouse-receipt');
        this.getWarehouseReceiptDetail(this.id);
      },
      error: (err) => {
        const userMessage = err.error?.Message || 'Cập nhật thất bại';
        this.toastr.error(userMessage);
      },
    });
  }
}
