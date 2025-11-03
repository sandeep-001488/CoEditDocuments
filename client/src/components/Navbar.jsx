"use client";

import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  HStack,
  Avatar,
} from "@chakra-ui/react";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
  MenuSeparator,
} from "@chakra-ui/react";
import NextLink from "next/link";
import useAuth from "@/app/hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <Box bg={{ base: "white", _dark: "gray.800" }} px={4} boxShadow="sm">
      <Flex
        h={16}
        alignItems="center"
        justifyContent="space-between"
        maxW="container.xl"
        mx="auto"
      >
        <HStack spacing={8} alignItems="center">
          <NextLink href={user ? "/dashboard" : "/"} passHref>
            <Text fontSize="2xl" fontWeight="bold" color="brand.500">
              CoEdit
            </Text>
          </NextLink>
        </HStack>
        <Flex alignItems="center">
          {user ? (
            <MenuRoot>
              <MenuTrigger asChild>
                <Button
                  rounded="full"
                  variant="ghost"
                  cursor="pointer"
                  minW={0}
                  p={0}
                >
                  <Avatar
                    size="sm"
                    name={user.name}
                    bg="brand.400"
                    color="white"
                  />
                </Button>
              </MenuTrigger>
              <MenuContent>
                <MenuItem asChild>
                  <NextLink href="/dashboard">Dashboard</NextLink>
                </MenuItem>
                <MenuItem asChild>
                  <NextLink href="/profile">Profile</NextLink>
                </MenuItem>
                <MenuSeparator />
                <MenuItem onClick={logout} color="red.500">
                  Sign Out
                </MenuItem>
              </MenuContent>
            </MenuRoot>
          ) : (
            <Stack direction="row" spacing={4}>
              <Button
                as={NextLink}
                href="/login"
                fontSize="sm"
                fontWeight={400}
                variant="ghost"
              >
                Sign In
              </Button>
              <Button
                as={NextLink}
                href="/register"
                fontSize="sm"
                fontWeight={600}
                colorScheme="brand"
              >
                Sign Up
              </Button>
            </Stack>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
