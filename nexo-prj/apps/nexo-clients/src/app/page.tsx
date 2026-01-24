import { Box, Typography, Button } from '@mui/material';

export default function ClientsPortal() {
  return (
    <Box sx={{ p: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to NEXO Clients Portal
      </Typography>
      <Typography variant="body1" gutterBottom>
        Access your account, view orders, and manage your services.
      </Typography>
      <Button variant="contained" color="primary">
        Login
      </Button>
    </Box>
  );
}
