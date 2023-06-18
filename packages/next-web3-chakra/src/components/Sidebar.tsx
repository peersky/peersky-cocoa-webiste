import { Sidebar, Menu } from "react-pro-sidebar";
import { useContext } from "react";
import {
  Flex,
  Image,
  IconButton,
  Button,
  Divider,
  Text,
  Badge,
  useColorMode,
  useColorModeValue,
  useTheme,
  Skeleton,
  Box,
} from "@chakra-ui/react";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import moment from "moment";
import ChainSelector from "./ChainSelector";
import UIContext from "../providers/UIProvider/context";
import Web3Context from "../providers/Web3Provider/context";

const _Sidebar = ({
  initialLogo = undefined,
  selectorSchema = undefined,
  metamaskSchema = undefined,
  colorScheme = undefined,
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const ui = useContext(UIContext);
  const web3ctx = useContext(Web3Context);
  const theme = useTheme();
  const { components } = theme;
  const themeLogo = theme.logo;
  const bgC = useColorModeValue(
    `${colorScheme ?? components.Navbar.colorScheme}.0`,
    `${colorScheme ?? components.Navbar.colorScheme}.800`
  );
  return (
    <Sidebar
      width="280px"
      backgroundColor={"#006D99"}
      breakPoint="lg"
      hidden={!ui.sidebarVisible}
    >
      <Menu>
        <Box p={4} alignItems="center">
          <Divider borderColor="blue.600" />
          {!!ui.webSiteConfig.ENABLE_WEB3 && (
            <>
              {" "}
              {web3ctx.buttonText !== web3ctx.WALLET_STATES.CONNECTED && (
                <Button
                  isDisabled={
                    web3ctx.WALLET_STATES.UNKNOWN_CHAIN === web3ctx.buttonText
                  }
                  variant="link"
                  colorScheme={
                    web3ctx.buttonText === web3ctx.WALLET_STATES.CONNECTED
                      ? "green"
                      : web3ctx.WALLET_STATES.UNKNOWN_CHAIN ===
                        web3ctx.buttonText
                      ? "red"
                      : "metamaskSchema"
                  }
                  onClick={() => web3ctx.onConnectWalletClick()}
                >
                  {web3ctx.buttonText}
                  {"  "}
                  <Image
                    pl={2}
                    h="24px"
                    src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg"
                  />
                </Button>
              )}
              {web3ctx.buttonText === web3ctx.WALLET_STATES.CONNECTED && (
                <Flex>
                  <code>
                    <Badge
                      colorScheme={metamaskSchema ?? "blue"}
                      variant={"subtle"}
                      size="md"
                      fontSize="16px"
                      borderRadius={"md"}
                      mr={2}
                      p={0}
                    >
                      <Skeleton
                        isLoaded={!!web3ctx.account}
                        h="100%"
                        colorScheme={"red"}
                        w="100%"
                        borderRadius={"inherit"}
                        startColor="red.500"
                        endColor="blue.500"
                        p={1}
                      >
                        {web3ctx.account}
                      </Skeleton>
                    </Badge>
                  </code>
                </Flex>
              )}
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
        </Box>
      </Menu>
    </Sidebar>
  );
};

export default _Sidebar;
