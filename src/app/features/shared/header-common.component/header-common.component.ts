import { Component, OnDestroy, OnInit } from '@angular/core';
import { TopMenuComponent } from '../top-menu.component/top-menu.component';
import { DarkModeToggleComponent } from '../dark-mode/pages/dark-mode-toggle.component';
import { CommonModule } from '@angular/common';
import { DarkModeService } from '../dark-mode/services/dark-mode.service';
import { Subscription } from 'rxjs';
import { NotificationComponent } from '../../notification/pages/notification';

@Component({
  standalone: true,
  selector: 'header-common',
  imports: [TopMenuComponent, DarkModeToggleComponent, CommonModule,NotificationComponent],
  templateUrl: './header-common.component.html',
  styleUrls: ['./header-common.component.scss'],
})
export class HeaderCommonComponent implements OnInit, OnDestroy {
  constructor(private darkModeService: DarkModeService) {}
  isDark = false;
  nameStore: string | null = localStorage.getItem('store_name');
  private sub!: Subscription;

  ngOnInit(): void {
    this.sub = this.darkModeService.isDark$.subscribe((value) => {
      this.isDark = value;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleDarkMode(): void {
    this.darkModeService.toggleDarkMode();
  }
}
