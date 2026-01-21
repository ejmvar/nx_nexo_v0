'use client';

import React from 'react';

// Utility function for conditional classes
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// Placeholder chart components - to be implemented with actual charting library
export interface ChartProps {
  data?: any[];
  title?: string;
}

export const LineChartComponent: React.FC<ChartProps> = ({ title = 'Line Chart', data }) => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
    <div className="p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="h-[200px] flex items-center justify-center bg-muted/50 mt-4 rounded">
        <p className="text-muted-foreground text-sm">Line Chart Component - To be implemented</p>
      </div>
    </div>
  </div>
);

export const BarChartComponent: React.FC<ChartProps> = ({ title = 'Bar Chart', data }) => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
    <div className="p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="h-[200px] flex items-center justify-center bg-muted/50 mt-4 rounded">
        <p className="text-muted-foreground text-sm">Bar Chart Component - To be implemented</p>
      </div>
    </div>
  </div>
);

export const PieChartComponent: React.FC<ChartProps> = ({ title = 'Pie Chart', data }) => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
    <div className="p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="h-[200px] flex items-center justify-center bg-muted/50 mt-4 rounded">
        <p className="text-muted-foreground text-sm">Pie Chart Component - To be implemented</p>
      </div>
    </div>
  </div>
);

export const AreaChartComponent: React.FC<ChartProps> = ({ title = 'Area Chart', data }) => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
    <div className="p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="h-[200px] flex items-center justify-center bg-muted/50 mt-4 rounded">
        <p className="text-muted-foreground text-sm">Area Chart Component - To be implemented</p>
      </div>
    </div>
  </div>
);

export const DonutChartComponent: React.FC<ChartProps> = ({ title = 'Donut Chart' }) => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
    <div className="p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="h-[200px] flex items-center justify-center bg-muted/50 mt-4 rounded">
        <p className="text-muted-foreground text-sm">Donut Chart Component - To be implemented</p>
      </div>
    </div>
  </div>
);

// KPI Card component
export interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  change?: number;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon, change }) => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
    <div className="p-6">
      <div className="flex items-center justify-between space-x-4">
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">
            {title}
          </p>
          <h3 className="text-3xl font-bold tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
          {change !== undefined && (
            <p className={cn(
              "text-sm font-semibold",
              change >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {change >= 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        {icon && (
          <div className="text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Data Table component
export interface DataTableColumn<T = any> {
  id: string;
  header: string;
  accessorKey: keyof T;
  cell?: (props: { row: { original: T } }) => React.ReactNode;
}

export type DataTableColumnType<T = any> = DataTableColumn<T>;

export interface DataTableProps<T = any> {
  data: T[];
  columns: DataTableColumn<T>[];
  title?: string;
  enableRowSelection?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
}

export const DataTable = <T,>({
  data,
  columns,
  title,
  enableRowSelection,
}: DataTableProps<T>) => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
    {title && (
      <div className="p-6 pb-0">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
    )}
    <div className="relative w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead className="border-b">
          <tr className="border-b transition-colors hover:bg-muted/50">
            {enableRowSelection && (
              <th className="h-12 px-4 text-left align-middle font-medium">
                <input type="checkbox" className="h-4 w-4 rounded border" />
              </th>
            )}
            {columns.map((column) => (
              <th key={column.id} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {data.map((row, index) => (
            <tr key={index} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              {enableRowSelection && (
                <td className="p-4 align-middle">
                  <input type="checkbox" className="h-4 w-4 rounded border" />
                </td>
              )}
              {columns.map((column) => (
                <td key={column.id} className="p-4 align-middle">
                  {column.cell
                    ? column.cell({ row: { original: row } })
                    : (row[column.accessorKey] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export interface PortalHeaderProps {
  title: string;
  userName?: string;
  userAvatar?: string;
  onLogout?: () => void;
  showBackButton?: boolean;
  backHref?: string;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  title,
  userName = 'User',
  userAvatar,
  onLogout,
  showBackButton = false,
  backHref = '/',
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground">
      <div className="flex h-16 items-center px-4 gap-4">
        {showBackButton && (
          <a
            href={backHref}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-primary/90 h-10 px-4 py-2"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </a>
        )}
        <h1 className="text-xl font-semibold flex-1">{title}</h1>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center text-sm font-semibold">
            {userAvatar || userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm hidden sm:inline-block">{userName}</span>
          <button
            onClick={onLogout}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-primary/90 h-10 px-4 py-2"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export interface MenuItem {
  icon: React.ReactNode;
  text: string;
  href: string;
}

export interface PortalSidebarProps {
  menuItems: MenuItem[];
  isOpen: boolean;
  onToggle: () => void;
}

export const PortalSidebar: React.FC<PortalSidebarProps> = ({
  menuItems,
  isOpen,
  onToggle,
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
      
      {/* Drawer */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-64 bg-background border-r z-50 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Navigation</h2>
          <div className="border-t my-4" />
          <nav className="space-y-1">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={onToggle}
              >
                <span className="flex items-center justify-center w-5 h-5">
                  {item.icon}
                </span>
                <span>{item.text}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

// Default menu items for different portals - using emoji icons for simplicity
export const getEmployeeMenuItems = (): MenuItem[] => [
  { icon: <span>📊</span>, text: 'Dashboard', href: '/employee/dashboard' },
  { icon: <span>📋</span>, text: 'My Tasks', href: '/employee/tasks' },
  { icon: <span>👥</span>, text: 'Team', href: '/employee/team' },
  { icon: <span>🏢</span>, text: 'Projects', href: '/employee/projects' },
  { icon: <span>📈</span>, text: 'Reports', href: '/employee/reports' },
  { icon: <span>⚙️</span>, text: 'Settings', href: '/employee/settings' },
];

export const getClientMenuItems = (): MenuItem[] => [
  { icon: <span>📊</span>, text: 'Dashboard', href: '/client/dashboard' },
  { icon: <span>📋</span>, text: 'My Projects', href: '/client/projects' },
  { icon: <span>🏢</span>, text: 'Services', href: '/client/services' },
  { icon: <span>📈</span>, text: 'Reports', href: '/client/reports' },
  { icon: <span>⚙️</span>, text: 'Settings', href: '/client/settings' },
];

export const getSupplierMenuItems = (): MenuItem[] => [
  { icon: <span>📊</span>, text: 'Dashboard', href: '/supplier/dashboard' },
  { icon: <span>📋</span>, text: 'Orders', href: '/supplier/orders' },
  { icon: <span>🏢</span>, text: 'Products', href: '/supplier/products' },
  { icon: <span>📈</span>, text: 'Analytics', href: '/supplier/analytics' },
  { icon: <span>⚙️</span>, text: 'Settings', href: '/supplier/settings' },
];

export const getProfessionalMenuItems = (): MenuItem[] => [
  { icon: <span>📊</span>, text: 'Dashboard', href: '/professional/dashboard' },
  { icon: <span>📋</span>, text: 'Assignments', href: '/professional/assignments' },
  { icon: <span>👥</span>, text: 'Clients', href: '/professional/clients' },
  { icon: <span>📈</span>, text: 'Performance', href: '/professional/performance' },
  { icon: <span>⚙️</span>, text: 'Settings', href: '/professional/settings' },
];
