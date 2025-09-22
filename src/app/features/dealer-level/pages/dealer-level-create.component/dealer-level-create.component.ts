import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
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
import { MenuComponent } from '../../../shared/menu.component/menu.component';
import { ToastrService } from 'ngx-toastr';
import { NgxPrintModule } from 'ngx-print';
import { DealerLevelCreateRequest } from '../../models/dealer-level-create-request.model';
import { DealerLevelService } from '../../services/dealer-level-service';
import { DealerLevel } from '../../models/dealer-level.model';

@Component({
  standalone: true,
  selector: 'dealer-level-create',
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
    MenuComponent,
  ],
  templateUrl: './dealer-level-create.component.html',
  styleUrls: ['./dealer-level-create.component.scss'],
})
export class DealerLevelCreateComponent {
  DealerLevelForm: FormGroup;
  isDark = false;
  dateToday = new Date();
  isPopupSearchDealerLevels = false;
  indeterminate = false;
  isSubmitting = false;
  showPrint = false;
  checked = false;
  setOfCheckedId = new Set<string>();
  isMobile = window.innerWidth < 768;
  listOfData: DealerLevel[] = [];
  listOfCurrentPageData: DealerLevel[] = [];
  editingId: string | null = null;
  editingPrice: number | null = null;
  inputError = false;
  allData: any[] = [];
  message: any;
  searchKeyword = '';
  dealerLevel = {
    name: '',
  };

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private modal: NzModalService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private dealerLevelService: DealerLevelService
  ) {
    this.DealerLevelForm = this.fb.group({
      dealerLevelName: [''],
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 768;
  }
  goBack(): void {
    this.location.back();
  }

  onPrint() {
    const { dealerLevelName } = this.DealerLevelForm.value;

    this.dealerLevel = {
      name: dealerLevelName,
    };

    this.showPrint = true;

    setTimeout(() => {
      window.print();
      this.showPrint = false;
    }, 100);
  }

  submitForm(): void {
    const formValues = this.DealerLevelForm.value;

    const payload: DealerLevelCreateRequest = {
      Name: formValues.dealerLevelName,
    };

    this.dealerLevelService.CreateDealerLevel(payload).subscribe({
      next: (res) => {
        this.toastr.success('Tạo cấp đại lý thành công!');
        const id = res.Id;
         this.router.navigateByUrl(`/dealer-level-update/${id}`);
      },
      error: (err) => {
        const userMessage = err.error?.Message || 'Tạo cấp đại lý thất bại';
        this.toastr.error(userMessage);
      },
    });
  }
}
