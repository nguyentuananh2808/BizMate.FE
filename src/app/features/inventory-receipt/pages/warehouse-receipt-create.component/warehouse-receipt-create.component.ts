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
import { InventoryDetail } from '../../models/warehouse-receipt-detail.model';
import { ProductPopupSearchComponent } from '../../../product/product-popup-search.component/product-popup-search.component';
import { MenuComponent } from '../../../shared/menu.component/menu.component';
import { CreateReceiptRequestRequest } from '../../models/warehouse-receipt-create.model';
import { WarehouseReceiptService } from '../../services/warehouse-receipt.service';
import { ToastrService } from 'ngx-toastr';
import { NgxPrintModule } from 'ngx-print';
import { Html5Qrcode } from 'html5-qrcode';

@Component({
  standalone: true,
  selector: 'warehouse-receipt-create',
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
  templateUrl: './warehouse-receipt-create.component.html',
  styleUrls: ['./warehouse-receipt-create.component.scss'],
})
export class WarehouseReceiptCreateComponent {
  receiptForm: FormGroup;
  isDark = false;
  dateToday = new Date();
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
    private router: Router,
    private receiptService: WarehouseReceiptService,
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
  private successSound = new Audio('assets/sounds/success-beep.mp3');
  private errorSound = new Audio('assets/sounds/error-buzz.mp3');
  isScanning = false;
  lastScan = '';
  scannerTitle = 'Quét Serial';
  private scanner?: Html5Qrcode;
  private scanLocked = false;
  private scanTargetItem: InventoryDetail | null = null;

  playSuccessSound(): void {
    this.successSound.currentTime = 0;
    this.successSound.play().catch((err) => console.log(err));
  }

  playErrorSound(): void {
    this.errorSound.currentTime = 0;
    this.errorSound.play().catch((err) => console.log(err));
  }

  
  isSerialTracked(item: InventoryDetail): boolean {
    return item.IsSerialTracked ?? (item as any).isSerialTracked ?? false;
  }

  getSerialNumbers(item: InventoryDetail): string[] {
    return item.SerialNumbers ?? [];
  }

  private normalizeSerialNumber(value: string): string {
    return value.trim();
  }

  private hasSerialInReceipt(
    serialNumber: string,
    targetItem: InventoryDetail
  ): boolean {
    const normalized = serialNumber.toLowerCase();

    return this.listOfData.some((item) => {
      if (item.ProductId === targetItem.ProductId) {
        return false;
      }

      return this.getSerialNumbers(item).some(
        (sn) => sn.toLowerCase() === normalized
      );
    });
  }

  private syncSerialQuantity(item: InventoryDetail): void {
    if (!this.isSerialTracked(item)) {
      return;
    }

    item.Quantity = this.getSerialNumbers(item).length;
  }

  private refreshDataSnapshots(): void {
    this.allData = [...this.listOfData];
    this.receiptForm.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  addSerialToItem(item: InventoryDetail, value: string): void {
    if (!this.isSerialTracked(item)) {
      this.toastr.warning('Sản phẩm này không bật quản lý theo SN.');
      return;
    }

    const serialNumber = this.normalizeSerialNumber(value);
    if (!serialNumber) {
      return;
    }

    const currentSerials = this.getSerialNumbers(item);
    const duplicatedInProduct = currentSerials.some(
      (sn) => sn.toLowerCase() === serialNumber.toLowerCase()
    );

    if (duplicatedInProduct || this.hasSerialInReceipt(serialNumber, item)) {
      this.toastr.warning(`SN ${serialNumber} đã có trong phiếu.`);
      this.playErrorSound();
      return;
    }

    item.SerialNumbers = [...currentSerials, serialNumber];
    this.syncSerialQuantity(item);
    this.lastScan = serialNumber;
    this.toastr.success(`Đã thêm SN ${serialNumber}`);
    navigator.vibrate?.(120);
    this.playSuccessSound();
    this.refreshDataSnapshots();
  }

  removeSerialFromItem(item: InventoryDetail, serialNumber: string): void {
    item.SerialNumbers = this.getSerialNumbers(item).filter(
      (sn) => sn !== serialNumber
    );
    this.syncSerialQuantity(item);
    this.refreshDataSnapshots();
  }

  openSerialTextModal(item: InventoryDetail): void {
    if (!this.isSerialTracked(item)) {
      return;
    }

    const existing = this.getSerialNumbers(item).join('\n');

    this.modal.create({
      nzTitle: `Nhập Serial - ${item.ProductName}`,
      nzContent: `
        <textarea id="snInput"
          style="width:100%;height:220px;border:1px solid #d9d9d9;border-radius:12px;padding:12px;outline:none"
          placeholder="Mỗi dòng 1 serial">${existing}</textarea>
      `,
      nzOkText: 'Lưu SN',
      nzCancelText: 'Đóng',
      nzOnOk: () => {
        const textarea = document.getElementById(
          'snInput'
        ) as HTMLTextAreaElement | null;

        if (!textarea) {
          return;
        }

        const serials = textarea.value
          .split('\n')
          .map((x) => this.normalizeSerialNumber(x))
          .filter((x) => x);

        item.SerialNumbers = [...new Set(serials)];
        this.syncSerialQuantity(item);
        this.refreshDataSnapshots();
      },
    });
  }

  async openCameraScanner(item: InventoryDetail): Promise<void> {
    if (!this.isSerialTracked(item)) {
      this.toastr.info('Sản phẩm này nhập theo số lượng, không cần quét SN.');
      return;
    }

    this.scanTargetItem = item;
    this.scannerTitle = `Quét SN - ${item.ProductName}`;
    this.isScanning = true;
    this.cdr.detectChanges();

    setTimeout(() => void this.startScanner(), 150);
  }

  private async startScanner(): Promise<void> {
    try {
      this.scanner = new Html5Qrcode('warehouse-serial-qr-reader');
      const cameras = await Html5Qrcode.getCameras();

      if (!cameras.length) {
        this.toastr.warning('Không tìm thấy camera khả dụng.');
        this.isScanning = false;
        return;
      }

      const cameraId =
        cameras.find((c) => c.label.toLowerCase().includes('back'))?.id ||
        cameras[0].id;

      await this.scanner.start(
        cameraId,
        {
          fps: 12,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => this.handleScannedSerial(decodedText),
        () => {}
      );
    } catch (error) {
      console.error('Cannot start serial scanner:', error);
      this.toastr.error('Không thể bật camera quét SN.');
      this.isScanning = false;
    }
  }

  private handleScannedSerial(decodedText: string): void {
    if (this.scanLocked || !this.scanTargetItem) {
      return;
    }

    this.scanLocked = true;
    this.addSerialToItem(this.scanTargetItem, decodedText);

    setTimeout(() => {
      this.scanLocked = false;
    }, 900);
  }

  async closeScanner(): Promise<void> {
    try {
      if (this.scanner) {
        await this.scanner.stop();
        await this.scanner.clear();
      }
    } catch (error) {
      console.warn('Cannot stop serial scanner:', error);
    }

    this.scanner = undefined;
    this.scanTargetItem = null;
    this.scanLocked = false;
    this.isScanning = false;
  }
  get details(): FormArray {
    return this.receiptForm.get('details') as FormArray;
  }

  get isSubmitDisabled(): boolean {
    return (
      this.listOfData.length === 0 ||
      this.listOfData.some((item) =>
        this.isSerialTracked(item)
          ? this.getSerialNumbers(item).length === 0
          : item.Quantity <= 0
      )
    );
  }

  startEdit(item: InventoryDetail): void {
    if (this.isSerialTracked(item)) {
      this.openSerialTextModal(item);
      return;
    }

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

  qrScanner!: Html5Qrcode;

  saveEdit(item: InventoryDetail): void {
    if (this.isSerialTracked(item)) {
      this.syncSerialQuantity(item);
      this.editingId = null;
      this.editingQuantity = null;
      return;
    }

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
    this.refreshDataSnapshots();
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
          (item) => item.Id !== itemToDelete.Id,
        );
        this.refreshDataSnapshots();
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
          String(value).toLowerCase().includes(this.searchKeyword),
        ),
      );
    }
    this.cdr.detectChanges();
  }

  onSelectedProducts(productList: InventoryDetail[]) {
    productList = productList.map((p) => ({
      ...p,
      IsSerialTracked:
        (p as any).IsSerialTracked ?? (p as any).isSerialTracked ?? false,
      SerialNumbers: (p as any).SerialNumbers ?? [],
      Quantity:
        ((p as any).IsSerialTracked ?? (p as any).isSerialTracked ?? false)
          ? ((p as any).SerialNumbers ?? []).length
          : p.Quantity > 0
            ? p.Quantity
            : 1,
    }));
    console.log('Selected Product:', productList);
    if (!productList || productList.length === 0) {
      this.closeProductPopup();
      return;
    }

    this.listOfData = [...this.listOfData, ...productList];

    this.listOfData = this.listOfData.filter(
      (item, index, self) => index === self.findIndex((t) => t.Id === item.Id),
    );

    this.listOfData.sort((a, b) => a.ProductCode.localeCompare(b.ProductCode));

    this.allData = [...this.listOfData];

    this.details.clear();

    for (const item of this.listOfData) {
      this.details.push(
        this.fb.group({
          productId: [item.ProductId ?? item.Id, Validators.required],
          quantity: [
            item.Quantity > 0 ? item.Quantity : this.isSerialTracked(item) ? 0 : 1,
            [Validators.required, Validators.min(1)],
          ],
        }),
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
      }),
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
          this.updateCheckedSet(data.Id, index % 2 !== 0),
        );
        this.refreshCheckedStatus();
      },
    },
    {
      text: 'Chọn hàng lẻ',
      onSelect: () => {
        this.listOfCurrentPageData.forEach((data, index) =>
          this.updateCheckedSet(data.Id, index % 2 === 0),
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
      this.updateCheckedSet(item.Id, val),
    );
    this.refreshCheckedStatus();
  }
  onCurrentPageDataChange(data: readonly Product[]) {
    this.listOfCurrentPageData = [...data];
    this.refreshCheckedStatus();
  }
  refreshCheckedStatus() {
    this.checked = this.listOfCurrentPageData.every((i) =>
      this.setOfCheckedId.has(i.Id),
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
    const missingSerialItem = this.listOfData.find(
      (item) => this.isSerialTracked(item) && this.getSerialNumbers(item).length === 0
    );

    if (missingSerialItem) {
      this.toastr.warning(
        `Vui lòng quét hoặc nhập SN cho ${missingSerialItem.ProductName}.`
      );
      return;
    }

    const payload: CreateReceiptRequestRequest = {
      supplierName: formValues.supplierName,
      deliveryAddress: formValues.deliveryAddress,
      description: formValues.description,
      details: this.listOfData.map((item) => ({
        productId: item.ProductId ?? item.Id,
        quantity: item.Quantity,
        serialNumbers: this.isSerialTracked(item)
          ? this.getSerialNumbers(item)
          : [],
      })),
    };

    this.isSubmitting = true;
    this.receiptService.CreateWarehouseReceipt(payload).subscribe({
      next: () => {
        this.toastr.success('Tạo phiếu nhập thành công!');
        this.router.navigateByUrl('/warehouse-receipt');
      },
      error: (err) => {
        const userMessage = err.error?.Message || 'Cập nhật thất bại';
        this.toastr.error(userMessage);
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
