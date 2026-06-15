import React, { useContext } from "react";
import { Link } from "@chakra-ui/next-js";
import {
  chakra,
  Button,
  Image,
  ButtonGroup,
  Spacer,
  IconButton,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  useTheme,
} from "@chakra-ui/react";
import { ChevronDownIcon, HamburgerIcon } from "@chakra-ui/icons";
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
  const { isMobileView, webSiteConfig, setSidebarToggled, sidebarToggled } =
    useContext(UIContext);
  const sitemap = webSiteConfig.SITEMAP;
  const theme = useTheme();
  const themeLogo = theme.logo;
  const bgC = useColorModeValue(
    "rgba(244, 239, 230, 0.85)",
    "rgba(21, 18, 13, 0.85)"
  );
  const borderBc = useColorModeValue("grey.200", "grey.700");
  return (
    <Flex
      {...props}
      bgColor={bgC}
      sx={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      borderBottomWidth="1px"
      borderBottomColor={borderBc}
      zIndex={100}
      alignItems="center"
      id="Navbar"
      minH={isMobileView ? "89px" : "62px"}
      maxH={isMobileView ? "89px" : "62px"}
      direction="row"
      w="100%"
      position={"fixed"}
      transition={"0.3s"}
      top={"0"}
    >
      {isMobileView && (
        <>
          <IconButton
            alignSelf="flex-start"
            aria-label="Menu"
            colorScheme="blue"
            minH={isMobileView ? "89px" : "62px"}
            borderRadius="0"
            m={0}
            variant="solid"
            onClick={() => setSidebarToggled(!sidebarToggled)}
            icon={<HamburgerIcon />}
          />
        </>
      )}
      <Flex
        pl={isMobileView ? 2 : 8}
        justifySelf="flex-start"
        h="50px"
        w="50px"
        py={1}
        // w="200px"
        // minW="200px"
        flexGrow={1}
        id="Logo Container"
      >
        <Link href="/">
          <Image
            // as={Link}
            // w="fit-content"
            h="100%"
            justifyContent="left"
            src={useColorModeValue(
              `/${webSiteConfig.DEFAULT_LOGO ?? themeLogo}`,
              `/inverted-${webSiteConfig.DEFAULT_LOGO ?? themeLogo}`
            )}
            // href="/"
            alt="Logo"
          />
        </Link>
      </Flex>

      <Flex pr={14} justifyItems="flex-end" flexGrow={1} alignItems="center">
        <Spacer />
        <ButtonGroup variant="solid" spacing={4} pr={16}>
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
                      {/* <Portal> */}
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
                      {/* </Portal> */}
                    </Menu>
                  )}
                </React.Fragment>
              );
            })}
        </ButtonGroup>

      </Flex>
    </Flex>
    // <Flex w="100px" h="100px" bgColor={"red.100"}>1</Flex>
  );
};
const Navbar = chakra(Navbar_);
export default Navbar;
