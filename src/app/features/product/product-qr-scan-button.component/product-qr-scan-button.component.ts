import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { Html5Qrcode } from 'html5-qrcode';
import { InventoryDetail } from '../../inventory-receipt/models/warehouse-receipt-detail.model';
import { Product } from '../product.component/models/product-response.model';
import { ProductService } from '../product.component/services/product-service';

@Component({
  selector: 'product-qr-scan-button',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzIconModule],
  templateUrl: './product-qr-scan-button.component.html',
  styleUrls: ['./product-qr-scan-button.component.scss'],
})
export class ProductQrScanButtonComponent implements OnDestroy {
  @Input() existingProducts: string[] = [];
  @Input() productQuantity = true;
  @Input() disabled = false;
  @Input() compact = false;
  @Output() selectProducts = new EventEmitter<InventoryDetail[]>();

  isQrScannerOpen = false;
  isResolvingQrProduct = false;
  readonly productQrReaderId = `product-qr-reader-${Math.random()
    .toString(36)
    .slice(2)}`;

  private productQrScanner?: Html5Qrcode;
  private qrScanLocked = false;

  constructor(
    private productService: ProductService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    void this.stopProductQrScanner();
  }

  async openProductQrScanner(): Promise<void> {
    if (this.disabled || this.isResolvingQrProduct) return;

    this.isQrScannerOpen = true;
    this.qrScanLocked = false;
    this.cdr.detectChanges();

    setTimeout(() => void this.startProductQrScanner(), 120);
  }

  async closeProductQrScanner(): Promise<void> {
    await this.stopProductQrScanner();
    this.isQrScannerOpen = false;
    this.qrScanLocked = false;
    this.cdr.detectChanges();
  }

  private async startProductQrScanner(): Promise<void> {
    try {
      this.productQrScanner = new Html5Qrcode(this.productQrReaderId);
      const cameras = await Html5Qrcode.getCameras();

      if (!cameras.length) {
        this.toastr.warning('Không tìm thấy camera khả dụng.');
        await this.closeProductQrScanner();
        return;
      }

      const cameraId =
        cameras.find((camera) => camera.label.toLowerCase().includes('back'))
          ?.id || cameras[0].id;

      await this.productQrScanner.start(
        cameraId,
        {
          fps: 12,
          qrbox: { width: 240, height: 240 },
        },
        (decodedText) => this.handleProductQrScan(decodedText),
        () => {}
      );
    } catch (error) {
      console.error('Cannot start product QR scanner:', error);
      this.toastr.error('Không thể bật camera quét QR sản phẩm.');
      await this.closeProductQrScanner();
    }
  }

  private async stopProductQrScanner(): Promise<void> {
    if (!this.productQrScanner) return;

    try {
      await this.productQrScanner.stop();
      await this.productQrScanner.clear();
    } catch (error) {
      console.warn('Cannot stop product QR scanner:', error);
    } finally {
      this.productQrScanner = undefined;
    }
  }

  private handleProductQrScan(decodedText: string): void {
    if (this.qrScanLocked) return;

    this.qrScanLocked = true;
    void this.closeProductQrScanner();
    this.addProductByQrName(decodedText);
  }

  private addProductByQrName(rawQrValue: string): void {
    const productName = this.extractProductNameFromQr(rawQrValue);

    if (!productName) {
      this.toastr.warning('QR không có tên sản phẩm hợp lệ.');
      return;
    }

    this.isResolvingQrProduct = true;
    this.productService
      .SearchProduct(productName, 20, 1, false)
      .pipe(finalize(() => (this.isResolvingQrProduct = false)))
      .subscribe({
        next: (response) => {
          const product = this.pickProductFromQrSearch(
            response.Products || [],
            productName
          );

          if (!product) {
            this.toastr.warning(
              'Không tìm thấy sản phẩm trùng tên QR. Vui lòng kiểm tra lại tên sản phẩm.'
            );
            return;
          }

          this.emitScannedProduct(product);
        },
        error: () => this.toastr.error('Không thể tìm sản phẩm từ QR.'),
      });
  }

  private extractProductNameFromQr(rawQrValue: string): string {
    const value = rawQrValue.trim();
    if (!value) return '';

    try {
      const parsed = JSON.parse(value) as Record<string, unknown>;
      const name =
        parsed['productName'] ||
        parsed['ProductName'] ||
        parsed['name'] ||
        parsed['Name'];

      if (typeof name === 'string') return name.trim();
    } catch {
      // QR hiện tại chứa thẳng tên sản phẩm.
    }

    return value;
  }

  private pickProductFromQrSearch(
    products: Product[],
    productName: string
  ): Product | null {
    const normalizedName = this.normalizeText(productName);
    const exactMatch = products.find(
      (product) => this.normalizeText(product.Name) === normalizedName
    );

    if (exactMatch) return exactMatch;
    if (products.length === 1) return products[0];

    return null;
  }

  private emitScannedProduct(product: Product): void {
    if (!this.canAddScannedProduct(product)) return;

    this.selectProducts.emit([this.mapProductToInventoryDetail(product)]);
  }

  private canAddScannedProduct(product: Product): boolean {
    if (this.existingProducts.includes(product.Id)) {
      this.toastr.warning('Sản phẩm này đã có trong danh sách.');
      return false;
    }

    if (!this.productQuantity && (product.Available ?? 0) <= 0) {
      this.toastr.warning('Sản phẩm này không còn số lượng khả dụng để xuất.');
      return false;
    }

    return true;
  }

  private mapProductToInventoryDetail(product: Product): InventoryDetail {
    const isSerialTracked =
      product.IsSerialTracked ?? (product as any).isSerialTracked ?? false;

    return {
      Id: product.Id,
      ProductId: product.Id,
      ProductName: product.Name,
      ProductCode: product.Code,
      Unit: product.Unit,
      Quantity: isSerialTracked ? 0 : 1,
      SalePrice: product.SalePrice,
      InventoryReceiptId: '',
      Available: product.Available,
      IsSerialTracked: isSerialTracked,
      SerialNumbers: [],
    };
  }

  private normalizeText(value: string): string {
    return value.trim().toLowerCase();
  }
}
