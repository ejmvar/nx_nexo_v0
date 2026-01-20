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
      title: 'New Order',
      description: 'Create a new order for a client',
      action: 'Create Order',
      color: 'primary'
    },
    {
      title: 'Update Inventory',
      description: 'Manage your product inventory',
      action: 'Update Stock',
      color: 'secondary'
    },
    {
      title: 'Track Deliveries',
      description: 'Monitor shipment status and delivery',
      action: 'View Deliveries',
      color: 'success'
    },
    {
      title: 'Generate Invoice',
      description: 'Create invoices for completed orders',
      action: 'Create Invoice',
      color: 'warning'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing': return 'warning';
      case 'Shipped': return 'info';
      case 'Delivered': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: 'success.main' }}>
        <Toolbar>
          <Button
            component={Link}
            href="/"
            startIcon={<ArrowBack />}
            sx={{ color: 'white', mr: 2 }}
          >
            Back to Portal Selection
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Supplier Portal
          </Typography>
          <Avatar sx={{ bgcolor: 'success.dark', mr: 1 }}>SS</Avatar>
          <Typography variant="body1" sx={{ mr: 2 }}>Supply Solutions Inc</Typography>
          <Button color="inherit" startIcon={<Logout />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

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
                    <ListItem key={index} component={Link} href={item.href} sx={{ cursor: 'pointer' }}>
                      <ListItemIcon>
                        {item.icon}
                      </ListItemIcon>
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
                  Welcome to Supply Solutions Portal
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Manage your orders, inventory, and supplier relationships
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip label="Verified Supplier" color="success" sx={{ mr: 1 }} />
                  <Chip label="Premium Partner" variant="outlined" sx={{ mr: 1 }} />
                  <Chip label="4 Active Orders" variant="outlined" />
                </Box>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
              Recent Orders
            </Typography>
            <Card sx={{ mb: 4 }}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.client}</TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            color={getStatusColor(order.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{order.amount}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <Button size="small" color="primary">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>

            {/* Quick Actions */}
            <Typography variant="h5" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {quickActions.map((action, index) => (
                <Grid size={{ xs: 12, sm: 6 }} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {action.description}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        color={action.color as any}
                        variant="contained"
                        fullWidth
                      >
                        {action.action}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Supplier Stats */}
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Supplier Statistics
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Assignment />
                    </ListItemIcon>
                    <ListItemText
                      primary="Total Orders This Month: 24"
                      secondary="12 completed, 8 in progress, 4 pending"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <LocalShipping />
                    </ListItemIcon>
                    <ListItemText
                      primary="On-Time Delivery Rate: 96%"
                      secondary="Above industry average"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <Inventory />
                    </ListItemIcon>
                    <ListItemText
                      primary="Inventory Status: 85% stocked"
                      secondary="Low stock alerts for 3 items"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <Assessment />
                    </ListItemIcon>
                    <ListItemText
                      primary="Monthly Revenue: $142,500"
                      secondary="15% increase from last month"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}