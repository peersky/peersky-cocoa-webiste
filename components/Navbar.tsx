import React, { useContext } from "react";
import { Link } from "@chakra-ui/next-js";
import {
  chakra,
  Button,
  Image,
  Text,
  ButtonGroup,
  Spacer,
  IconButton,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  useColorModeValue,
  useTheme,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import UIContext from "../providers/UIProvider/context";
import RouteButton from "./RouteButton";
import router from "next/router";
import { SiteMapItem, SiteMapItemType } from "../types";

interface NavbarProps {
  selectorSchema?: string;
  metamaskSchema?: string;
  colorScheme?: string;
  [x: string]: any;
}

const Navbar_ = ({
  selectorSchema,
  metamaskSchema,
  colorScheme,
  ...props
}: NavbarProps) => {
  const { isMobileView, webSiteConfig } = useContext(UIContext);
  const { colorMode, toggleColorMode } = useColorMode();
  const sitemap = webSiteConfig.SITEMAP;
  const theme = useTheme();
  const themeLogo = theme.logo;
  const bgC = useColorModeValue(
    "rgba(255, 255, 255, 0.78)",
    "rgba(6, 10, 24, 0.78)"
  );
  const borderBc = useColorModeValue("grey.200", "grey.700");
  const wordmarkColor = useColorModeValue("grey.800", "grey.100");
  const toggleHover = useColorModeValue("grey.100", "grey.700");
  return (
    <Flex
      {...props}
      bgColor={bgC}
      sx={{ backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}
      borderBottomWidth="1px"
      borderBottomColor={borderBc}
      zIndex={100}
      alignItems="center"
      id="Navbar"
      minH="64px"
      maxH="64px"
      direction="row"
      w="100%"
      position={"fixed"}
      transition={"0.3s"}
      top={"0"}
      px={isMobileView ? 4 : 8}
    >
      <Link href="/">
        <HStack spacing={3} alignItems="center" cursor="pointer">
          <Image
            h="34px"
            w="34px"
            src={useColorModeValue(
              `/${webSiteConfig.DEFAULT_LOGO ?? themeLogo}`,
              `/inverted-${webSiteConfig.DEFAULT_LOGO ?? themeLogo}`
            )}
            alt="Peersky logo"
          />
          {!isMobileView && (
            <Text
              fontFamily="heading"
              fontWeight="500"
              fontSize="xl"
              letterSpacing="-0.02em"
              color={wordmarkColor}
            >
              Peersky
            </Text>
          )}
        </HStack>
      </Link>

      <Spacer />

      {/* TODO(slop): add test for new `ternary` branch (no paired test file in this patch) */}
      <HStack spacing={isMobileView ? 2 : 6} alignItems="center">
        <ButtonGroup variant="link" spacing={5}>
          {sitemap
            ?.filter(
              (item: SiteMapItem) =>
                item.type != SiteMapItemType.FOOTER_CATEGORY
            )
            ?.map((item: any, idx: number) => {
              return (
                <React.Fragment key={`Fragment-${idx}`}>
                  {!item.children && (
                    <RouteButton
                      key={`${idx}-${item.title}-landing-all-links`}
                      variant="link"
                      href={item.path}
                      isActive={!!(router.pathname === item.path)}
                      fontWeight="500"
                      fontSize="md"
                      textDecoration="none"
                      _hover={{ textDecoration: "none", opacity: 0.7 }}
                    >
                      {item.title}
                    </RouteButton>
                  )}
                  {item.children && (
                    <Menu colorScheme={"blue"} matchWidth={true} gutter={0}>
                      <MenuButton
                        h="32px"
                        as={Button}
                        colorScheme={"blue"}
                        w="180px"
                        rightIcon={<ChevronDownIcon />}
                        variant="menu"
                      >
                        {item.title}
                      </MenuButton>
                      <MenuList zIndex={100} minW="0px" mt={0} pt={0}>
                        {item.children.map((child: any, idx: number) => (
                          <Link
                            shallow={true}
                            key={`${idx}-${item.title}-menu-links`}
                            href={child.path}
                          >
                            <MenuItem key={`menu-${idx}`} m={0}>
                              {child.title}
                            </MenuItem>
                          </Link>
                        ))}
                      </MenuList>
                    </Menu>
                  )}
                </React.Fragment>
              );
            })}
        </ButtonGroup>

        <IconButton
          /* TODO(slop): add test for new `ternary` branch (no paired test file in this patch) */
          aria-label={colorMode === "light" ? "Switch to dark mode" : "Switch to light mode"}
          onClick={toggleColorMode}
          variant="ghost"
          size="sm"
          fontSize="lg"
          color={wordmarkColor}
          _hover={{ bg: toggleHover }}
          /* TODO(slop): add test for new `ternary` branch (no paired test file in this patch) */
          icon={colorMode === "light" ? <MdDarkMode /> : <MdLightMode />}
        />
      </HStack>
    </Flex>
  );
};
const Navbar = chakra(Navbar_);
export default Navbar;
