import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { Customer } from '../../models/customer-response.model';
import { CustomerService } from '../../services/customer-service';
import { DealerLevel } from '../../../dealer-level/models/dealer-level.model';
import { DealerLevelSearchRequest } from '../../../dealer-level/models/dealer-level-search-request.model';
import { DealerLevelService } from '../../../dealer-level/services/dealer-level-service';

@Component({
  selector: 'customer-popup-update',
  standalone: true,
  imports: [CommonModule, FormsModule, NzSelectModule],
  templateUrl: './customer-popup-update.component.html',
  styleUrls: ['./customer-popup-update.component.scss'],
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
export class CustomerPopupUpdateComponent implements OnInit {
  @Input() data!: Customer;
  @Output() closePopup = new EventEmitter<void>();
  @Output() update = new EventEmitter<void>();
  dealerLevelId: string = '';
  dealerLevels: DealerLevel[] = [];
  searchTerm: string = '';
  filteredDealerLevels: DealerLevel[] = [];
  showDropdown: boolean = false;
  isClosing = false;
  isSaving = false;

  constructor(
    private customerService: CustomerService,
    private toastr: ToastrService,
    private dealerLevelService: DealerLevelService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDealerLevels();
  }

  private loadDealerLevels(): void {
    const payload: DealerLevelSearchRequest = {
      keySearch: '',
      pageIndex: 1,
      pageSize: 50,
    };

    this.dealerLevelService.SearchDealerLevel(payload).subscribe({
      next: (res) => {
        this.dealerLevels = res.DealerLevels || [];
        this.filteredDealerLevels = [...this.dealerLevels];

        // 👉 Set giá trị mặc định khi mở popup
        if (this.data.DealerLevelId) {
          const selected = this.dealerLevels.find(
            (dl) => dl.Id === this.data.DealerLevelId
          );
          if (selected) {
            this.searchTerm = selected.Name;
            this.dealerLevelId = selected.Id;
          }
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.toastr.error('Không thể load cấp đại lý');
      },
    });
  }

  filterDealerLevel(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredDealerLevels = this.dealerLevels.filter((dl) =>
      dl.Name.toLowerCase().includes(term)
    );

    const matched = this.dealerLevels.find(
      (dl) => dl.Name.toLowerCase() === term
    );
    if (!matched) this.dealerLevelId = '';
  }

  selectDealerLevel(dl: DealerLevel): void {
    this.dealerLevelId = dl.Id;
    this.searchTerm = dl.Name;
    this.showDropdown = false;
    this.data.DealerLevelId = dl.Id;
  }

  close() {
    this.isClosing = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.closePopup.emit();
      this.isClosing = false;
      this.cdr.detectChanges();
    }, 200);
  }
  onBlur(): void {
    setTimeout(() => {
      this.showDropdown = false;

      const match = this.dealerLevels.find((dl) => dl.Name === this.searchTerm);
      if (!match) {
        this.dealerLevelId = '';
        this.searchTerm = '';
      }
    }, 200);
  }

  onSubmit() {
    if (this.isSaving) return;
    this.isSaving = true;

    this.customerService
      .UpdateCustomer(
        this.data.Id,
        this.data.Code.trim(),
        this.data.Name.trim(),
        this.data.Phone.trim(),
        this.data.Address.trim(),
        this.data.RowVersion,
        this.data.IsActive,
        this.data.DealerLevelId
      )
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.isSaving = false;
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: () => {
          this.toastr.success('Cập nhật thành công');
          this.update.emit();
          this.close();
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
          } else if (apiMessage === 'BACKEND.APP_MESSAGE.DATA_DUPLICATE') {
            userMessage = 'Tên khách hàng đã tồn tại.';
          } else if (apiMessage) {
            userMessage = apiMessage;
          }
          this.toastr.error(userMessage);
        },
      });
  }
}
