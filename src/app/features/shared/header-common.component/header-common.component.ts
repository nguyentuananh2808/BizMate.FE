import { Component } from '@angular/core';
import { TopMenuComponent } from '../top-menu.component/top-menu.component';

@Component({
  selector: 'header-common',
  imports: [TopMenuComponent],
  templateUrl: './header-common.component.html',
  styleUrl: './header-common.component.scss'
})
export class HeaderCommonComponent {
 nameStore : string | null = localStorage.getItem('store_name');

 
}
