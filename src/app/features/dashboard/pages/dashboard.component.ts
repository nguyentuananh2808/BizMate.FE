import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ChartConfiguration,
  ChartOptions,
  ChartType,
  Chart,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PieController,
  BarController,
  Tooltip,
  Legend,
} from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { HeaderCommonComponent } from '../../shared/header-common.component/header-common.component';
import { MenuComponent } from '../../shared/menu.component/menu.component';

// ✅ Đăng ký các thành phần cần cho Pie & Bar chart
Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PieController,
  BarController,
  Tooltip,
  Legend
);

@Component({
  selector: 'dashboard-app',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, HeaderCommonComponent, MenuComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  isDark = false;

  // Dữ liệu biểu đồ tròn
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Hoàn thành', 'Đang xử lý', 'Hủy'],
    datasets: [
      {
        data: [120, 45, 10],
        backgroundColor: ['#4ade80', '#60a5fa', '#f87171'],
      },
    ],
  };
  pieChartType: ChartType = 'pie';

  // Dữ liệu biểu đồ cột
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6'],
    datasets: [
      {
        label: 'Doanh thu (triệu VND)',
        data: [25, 35, 40, 50, 45, 60],
        backgroundColor: '#60a5fa',
      },
    ],
  };
  barChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
  };
}
