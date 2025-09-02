import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import {CustomerService} from '../../services/customer-service'
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { Customer } from '../../models/customer-response.model';

@Component({
  selector: 'customer-popup-create',
  standalone: true,
  imports: [CommonModule, FormsModule, NzSelectModule, NzFormModule],
  templateUrl: './customer-popup-create.component.html',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'scale(0.90)' })
        ),
      ]),
    ]),
  ],
})
export class CustomerPopupCreateComponent implements OnInit {
  name: string = '';
  phone: string = '';
  address: string = '';
  dealerLevelId: string = '';

  searchTerm: string = '';
  filteredCategories: Customer[] = [];
  showDropdown: boolean = false;

  @Output() closePopupCreate = new EventEmitter<void>();
  @Output() create = new EventEmitter<void>();

  isClosing: boolean = false;
  isSaving: boolean = false;

  constructor(
    private customerService: CustomerService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    //this.loadCategories();
  }

//   private loadCategories(): void {
//     this.customerService.SearchCustomer().subscribe({
//       next: (res) => {
//         this.categories = (res.Customers || []).filter(
//           (cat) => cat.IsActive == false
//         );
//         this.filteredCategories = [...this.categories];
//         console.log('Categories loaded:', this.categories);
//         this.cdr.detectChanges();
//       },
//       error: () => {
//         this.toastr.error('Không thể load loại sản phẩm');
//       },
//     });
//   }
//   filterCategories(): void {
//     const term = this.searchTerm.toLowerCase();
//     this.filteredCategories = this.categories.filter((cat) =>
//       cat.Name.toLowerCase().includes(term)
//     );

//     const matched = this.categories.find(
//       (cat) => cat.Name.toLowerCase() === term
//     );
//     if (!matched) this.CustomerId = '';
//   }

//   selectCategory(cat: Customer): void {
//     this.CustomerId = cat.Id;
//     this.searchTerm = cat.Name;
//     this.showDropdown = false;
//   }

//   onBlur(): void {
//     setTimeout(() => {
//       this.showDropdown = false;

//       const match = this.categories.find((cat) => cat.Name === this.searchTerm);
//       if (!match) {
//         this.CustomerId = '';
//         this.searchTerm = '';
//       }
//     }, 200);
//   }

  close(): void {
    this.closePopupCreate.emit();
  }

  onSubmit(): void {
    if (this.isSaving) return;


    this.isSaving = true;
    this.customerService
      .CreateCustomer(
        this.name,
        this.phone,
        this.address
      )
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.toastr.success('Tạo mới khách hàng thành công');
          this.create.emit();
          this.close();
        },
        error: (err) => {
           const apiMessage = err.error?.Message;
        let userMessage = 'Cập nhật thất bại';

        if (apiMessage === 'BACKEND.VALIDATION.MESSAGE.ALREADY_EXIST') {
          userMessage = 'Khách hàng đã tồn tại trong hệ thống';
        } else if (apiMessage) {
          userMessage = apiMessage; 
        }
          this.toastr.error(userMessage);
        },
      });
  }
}
