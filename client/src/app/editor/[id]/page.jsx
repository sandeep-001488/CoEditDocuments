"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Container,
  HStack,
  Button,
  Input,
  Avatar,
  AvatarGroup,
  useToast,
  Spinner,
  Center,
  IconButton,
  Tooltip,
  Badge,
  Text,
  VStack,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { ArrowBackIcon, HamburgerIcon } from "@chakra-ui/icons";
import { FiSave, FiUsers, FiZap } from "react-icons/fi";
import Editor from "@/components/Editor";
import AIAssistant from "@/components/AIAssistant";
import api from "@/services/api";
import { initSocket, disconnectSocket } from "@/services/socket";

export default function EditorPage() {
  const bgColor = "gray.50";
  const navBg = "white";
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [socket, setSocket] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const autoSaveTimer = useRef(null);
  const typingTimer = useRef(null);

  // Auto-save functionality
  useEffect(() => {
    if (!content && !title) return;
    if (!socket || !isConnected) return;

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(() => {
      handleAutoSave();
    }, 30000);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [content, title, socket, isConnected]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    fetchDocument();
    const socketInstance = initSocket(params.id, token);
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("✅ Connected to server");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Disconnected from server");
      setIsConnected(false);
      toast({
        title: "Connection lost",
        description: "Reconnecting...",
        status: "warning",
        duration: 3000,
      });
    });

    socketInstance.on("document-loaded", (data) => {
      console.log("📄 Document loaded:", data);
      setContent(data.content || "");
      setTitle(data.title || "");
      setLastSaved(new Date(data.updatedAt));
      setLoading(false);
    });

    socketInstance.on("text-change", (data) => {
      console.log("✏️ Remote text change received");
      setContent(data.content || "");
    });

    socketInstance.on("users-update", (users) => {
      console.log("👥 Active users updated:", users);
      setActiveUsers(users);

      if (users.length > activeUsers.length) {
        const newUser = users.find(
          (u) => !activeUsers.some((au) => au.socketId === u.socketId)
        );
        if (newUser) {
          toast({
            title: `${newUser.name.split(" ")[0]} joined`,
            status: "info",
            duration: 2000,
            position: "top-right",
          });
        }
      }
    });

    socketInstance.on("document-saved", (data) => {
      if (data.success) {
        setLastSaved(new Date());
        setSaving(false);
      }
    });

    socketInstance.on("document-updated", (data) => {
      setLastSaved(new Date(data.updatedAt));
    });

    socketInstance.on("user-typing", (data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => new Map(prev).set(data.userId, data.name));
        setTimeout(() => {
          setTypingUsers((prev) => {
            const newMap = new Map(prev);
            newMap.delete(data.userId);
            return newMap;
          });
        }, 3000);
      } else {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.delete(data.userId);
          return newMap;
        });
      }
    });

    socketInstance.on("cursor-update", (data) => {
      console.log("🖱️ Cursor update:", data);
    });

    socketInstance.on("error", (error) => {
      console.error("❌ Socket error:", error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    });

    return () => {
      disconnectSocket(params.id);
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }
    };
  }, [params.id]);

  const fetchDocument = async () => {
    try {
      const response = await api.get(`/documents/${params.id}`);
      if (response.data.success) {
        setDocument(response.data.document);
        setTitle(response.data.document.title);
        setContent(response.data.document.content);
        setLastSaved(new Date(response.data.document.updatedAt));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load document",
        status: "error",
        duration: 5000,
      });
      router.push("/dashboard");
    }
  };

  const handleAutoSave = async () => {
    if (socket && !saving && isConnected) {
      console.log("💾 Auto-saving document...");
      socket.emit("save-document", {
        documentId: params.id,
        content,
        title,
      });
    }
  };

  const handleSave = async () => {
    if (!socket || !isConnected) {
      toast({
        title: "Not connected",
        description: "Please wait for connection",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setSaving(true);
    socket.emit("save-document", {
      documentId: params.id,
      content,
      title,
    });

    setTimeout(() => {
      if (saving) {
        setSaving(false);
        toast({
          title: "Save completed",
          status: "success",
          duration: 2000,
        });
      }
    }, 1000);
  };

  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
    emitTypingIndicator();
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    emitTypingIndicator();

    if (socket && isConnected) {
      socket.emit("text-change", {
        documentId: params.id,
        content: newContent,
      });
    }
  };

  const emitTypingIndicator = () => {
    if (!socket || !isConnected) return;

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

    socket.emit("typing", {
      documentId: params.id,
      isTyping: true,
    });

    typingTimer.current = setTimeout(() => {
      socket.emit("typing", {
        documentId: params.id,
        isTyping: false,
      });
    }, 2000);
  };

  const formatLastSaved = () => {
    if (!lastSaved) return "Not saved";
    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const getTypingText = () => {
    const typingArray = Array.from(typingUsers.values());
    if (typingArray.length === 0) return "";
    const firstName = typingArray[0].split(" ")[0];
    if (typingArray.length === 1) return `${firstName} is typing...`;
    if (typingArray.length === 2) {
      const firstName2 = typingArray[1].split(" ")[0];
      return `${firstName} and ${firstName2} are typing...`;
    }
    return `${firstName} and ${typingArray.length - 1} others are typing...`;
  };

  const getFirstName = (fullName) => {
    return fullName ? fullName.split(" ")[0] : "";
  };

  if (loading) {
    return (
      <Center minH="100vh" bg={bgColor}>
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text color="gray.600">Loading document...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor} position="relative">
      {/* Top Navigation - Responsive */}
      <Box
        bg={navBg}
        boxShadow="sm"
        py={3}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Container maxW="container.xl" px={{ base: 3, md: 4, lg: 6 }}>
          <VStack spacing={2} align="stretch">
            {/* Desktop Header (lg and up) */}
            <HStack
              justify="space-between"
              display={{ base: "none", lg: "flex" }}
            >
              <HStack spacing={3} flex={1} minW={0}>
                <IconButton
                  icon={<ArrowBackIcon />}
                  onClick={() => router.push("/dashboard")}
                  variant="ghost"
                  aria-label="Back to dashboard"
                  size="sm"
                />
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  variant="unstyled"
                  fontSize="lg"
                  fontWeight="semibold"
                  placeholder="Untitled Document"
                  maxW="400px"
                />
                <HStack spacing={2}>
                  <Badge
                    colorScheme={isConnected ? "green" : "red"}
                    fontSize="xs"
                  >
                    {isConnected ? "●" : "○"}
                  </Badge>
                  <Text fontSize="xs" color="gray.500">
                    {formatLastSaved()}
                  </Text>
                </HStack>
              </HStack>

              <HStack spacing={3}>
                {activeUsers.length > 0 && (
                  <Menu>
                    <MenuButton as={Button} variant="ghost" size="sm">
                      <HStack spacing={2}>
                        <FiUsers />
                        <Text fontSize="sm">{activeUsers.length}</Text>
                        <AvatarGroup size="xs" max={3}>
                          {activeUsers.slice(0, 3).map((user) => (
                            <Avatar
                              key={user.socketId}
                              name={user.name}
                              src={user.avatar}
                            />
                          ))}
                        </AvatarGroup>
                      </HStack>
                    </MenuButton>
                    <MenuList>
                      <Text
                        px={3}
                        py={2}
                        fontSize="sm"
                        fontWeight="semibold"
                        color="gray.600"
                      >
                        Active Users ({activeUsers.length})
                      </Text>
                      {activeUsers.map((user) => (
                        <MenuItem key={user.socketId}>
                          <HStack>
                            <Avatar
                              size="sm"
                              name={user.name}
                              src={user.avatar}
                            />
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm">{user.name}</Text>
                              <Text fontSize="xs" color="gray.500">
                                {getFirstName(user.name)}
                              </Text>
                            </VStack>
                          </HStack>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                )}

                <Button
                  leftIcon={<FiSave />}
                  colorScheme="purple"
                  onClick={handleSave}
                  isLoading={saving}
                  loadingText="Saving"
                  size="sm"
                  isDisabled={!isConnected}
                >
                  Save
                </Button>
              </HStack>
            </HStack>

            {/* Tablet/Mobile Header (base to lg) */}
            <HStack
              justify="space-between"
              display={{ base: "flex", lg: "none" }}
            >
              <HStack spacing={2} flex={1} minW={0}>
                <IconButton
                  icon={<ArrowBackIcon />}
                  onClick={() => router.push("/dashboard")}
                  variant="ghost"
                  size="sm"
                  aria-label="Back"
                />
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  variant="unstyled"
                  fontSize={{ base: "md", md: "lg" }}
                  fontWeight="semibold"
                  placeholder="Untitled"
                  flex={1}
                />
              </HStack>

              <HStack spacing={2}>
                <Badge
                  colorScheme={isConnected ? "green" : "red"}
                  fontSize="xs"
                  display={{ base: "none", md: "block" }}
                >
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>

                <Badge
                  colorScheme={isConnected ? "green" : "red"}
                  fontSize="xs"
                  display={{ base: "block", md: "none" }}
                >
                  {isConnected ? "●" : "○"}
                </Badge>

                {activeUsers.length > 0 && (
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<FiUsers />}
                      size="sm"
                      variant="ghost"
                      position="relative"
                    >
                      <Badge
                        position="absolute"
                        top="-1"
                        right="-1"
                        colorScheme="green"
                        borderRadius="full"
                        fontSize="2xs"
                        minW="18px"
                        h="18px"
                      >
                        {activeUsers.length}
                      </Badge>
                    </MenuButton>
                    <MenuList>
                      <Text
                        px={3}
                        py={2}
                        fontSize="sm"
                        fontWeight="semibold"
                        color="gray.600"
                      >
                        Online ({activeUsers.length})
                      </Text>
                      {activeUsers.map((user) => (
                        <MenuItem key={user.socketId}>
                          <HStack>
                            <Avatar
                              size="sm"
                              name={user.name}
                              src={user.avatar}
                            />
                            <Text fontSize="sm">{getFirstName(user.name)}</Text>
                          </HStack>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                )}

                <IconButton
                  icon={<FiSave />}
                  onClick={handleSave}
                  isLoading={saving}
                  size="sm"
                  variant="ghost"
                  isDisabled={!isConnected}
                  aria-label="Save"
                />
              </HStack>
            </HStack>

            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
              <Text fontSize="xs" color="gray.500" pl={{ base: 10, md: 12 }}>
                {getTypingText()}
              </Text>
            )}

            {/* Save status on mobile/tablet */}
            <HStack
              justify="space-between"
              display={{ base: "flex", lg: "none" }}
              px={10}
            >
              <Text fontSize="xs" color="gray.500">
                {formatLastSaved()}
              </Text>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Editor and AI Assistant */}
      <Container
        maxW="container.xl"
        py={{ base: 4, md: 6 }}
        px={{ base: 2, md: 4, lg: 6 }}
      >
        <HStack align="start" spacing={{ base: 0, lg: 6 }}>
          <Box flex={1} w="full">
            <Editor
              content={content}
              onChange={handleContentChange}
              socket={socket}
              documentId={params.id}
            />
          </Box>

          {/* Desktop AI Assistant - Only on very large screens */}
          <Box
            w="350px"
            display={{ base: "none", xl: "block" }}
            position="sticky"
            top="100px"
          >
            <AIAssistant content={content} onApply={handleContentChange} />
          </Box>
        </HStack>
      </Container>

      {/* Floating AI Assistant Button - Shows on all screens except xl */}
      <Box
        position="fixed"
        bottom={{ base: 4, md: 6 }}
        right={{ base: 4, md: 6 }}
        zIndex={20}
        display={{ base: "block", xl: "none" }}
      >
        <Tooltip label="AI Writing Assistant" placement="left">
          <IconButton
            icon={<FiZap />}
            onClick={onOpen}
            colorScheme="purple"
            size={{ base: "lg", md: "md" }}
            borderRadius="full"
            boxShadow="lg"
            aria-label="AI Assistant"
            _hover={{
              transform: "scale(1.1)",
              boxShadow: "xl",
            }}
            transition="all 0.2s"
            w={{ base: "56px", md: "48px" }}
            h={{ base: "56px", md: "48px" }}
          />
        </Tooltip>
      </Box>

      {/* Mobile/Tablet AI Assistant Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size={{ base: "full", md: "md" }}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <HStack>
              <FiZap color="#805AD5" />
              <Text>AI Writing Assistant</Text>
            </HStack>
          </DrawerHeader>
          <DrawerBody p={4}>
            <AIAssistant
              content={content}
              onApply={(newContent) => {
                handleContentChange(newContent);
                onClose();
              }}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
