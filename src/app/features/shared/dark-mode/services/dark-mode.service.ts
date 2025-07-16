import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DarkModeService {
  private darkMode = false;

  constructor() {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      this.darkMode = savedMode === 'true';
    } else {
      this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyMode();
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', String(this.darkMode));
    this.applyMode();
  }

  isDarkMode(): boolean {
    return this.darkMode;
  }

  private applyMode(): void {
    if (this.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
