import { Box, Typography, Button } from '@mui/material';

export default function EmployeesPortal() {
  return (
    <Box sx={{ p: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to NEXO Employees Portal
      </Typography>
      <Typography variant="body1" gutterBottom>
        Manage your employee tasks, view schedules, and access company resources.
      </Typography>
      <Button variant="contained" color="primary">
        Login
      </Button>
    </Box>
  );
}
