// Example usage of chart components
import React from 'react';
import {
  LineChartComponent,
  AreaChartComponent,
  BarChartComponent,
  PieChartComponent,
  DonutChartComponent,
  KPICard,
  ChartGrid,
} from '@nexo-prj/shared-ui';

// Sample data for demonstration
const salesData = [
  { month: 'Jan', sales: 4000, profit: 2400, users: 1200 },
  { month: 'Feb', sales: 3000, profit: 1398, users: 1100 },
  { month: 'Mar', sales: 2000, profit: 9800, users: 1300 },
  { month: 'Apr', sales: 2780, profit: 3908, users: 1400 },
  { month: 'May', sales: 1890, profit: 4800, users: 1500 },
  { month: 'Jun', sales: 2390, profit: 3800, users: 1600 },
];

const deviceData = [
  { name: 'Desktop', value: 400 },
  { name: 'Mobile', value: 300 },
  { name: 'Tablet', value: 200 },
  { name: 'Other', value: 100 },
];

export default function ChartsDemo() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>NEXO Charts Demo</h1>

      {/* KPI Cards */}
      <ChartGrid columns={4} spacing={2} style={{ marginBottom: '30px' }}>
        <KPICard
          title="Total Sales"
          value="$45,060"
          change={{ value: 12.5, label: 'vs last month' }}
        />
        <KPICard
          title="Total Users"
          value="9,100"
          change={{ value: 8.2, label: 'vs last month' }}
        />
        <KPICard
          title="Conversion Rate"
          value="3.24%"
          change={{ value: -2.1, label: 'vs last month' }}
        />
        <KPICard
          title="Avg Order Value"
          value="$127.50"
          change={{ value: 5.7, label: 'vs last month' }}
        />
      </ChartGrid>

      {/* Charts Grid */}
      <ChartGrid columns={2} spacing={3}>
        <LineChartComponent
          data={salesData}
          xKey="month"
          yKeys={['sales', 'profit']}
          title="Sales & Profit Trends"
          height={350}
        />

        <AreaChartComponent
          data={salesData}
          xKey="month"
          yKeys={['users']}
          title="User Growth"
          height={350}
        />

        <BarChartComponent
          data={salesData}
          xKey="month"
          yKeys={['sales']}
          title="Monthly Sales"
          height={350}
        />

        <PieChartComponent
          data={deviceData}
          dataKey="value"
          nameKey="name"
          title="Device Usage"
          height={350}
        />

        <DonutChartComponent
          data={deviceData}
          dataKey="value"
          nameKey="name"
          title="Traffic Sources"
          height={350}
        />
      </ChartGrid>
    </div>
  );
}