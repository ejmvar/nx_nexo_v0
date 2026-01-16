import { Box, Heading, Text, Button } from '@chakra-ui/react';

export default function SuppliersPortal() {
  return (
    <Box p={8}>
      <Heading as="h1" size="xl" mb={4}>
        Welcome to NEXO Suppliers Portal
      </Heading>
      <Text mb={6}>
        Manage your supplies, view orders, and collaborate with NEXO.
      </Text>
      <Button colorScheme="orange">Login</Button>
    </Box>
  );
}
