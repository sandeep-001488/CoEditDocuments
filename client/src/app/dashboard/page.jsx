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

  // ✅ Define background gradient and nav background here
  const bgGradient = "linear(to-br, gray.50, purple.50)";
  const navBg = "whiteAlpha.900";


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

    // Small delay to ensure localStorage is available
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
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      {/* Navigation Bar */}
      <Box
        bg={navBg}
        boxShadow="sm"
        py={4}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Container maxW="container.xl">
          <HStack justify="space-between">
            <Heading
              size="lg"
              bgGradient="linear(to-r, purple.600, blue.600)"
              bgClip="text"
            >
              CollabWrite AI
            </Heading>
            <HStack spacing={4}>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="purple"
                onClick={handleCreateDocument}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                }}
                transition="all 0.2s"
              >
                New Document
              </Button>
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  variant="ghost"
                >
                  <HStack>
                    <Avatar size="sm" name={user?.name} src={user?.avatar} />
                    <Text display={{ base: "none", md: "block" }}>
                      {user?.name}
                    </Text>
                  </HStack>
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </HStack>
        </Container>
      </Box>

      {/* Documents Grid */}
      <Container maxW="container.xl" py={10}>
        <VStack align="stretch" spacing={6}>
          <HStack justify="space-between">
            <Heading size="lg">My Documents</Heading>
            <Text color="gray.600">{documents.length} document(s)</Text>
          </HStack>

          {documents.length === 0 ? (
            <Center py={20}>
              <VStack spacing={4}>
                <Text fontSize="xl" color="gray.500">
                  No documents yet
                </Text>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="purple"
                  size="lg"
                  onClick={handleCreateDocument}
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
