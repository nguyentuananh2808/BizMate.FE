import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'price',
})
export class PricePipe implements PipeTransform {
  transform(value: number): string {
    if (value == null) return '';
    return (value * 1000).toLocaleString('vi-VN') + ' vnđ';
  }
}
