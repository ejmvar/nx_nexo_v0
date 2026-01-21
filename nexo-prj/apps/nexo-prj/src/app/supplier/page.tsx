'use client';

import { useState } from 'react';
import {
  PortalHeader,
  PortalSidebar,
  getSupplierMenuItems,
  BarChartComponent,
  DonutChartComponent,
  KPICard,
  DataTable,
  DataTableColumn,
} from '../../shared-ui/lib/portal-components';

export const dynamic = 'force-dynamic';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  amount: string;
  date: string;
}

export default function SupplierPortal() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuItems = getSupplierMenuItems();

  const salesData = [
    { name: 'Jan', value: 42000 },
    { name: 'Feb', value: 48000 },
    { name: 'Mar', value: 51000 },
    { name: 'Apr', value: 46000 },
    { name: 'May', value: 55000 },
    { name: 'Jun', value: 58000 },
  ];

  const inventoryData = [
    { name: 'In Stock', value: 1250, fill: '#10b981' },
    { name: 'Low Stock', value: 180, fill: '#f59e0b' },
    { name: 'Out of Stock', value: 45, fill: '#ef4444' },
    { name: 'On Order', value: 320, fill: '#3b82f6' },
  ];

  const orders: Order[] = [
    { id: '1', orderNumber: 'ORD-001', customer: 'Tech Solutions Inc', status: 'processing', amount: '$12,500', date: '2026-01-20' },
    { id: '2', orderNumber: 'ORD-002', customer: 'Global Enterprises', status: 'shipped', amount: '$8,750', date: '2026-01-19' },
    { id: '3', orderNumber: 'ORD-003', customer: 'StartUp Co', status: 'pending', amount: '$15,200', date: '2026-01-21' },
    { id: '4', orderNumber: 'ORD-004', customer: 'Retail Partners', status: 'delivered', amount: '$9,800', date: '2026-01-15' },
  ];

  const orderColumns: DataTableColumn<Order>[] = [
    { id: 'orderNumber', header: 'Order #', accessorKey: 'orderNumber' },
    { id: 'customer', header: 'Customer', accessorKey: 'customer' },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.original.status === 'delivered' ? 'bg-green-100 text-green-800' :
          row.original.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
          row.original.status === 'processing' ? 'bg-purple-100 text-purple-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.original.status}
        </span>
      )
    },
    { id: 'amount', header: 'Amount', accessorKey: 'amount' },
    { id: 'date', header: 'Date', accessorKey: 'date' },
  ];

  const topProducts = [
    { name: 'Premium Widget A', sold: 245, revenue: '$24,500', trend: 'up', icon: '📦' },
    { name: 'Standard Component B', sold: 189, revenue: '$18,900', trend: 'up', icon: '🔧' },
    { name: 'Deluxe Module C', sold: 156, revenue: '$31,200', trend: 'down', icon: '⚙️' },
  ];

  const recentActivity = [
    { message: 'New order received from Tech Solutions', time: '5 minutes ago', icon: '🛒' },
    { message: 'Shipment ORD-002 dispatched', time: '2 hours ago', icon: '🚚' },
    { message: 'Inventory updated for 15 products', time: '4 hours ago', icon: '📊' },
    { message: 'Payment received: $12,500', time: '1 day ago', icon: '💰' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader
        title="Supplier Portal"
        userName="Supply Manager"
        onLogout={() => console.log('Logout')}
        showBackButton={true}
        backHref="/"
      />

      <PortalSidebar
        menuItems={menuItems}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-4 top-20 z-30 bg-primary text-white p-2 rounded-md shadow-lg hover:bg-primary/90"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <main className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Supplier Dashboard</h2>
          <p className="text-gray-600">Manage orders, inventory, and supplier operations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total Orders"
            value="156"
            subtitle="This month"
            icon={<span className="text-4xl">📦</span>}
            change={18}
          />
          <KPICard
            title="Revenue"
            value="$58K"
            subtitle="Monthly total"
            icon={<span className="text-4xl">💰</span>}
            change={12}
          />
          <KPICard
            title="Active Products"
            value="342"
            subtitle="In catalog"
            icon={<span className="text-4xl">🛍️</span>}
            change={5}
          />
          <KPICard
            title="Fulfillment Rate"
            value="94%"
            subtitle="On-time delivery"
            icon={<span className="text-4xl">🚚</span>}
            change={3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <BarChartComponent title="Monthly Sales" data={salesData} />
          <DonutChartComponent title="Inventory Status" data={inventoryData} />
        </div>

        <div className="mb-8">
          <DataTable
            title="Recent Orders"
            data={orders}
            columns={orderColumns}
            enableRowSelection={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>🏆</span>
              Top Products
            </h3>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border hover:border-primary transition-colors">
                  <span className="text-2xl">{product.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{product.name}</h4>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-600">{product.sold} units sold</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-600">{product.revenue}</span>
                        <span className={product.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                          {product.trend === 'up' ? '↗' : '↘'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📢</span>
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-2xl">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
