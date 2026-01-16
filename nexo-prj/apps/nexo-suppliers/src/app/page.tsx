import { Box, Typography, Button } from '@mui/material';

export default function SuppliersPortal() {
  return (
    <Box sx={{ p: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to NEXO Suppliers Portal
      </Typography>
      <Typography variant="body1" gutterBottom>
        Manage your supplies, view orders, and collaborate with NEXO.
      </Typography>
      <Button variant="contained" color="primary">
        Login
      </Button>
    </Box>
  );
}
