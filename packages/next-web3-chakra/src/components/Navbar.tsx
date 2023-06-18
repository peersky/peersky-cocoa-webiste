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
  Badge,
  Skeleton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
  useColorMode,
  useColorModeValue,
  useTheme,
} from "@chakra-ui/react";
import { ChevronDownIcon, HamburgerIcon } from "@chakra-ui/icons";
import UIContext from "../providers/UIProvider/context";
import RouteButton from "./RouteButton";
import router from "next/router";
import Web3Context from "../providers/Web3Provider/context";
import ChainSelector from "./ChainSelector";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { SiteMapItem, SiteMapItemType } from "../types";
import Web3Button from "./Web3Button";

const _Navbar = ({
  selectorSchema,
  metamaskSchema,
  colorScheme,
  ...props
}: {
  colorScheme?: string;
  selectorSchema?: string;
  metamaskSchema?: string;
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isMobileView, webSiteConfig, setSidebarToggled, sidebarToggled } =
    useContext(UIContext);
  const sitemap = webSiteConfig.SITEMAP;
  const web3Provider = useContext(Web3Context);
  const theme = useTheme();
  const { components } = theme;
  const themeLogo = theme.logo;
  const bgC = useColorModeValue(
    `${colorScheme ?? components.Navbar.colorScheme}.0`,
    `${colorScheme ?? components.Navbar.colorScheme}.800`
  );
  return (
    <Flex
      {...props}
      // transpar
      bgColor={bgC}
      boxShadow={["md", "lg"]}
      zIndex={100}
      shadow={"outline"}
      alignItems="center"
      id="Navbar"
      // bgColor={useColorModeValue("blue.200", "grey.900")}
      minH={isMobileView ? "89px" : "62px"}
      maxH={isMobileView ? "89px" : "62px"}
      direction="row"
      w="100%"
      // overflowX="hidden"
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
        {!isMobileView && (
          <>
            {!!webSiteConfig.ENABLE_WEB3 && (
              <>
                <Web3Button colorScheme={metamaskSchema} />
                <ChainSelector selectorScheme={selectorSchema} />
              </>
            )}
            <IconButton
              alignSelf="flex-start"
              aria-label="Menu"
              colorScheme="blue"
              size="sm"
              variant="solid"
              onClick={toggleColorMode}
              icon={colorMode === "light" ? <MdDarkMode /> : <MdLightMode />}
            />
          </>
        )}
      </Flex>
    </Flex>
    // <Flex w="100px" h="100px" bgColor={"red.100"}>1</Flex>
  );
};
const Navbar = chakra(_Navbar);
export default Navbar;
