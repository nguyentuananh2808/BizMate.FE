import { Component } from '@angular/core';
import { TopMenuComponent } from '../top-menu.component/top-menu.component';
import { DarkModeToggleComponent } from '../dark-mode/pages/dark-mode-toggle.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'header-common',
  imports: [TopMenuComponent, DarkModeToggleComponent, CommonModule],
  templateUrl: './header-common.component.html',
  styleUrls: ['./header-common.component.scss'],
})
export class HeaderCommonComponent {
  nameStore: string | null = localStorage.getItem('store_name');
}
