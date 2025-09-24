import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'bottom-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './bottom-menu.component.html',
  styleUrls: ['./bottom-menu.component.scss'],
})
export class BottomMenuComponent {
  active = '';

  menuItems = [
    { id: 'home', icon: 'home', url: '/dashboard' },
    { id: 'fab', icon: 'wrench-screwdriver', url: '/dashboard' },
    { id: 'me', icon: 'user', url: '/user-information' },
  ];

  constructor(private router: Router) {
    // Lắng nghe sự kiện đổi route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const current = this.menuItems.find(item =>
          event.urlAfterRedirects.startsWith(item.url)
        );
        this.active = current ? current.id : '';
      });
  }

  setActive(id: string) {
    this.active = id;
  }
}
