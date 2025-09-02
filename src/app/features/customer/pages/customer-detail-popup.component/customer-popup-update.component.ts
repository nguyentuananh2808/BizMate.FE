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

  searchTerm: string = '';
  showDropdown: boolean = false;
  isClosing = false;
  isSaving = false;

  constructor(
    private customerService: CustomerService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  
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
        this.data.IsActive
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
