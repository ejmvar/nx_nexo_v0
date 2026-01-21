import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
} from '@mui/material';
import {
  Menu,
  Dashboard,
  Assignment,
  People,
  Business,
  Assessment,
  Settings,
  Logout,
  ArrowBack,
} from '@mui/icons-material';
import Link from 'next/link';

// Placeholder chart components - to be implemented with actual charting library
export interface ChartProps {
  data?: any[];
  title?: string;
}

export const LineChartComponent: React.FC<ChartProps> = ({ title = 'Line Chart' }) => (
  <Card>
    <CardContent>
      <Typography variant="h6">{title}</Typography>
      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
        <Typography color="textSecondary">Line Chart Component - To be implemented</Typography>
      </Box>
    </CardContent>
  </Card>
);

export const BarChartComponent: React.FC<ChartProps> = ({ title = 'Bar Chart' }) => (
  <Card>
    <CardContent>
      <Typography variant="h6">{title}</Typography>
      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
        <Typography color="textSecondary">Bar Chart Component - To be implemented</Typography>
      </Box>
    </CardContent>
  </Card>
);

export const PieChartComponent: React.FC<ChartProps> = ({ title = 'Pie Chart' }) => (
  <Card>
    <CardContent>
      <Typography variant="h6">{title}</Typography>
      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
        <Typography color="textSecondary">Pie Chart Component - To be implemented</Typography>
      </Box>
    </CardContent>
  </Card>
);

export const AreaChartComponent: React.FC<ChartProps> = ({ title = 'Area Chart' }) => (
  <Card>
    <CardContent>
      <Typography variant="h6">{title}</Typography>
      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
        <Typography color="textSecondary">Area Chart Component - To be implemented</Typography>
      </Box>
    </CardContent>
  </Card>
);

export const DonutChartComponent: React.FC<ChartProps> = ({ title = 'Donut Chart' }) => (
  <Card>
    <CardContent>
      <Typography variant="h6">{title}</Typography>
      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
        <Typography color="textSecondary">Donut Chart Component - To be implemented</Typography>
      </Box>
    </CardContent>
  </Card>
);

// KPI Card component
export interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4">
            {value}
          </Typography>
          {subtitle && (
            <Typography color="textSecondary" variant="body2">
              {subtitle}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box sx={{ color: 'primary.main' }}>
            {icon}
          </Box>
        )}
      </Box>
    </CardContent>
  </Card>
);

// Data Table component
export interface DataTableColumn<T = any> {
  id: string;
  header: string;
  accessorKey: keyof T;
  cell?: (props: { row: { original: T } }) => React.ReactNode;
}

// Export a dummy value for bundler compatibility
export const DataTableColumnType = {} as DataTableColumn;

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
  enableSorting,
  enableFiltering,
}: DataTableProps<T>) => (
  <Card>
    {title && (
      <CardContent>
        <Typography variant="h6">{title}</Typography>
      </CardContent>
    )}
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {enableRowSelection && (
              <TableCell padding="checkbox">
                <Checkbox />
              </TableCell>
            )}
            {columns.map((column) => (
              <TableCell key={column.id}>{column.header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              {enableRowSelection && (
                <TableCell padding="checkbox">
                  <Checkbox />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={column.id}>
                  {column.cell
                    ? column.cell({ row: { original: row } })
                    : (row[column.accessorKey] as React.ReactNode)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Card>
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
    <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
      <Toolbar>
        {showBackButton && (
          <Button
            component={Link}
            href={backHref}
            startIcon={<ArrowBack />}
            sx={{ color: 'white', mr: 2 }}
          >
            Back to Portal Selection
          </Button>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <Avatar sx={{ bgcolor: 'primary.dark', mr: 1 }}>
          {userAvatar || userName.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="body1" sx={{ mr: 2 }}>
          {userName}
        </Typography>
        <Button color="inherit" startIcon={<Logout />} onClick={onLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
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
  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <Typography variant="h6" sx={{ p: 2 }}>
        Navigation
      </Typography>
      <Divider />
      <List>
        {menuItems.map((item, index) => (
          <ListItem key={index} component={Link} href={item.href} sx={{ cursor: 'pointer' }}>
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer anchor="left" open={isOpen} onClose={onToggle}>
      {drawerContent}
    </Drawer>
  );
};

// Default menu items for different portals
export const getEmployeeMenuItems = (): MenuItem[] => [
  { icon: <Dashboard />, text: 'Dashboard', href: '/employee/dashboard' },
  { icon: <Assignment />, text: 'My Tasks', href: '/employee/tasks' },
  { icon: <People />, text: 'Team', href: '/employee/team' },
  { icon: <Business />, text: 'Projects', href: '/employee/projects' },
  { icon: <Assessment />, text: 'Reports', href: '/employee/reports' },
  { icon: <Settings />, text: 'Settings', href: '/employee/settings' },
];

export const getClientMenuItems = (): MenuItem[] => [
  { icon: <Dashboard />, text: 'Dashboard', href: '/client/dashboard' },
  { icon: <Assignment />, text: 'My Projects', href: '/client/projects' },
  { icon: <Business />, text: 'Services', href: '/client/services' },
  { icon: <Assessment />, text: 'Reports', href: '/client/reports' },
  { icon: <Settings />, text: 'Settings', href: '/client/settings' },
];

export const getSupplierMenuItems = (): MenuItem[] => [
  { icon: <Dashboard />, text: 'Dashboard', href: '/supplier/dashboard' },
  { icon: <Assignment />, text: 'Orders', href: '/supplier/orders' },
  { icon: <Business />, text: 'Products', href: '/supplier/products' },
  { icon: <Assessment />, text: 'Analytics', href: '/supplier/analytics' },
  { icon: <Settings />, text: 'Settings', href: '/supplier/settings' },
];

export const getProfessionalMenuItems = (): MenuItem[] => [
  { icon: <Dashboard />, text: 'Dashboard', href: '/professional/dashboard' },
  { icon: <Assignment />, text: 'Assignments', href: '/professional/assignments' },
  { icon: <People />, text: 'Clients', href: '/professional/clients' },
  { icon: <Assessment />, text: 'Performance', href: '/professional/performance' },
  { icon: <Settings />, text: 'Settings', href: '/professional/settings' },
];