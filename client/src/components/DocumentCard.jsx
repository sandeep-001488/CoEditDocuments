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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
import {
  FiMoreVertical,
  FiTrash2,
  FiShare2,
  FiFileText,
  FiCopy,
  FiMail,
  FiLink,
  FiEye,
  FiEdit,
  FiUsers,
} from "react-icons/fi";
import api from "@/services/api";

const DocumentCard = ({ document, onDelete, onClick }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [shareEmail, setShareEmail] = useState("");
  const [emailPermission, setEmailPermission] = useState("viewer");
  const [linkPermission, setLinkPermission] = useState("viewer");
  const [shareLink, setShareLink] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
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
    setShareLink("");
    setShareEmail("");
    onOpen();
  };

  const handleGenerateShareLink = async () => {
    setLoadingLink(true);
    try {
      const response = await api.post(`/documents/${document._id}/share-link`, {
        permission: linkPermission,
      });
      if (response.data.success) {
        setShareLink(response.data.shareLink);
        toast({
          title: "Share link generated",
          description: `Link with ${linkPermission} permission created`,
          status: "success",
          duration: 3000,
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

  const handleSendEmailInvitation = async () => {
    if (!shareEmail) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shareEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setLoadingEmail(true);
    try {
      const response = await api.post(
        `/documents/${document._id}/send-invitation`,
        {
          email: shareEmail,
          permission: emailPermission,
        }
      );

      if (response.data.success) {
        toast({
          title: "Invitation sent",
          description: response.data.message,
          status: "success",
          duration: 4000,
        });
        setShareEmail("");

        // Show the share link as backup
        if (response.data.shareLink) {
          setShareLink(response.data.shareLink);
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message;

      toast({
        title: "Error",
        description: errorMessage || "Failed to send invitation",
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <>
      <Box
        bg="white"
        borderRadius="2xl"
        borderWidth="2px"
        borderColor="purple.200"
        p={6}
        cursor="pointer"
        onClick={onClick}
        _hover={{
          transform: "translateY(-6px)",
          boxShadow: "2xl",
          borderColor: "purple.400",
          bgGradient: "linear(to-br, white, purple.50)",
        }}
        transition="all 0.3s"
        position="relative"
      >
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between">
            <HStack>
              <Box
                p={2}
                borderRadius="lg"
                bgGradient="linear(to-br, purple.500, blue.500)"
              >
                <FiFileText size={20} color="white" />
              </Box>
              <Heading size="md" noOfLines={1} color="gray.800">
                {document.title || "Untitled Document"}
              </Heading>
            </HStack>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiMoreVertical />}
                variant="ghost"
                size="sm"
                colorScheme="purple"
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
            <Text fontSize="xs" color="gray.500" fontWeight="medium">
              Updated {formatDate(document.updatedAt)}
            </Text>
            {document.collaborators?.length > 0 && (
              <Badge
                colorScheme="purple"
                fontSize="xs"
                borderRadius="full"
                px={2}
              >
                <HStack spacing={1}>
                  <FiUsers />
                  <Text>Shared</Text>
                </HStack>
              </Badge>
            )}
          </HStack>
        </VStack>
      </Box>

      {/* Share Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            bgGradient="linear(to-r, purple.500, blue.500)"
            color="white"
            borderTopRadius="md"
          >
            Share "{document.title || "Untitled"}"
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody pb={6}>
            <Tabs colorScheme="purple">
              <TabList>
                <Tab>
                  <HStack>
                    <FiMail />
                    <Text>Email Invitation</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack>
                    <FiLink />
                    <Text>Share Link</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {/* Email Invitation Tab - Now First */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <Box>
                      <Heading size="sm" mb={3} color="purple.700">
                        Invite via email
                      </Heading>
                      <Text fontSize="sm" color="gray.600" mb={4}>
                        Send an invitation email with access link to a specific
                        user
                      </Text>

                      <VStack spacing={4}>
                        <FormControl isRequired>
                          <FormLabel color="purple.600">
                            Recipient Email
                          </FormLabel>
                          <Input
                            type="email"
                            placeholder="colleague@example.com"
                            value={shareEmail}
                            onChange={(e) => setShareEmail(e.target.value)}
                          />
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            User must have a registered account
                          </Text>
                        </FormControl>

                        <FormControl>
                          <FormLabel color="purple.600">
                            Access Permission
                          </FormLabel>
                          <RadioGroup
                            value={emailPermission}
                            onChange={setEmailPermission}
                          >
                            <Stack direction="column" spacing={3}>
                              <Radio value="viewer" colorScheme="purple">
                                <HStack>
                                  <FiEye />
                                  <VStack align="start" spacing={0}>
                                    <Text fontWeight="semibold">View Only</Text>
                                    <Text fontSize="xs" color="gray.600">
                                      Can only read the document
                                    </Text>
                                  </VStack>
                                </HStack>
                              </Radio>
                              <Radio value="editor" colorScheme="purple">
                                <HStack>
                                  <FiEdit />
                                  <VStack align="start" spacing={0}>
                                    <Text fontWeight="semibold">Can Edit</Text>
                                    <Text fontSize="xs" color="gray.600">
                                      Can view and edit the document
                                    </Text>
                                  </VStack>
                                </HStack>
                              </Radio>
                            </Stack>
                          </RadioGroup>
                        </FormControl>

                        <Button
                          leftIcon={<FiMail />}
                          colorScheme="purple"
                          width="full"
                          onClick={handleSendEmailInvitation}
                          isLoading={loadingEmail}
                          bgGradient="linear(to-r, purple.500, blue.500)"
                          _hover={{
                            bgGradient: "linear(to-r, purple.600, blue.600)",
                          }}
                        >
                          Send Invitation Email
                        </Button>
                      </VStack>
                    </Box>

                    <Box
                      p={3}
                      bgGradient="linear(to-r, blue.50, purple.50)"
                      borderRadius="md"
                      borderLeft="4px solid"
                      borderColor="blue.500"
                    >
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        mb={1}
                        color="blue.700"
                      >
                        📧 Email will be sent from your account
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        The recipient will receive an email with the document
                        link and access instructions
                      </Text>
                    </Box>

                    {/* Show share link if email was sent */}
                    {shareLink && (
                      <Box
                        p={3}
                        bgGradient="linear(to-r, green.50, blue.50)"
                        borderRadius="md"
                        borderLeft="4px solid"
                        borderColor="green.500"
                      >
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          mb={2}
                          color="green.700"
                        >
                          ✅ Backup Share Link
                        </Text>
                        <InputGroup size="sm">
                          <Input value={shareLink} isReadOnly bg="white" />
                          <InputRightElement width="3rem">
                            <Button
                              h="1.5rem"
                              size="xs"
                              colorScheme="green"
                              onClick={handleCopyLink}
                            >
                              <FiCopy />
                            </Button>
                          </InputRightElement>
                        </InputGroup>
                        <Text fontSize="xs" color="gray.600" mt={1}>
                          You can also share this link manually if needed
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </TabPanel>

                {/* Share Link Tab - Now Second */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    <Box>
                      <Heading size="sm" mb={3} color="purple.700">
                        Generate a shareable link
                      </Heading>
                      <Text fontSize="sm" color="gray.600" mb={4}>
                        Anyone with this link will be able to access the
                        document
                      </Text>

                      <FormControl mb={4}>
                        <FormLabel color="purple.600">
                          Link Permission
                        </FormLabel>
                        <RadioGroup
                          value={linkPermission}
                          onChange={setLinkPermission}
                        >
                          <Stack direction="column" spacing={3}>
                            <Radio value="viewer" colorScheme="purple">
                              <HStack>
                                <FiEye />
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="semibold">View Only</Text>
                                  <Text fontSize="xs" color="gray.600">
                                    Recipients can only view the document
                                  </Text>
                                </VStack>
                              </HStack>
                            </Radio>
                            <Radio value="editor" colorScheme="purple">
                              <HStack>
                                <FiEdit />
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="semibold">Can Edit</Text>
                                  <Text fontSize="xs" color="gray.600">
                                    Recipients can view and edit the document
                                  </Text>
                                </VStack>
                              </HStack>
                            </Radio>
                          </Stack>
                        </RadioGroup>
                      </FormControl>

                      {!shareLink ? (
                        <Button
                          leftIcon={<FiLink />}
                          colorScheme="purple"
                          width="full"
                          onClick={handleGenerateShareLink}
                          isLoading={loadingLink}
                          bgGradient="linear(to-r, purple.500, blue.500)"
                          _hover={{
                            bgGradient: "linear(to-r, purple.600, blue.600)",
                          }}
                        >
                          Generate{" "}
                          {linkPermission === "editor"
                            ? "Editable"
                            : "View-Only"}{" "}
                          Link
                        </Button>
                      ) : (
                        <VStack spacing={3}>
                          <InputGroup>
                            <Input value={shareLink} isReadOnly />
                            <InputRightElement width="4.5rem">
                              <Button
                                h="1.75rem"
                                size="sm"
                                colorScheme="purple"
                                onClick={handleCopyLink}
                              >
                                <FiCopy />
                              </Button>
                            </InputRightElement>
                          </InputGroup>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="purple"
                            width="full"
                            onClick={() => setShareLink("")}
                          >
                            Generate New Link
                          </Button>
                        </VStack>
                      )}
                    </Box>

                    {shareLink && (
                      <Box
                        p={3}
                        bgGradient="linear(to-r, purple.50, blue.50)"
                        borderRadius="md"
                        borderLeft="4px solid"
                        borderColor="purple.500"
                      >
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          mb={1}
                          color="purple.700"
                        >
                          Link Permission:{" "}
                          {linkPermission === "editor"
                            ? "Can Edit"
                            : "View Only"}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {linkPermission === "editor"
                            ? "Anyone with this link can edit the document"
                            : "Anyone with this link can only view the document"}
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DocumentCard;