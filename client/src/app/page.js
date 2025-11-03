"use client";
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { FiEdit3, FiUsers, FiZap, FiLock } from "react-icons/fi";

export default function HomePage() {
  const router = useRouter();
  const bgGradient = "linear(to-br, purple.50, blue.50)";
  const cardBg = useColorModeValue("white", "gray.800");

  const features = [
    {
      icon: FiEdit3,
      title: "Rich Text Editor",
      description: "Powerful editing tools with formatting options",
    },
    {
      icon: FiUsers,
      title: "Real-time Collaboration",
      description: "Work together with your team simultaneously",
    },
    {
      icon: FiZap,
      title: "AI-Powered Writing",
      description: "Get smart suggestions and improvements with Gemini AI",
    },
    {
      icon: FiLock,
      title: "Secure & Private",
      description: "Your documents are encrypted and protected",
    },
  ];

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      {/* Hero Section */}
      <Container maxW="container.xl" pt={20} pb={16}>
        <VStack spacing={8} textAlign="center">
          <Heading
            fontSize={{ base: "4xl", md: "6xl" }}
            bgGradient="linear(to-r, purple.600, blue.600)"
            bgClip="text"
            fontWeight="extrabold"
          >
            CoEdit
          </Heading>
          <Text
            fontSize={{ base: "xl", md: "2xl" }}
            color="gray.600"
            maxW="2xl"
          >
            The smart collaborative document editor powered by AI. Write better,
            see together and achieve more.
          </Text>
          <HStack spacing={4}>
            <Button
              size="lg"
              colorScheme="purple"
              onClick={() => router.push("/auth/register")}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "xl",
              }}
              transition="all 0.2s"
            >
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              colorScheme="purple"
              onClick={() => router.push("/auth/login")}
            >
              Sign In
            </Button>
          </HStack>
        </VStack>
      </Container>

      {/* Features Section */}
      <Container maxW="container.xl" py={16}>
        <VStack spacing={12}>
          <Heading size="xl" textAlign="center">
            Everything you need to write better
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} w="full">
            {features.map((feature, index) => (
              <Box
                key={index}
                bg={cardBg}
                p={8}
                borderRadius="xl"
                boxShadow="lg"
                _hover={{
                  transform: "translateY(-4px)",
                  boxShadow: "xl",
                }}
                transition="all 0.3s"
              >
                <VStack spacing={4} align="start">
                  <Icon as={feature.icon} w={10} h={10} color="purple.500" />
                  <Heading size="md">{feature.title}</Heading>
                  <Text color="gray.600">{feature.description}</Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      {/* CTA Section */}
      <Container maxW="container.xl" py={20}>
        <Box bg="purple.600" borderRadius="2xl" p={12} textAlign="center">
          <VStack spacing={6}>
            <Heading size="xl" color="white">
              Ready to transform your writing?
            </Heading>
            <Text fontSize="lg" color="purple.100" maxW="2xl">
              Join thousands of writers using CoEdit to create amazing
              documents
            </Text>
            <Button
              size="lg"
              bg="white"
              color="purple.600"
              onClick={() => router.push("/auth/register")}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "2xl",
              }}
            >
              Start Writing Now
            </Button>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
