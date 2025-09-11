import { Product } from './../../../product/product.component/models/product-response.model';
import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
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
import { Router, RouterModule } from '@angular/router';
import { UnitTextPipe } from '../../../../shared/pipes/unit-text-pipe';
import { ProductPopupSearchComponent } from '../../../product/product-popup-search.component/product-popup-search.component';
import { MenuComponent } from '../../../shared/menu.component/menu.component';
import { ToastrService } from 'ngx-toastr';
import { NgxPrintModule } from 'ngx-print';
import { InventoryDetail } from '../../../inventory-receipt/models/warehouse-receipt-detail.model';
import { WarehouseReceiptService } from '../../../inventory-receipt/services/warehouse-receipt.service';
import { CreateReceiptRequestRequest } from '../../../inventory-receipt/models/warehouse-receipt-create.model';

@Component({
  standalone: true,
  selector: 'order-create',
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
    ProductPopupSearchComponent,
    MenuComponent,
  ],
  templateUrl: './order-create.component.html',
  styleUrls: ['./order-create.component.scss'],
})
export class OrderCreateComponent {
  orderForm: FormGroup;
  isDark = false;
  dateToday = new Date();
  existingProductIds: string[] = [];
  isPopupSearchProducts = false;
  indeterminate = false;
  isSubmitting = false;
  showPrint = false;
  checked = false;
  setOfCheckedId = new Set<string>();
  isMobile = window.innerWidth < 768;
  listOfData: InventoryDetail[] = [];
  listOfCurrentPageData: Product[] = [];
  editingId: string | null = null;
  editingQuantity: number | null = null;
  inputError = false;
  allData: any[] = [];
  message: any;
  searchKeyword = '';
  customer = {
    name: '',
    phone: '',
    address: '',
    description: '',
  };

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private modal: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private receiptService: WarehouseReceiptService
  ) {
    this.orderForm = this.fb.group({
      customerName: [''],
      phoneNumber: [''],
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

  get details(): FormArray {
    return this.orderForm.get('details') as FormArray;
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
    const { customerName, phoneNumber, description, deliveryAddress } =
      this.orderForm.value;

    this.customer = {
      name: customerName,
      phone: phoneNumber,
      address: deliveryAddress,
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

  deleteItem(itemToDelete: any): void {
    this.modal.confirm({
      nzTitle: `Bạn có chắc muốn xóa sản phẩm "<b>${itemToDelete.ProductName}</b>" này?`,
      nzOkText: 'Xóa',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.listOfData = this.listOfData.filter(
          (item) => item.Id !== itemToDelete.Id
        );
        this.cdr.detectChanges();
      },
    });
  }

  onSearch(): void {
    this.searchKeyword = this.searchKeyword.trim().toLowerCase();
    if (!this.searchKeyword) {
      this.listOfData = [...this.allData];
    } else {
      console.log('allData :', this.allData);

      this.listOfData = this.allData.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(this.searchKeyword)
        )
      );
    }
    this.cdr.detectChanges();
  }

  onSelectedProducts(productList: InventoryDetail[]) {
    if (!productList || productList.length === 0) {
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

    this.orderForm.updateValueAndValidity();
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
    const formValues = this.orderForm.value;

    const payload: CreateReceiptRequestRequest = {
      type: 2, //phiếu xuất
      customerName: formValues.customerName,
      customerPhone: formValues.phoneNumber,
      deliveryAddress: formValues.deliveryAddress,
      description: formValues.description,
      details: this.listOfData.map((item) => ({
        productId: item.ProductId ?? item.Id,
        quantity: item.Quantity,
      })),
    };

    this.receiptService.CreateWarehouseReceipt(payload).subscribe({
      next: () => {
        this.toastr.success('Tạo đơn hàng thành công!');
        this.router.navigateByUrl('/order');
      },
      error: (err) => {
        const userMessage = err.error?.Message || 'Cập nhật thất bại';
        this.toastr.error(userMessage);
      },
    });
  }
}
