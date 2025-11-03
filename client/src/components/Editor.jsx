// "use client";

// import { useRef, useEffect } from "react";
// import { Box, useColorModeValue, useToast } from "@chakra-ui/react";
// import dynamic from "next/dynamic";
// import "react-quill-new/dist/quill.snow.css";

// const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// const Editor = ({
//   content,
//   onChange,
//   socket,
//   documentId,
//   isReadOnly = false,
//   onImageUpload,
//   isOwner = false,
// }) => {
//   const quillRef = useRef(null);
//   const bgColor = useColorModeValue("white", "gray.800");
//   const isRemoteChange = useRef(false);
//   const toast = useToast();

//   useEffect(() => {
//     const quill = quillRef.current?.getEditor();
//     if (!quill || !socket) return;

//     const handleRemoteChange = (data) => {
//       if (data.socketId === socket.id) return;

//       isRemoteChange.current = true;
//       const currentSelection = quill.getSelection();

//       if (data.content) {
//         quill.setContents(quill.clipboard.convert(data.content));
//       }

//       if (currentSelection) {
//         quill.setSelection(currentSelection);
//       }

//       isRemoteChange.current = false;
//     };

//     socket.on("text-change", handleRemoteChange);

//     return () => {
//       socket.off("text-change", handleRemoteChange);
//     };
//   }, [socket]);

//   const imageHandler = () => {
//     if (isReadOnly) {
//       toast({
//         title: "Read-only mode",
//         description: "You cannot add images in view-only mode",
//         status: "warning",
//         duration: 3000,
//       });
//       return;
//     }

//     if (!isOwner) {
//       toast({
//         title: "Permission denied",
//         description: "Only document owner can upload images",
//         status: "warning",
//         duration: 3000,
//       });
//       return;
//     }

//     const input = document.createElement("input");
//     input.setAttribute("type", "file");
//     input.setAttribute("accept", "image/*");
//     input.click();

//     input.onchange = async () => {
//       const file = input.files[0];
//       if (file) {
//         if (file.size > 5 * 1024 * 1024) {
//           toast({
//             title: "File too large",
//             description: "Please select an image smaller than 5MB",
//             status: "error",
//             duration: 3000,
//           });
//           return;
//         }

//         const reader = new FileReader();
//         reader.onload = (e) => {
//           const imageData = {
//             url: e.target.result,
//             name: file.name,
//             uploadedAt: new Date(),
//           };

//           if (onImageUpload) {
//             onImageUpload(imageData);
//           }

//           toast({
//             title: "Image added to gallery",
//             description: "Click the image icon to view all images",
//             status: "success",
//             duration: 3000,
//           });
//         };
//         reader.readAsDataURL(file);
//       }
//     };
//   };

//   const handleChange = (value, delta, source, editor) => {
//     if (!isRemoteChange.current && source === "user" && !isReadOnly) {
//       onChange(value);

//       if (socket) {
//         const selection = editor.getSelection();
//         if (selection) {
//           socket.emit("cursor-move", {
//             documentId,
//             range: selection,
//             index: selection.index,
//           });
//         }
//       }
//     }
//   };

//   const modules = {
//     toolbar: {
//       container: [
//         [{ header: [1, 2, 3, 4, 5, 6, false] }],
//         [{ font: [] }],
//         [{ size: [] }],
//         ["bold", "italic", "underline", "strike", "blockquote"],
//         [
//           { list: "ordered" },
//           { list: "bullet" },
//           { indent: "-1" },
//           { indent: "+1" },
//         ],
//         ["link", "image"],
//         [{ color: [] }, { background: [] }],
//         [{ align: [] }],
//         ["clean"],
//       ],
//       handlers: {
//         image: imageHandler,
//       },
//     },
//   };

//   const formats = [
//     "header",
//     "font",
//     "size",
//     "bold",
//     "italic",
//     "underline",
//     "strike",
//     "blockquote",
//     "list",
//     "indent",
//     "link",
//     "image",
//     "color",
//     "background",
//     "align",
//   ];

//   return (
//     <Box
//       bg={bgColor}
//       borderRadius="xl"
//       boxShadow="lg"
//       p={{ base: 2, md: 4 }}
//       minH={{ base: "400px", md: "600px" }}
//       border="1px solid"
//       borderColor="purple.100"
//     >
//       <style jsx global>{`
//         .ql-toolbar {
//           background: linear-gradient(
//             135deg,
//             #f6f8fb 0%,
//             #ffffff 100%
//           ) !important;
//           border: 1px solid #e2e8f0 !important;
//           border-radius: 12px 12px 0 0 !important;
//           padding: 12px !important;
//         }
//         .ql-container {
//           border: 1px solid #e2e8f0 !important;
//           border-radius: 0 0 12px 12px !important;
//           font-size: 16px !important;
//           min-height: 450px !important;
//         }
//         .ql-editor {
//           min-height: 450px !important;
//           padding: 20px !important;
//         }
//         .ql-toolbar button:hover,
//         .ql-toolbar button:focus,
//         .ql-toolbar .ql-picker-label:hover,
//         .ql-toolbar .ql-picker-label.ql-active {
//           color: #805ad5 !important;
//         }
//         .ql-toolbar button.ql-active {
//           color: #805ad5 !important;
//         }
//         .ql-stroke {
//           stroke: #4a5568 !important;
//         }
//         .ql-fill {
//           fill: #4a5568 !important;
//         }
//         .ql-toolbar button:hover .ql-stroke,
//         .ql-toolbar button.ql-active .ql-stroke {
//           stroke: #805ad5 !important;
//         }
//         .ql-toolbar button:hover .ql-fill,
//         .ql-toolbar button.ql-active .ql-fill {
//           fill: #805ad5 !important;
//         }
//         @media (max-width: 768px) {
//           .ql-toolbar {
//             padding: 8px !important;
//           }
//           .ql-container {
//             min-height: 350px !important;
//           }
//           .ql-editor {
//             min-height: 350px !important;
//             padding: 12px !important;
//             font-size: 14px !important;
//           }
//         }
//       `}</style>
//       <ReactQuill
//         ref={quillRef}
//         theme="snow"
//         value={content}
//         onChange={handleChange}
//         modules={modules}
//         formats={formats}
//         placeholder={
//           isReadOnly
//             ? "This document is read-only"
//             : "Start writing your document..."
//         }
//         readOnly={isReadOnly}
//       />
//     </Box>
//   );
// };

// export default Editor;

"use client";

import { useRef, useEffect } from "react";
import { Box, useColorModeValue, useToast } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const Editor = ({
  content,
  onChange,
  socket,
  documentId,
  isReadOnly = false,
  onImageUpload,
  isOwner = false,
}) => {
  const quillRef = useRef(null);
  const bgColor = useColorModeValue("white", "gray.800");
  const isRemoteChange = useRef(false);
  const toast = useToast();

  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill || !socket) return;

    const handleRemoteChange = (data) => {
      if (data.socketId === socket.id) return;

      isRemoteChange.current = true;
      const currentSelection = quill.getSelection();

      if (data.content) {
        quill.setContents(quill.clipboard.convert(data.content));
      }

      if (currentSelection) {
        quill.setSelection(currentSelection);
      }

      isRemoteChange.current = false;
    };

    socket.on("text-change", handleRemoteChange);

    return () => {
      socket.off("text-change", handleRemoteChange);
    };
  }, [socket]);

  const imageHandler = () => {
    if (isReadOnly) {
      toast({
        title: "Read-only mode",
        description: "You cannot add images in view-only mode",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (!isOwner) {
      toast({
        title: "Permission denied",
        description: "Only document owner can upload images",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Please select an image smaller than 5MB",
            status: "error",
            duration: 3000,
          });
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = {
            url: e.target.result,
            name: file.name,
            uploadedAt: new Date(),
          };

          // UPDATED: Just call onImageUpload, socket emission handled in parent
          if (onImageUpload) {
            onImageUpload(imageData);
          }

          toast({
            title: "Image added to gallery",
            description: "Image will be visible to all users",
            status: "success",
            duration: 3000,
          });
        };
        reader.readAsDataURL(file);
      }
    };
  };

  const handleChange = (value, delta, source, editor) => {
    if (!isRemoteChange.current && source === "user" && !isReadOnly) {
      onChange(value);

      if (socket) {
        const selection = editor.getSelection();
        if (selection) {
          socket.emit("cursor-move", {
            documentId,
            range: selection,
            index: selection.index,
          });
        }
      }
    }
  };

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: [] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        ["link", "image"],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ["clean"],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  };

  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "indent",
    "link",
    "image",
    "color",
    "background",
    "align",
  ];

  return (
    <Box
      bg={bgColor}
      borderRadius="xl"
      boxShadow="lg"
      p={{ base: 2, md: 4 }}
      minH={{ base: "400px", md: "600px" }}
      border="1px solid"
      borderColor="purple.100"
    >
      <style jsx global>{`
        .ql-toolbar {
          background: linear-gradient(
            135deg,
            #f6f8fb 0%,
            #ffffff 100%
          ) !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px 12px 0 0 !important;
          padding: 12px !important;
        }
        .ql-container {
          border: 1px solid #e2e8f0 !important;
          border-radius: 0 0 12px 12px !important;
          font-size: 16px !important;
          min-height: 450px !important;
        }
        .ql-editor {
          min-height: 450px !important;
          padding: 20px !important;
        }
        .ql-toolbar button:hover,
        .ql-toolbar button:focus,
        .ql-toolbar .ql-picker-label:hover,
        .ql-toolbar .ql-picker-label.ql-active {
          color: #805ad5 !important;
        }
        .ql-toolbar button.ql-active {
          color: #805ad5 !important;
        }
        .ql-stroke {
          stroke: #4a5568 !important;
        }
        .ql-fill {
          fill: #4a5568 !important;
        }
        .ql-toolbar button:hover .ql-stroke,
        .ql-toolbar button.ql-active .ql-stroke {
          stroke: #805ad5 !important;
        }
        .ql-toolbar button:hover .ql-fill,
        .ql-toolbar button.ql-active .ql-fill {
          fill: #805ad5 !important;
        }
        @media (max-width: 768px) {
          .ql-toolbar {
            padding: 8px !important;
          }
          .ql-container {
            min-height: 350px !important;
          }
          .ql-editor {
            min-height: 350px !important;
            padding: 12px !important;
            font-size: 14px !important;
          }
        }
      `}</style>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={
          isReadOnly
            ? "This document is read-only"
            : "Start writing your document..."
        }
        readOnly={isReadOnly}
      />
    </Box>
  );
};

export default Editor;