'use client';

import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  CardActions,
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  LocalShipping,
  Inventory,
  TrendingUp,
  AttachMoney,
} from '@mui/icons-material';
import {
  PortalHeader,
  getSupplierMenuItems,
  BarChartComponent,
  DonutChartComponent,
  KPICard,
  DataTable,
  type DataTableColumn,
} from '@nexo-prj/shared-ui';

interface Order {
  id: string;
  client: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  amount: string;
  date: string;
}

export default function SupplierPortal() {
  const menuItems = getSupplierMenuItems();

  // Sample data for charts
  const orderStatusData = [
    { name: 'Delivered', value: 45, fill: '#4caf50' },
    { name: 'Shipped', value: 28, fill: '#2196f3' },
    { name: 'Processing', value: 18, fill: '#ff9800' },
    { name: 'Pending', value: 9, fill: '#f44336' },
  ];

  const monthlyRevenueData = [
    { name: 'Jan', value: 45000 },
    { name: 'Feb', value: 52000 },
    { name: 'Mar', value: 48000 },
    { name: 'Apr', value: 61000 },
    { name: 'May', value: 55000 },
    { name: 'Jun', value: 67000 },
  ];

  // Sample orders for table
  const orders: Order[] = [
    {
      id: 'ORD-2026-001',
      client: 'Acme Corp',
      status: 'processing',
      amount: '$12,500',
      date: '2026-01-15',
    },
    {
      id: 'ORD-2026-002',
      client: 'TechStart Inc',
      status: 'shipped',
      amount: '$8,750',
      date: '2026-01-12',
    },
    {
      id: 'ORD-2026-003',
      client: 'Global Solutions',
      status: 'delivered',
      amount: '$15,200',
      date: '2026-01-10',
    },
    {
      id: 'ORD-2026-004',
      client: 'Innovate Ltd',
      status: 'pending',
      amount: '$9,800',
      date: '2026-01-18',
    },
  ];

  const columns: DataTableColumn<Order>[] = [
    {
      id: 'id',
      header: 'Order ID',
      accessorKey: 'id',
    },
    {
      id: 'client',
      header: 'Client',
      accessorKey: 'client',
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status;
        const colorMap = {
          delivered: 'success' as const,
          shipped: 'info' as const,
          processing: 'warning' as const,
          pending: 'error' as const,
        };
        return <Chip label={status} color={colorMap[status]} size="small" />;
      },
    },
    {
      id: 'amount',
      header: 'Amount',
      accessorKey: 'amount',
    },
    {
      id: 'date',
      header: 'Date',
      accessorKey: 'date',
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <PortalHeader
        title="Supplier Portal"
        userName="Global Supplies Co."
        showBackButton={true}
        backHref="/"
      />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Sidebar Menu */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Navigation
                </Typography>
                <List>
                  {menuItems.map((item, index) => (
                    <ListItem key={index} sx={{ cursor: 'pointer' }}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Main Content */}
          <Grid size={{ xs: 12, md: 9 }}>
            {/* Welcome Section */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  Welcome, Global Supplies Co.
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Manage your orders and track deliveries
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip label="Verified Supplier" color="success" sx={{ mr: 1 }} />
                  <Chip label="100+ Orders" variant="outlined" sx={{ mr: 1 }} />
                  <Chip label="Premium Partner" variant="outlined" />
                </Box>
              </CardContent>
            </Card>

            {/* KPI Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KPICard
                  title="Total Orders"
                  value="128"
                  change={18.5}
                  icon={<Assignment />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KPICard
                  title="Monthly Revenue"
                  value="$67K"
                  change={12.3}
                  icon={<AttachMoney />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KPICard
                  title="On-Time Delivery"
                  value="94%"
                  change={2.8}
                  icon={<LocalShipping />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <KPICard
                  title="Stock Items"
                  value="1,247"
                  change={-3.2}
                  icon={<Inventory />}
                />
              </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Card>
                  <CardContent>
                    <BarChartComponent
                      data={monthlyRevenueData}
                      title="Monthly Revenue Trend"
                      xAxisKey="name"
                      bars={[
                        {
                          dataKey: 'value',
                          fill: '#2196f3',
                          name: 'Revenue ($)',
                        },
                      ]}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Card>
                  <CardContent>
                    <DonutChartComponent
                      data={orderStatusData}
                      title="Order Status Distribution"
                      nameKey="name"
                      dataKey="value"
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Orders Table */}
            <Card sx={{ mb: 3 }}>
              <DataTable
                data={orders}
                columns={columns}
                title="Recent Orders"
                enableRowSelection
                enableSorting
                enableFiltering
              />
            </Card>

            {/* Quick Actions */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Button variant="contained" fullWidth>
                      New Order
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Button variant="outlined" fullWidth>
                      Track Shipment
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Button variant="outlined" fullWidth>
                      Update Inventory
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Button variant="outlined" fullWidth>
                      View Reports
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Recent Activity
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <LocalShipping />
                    </ListItemIcon>
                    <ListItemText
                      primary="Order ORD-2026-002 shipped to TechStart Inc"
                      secondary="2 hours ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Inventory />
                    </ListItemIcon>
                    <ListItemText
                      primary="Inventory updated: 45 new items added"
                      secondary="5 hours ago"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Assignment />
                    </ListItemIcon>
                    <ListItemText
                      primary="New order received from Innovate Ltd"
                      secondary="1 day ago"
                    />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary">
                  View All Activity
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}