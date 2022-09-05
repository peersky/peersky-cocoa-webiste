import React, { useContext, useDebugValue } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import useRouter from "../hooks/useRouter";
import Web3Context from "@peersky/next-web3-chakra/providers/Web3Provider/context";
import { Button, Image, useBreakpointValue } from "@chakra-ui/react";

const Home = () => {
  const bp = useBreakpointValue({ base: "md" });
  const [hydrated, setHydrated] = React.useState(false);
  const { query } = useRouter();
  const web3ctx = useContext(Web3Context);
  React.useEffect(() => {
    setHydrated(true);
  }, []);
  if (!hydrated) {
    // Returns null on first render, so the client and server match
    return null;
  }

  const action = query?.action;
  const gmSignature = query?.gmSignature;
  const message = query?.msg;

  // console.log(window.location.hostname);

  return (
    <div className={styles.container}>
      {/* <Navbar h="50px" maxH={"50px"} bgColor="red" /> */}
      {/* {web3ctx.account ?? "No account"}
      {web3ctx.buttonText !== web3ctx.WALLET_STATES.CONNECTED && (
        <Button
          isDisabled={
            web3ctx.WALLET_STATES.UNKNOWN_CHAIN === web3ctx.buttonText
          }
          colorScheme={
            web3ctx.buttonText === web3ctx.WALLET_STATES.CONNECTED
              ? "green"
              : web3ctx.WALLET_STATES.UNKNOWN_CHAIN === web3ctx.buttonText
              ? "red"
              : "green"
          }
          onClick={web3ctx.onConnectWalletClick}
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
      <br />
      {action}
      <br />
      {gmSignature}
      <br />
      {message} */}
    </div>
  );
};

export default Home;
