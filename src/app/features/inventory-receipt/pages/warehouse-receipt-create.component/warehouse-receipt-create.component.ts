import { Product } from './../../../product/product.component/models/product-response.model';
import { ProductService } from './../../../product/product.component/services/product-service';
import { CommonModule, Location } from '@angular/common';
import { Component, HostListener } from '@angular/core';
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
import { NzModalModule } from 'ng-zorro-antd/modal';
import { RouterModule } from '@angular/router';
import { UnitTextPipe } from '../../../../shared/pipes/unit-text-pipe';
import { InventoryDetail } from '../../models/warehouse-receipt-detail.model';
import { ProductResponse } from '../../../product/product.component/models/product-response.model';
import { map } from 'rxjs';
import { ProductPopupSearchComponent } from '../../../product/product-popup-search.component/product-popup-search.component';

@Component({
  standalone: true,
  selector: 'warehouse-receipt-create',
  imports: [
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
  ],
  templateUrl: './warehouse-receipt-create.component.html',
  styleUrls: ['./warehouse-receipt-create.component.scss'],
})
export class WarehouseReceiptCreateComponent {
  receiptForm: FormGroup;
  isDark = false;
  dateToday = new Date();
  isPopupSearchProducts = false;
  indeterminate = false;
  checked = false;
  setOfCheckedId = new Set<string>();
  isMobile = window.innerWidth < 768;
  listOfData: InventoryDetail[] = [];
  listOfCurrentPageData: Product[] = [];

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private productService: ProductService
  ) {
    this.receiptForm = this.fb.group({
      supplierName: ['', Validators.required],
      phoneNumber: [''],
      email: [''],
      deliveryAddress: [''],
      details: this.fb.array([]),
    });

    this.addProduct();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 768;
  }

  get details(): FormArray {
    return this.receiptForm.get('details') as FormArray;
  }

  onSelectedProducts(product: InventoryDetail[]) {
    this.listOfData = [...this.listOfData, ...product];
    // Lọc trùng theo ProductId (nếu cần)
    this.listOfData = this.listOfData.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.Id === item.Id)
    );

    // Sắp xếp theo ProductCode
    this.listOfData.sort((a, b) => a.ProductCode.localeCompare(b.ProductCode));
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

  submitForm(): void {
    if (this.receiptForm.valid) {
      const payload = this.receiptForm.value;
      console.log('Tạo phiếu nhập với dữ liệu:', payload);
    } else {
      console.warn('Form không hợp lệ');
    }
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
}
