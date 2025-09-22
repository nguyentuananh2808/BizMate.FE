import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusColor',
  standalone: true,
})
export class StatusColorPipe implements PipeTransform {
  transform(statusName: string): string {
    switch (statusName) {
      case 'Tạo mới':
        return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'Đang đóng hàng':
        return 'bg-orange-100 text-orange-700 border border-orange-300';
      case 'Đã đóng hàng':
        return 'bg-purple-100 text-purple-700 border border-purple-300';
      case 'Hoàn thành':
        return 'bg-green-100 text-green-700 border border-green-300';
      case 'Hủy':
        return 'bg-red-100 text-red-700 border border-red-300';
      case 'Đã duyệt':
        return 'bg-green-700 text-white border border-green-900';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  }
}
