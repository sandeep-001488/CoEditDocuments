"use client";

import { useRef, useEffect } from "react";
import { Box, useColorModeValue } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const Editor = ({
  content,
  onChange,
  socket,
  documentId,
  isReadOnly = false,
}) => {
  const quillRef = useRef(null);
  const bgColor = useColorModeValue("white", "gray.800");
  const isRemoteChange = useRef(false);

  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill || !socket) return;

    // Handle text changes from other users
    const handleRemoteChange = (data) => {
      if (data.socketId === socket.id) return; // Ignore own changes

      isRemoteChange.current = true;
      const currentSelection = quill.getSelection();

      // Apply remote changes
      if (data.content) {
        quill.setContents(quill.clipboard.convert(data.content));
      }

      // Restore cursor position
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

  const handleChange = (value, delta, source, editor) => {
    // Only propagate local changes
    if (!isRemoteChange.current && source === "user") {
      onChange(value);

      // Emit cursor position
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
    toolbar: [
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
      ["link", "image", "video"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["clean"],
    ],
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
    "video",
    "color",
    "background",
    "align",
  ];

  return (
    <Box bg={bgColor} borderRadius="xl" boxShadow="lg" p={4} minH="600px">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder="Start writing your document..."
        readOnly={isReadOnly}
        style={{
          height: "500px",
          marginBottom: "42px",
        }}
      />
    </Box>
  );
};

export default Editor;
