import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DarkModeService {
  private darkModeSubject: BehaviorSubject<boolean>;

  public isDark$; 

  constructor() {
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    const initialValue =
      savedMode !== null ? savedMode === 'true' : prefersDark;

    this.darkModeSubject = new BehaviorSubject<boolean>(initialValue);
    this.isDark$ = this.darkModeSubject.asObservable();

    this.applyMode(initialValue);
  }

  toggleDarkMode(): void {
    const newValue = !this.darkModeSubject.value;
    this.darkModeSubject.next(newValue);
    localStorage.setItem('darkMode', String(newValue));
    this.applyMode(newValue);
  }

  isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }

  private applyMode(mode: boolean): void {
    if (mode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
