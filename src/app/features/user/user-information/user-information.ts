import { routes } from './../../../app.routes';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HeaderCommonComponent } from '../../shared/header-common.component/header-common.component';
import { BottomMenuComponent } from '../../shared/bottom-menu.component/bottom-menu.component';
import { MenuComponent } from '../../shared/menu.component/menu.component';
import { DarkModeToggleComponent } from '../../shared/dark-mode/pages/dark-mode-toggle.component';
import { Router } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'user-information',
  standalone: true,
  imports: [
    CommonModule,
    DarkModeToggleComponent,
    HeaderCommonComponent,
    BottomMenuComponent,
    MenuComponent,
    NzIconModule
  ],
  templateUrl: './user-information.html',
  styleUrls: ['./user-information.scss'],
})
export class UserInformation implements OnInit {
  constructor(private router: Router) {}

  isDark = false;

  user: {
    name: string;
    email: string;
    role: string;
    storeName: string;
    userId: string;
    darkMode: boolean;
  } = {
    name: '',
    email: '',
    role: '',
    storeName: '',
    userId: '',
    darkMode: false,
  };

  ngOnInit(): void {
    this.user.name = localStorage.getItem('name') ?? '';
    this.user.email = localStorage.getItem('email') ?? '';
    this.user.role = localStorage.getItem('role') ?? '';
    this.user.storeName = localStorage.getItem('store_name') ?? '';
    this.user.userId = localStorage.getItem('user_id') ?? '';
    this.user.darkMode = localStorage.getItem('darkMode') === 'true';
  }

  logout(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
