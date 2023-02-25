import React from "react";
import {
  Stack,
  Heading,
  chakra,
  Box,
  Link as ChakraLink,
  Flex,
  ChakraProps,
  As,
} from "@chakra-ui/react";
import { Link } from "@chakra-ui/next-js";
import Web3 from "web3";
const PixelsCard = ({
  text,
  heading,
  link,
  textColor,
  level,
  disabled,
  ...props
}: {
  text: string;
  heading: string;
  link: string;
  textColor: string;
  level: As;
  disabled: boolean;
}) => {
  const web3 = new Web3();
  const pixelseed = web3.utils.keccak256(heading);
  const dimensions = Math.floor(pixelseed.length / 4);
  const boxSize = 20;
  return (
    <Link href={link} shallow scroll>
      <Stack
        bgColor={disabled ? "grey.1600" : undefined}
        {...props}
        transition={"1s"}
        spacing={1}
        px={1}
        alignItems="center"
        borderRadius="12px"
        borderColor="grey.100"
        borderWidth={"1px"}
        _hover={{ transform: "scale(1.05)", transition: "0.42s" }}
        m={2}
        pb={2}
        // h="auto"
      >
        <Flex
          flexWrap="wrap"
          w={`Math${Math.floor((dimensions * boxSize) / 4)}px`}
          h={`${Math.floor((dimensions * boxSize) / 4)}px`}
          maxW={`${Math.floor((dimensions * boxSize) / 4)}px`}
        >
          {Array.from(Array(pixelseed.length), (v, i) => {
            return (
              <Box
                w={`${boxSize}px`}
                h={`${boxSize}px`}
                bgColor={`#${pixelseed.slice(1 + i * 4, 1 + i * 4 + 4)}`}
                key={`${i}`}
              />
            );
          })}
        </Flex>
        <Heading
          size={heading.length > 32 ? "sm" : "md"}
          textAlign="center"
          as={level ?? "h2"}
          _hover={{}}
        >
          {heading}
        </Heading>
        <chakra.span
          textAlign={"center"}
          textColor={textColor ?? "blue.400"}
          px={2}
        >
          {text}
        </chakra.span>
      </Stack>
    </Link>
  );
};

export default chakra(PixelsCard);
