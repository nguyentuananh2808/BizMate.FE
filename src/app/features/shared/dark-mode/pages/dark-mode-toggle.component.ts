import { CommonModule } from '@angular/common';
import { DarkModeService } from './../services/dark-mode.service';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { MoonOutline, SunOutline } from '@ant-design/icons-angular/icons';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'dark-mode-toggle',
  imports: [NzSwitchModule, CommonModule, NzIconModule, FormsModule],
  templateUrl: './dark-mode-toggle.component.html',
  styleUrl: './dark-mode-toggle.component.scss',
})
export class DarkModeToggleComponent {
  constructor(private darkModeService: DarkModeService) {}
  sunIcon = SunOutline;
  moonIcon = MoonOutline;
  @ViewChild('checkedTpl') checkedTpl!: TemplateRef<void>;
  @ViewChild('uncheckedTpl') uncheckedTpl!: TemplateRef<void>;
  get isDark(): boolean {
    return this.darkModeService.isDarkMode();
  }

  toggleDarkMode(): void {
    this.darkModeService.toggleDarkMode();
  }
}
