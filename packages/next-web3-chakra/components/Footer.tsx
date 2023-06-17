import React, { useContext } from "react";
import { Link } from "@chakra-ui/next-js";
import {
  Text,
  Box,
  Container,
  SimpleGrid,
  Stack,
  Image as ChakraImage,
  useColorModeValue,
  VisuallyHidden,
  chakra,
  useTheme,
  Image,
  Flex,
} from "@chakra-ui/react";
import { FaGithub, FaTwitter, FaDiscord } from "react-icons/fa";
import moment from "moment";
import UIContext from "../providers/UIProvider/context";
const LINKS_SIZES = {
  fontWeight: "300",
  fontSize: "lg",
};

const ListHeader = ({ children }: any) => {
  return (
    <Text
      fontWeight={"500"}
      fontSize={"lg"}
      mb={2}
      borderBottom="1px"
      // borderColor="blue.700"
      // textColor="blue.500"
    >
      {children}
    </Text>
  );
};

const SocialButton = ({ children, label, href }: any) => {
  return (
    <chakra.button
      bg={useColorModeValue("blackAlpha.100", "whiteAlpha.100")}
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
        bg: useColorModeValue("blackAlpha.200", "whiteAlpha.200"),
      }}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};

const Footer = ({
  colorScheme,
  initialLogo,
  ...props
}: {
  colorScheme?: string;
  initialLogo?: string;
}) => {
  const ui = useContext(UIContext);
  const theme = useTheme();
  const { components } = theme;
  const themeLogo = theme.logo;
  const bgC = useColorModeValue(
    `${colorScheme ?? components.Navbar.colorScheme}.0`,
    `${colorScheme ?? components.Navbar.colorScheme}.800`
  );
  return (
    <Box
      className="Footer"
      {...props}
      bgColor={bgC}
      color={useColorModeValue("grey.900", "grey.200")}
      // position={"absolute"}
      // bottom={0}
      // left={0}
      // right={0}
    >
      <Container as={Stack} maxW={"8xl"} py={10}>
        <SimpleGrid
          templateColumns={{ sm: "1fr 1fr", md: "2fr 1fr 1fr 1fr 1fr" }}
          spacing={8}
        >
          <Stack spacing={6}>
            <Flex
              pl={ui.isMobileView ? 2 : 8}
              justifySelf="flex-start"
              // h="50px"
              // w="50px"
              py={1}
              w="200px"
              // minW="200px"
              flexGrow={1}
              id="Logo Container"
            >
              <Link href="/">
                <Image
                  // as={Link}
                  // href="/"
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
            <Text fontSize={"sm"}>
              © {moment().year()} {ui.webSiteConfig.COPYRIGHT_NAME} All rights
              reserved
            </Text>
            <Stack direction={"row"} spacing={6}>
              {ui.webSiteConfig.TWITTER && (
                <SocialButton label={"Twitter"} href={ui.webSiteConfig.TWITTER}>
                  <FaTwitter />
                </SocialButton>
              )}
              {ui.webSiteConfig.GITHUB && (
                <SocialButton label={"Github"} href={ui.webSiteConfig.GITHUB}>
                  <FaGithub />
                </SocialButton>
              )}
              {ui.webSiteConfig.DISCORD && (
                <SocialButton label={"Discord"} href={ui.webSiteConfig.DISCORD}>
                  <FaDiscord />
                </SocialButton>
              )}
            </Stack>
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
                        key={`footer-list-link-item-${colIndex}-col-${colIndex}`}
                      >
                        {category.title}
                      </Link>
                      {category.children?.map((linkItem, linkItemIndex) => {
                        return (
                          <Link
                            {...LINKS_SIZES}
                            href={linkItem.path}
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
