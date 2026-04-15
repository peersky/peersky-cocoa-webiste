import React, { useContext } from "react";
import { Link } from "@chakra-ui/next-js";
import {
  Text,
  Box,
  Container,
  SimpleGrid,
  Stack,
  useColorModeValue,
  VisuallyHidden,
  chakra,
  useTheme,
  Image,
  Flex,
} from "@chakra-ui/react";
import { FaGithub, FaTwitter, FaDiscord } from "react-icons/fa"
import moment from "moment";
import UIContext from "../providers/UIProvider/context";
const LINKS_SIZES = {
  fontWeight: "400",
  fontSize: "sm",
};

const ListHeader = ({ children }: any) => {
  return (
    <Text
      fontWeight={"600"}
      fontSize={"sm"}
      textTransform="uppercase"
      letterSpacing="0.05em"
      mb={3}
      color={useColorModeValue("grey.600", "grey.300")}
    >
      {children}
    </Text>
  );
};

const SocialButton = ({ children, label, href }: any) => {
  return (
    <chakra.button
      bg={useColorModeValue("grey.200", "whiteAlpha.100")}
      rounded={"full"}
      w={8}
      h={8}
      cursor={"pointer"}
      as={"a"}
      href={href}
      display={"inline-flex"}
      alignItems={"center"}
      justifyContent={"center"}
      transition={"background 0.3s ease"}
      _hover={{
        bg: useColorModeValue("grey.300", "whiteAlpha.200"),
      }}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};

interface FooterProps {
  colorScheme?: string;
  initialLogo?: string;
  [x: string]: any;
}

const Footer = ({ colorScheme, initialLogo, ...props }: FooterProps) => {
  const ui = useContext(UIContext);
  const theme = useTheme();
  const { components } = theme;
  const themeLogo = theme.logo;
  return (
    <Box
      className="Footer"
      {...props}
      bgColor={useColorModeValue("grey.100", "grey.800")}
      borderTopWidth="1px"
      borderTopColor={useColorModeValue("grey.200", "grey.700")}
      color={useColorModeValue("grey.600", "grey.300")}
    >
      <Container as={Stack} maxW={"8xl"} py={12} px={8}>
        <SimpleGrid
          templateColumns={{ sm: "1fr 1fr", md: "2fr 1fr 1fr 1fr 1fr" }}
          spacing={8}
        >
          <Stack spacing={6}>
            <Flex
              pl={ui.isMobileView ? 2 : 8}
              justifySelf="flex-start"
              py={1}
              w="200px"
              flexGrow={1}
              id="Logo Container"
            >
              <Link href="/">
                <Image
                  w="fit-content"
                  h="auto"
                  justifyContent="left"
                  src={useColorModeValue(
                    `/${initialLogo ?? themeLogo}`,
                    `/inverted-${initialLogo ?? themeLogo}`
                  )}
                  alt="Logo"
                />
              </Link>
            </Flex>
            <Text fontSize={"sm"} color={useColorModeValue("grey.500", "grey.400")}>
              © {moment().year()} {ui.webSiteConfig.COPYRIGHT_NAME} All rights
              reserved
            </Text>
          </Stack>
          {ui.webSiteConfig.SITEMAP.length > 0 &&
            Object.values(ui.webSiteConfig.SITEMAP).map(
              (category, colIndex) => {
                return (
                  <Stack
                    align={"flex-start"}
                    key={`footer-list-column-${colIndex}`}
                  >
                    <>
                      <Link
                        {...LINKS_SIZES}
                        href={category.path}
                        _hover={{
                          color: useColorModeValue("grey.900", "whiteAlpha.900"),
                        }}
                        key={`footer-list-link-item-${colIndex}-col-${colIndex}`}
                      >
                        {category.title}
                      </Link>
                      {category.children?.map((linkItem, linkItemIndex) => {
                        return (
                          <Link
                            {...LINKS_SIZES}
                            href={linkItem.path}
                            _hover={{
                              color: useColorModeValue("grey.900", "whiteAlpha.900"),
                            }}
                            key={`footer-list-link-item-${linkItemIndex}-col-${colIndex}`}
                          >
                            {linkItem.title}
                          </Link>
                        );
                      })}
                    </>
                  </Stack>
                );
              }
            )}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Footer;
