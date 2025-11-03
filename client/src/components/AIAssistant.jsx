"use client";

import { useState } from "react";
import {
  Box,
  VStack,
  Button,
  Heading,
  Text,
  Textarea,
  useToast,
  Divider,
  Badge,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FiCheckCircle,
  FiZap,
  FiFileText,
  FiEdit3,
  FiSun,
} from "react-icons/fi";
import api from "@/services/api";

const AIAssistant = ({ content, onApply, isReadOnly = false }) => {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState("");
  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const handleAIRequest = async (endpoint, feature) => {
    if (!content || content.length < 10) {
      toast({
        title: "Not enough content",
        description: "Please write at least 10 characters",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    setActiveFeature(feature);
    setResult("");

    try {
      const response = await api.post(`/ai/${endpoint}`, {
        text: content.replace(/<[^>]*>/g, "").substring(0, 2000),
      });

      if (response.data.success) {
        setResult(response.data.result);
        toast({
          title: "AI Processing Complete",
          status: "success",
          duration: 2000,
        });
      }
    } catch (error) {
      toast({
        title: "AI Request Failed",
        description: error.response?.data?.message || "Please try again",
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyResult = () => {
    if (isReadOnly) {
      toast({
        title: "Read-only mode",
        description: "You cannot apply changes in view-only mode",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    onApply(result);
    toast({
      title: "Applied to document",
      status: "success",
      duration: 2000,
    });
  };

  const aiFeatures = [
    {
      id: "grammar",
      name: "Grammar Check",
      icon: FiCheckCircle,
      color: "green",
      endpoint: "grammar-check",
      description: "Check for grammar and spelling errors",
    },
    {
      id: "enhance",
      name: "Enhance Writing",
      icon: FiZap,
      color: "purple",
      endpoint: "enhance",
      description: "Improve clarity and professionalism",
    },
    {
      id: "summarize",
      name: "Summarize",
      icon: FiFileText,
      color: "blue",
      endpoint: "summarize",
      description: "Create a concise summary",
    },
    {
      id: "complete",
      name: "Auto-Complete",
      icon: FiEdit3,
      color: "orange",
      endpoint: "complete",
      description: "Continue your writing",
    },
    {
      id: "suggestions",
      name: "Suggestions",
      icon: FiSun,
      color: "yellow",
      endpoint: "suggestions",
      description: "Get improvement suggestions",
    },
  ];

  return (
    <Box
      bg={bgColor}
      borderRadius="xl"
      boxShadow="lg"
      p={6}
      borderWidth="1px"
      borderColor={borderColor}
      position="sticky"
      top="100px"
      maxH="calc(100vh - 120px)"
      overflowY="auto"
    >
      <VStack align="stretch" spacing={4}>
        <Heading size="md" color="purple.600">
          AI Writing Assistant
        </Heading>
        <Text fontSize="sm" color="gray.600">
          Select an AI feature to improve your writing
        </Text>

        {isReadOnly && (
          <Badge colorScheme="orange" p={2} borderRadius="md">
            View-only mode - AI results cannot be applied
          </Badge>
        )}

        <Divider />

        {aiFeatures.map((feature) => (
          <Button
            key={feature.id}
            leftIcon={<feature.icon />}
            colorScheme={feature.color}
            variant={activeFeature === feature.id ? "solid" : "outline"}
            onClick={() => handleAIRequest(feature.endpoint, feature.id)}
            isLoading={loading && activeFeature === feature.id}
            loadingText="Processing..."
            size="md"
            justifyContent="flex-start"
            _hover={{
              transform: "translateX(4px)",
            }}
            transition="all 0.2s"
          >
            <VStack align="start" spacing={0} flex={1}>
              <Text fontWeight="semibold">{feature.name}</Text>
              <Text fontSize="xs" fontWeight="normal">
                {feature.description}
              </Text>
            </VStack>
          </Button>
        ))}

        {result && (
          <>
            <Divider />
            <Box>
              <HStack justify="space-between" mb={2}>
                <Badge colorScheme="purple">AI Result</Badge>
              </HStack>
              <Textarea
                value={result}
                onChange={(e) => setResult(e.target.value)}
                minH="200px"
                placeholder="AI results will appear here..."
                fontSize="sm"
              />
              <Button
                size="sm"
                colorScheme="purple"
                mt={2}
                width="full"
                onClick={handleApplyResult}
                isDisabled={isReadOnly}
              >
                {isReadOnly ? "Cannot Apply (Read-Only)" : "Apply to Document"}
              </Button>
            </Box>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default AIAssistant; 