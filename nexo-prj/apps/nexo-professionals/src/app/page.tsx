import { Box, Typography, Button } from '@mui/material';

export default function ProfessionalsPortal() {
  return (
    <Box sx={{ p: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to NEXO Professionals Portal
      </Typography>
      <Typography variant="body1" gutterBottom>
        Connect with clients, manage your services, and grow your business.
      </Typography>
      <Button variant="contained" color="primary">
        Login
      </Button>
    </Box>
  );
}
