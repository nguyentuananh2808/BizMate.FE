import { WarehouseReceiptService } from './../../services/warehouse-receipt.service';
import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
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
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';
import { NzButtonModule } from 'ng-zorro-antd/button';
import {
  InventoryDetail,
  InventoryReadById,
} from '../../models/warehouse-receipt-detail.model';
import { UnitTextPipe } from '../../../../shared/pipes/unit-text-pipe';

@Component({
  selector: 'warehouse-receipt-detail',
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzCheckboxModule,
    NzButtonModule,
    BottomMenuComponent,
    NzIconModule,
    RouterModule,
    HeaderCommonComponent,
    NzModalModule,
    NzFloatButtonModule,
    UnitTextPipe,
    ReactiveFormsModule
  ],
  templateUrl: './warehouse-receipt-detail.component.html',
  styleUrls: ['./warehouse-receipt-detail.component.scss'],
  providers: [DatePipe],
})
export class WarehouseReceiptDetailComponent implements OnInit {
  receiptForm: FormGroup;
  isDark = false;
  isLoading = false;
  id!: string;
  indeterminate = false;
  isMobile = window.innerWidth < 768;
  dateToday = new Date();
  setOfCheckedId = new Set<string>();
  dataDetail: InventoryReadById | undefined;
  listOfData: InventoryDetail[] = [];
  checked = false;
  listOfCurrentPageData: InventoryDetail[] = [];
  constructor(
    private warehouseReceiptService: WarehouseReceiptService,
    private cdr: ChangeDetectorRef,
    private modal: NzModalService,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private location: Location,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.receiptForm = this.fb.group({
      supplierName: ['', Validators.required],
      phoneNumber: [''],
      email: [''],
      deliveryAddress: [''],
      details: this.fb.array([]), // danh sách sản phẩm
    });
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 768;
  }

  get details(): FormArray {
    return this.receiptForm.get('details') as FormArray;
  }

  addProduct() {
    this.details.push(
      this.fb.group({
        productId: ['', Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]],
      })
    );
  }

  removeProduct(index: number) {
    this.details.removeAt(index);
  }

  submitForm() {
    if (this.receiptForm.valid) {
      const formData = this.receiptForm.value;

      const payload = {
        id: this.id,
        supplierName: formData.supplierName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        deliveryAddress: formData.deliveryAddress,
        details: formData.details,
      };

      console.log('Dữ liệu gửi:', payload);
    }
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.fetchData();
    console.log('ID nhận được:', this.id);
  }
  goBack(): void {
    this.location.back();
  }

  fetchData(): void {
    this.isLoading = true;
    this.warehouseReceiptService.ReadByIdWarehouseReceipt(this.id).subscribe({
      next: (res) => {
        this.dataDetail = res || null;
        this.listOfCurrentPageData = res.InventoryDetails || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => (this.isLoading = false),
    });
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
  onCurrentPageDataChange(data: readonly InventoryDetail[]) {
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
