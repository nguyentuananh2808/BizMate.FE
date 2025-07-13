import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: true,
  selector: 'table-common',
  imports: [CommonModule, FormsModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements OnChanges, OnInit {
  constructor(private cdr: ChangeDetectorRef) {}
  @Input() columns: { key: string; label: string; sortable?: boolean }[] = [];
  @Input() data: any[] = [];
  @Input() isLoading = false;
  @Input() pageSize = 5;
  @Input() customTemplates: { [key: string]: TemplateRef<any> } = {};

  @Output() rowSelected = new EventEmitter<any[]>();

  searchText = '';
  currentPage = 1;
  sortKey: string | null = null;
  sortAsc: boolean = true;
  selectedRows: Set<any> = new Set();

  ngOnInit() {
    console.log('[TableComponent:OnInit] DATA nhận được:', this.data);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['data'] &&
      changes['data'].currentValue !== changes['data'].previousValue
    ) {
      this.currentPage = 1;
      this.cdr.markForCheck();
    }
  }

  get filteredData() {
    let filtered = this.data.filter((row) =>
      Object.values(row).some((val) =>
        val?.toString().toLowerCase().includes(this.searchText.toLowerCase())
      )
    );

    if (this.sortKey) {
      filtered.sort((a, b) => {
        const aVal = a[this.sortKey!];
        const bVal = b[this.sortKey!];
        return this.sortAsc ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
      });
    }

    return filtered;
  }

  get pagedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  toggleSort(key: string) {
    if (this.sortKey === key) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortKey = key;
      this.sortAsc = true;
    }
  }

  toggleSelect(row: any) {
    if (this.selectedRows.has(row)) {
      this.selectedRows.delete(row);
    } else {
      this.selectedRows.add(row);
    }
    this.rowSelected.emit([...this.selectedRows]);
  }

  isSelected(row: any) {
    return this.selectedRows.has(row);
  }
}
