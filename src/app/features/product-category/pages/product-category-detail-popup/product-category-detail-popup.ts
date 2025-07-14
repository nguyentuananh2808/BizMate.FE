import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCategory } from '../../models/product-category-response.model';

@Component({
  selector: 'product-category-detail-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-category-detail-popup.html',
  styleUrl: './product-category-detail-popup.scss',
})
export class ProductCategoryDetailPopup {
  @Input() data!: ProductCategory;
  @Output() closePopup = new EventEmitter<void>();
  isClosing = false;

  close() {
    this.isClosing = true;
    setTimeout(() => this.closePopup.emit(), 900); 
  }
}
