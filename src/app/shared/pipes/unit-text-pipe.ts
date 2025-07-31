import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unitText',
  standalone: true,
})
export class UnitTextPipe implements PipeTransform {
  transform(unit: number): string {
    switch (unit) {
      case 1:
        return 'Cái';
      case 2:
        return 'Hộp';
      case 3:
        return 'Thùng';
      case 4:
        return 'Kg';
      case 5:
        return 'Lít';
      case 6:
        return 'Cây';
      default:
        return 'Khác';
    }
  }
}
