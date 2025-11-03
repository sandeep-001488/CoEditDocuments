// "use client";

// import {
//   Drawer,
//   DrawerBody,
//   DrawerHeader,
//   DrawerOverlay,
//   DrawerContent,
//   DrawerCloseButton,
//   VStack,
//   HStack,
//   Text,
//   Image,
//   Box,
//   Badge,
//   SimpleGrid,
//   Modal,
//   ModalOverlay,
//   ModalContent,
//   ModalBody,
//   ModalCloseButton,
//   useDisclosure,
//   IconButton,
//   Tooltip,
//   useToast,
// } from "@chakra-ui/react";
// import { useState } from "react";
// import { FiImage, FiUser, FiClock, FiTrash2 } from "react-icons/fi";

// const ImageGallery = ({ isOpen, onClose, images, isOwner, onRemoveImage }) => {
//   const {
//     isOpen: isModalOpen,
//     onOpen: onModalOpen,
//     onClose: onModalClose,
//   } = useDisclosure();
//   const [selectedImage, setSelectedImage] = useState(null);
//   const toast = useToast();

//   const handleImageClick = (image) => {
//     setSelectedImage(image);
//     onModalOpen();
//   };

//   const handleRemoveImage = (index, e) => {
//     e.stopPropagation();
//     if (onRemoveImage) {
//       onRemoveImage(index);
//       toast({
//         title: "Image removed",
//         status: "success",
//         duration: 2000,
//       });
//     }
//   };

//   const formatDate = (date) => {
//     try {
//       const d = new Date(date);
//       return d.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     } catch {
//       return "Recently";
//     }
//   };

//   return (
//     <>
//       <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
//         <DrawerOverlay />
//         <DrawerContent bg="purple.50">
//           <DrawerCloseButton />
//           <DrawerHeader borderBottomWidth="1px" bg="white">
//             <HStack>
//               <FiImage color="#805AD5" size={20} />
//               <Text>Document Images</Text>
//               <Badge colorScheme="purple">{images?.length || 0}</Badge>
//             </HStack>
//           </DrawerHeader>
//           <DrawerBody p={4}>
//             {!images || images.length === 0 ? (
//               <VStack py={10} spacing={3}>
//                 <FiImage size={48} color="#CBD5E0" />
//                 <Text color="gray.500">No images yet</Text>
//                 <Text fontSize="sm" color="gray.400" textAlign="center">
//                   Images attached to the document will appear here
//                 </Text>
//               </VStack>
//             ) : (
//               <SimpleGrid columns={2} spacing={4}>
//                 {images.map((image, index) => (
//                   <Box
//                     key={index}
//                     borderWidth="1px"
//                     borderRadius="lg"
//                     overflow="hidden"
//                     cursor="pointer"
//                     onClick={() => handleImageClick(image)}
//                     _hover={{
//                       transform: "scale(1.05)",
//                       boxShadow: "lg",
//                     }}
//                     transition="all 0.2s"
//                     position="relative"
//                     bg="white"
//                   >
//                     {isOwner && (
//                       <Tooltip label="Remove image">
//                         <IconButton
//                           icon={<FiTrash2 />}
//                           size="sm"
//                           colorScheme="red"
//                           position="absolute"
//                           top={2}
//                           right={2}
//                           zIndex={2}
//                           onClick={(e) => handleRemoveImage(index, e)}
//                           aria-label="Remove image"
//                         />
//                       </Tooltip>
//                     )}
//                     <Image
//                       src={image.url}
//                       alt={image.name || `Image ${index + 1}`}
//                       objectFit="cover"
//                       w="full"
//                       h="150px"
//                     />
//                     <Box p={2} bg="gray.50">
//                       <Text fontSize="xs" fontWeight="semibold" noOfLines={1}>
//                         {image.name || `Image ${index + 1}`}
//                       </Text>
//                       <HStack spacing={2} mt={1}>
//                         <HStack spacing={1}>
//                           <FiUser size={10} />
//                           <Text fontSize="2xs" color="gray.600">
//                             {image.uploadedBy?.name || "Unknown"}
//                           </Text>
//                         </HStack>
//                       </HStack>
//                       <HStack spacing={1} mt={1}>
//                         <FiClock size={10} />
//                         <Text fontSize="2xs" color="gray.500">
//                           {formatDate(image.uploadedAt)}
//                         </Text>
//                       </HStack>
//                     </Box>
//                   </Box>
//                 ))}
//               </SimpleGrid>
//             )}
//           </DrawerBody>
//         </DrawerContent>
//       </Drawer>

//       <Modal isOpen={isModalOpen} onClose={onModalClose} size="xl" isCentered>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalCloseButton />
//           <ModalBody p={0}>
//             {selectedImage && (
//               <VStack spacing={0} align="stretch">
//                 <Image
//                   src={selectedImage.url}
//                   alt={selectedImage.name}
//                   objectFit="contain"
//                   maxH="70vh"
//                 />
//                 <Box p={4} bg="gray.50">
//                   <Text fontWeight="semibold" mb={2}>
//                     {selectedImage.name || "Untitled Image"}
//                   </Text>
//                   <HStack spacing={4}>
//                     <HStack>
//                       <FiUser />
//                       <Text fontSize="sm" color="gray.600">
//                         Uploaded by:{" "}
//                         {selectedImage.uploadedBy?.name || "Unknown"}
//                       </Text>
//                     </HStack>
//                     <HStack>
//                       <FiClock />
//                       <Text fontSize="sm" color="gray.600">
//                         {formatDate(selectedImage.uploadedAt)}
//                       </Text>
//                     </HStack>
//                   </HStack>
//                 </Box>
//               </VStack>
//             )}
//           </ModalBody>
//         </ModalContent>
//       </Modal>
//     </>
//   );
// };

// export default ImageGallery;
"use client";

import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  Text,
  Image,
  Box,
  Badge,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiImage, FiUser, FiClock, FiTrash2 } from "react-icons/fi";

const ImageGallery = ({ isOpen, onClose, images, isOwner, onRemoveImage }) => {
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState(null);
  const toast = useToast();

  const handleImageClick = (image) => {
    setSelectedImage(image);
    onModalOpen();
  };

  // UPDATED: Pass image._id instead of index
  const handleRemoveImage = (imageId, e) => {
    e.stopPropagation();
    if (onRemoveImage) {
      onRemoveImage(imageId);
      toast({
        title: "Image removed",
        status: "success",
        duration: 2000,
      });
    }
  };

  const formatDate = (date) => {
    try {
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent bg="purple.50">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" bg="white">
            <HStack>
              <FiImage color="#805AD5" size={20} />
              <Text>Document Images</Text>
              <Badge colorScheme="purple">{images?.length || 0}</Badge>
            </HStack>
          </DrawerHeader>
          <DrawerBody p={4}>
            {!images || images.length === 0 ? (
              <VStack py={10} spacing={3}>
                <FiImage size={48} color="#CBD5E0" />
                <Text color="gray.500">No images yet</Text>
                <Text fontSize="sm" color="gray.400" textAlign="center">
                  Images attached to the document will appear here
                </Text>
              </VStack>
            ) : (
              <SimpleGrid columns={2} spacing={4}>
                {images.map((image, index) => (
                  <Box
                    key={image._id || index}
                    borderWidth="1px"
                    borderRadius="lg"
                    overflow="hidden"
                    cursor="pointer"
                    onClick={() => handleImageClick(image)}
                    _hover={{
                      transform: "scale(1.05)",
                      boxShadow: "lg",
                    }}
                    transition="all 0.2s"
                    position="relative"
                    bg="white"
                  >
                    {isOwner && (
                      <Tooltip label="Remove image">
                        <IconButton
                          icon={<FiTrash2 />}
                          size="sm"
                          colorScheme="red"
                          position="absolute"
                          top={2}
                          right={2}
                          zIndex={2}
                          onClick={(e) => handleRemoveImage(image._id, e)}
                          aria-label="Remove image"
                        />
                      </Tooltip>
                    )}
                    <Image
                      src={image.url}
                      alt={image.name || `Image ${index + 1}`}
                      objectFit="cover"
                      w="full"
                      h="150px"
                    />
                    <Box p={2} bg="gray.50">
                      <Text fontSize="xs" fontWeight="semibold" noOfLines={1}>
                        {image.name || `Image ${index + 1}`}
                      </Text>
                      <HStack spacing={2} mt={1}>
                        <HStack spacing={1}>
                          <FiUser size={10} />
                          <Text fontSize="2xs" color="gray.600">
                            {image.uploadedBy?.name || "Unknown"}
                          </Text>
                        </HStack>
                      </HStack>
                      <HStack spacing={1} mt={1}>
                        <FiClock size={10} />
                        <Text fontSize="2xs" color="gray.500">
                          {formatDate(image.uploadedAt)}
                        </Text>
                      </HStack>
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Modal isOpen={isModalOpen} onClose={onModalClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={0}>
            {selectedImage && (
              <VStack spacing={0} align="stretch">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.name}
                  objectFit="contain"
                  maxH="70vh"
                />
                <Box p={4} bg="gray.50">
                  <Text fontWeight="semibold" mb={2}>
                    {selectedImage.name || "Untitled Image"}
                  </Text>
                  <HStack spacing={4}>
                    <HStack>
                      <FiUser />
                      <Text fontSize="sm" color="gray.600">
                        Uploaded by:{" "}
                        {selectedImage.uploadedBy?.name || "Unknown"}
                      </Text>
                    </HStack>
                    <HStack>
                      <FiClock />
                      <Text fontSize="sm" color="gray.600">
                        {formatDate(selectedImage.uploadedAt)}
                      </Text>
                    </HStack>
                  </HStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ImageGallery;