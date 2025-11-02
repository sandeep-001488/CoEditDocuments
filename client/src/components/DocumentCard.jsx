"use client";

import { useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  Button,
  useToast,
  useDisclosure,
  InputGroup,
  InputRightElement,
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import {
  FiMoreVertical,
  FiTrash2,
  FiShare2,
  FiFileText,
  FiCopy,
  FiMail,
} from "react-icons/fi";
import api from "@/services/api";

const DocumentCard = ({ document, onDelete, onClick }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState("viewer");
  const [shareLink, setShareLink] = useState("");
  const [loadingShare, setLoadingShare] = useState(false);
  const [loadingLink, setLoadingLink] = useState(false);
  const toast = useToast();

  const formatDate = (date) => {
    try {
      const d = new Date(date);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const month = months[d.getMonth()];
      const day = String(d.getDate()).padStart(2, "0");
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${month} ${day}, ${year} ${hours}:${minutes}`;
    } catch {
      return "Recently";
    }
  };

  const getPreview = () => {
    const text = document.content?.replace(/<[^>]*>/g, "") || "";
    return text.substring(0, 100) + (text.length > 100 ? "..." : "");
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    onOpen();
  };

  const handleGenerateShareLink = async () => {
    setLoadingLink(true);
    try {
      const response = await api.post(`/documents/${document._id}/share-link`);
      if (response.data.success) {
        setShareLink(response.data.shareLink);
        toast({
          title: "Share link generated",
          status: "success",
          duration: 2000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate share link",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoadingLink(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard",
      status: "success",
      duration: 2000,
    });
  };

  const handleShareWithEmail = async () => {
    if (!shareEmail) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setLoadingShare(true);
    try {
      const response = await api.post(`/documents/${document._id}/share`, {
        email: shareEmail,
        role: shareRole,
      });

      if (response.data.success) {
        toast({
          title: "Document shared",
          description: `Shared with ${shareEmail} as ${shareRole}`,
          status: "success",
          duration: 3000,
        });
        setShareEmail("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to share document",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoadingShare(false);
    }
  };

  return (
    <>
      <Box
        bg="white"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="gray.200"
        p={6}
        cursor="pointer"
        onClick={onClick}
        _hover={{
          transform: "translateY(-4px)",
          boxShadow: "xl",
          bg: "gray.50",
        }}
        transition="all 0.3s"
        position="relative"
      >
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between">
            <HStack>
              <FiFileText size={20} color="#805AD5" />
              <Heading size="md" noOfLines={1}>
                {document.title || "Untitled Document"}
              </Heading>
            </HStack>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiMoreVertical />}
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              />
              <MenuList>
                <MenuItem icon={<FiShare2 />} onClick={handleShareClick}>
                  Share
                </MenuItem>
                <MenuItem
                  icon={<FiTrash2 />}
                  color="red.500"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(document._id);
                  }}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>

          <Text fontSize="sm" color="gray.600" noOfLines={3} minH="60px">
            {getPreview() || "No content yet..."}
          </Text>

          <HStack justify="space-between" pt={2}>
            <Text fontSize="xs" color="gray.500">
              Updated {formatDate(document.updatedAt)}
            </Text>
            {document.collaborators?.length > 0 && (
              <Badge colorScheme="purple" fontSize="xs">
                Shared
              </Badge>
            )}
          </HStack>
        </VStack>
      </Box>

      {/* Share Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share Document</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="stretch">
              {/* Share with Email */}
              <Box>
                <Heading size="sm" mb={3}>
                  Share with specific people
                </Heading>
                <VStack spacing={3}>
                  <FormControl>
                    <FormLabel>Email Address</FormLabel>
                    <Input
                      placeholder="colleague@email.com"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      type="email"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Permission</FormLabel>
                    <Select
                      value={shareRole}
                      onChange={(e) => setShareRole(e.target.value)}
                    >
                      <option value="viewer">Viewer (Read only)</option>
                      <option value="editor">Editor (Can edit)</option>
                    </Select>
                  </FormControl>
                  <Button
                    leftIcon={<FiMail />}
                    colorScheme="purple"
                    width="full"
                    onClick={handleShareWithEmail}
                    isLoading={loadingShare}
                  >
                    Send Invitation
                  </Button>
                </VStack>
              </Box>

              {/* Generate Share Link */}
              <Box>
                <Heading size="sm" mb={3}>
                  Or share with a link
                </Heading>
                {!shareLink ? (
                  <Button
                    leftIcon={<FiShare2 />}
                    colorScheme="blue"
                    variant="outline"
                    width="full"
                    onClick={handleGenerateShareLink}
                    isLoading={loadingLink}
                  >
                    Generate Share Link
                  </Button>
                ) : (
                  <InputGroup>
                    <Input value={shareLink} isReadOnly />
                    <InputRightElement width="4.5rem">
                      <Button
                        h="1.75rem"
                        size="sm"
                        onClick={handleCopyLink}
                        leftIcon={<FiCopy />}
                      >
                        Copy
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                )}
              </Box>

              {/* Existing Collaborators */}
              {document.collaborators?.length > 0 && (
                <Box>
                  <Heading size="sm" mb={3}>
                    People with access
                  </Heading>
                  <VStack align="stretch" spacing={2}>
                    {document.collaborators.map((collab) => (
                      <HStack
                        key={collab.user._id}
                        justify="space-between"
                        p={2}
                        bg="gray.50"
                        borderRadius="md"
                      >
                        <Text fontSize="sm">{collab.user.email}</Text>
                        <Badge colorScheme="purple">{collab.role}</Badge>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DocumentCard;
