"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { AddIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import DocumentCard from "@/components/DocumentCard";

export default function DashboardPage() {
  const [documents, setDocuments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();

  const bgGradient = "linear(to-br, purple.50, blue.50, pink.50)";
  const navBg = "white";

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (!token) {
        router.push("/auth/login");
        return;
      }

      if (userData) {
        setUser(JSON.parse(userData));
      }

      fetchDocuments();
    };

    setTimeout(checkAuth, 50);
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get("/documents");
      if (response.data.success) {
        setDocuments(response.data.documents);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load documents",
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    try {
      const response = await api.post("/documents", {
        title: "Untitled Document",
      });

      if (response.data.success) {
        toast({
          title: "Document created",
          status: "success",
          duration: 2000,
        });
        router.push(`/editor/${response.data.document._id}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create document",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleDeleteDocument = async (id) => {
    try {
      await api.delete(`/documents/${id}`);
      setDocuments(documents.filter((doc) => doc._id !== id));
      toast({
        title: "Document deleted",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        status: "error",
        duration: 5000,
      });
    }
  };

  if (loading) {
    return (
      <Center minH="100vh" bgGradient={bgGradient}>
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text color="purple.600" fontWeight="semibold">
            Loading your documents...
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      {/* Navigation Bar */}
      <Box
        bg={navBg}
        boxShadow="md"
        py={4}
        position="sticky"
        top={0}
        zIndex={10}
        borderBottom="3px solid"
        borderColor="purple.200"
      >
        <Container maxW="container.xl" px={{ base: 4, md: 6 }}>
          <HStack
            justify="space-between"
            flexWrap={{ base: "wrap", md: "nowrap" }}
            gap={3}
          >
            <Heading
              size={{ base: "md", md: "lg" }}
              bgGradient="linear(to-r, purple.600, blue.600, pink.600)"
              bgClip="text"
              fontWeight="extrabold"
            >
              CoEdit
            </Heading>
            <HStack spacing={{ base: 2, md: 4 }}>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="purple"
                onClick={handleCreateDocument}
                size={{ base: "sm", md: "md" }}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                  bgGradient: "linear(to-r, purple.500, blue.500)",
                }}
                transition="all 0.2s"
                bgGradient="linear(to-r, purple.600, blue.600)"
              >
                <Text display={{ base: "none", sm: "block" }}>
                  New Document
                </Text>
                <Text display={{ base: "block", sm: "none" }}>New</Text>
              </Button>
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  variant="ghost"
                  colorScheme="purple"
                  size={{ base: "sm", md: "md" }}
                >
                  <HStack>
                    <Avatar
                      size={{ base: "xs", md: "sm" }}
                      name={user?.name}
                      src={user?.avatar}
                      bg="purple.500"
                    />
                    <Text display={{ base: "none", md: "block" }}>
                      {user?.name}
                    </Text>
                  </HStack>
                </MenuButton>
                <MenuList>
                  <MenuItem
                    onClick={handleLogout}
                    color="red.500"
                    fontWeight="semibold"
                  >
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </HStack>
        </Container>
      </Box>

      {/* Documents Grid */}
      <Container
        maxW="container.xl"
        py={{ base: 6, md: 10 }}
        px={{ base: 4, md: 6 }}
      >
        <VStack align="stretch" spacing={6}>
          <HStack justify="space-between" flexWrap="wrap">
            <Heading
              size={{ base: "md", md: "lg" }}
              bgGradient="linear(to-r, purple.600, pink.600)"
              bgClip="text"
            >
              My Documents
            </Heading>
            <HStack>
              <Text
                color="purple.600"
                fontWeight="semibold"
                bg="white"
                px={3}
                py={1}
                borderRadius="full"
                fontSize={{ base: "sm", md: "md" }}
              >
                {documents.length} document{documents.length !== 1 ? "s" : ""}
              </Text>
            </HStack>
          </HStack>

          {documents.length === 0 ? (
            <Center py={20}>
              <VStack spacing={4}>
                <Box
                  w="120px"
                  h="120px"
                  borderRadius="full"
                  bgGradient="linear(to-br, purple.100, blue.100)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <AddIcon boxSize={12} color="purple.500" />
                </Box>
                <Text fontSize="xl" color="purple.700" fontWeight="semibold">
                  No documents yet
                </Text>
                <Text
                  fontSize="sm"
                  color="gray.600"
                  textAlign="center"
                  maxW="300px"
                >
                  Create your first document and start writing with AI
                  assistance
                </Text>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="purple"
                  size="lg"
                  onClick={handleCreateDocument}
                  bgGradient="linear(to-r, purple.600, blue.600)"
                  _hover={{
                    bgGradient: "linear(to-r, purple.500, blue.500)",
                    transform: "scale(1.05)",
                  }}
                  mt={4}
                >
                  Create Your First Document
                </Button>
              </VStack>
            </Center>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {documents.map((doc) => (
                <DocumentCard
                  key={doc._id}
                  document={doc}
                  onDelete={handleDeleteDocument}
                  onClick={() => router.push(`/editor/${doc._id}`)}
                />
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
