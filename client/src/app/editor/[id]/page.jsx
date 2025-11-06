"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import { ArrowBackIcon } from "@chakra-ui/icons";
import { FiSave, FiUsers, FiZap, FiLink, FiImage } from "react-icons/fi";
import Editor from "@/components/Editor";
import AIAssistant from "@/components/AIAssistant";
import ImageGallery from "@/components/ImageGallery";
import api from "@/services/api";
import { initSocket, disconnectSocket } from "@/services/socket";

export default function EditorPage() {
  const bgGradient = "linear(to-br, purple.50, blue.50, pink.50)";
  const navBg = "white";
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isGalleryOpen,
    onOpen: onGalleryOpen,
    onClose: onGalleryClose,
  } = useDisclosure();

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
  const [isOwner, setIsOwner] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [joinedViaLink, setJoinedViaLink] = useState(false);
  const [images, setImages] = useState([]);
  const [waitingForOwner, setWaitingForOwner] = useState(false);
  const autoSaveTimer = useRef(null);
  const typingTimer = useRef(null);
  const titleSaveTimer = useRef(null);
  const waitingToastId = useRef(null); // NEW: Track toast ID

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

    const linkToken = searchParams.get("token");
    const permission = searchParams.get("permission");
    if (linkToken) {
      setJoinedViaLink(true);
      setUserRole(permission || "viewer");
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
      // console.log("📄 Document loaded:", data);
      setContent(data.content || "");
      setTitle(data.title || "");
      setLastSaved(new Date(data.updatedAt));
      setIsOwner(data.isOwner);
      setImages(data.images || []);
      setWaitingForOwner(false);
      setLoading(false);

      // UPDATED: Close waiting toast when document loads
      if (waitingToastId.current) {
        toast.close(waitingToastId.current);
        waitingToastId.current = null;
      }

      if (linkToken && permission) {
        setUserRole(permission);
      } else {
        setUserRole(data.userRole);
      }
    });

    // UPDATED: Handle owner offline - show toast only once
    socketInstance.on("owner-offline", (data) => {
      console.log("⏳ Owner is offline, waiting...");
      setWaitingForOwner(true);

      // Close any existing waiting toast first
      if (waitingToastId.current) {
        toast.close(waitingToastId.current);
      }

      // Show single persistent toast
      waitingToastId.current = toast({
        title: "Waiting for owner",
        description: data.message,
        status: "info",
        duration: null, // Keep it open until manually closed
        isClosable: false,
      });
    });

    // UPDATED: Handle owner coming online
    socketInstance.on("owner-online", (data) => {
      console.log("✅ Owner is now online, reconnecting...");

      // Close waiting toast
      if (waitingToastId.current) {
        toast.close(waitingToastId.current);
        waitingToastId.current = null;
      }

      // Show success toast
      toast({
        title: "Owner is online",
        description: "Connecting to document...",
        status: "success",
        duration: 2000,
      });

      // Retry joining
      setTimeout(() => {
        socketInstance.emit("join-document", {
          documentId: params.id,
          token,
        });
      }, 500);
    });

    socketInstance.on("image-added", (imageData) => {
      // console.log("🖼️ New image added:", imageData);
      setImages((prev) => [...prev, imageData]);

      toast({
        title: "Image added",
        description: `${imageData.uploadedBy.name} added an image`,
        status: "info",
        duration: 3000,
      });
    });

    socketInstance.on("image-removed", ({ imageId }) => {
      // console.log("🗑️ Image removed:", imageId);
      setImages((prev) => prev.filter((img) => img._id !== imageId));

      toast({
        title: "Image removed",
        description: "Owner removed an image",
        status: "info",
        duration: 2000,
      });
    });

    socketInstance.on("text-change", (data) => {
      // console.log("✏️ Remote text change received");
      setContent(data.content || "");
    });

    socketInstance.on("users-update", (users) => {
      // console.log("👥 Active users updated:", users);
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

    socketInstance.on("owner-disconnected", (data) => {
      toast({
        title: "Owner disconnected",
        description: data.message,
        status: "error",
        duration: 5000,
        isClosable: false,
      });
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    });

    return () => {
      // UPDATED: Close waiting toast on cleanup
      if (waitingToastId.current) {
        toast.close(waitingToastId.current);
      }
      disconnectSocket(params.id);
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      if (titleSaveTimer.current) clearTimeout(titleSaveTimer.current);
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
    if (socket && !saving && isConnected && isOwner) {
      // console.log("💾 Auto-saving document...");
      socket.emit("save-document", {
        documentId: params.id,
        content,
        title,
      });
    }
  };

  const handleSave = async () => {
    if (!isOwner) {
      toast({
        title: "Permission denied",
        description: "Only the document owner can save",
        status: "warning",
        duration: 3000,
      });
      return;
    }

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

    if (titleSaveTimer.current) {
      clearTimeout(titleSaveTimer.current);
    }

    titleSaveTimer.current = setTimeout(() => {
      if (socket && isConnected && isOwner) {
        socket.emit("save-document", {
          documentId: params.id,
          content,
          title: newTitle,
        });
      }
    }, 2000);
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

  const handleImageUpload = (imageData) => {
    if (!socket || !isConnected) {
      toast({
        title: "Not connected",
        description: "Please wait for connection",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    socket.emit("image-upload", {
      documentId: params.id,
      imageData,
    });
  };

  const handleRemoveImage = (imageId) => {
    if (!socket || !isConnected) {
      toast({
        title: "Not connected",
        description: "Please wait for connection",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    socket.emit("image-remove", {
      documentId: params.id,
      imageId,
    });
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

  const getRoleLabel = (role) => {
    if (role === "owner") return "OWNER";
    if (role === "editor") return "EDITOR";
    return "VIEWER";
  };

  const getRoleBadgeColor = (role) => {
    if (role === "owner") return "purple";
    if (role === "editor") return "green";
    return "blue";
  };

  // UPDATED: Simplified waiting screen without attempt counter
  if (loading || waitingForOwner) {
    return (
      <Center minH="100vh" bgGradient={bgGradient}>
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text color="gray.600" fontSize="lg" fontWeight="medium">
            {waitingForOwner
              ? "Waiting for document owner to come online..."
              : "Loading document..."}
          </Text>
          {waitingForOwner && (
            <Text color="gray.500" fontSize="sm">
              Please wait while we connect you to the document
            </Text>
          )}
        </VStack>
      </Center>
    );
  }

  const isReadOnly = userRole === "viewer";

  return (
    <Box minH="100vh" bgGradient={bgGradient} position="relative">
      {/* Top Navigation */}
      <Box
        bg={navBg}
        boxShadow="md"
        py={3}
        position="sticky"
        top={0}
        zIndex={10}
        borderBottom="2px solid"
        borderColor="purple.200"
      >
        <Container maxW="container.xl" px={{ base: 3, md: 4, lg: 6 }}>
          <VStack spacing={2} align="stretch">
            {/* Desktop Header */}
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
                  colorScheme="purple"
                />
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  variant="unstyled"
                  fontSize="lg"
                  fontWeight="bold"
                  placeholder="Untitled Document"
                  maxW="400px"
                  isReadOnly={!isOwner}
                />
                <HStack spacing={2}>
                  <Badge
                    colorScheme={isConnected ? "green" : "red"}
                    fontSize="xs"
                    px={2}
                  >
                    {isConnected ? "● Connected" : "○ Disconnected"}
                  </Badge>
                  <Badge
                    colorScheme={getRoleBadgeColor(userRole)}
                    fontSize="xs"
                    px={2}
                  >
                    {getRoleLabel(userRole)}
                  </Badge>
                  {joinedViaLink && (
                    <Badge colorScheme="orange" fontSize="xs" px={2}>
                      <HStack spacing={1}>
                        <FiLink size={10} />
                        <Text>Via Link</Text>
                      </HStack>
                    </Badge>
                  )}
                  <Text fontSize="xs" color="gray.500">
                    {formatLastSaved()}
                  </Text>
                </HStack>
              </HStack>

              <HStack spacing={3}>
                {activeUsers.length > 0 && (
                  <Menu>
                    <MenuButton
                      as={Button}
                      variant="ghost"
                      size="sm"
                      colorScheme="purple"
                    >
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
                          <HStack spacing={3} w="full">
                            <Avatar
                              size="sm"
                              name={user.name}
                              src={user.avatar}
                            />
                            <VStack align="start" spacing={0} flex={1}>
                              <Text fontSize="sm">{user.name}</Text>
                              <HStack spacing={2}>
                                <Badge
                                  size="xs"
                                  colorScheme={getRoleBadgeColor(user.role)}
                                  fontSize="2xs"
                                >
                                  {getRoleLabel(user.role)}
                                </Badge>
                              </HStack>
                            </VStack>
                          </HStack>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                )}

                <Tooltip label="View images">
                  <IconButton
                    icon={<FiImage />}
                    onClick={onGalleryOpen}
                    variant="ghost"
                    size="sm"
                    colorScheme="purple"
                    aria-label="Image gallery"
                  />
                </Tooltip>

                {isOwner && (
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
                )}
              </HStack>
            </HStack>

            {/* Mobile/Tablet Header */}
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
                  colorScheme="purple"
                />
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  variant="unstyled"
                  fontSize={{ base: "md", md: "lg" }}
                  fontWeight="bold"
                  placeholder="Untitled"
                  flex={1}
                  isReadOnly={!isOwner}
                />
              </HStack>

              <HStack spacing={2}>
                <Badge
                  colorScheme={isConnected ? "green" : "red"}
                  fontSize="2xs"
                >
                  {isConnected ? "●" : "○"}
                </Badge>

                <Badge colorScheme={getRoleBadgeColor(userRole)} fontSize="2xs">
                  {getRoleLabel(userRole)}
                </Badge>

                {activeUsers.length > 0 && (
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<FiUsers />}
                      size="sm"
                      variant="ghost"
                      colorScheme="purple"
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
                          <HStack spacing={2} w="full">
                            <Avatar
                              size="sm"
                              name={user.name}
                              src={user.avatar}
                            />
                            <VStack align="start" spacing={0} flex={1}>
                              <Text fontSize="sm">
                                {getFirstName(user.name)}
                              </Text>
                              <Badge
                                size="xs"
                                colorScheme={getRoleBadgeColor(user.role)}
                                fontSize="2xs"
                              >
                                {getRoleLabel(user.role)}
                              </Badge>
                            </VStack>
                          </HStack>
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                )}

                <IconButton
                  icon={<FiImage />}
                  onClick={onGalleryOpen}
                  size="sm"
                  variant="ghost"
                  colorScheme="purple"
                  aria-label="Images"
                />

                {isOwner && (
                  <IconButton
                    icon={<FiSave />}
                    onClick={handleSave}
                    isLoading={saving}
                    size="sm"
                    variant="ghost"
                    colorScheme="purple"
                    isDisabled={!isConnected}
                    aria-label="Save"
                  />
                )}
              </HStack>
            </HStack>

            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
              <Text
                fontSize="xs"
                color="purple.600"
                fontStyle="italic"
                pl={{ base: 10, md: 12 }}
              >
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
              {joinedViaLink && (
                <Badge colorScheme="orange" fontSize="2xs">
                  <HStack spacing={1}>
                    <FiLink size={8} />
                    <Text>Link</Text>
                  </HStack>
                </Badge>
              )}
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
              isReadOnly={isReadOnly}
              onImageUpload={handleImageUpload}
              isOwner={isOwner}
            />
          </Box>

          {/* Desktop AI Assistant */}
          <Box
            w="350px"
            display={{ base: "none", xl: "block" }}
            position="sticky"
            top="120px"
          >
            <AIAssistant content={content} onApply={handleContentChange} />
          </Box>
        </HStack>
      </Container>

      {/* Floating AI Assistant Button */}
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
            boxShadow="xl"
            aria-label="AI Assistant"
            _hover={{
              transform: "scale(1.1)",
              boxShadow: "2xl",
            }}
            transition="all 0.2s"
            w={{ base: "60px", md: "56px" }}
            h={{ base: "60px", md: "56px" }}
          />
        </Tooltip>
      </Box>

      {/* AI Assistant Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size={{ base: "full", md: "md" }}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" bg="purple.50">
            <HStack>
              <FiZap color="#805AD5" />
              <Text>AI Writing Assistant</Text>
            </HStack>
          </DrawerHeader>
          <DrawerBody p={4} bg="purple.50">
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

      {/* Image Gallery */}
      <ImageGallery
        isOpen={isGalleryOpen}
        onClose={onGalleryClose}
        images={images}
        isOwner={isOwner}
        onRemoveImage={handleRemoveImage}
      />
    </Box>
  );
}