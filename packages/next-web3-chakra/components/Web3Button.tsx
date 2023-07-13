import { useContext } from "react";
import Web3Context from "../providers/Web3Provider/context";
import {
  Button,
  Image,
  useColorModeValue,
  Skeleton,
  Flex,
  chakra,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
const _Web3Button = ({ colorScheme, ...props }: { colorScheme?: string }) => {
  const web3Provider = useContext(Web3Context);
  const bgC = useColorModeValue("blue.500", "blue.800");
  return (
    <>
      {web3Provider.buttonText !== web3Provider.WALLET_STATES.CONNECTED && (
        <Button
          isDisabled={
            web3Provider.WALLET_STATES.UNKNOWN_CHAIN === web3Provider.buttonText
          }
          variant="link"
          colorScheme={
            web3Provider.buttonText === web3Provider.WALLET_STATES.CONNECTED
              ? "green"
              : web3Provider.WALLET_STATES.UNKNOWN_CHAIN ===
                web3Provider.buttonText
              ? "red"
              : colorScheme
          }
          onClick={() => web3Provider.onConnectWalletClick()}
          {...props}
        >
          {web3Provider.buttonText}
          {"  "}
          <Image
            pl={2}
            h="24px"
            src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg"
          />
        </Button>
      )}
      {web3Provider.buttonText === web3Provider.WALLET_STATES.CONNECTED && (
        <Flex
          bgColor={bgC}
          px={2}
          fontWeight="semibold"
          borderRadius="md"
          {...props}
        >
          <Skeleton
            isLoaded={!!web3Provider.account}
            h="100%"
            colorScheme={"red"}
            w="100%"
            borderRadius={"inherit"}
            startColor="red.500"
            endColor="blue.500"
            p={1}
          >
            {web3Provider.account}
          </Skeleton>
        </Flex>
      )}
    </>
  );
};

const Web3Button = chakra(_Web3Button);

export default Web3Button;
