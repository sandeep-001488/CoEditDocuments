"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  Text,
  Link,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import useAuth from "@/app/hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      
      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
        status: "success",
        duration: 2000,
      });

      // Small delay to show toast, then redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
      
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Invalid credentials",
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bgGradient="linear(to-br, purple.50, blue.50)" py={20}>
      <Container maxW="md">
        <Box bg="white" p={8} borderRadius="xl" boxShadow="2xl">
          <VStack spacing={6} as="form" onSubmit={handleSubmit}>
            <Heading
              bgGradient="linear(to-r, purple.600, blue.600)"
              bgClip="text"
            >
              Welcome Back
            </Heading>
            <Text color="gray.600">Sign in to your CollabWrite account</Text>

            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                size="lg"
                autoComplete="email"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup size="lg">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <InputRightElement>
                  <IconButton
                    variant="ghost"
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button
              type="submit"
              colorScheme="purple"
              size="lg"
              width="full"
              isLoading={loading}
              loadingText="Signing in..."
            >
              Sign In
            </Button>

            <Text>
              Don't have an account?{" "}
              <Link
                as={NextLink}
                href="/auth/register"
                color="purple.600"
                fontWeight="semibold"
              >
                Sign Up
              </Link>
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}