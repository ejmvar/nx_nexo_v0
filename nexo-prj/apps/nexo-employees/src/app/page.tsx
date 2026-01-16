import { Box, Heading, Text, Button } from '@chakra-ui/react';

export default function EmployeesPortal() {
  return (
    <Box p={8}>
      <Heading as="h1" size="xl" mb={4}>
        Welcome to NEXO Employees Portal
      </Heading>
      <Text mb={6}>
        Manage your employee tasks, view schedules, and access company resources.
      </Text>
      <Button colorScheme="blue">Login</Button>
    </Box>
  );
}
