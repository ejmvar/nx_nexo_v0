import { Box, Heading, Text, Button } from '@chakra-ui/react';

export default function ClientsPortal() {
  return (
    <Box p={8}>
      <Heading as="h1" size="xl" mb={4}>
        Welcome to NEXO Clients Portal
      </Heading>
      <Text mb={6}>
        Access your account, view orders, and manage your services.
      </Text>
      <Button colorScheme="green">Login</Button>
    </Box>
  );
}
