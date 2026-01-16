import { Box, Heading, Text, Button } from '@chakra-ui/react';

export default function ProfessionalsPortal() {
  return (
    <Box p={8}>
      <Heading as="h1" size="xl" mb={4}>
        Welcome to NEXO Professionals Portal
      </Heading>
      <Text mb={6}>
        Connect with clients, manage your services, and grow your business.
      </Text>
      <Button colorScheme="purple">Login</Button>
    </Box>
  );
}
