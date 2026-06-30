import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { BottomMenuComponent } from '../bottom-menu.component/bottom-menu.component';
import { HeaderCommonComponent } from '../header-common.component/header-common.component';
import { MenuComponent } from '../menu.component/menu.component';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzIconModule,
    MenuComponent,
    HeaderCommonComponent,
    BottomMenuComponent,
  ],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.scss',
})
export class UnauthorizedComponent {
  constructor(
    private readonly location: Location,
    private readonly router: Router
  ) {}

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
      return;
    }

    void this.router.navigate(['/dashboard']);
  }
}
