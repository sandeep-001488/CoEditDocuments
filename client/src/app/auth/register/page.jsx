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

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
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

    if (!name || !email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        status: "error",
        duration: 5000,
      });
      return;
    }

    setLoading(true);

    try {
    await register(name, email, password);
    toast({
      title: "Account created",
      description: "You can now log in",
      status: "success",
      duration: 2000,
    });

    // Redirect to login
    setTimeout(() => {
      router.push("/auth/login");
    }, 500);

    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "Something went wrong",
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
              Create Account
            </Heading>
            <Text color="gray.600">Start your writing journey today</Text>

            <FormControl isRequired>
              <FormLabel>Full Name</FormLabel>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                size="lg"
                autoComplete="name"
              />
            </FormControl>

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
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
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
              loadingText="Creating account..."
            >
              Sign Up
            </Button>

            <Text>
              Already have an account?{" "}
              <Link
                as={NextLink}
                href="/auth/login"
                color="purple.600"
                fontWeight="semibold"
              >
                Sign In
              </Link>
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
