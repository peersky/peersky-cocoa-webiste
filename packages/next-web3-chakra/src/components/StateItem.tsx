import {
  chakra,
  Flex,
  Editable as _Editable,
  EditablePreview,
  EditableInput,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Skeleton,
  Box,
  Button,
  Switch,
  Spacer,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { AbiItem } from "web3-utils";
import Web3Context from "../providers/Web3Provider/context";
import { useQuery } from "react-query";
import dynamic from "next/dynamic";
import Web3MethodField from "./We3MethodField";
const ReactJson = dynamic(() => import("react-json-view"), {
  ssr: false,
});
import useABIItemForm from "../hooks/useAbiItemForm";
import { ethers } from "ethers";
import { JsonFragment } from "@ethersproject/abi";

const _StateItem = ({
  abiItem,
  address,
  args,
}: {
  abiItem: JsonFragment;
  address: string;
  args?: any;
}) => {
  const web3ctx = useContext(Web3Context);

  const { state, dispatchArguments, getArgs } = useABIItemForm(abiItem);

  console.dir(state);
  const getItemState = async () => {
    setIsEnabled(false);
    const contract = new ethers.Contract(
      address,
      [abiItem] as any as string,
      web3ctx.provider
    );

    let response;
    if (abiItem?.inputs?.length !== 0) {
      const _args = getArgs();

      response =
        abiItem.name &&
        (await contract.functions[abiItem.name](
          abiItem.inputs?.length == 1 ? _args[0] : _args
        ));
    } else {
      response = abiItem.name && (await contract.functions[abiItem.name]());
    }

    return response;
  };

  const [isEnabled, setIsEnabled] = React.useState(
    abiItem?.inputs?.length === 0 ? true : false
  );
  React.useEffect(() => {
    setIsEnabled(abiItem?.inputs?.length === 0 ? true : false);
  }, [address]);

  const response = useQuery(
    ["abiItemState", address, abiItem.name],
    getItemState,
    {
      enabled: isEnabled && !!web3ctx.account,
      retry(failureCount, error) {
        return false;
      },
      onSettled: () => {
        setIsEnabled(false);
      },
    }
  );
  const handleKeypress = (e: any) => {
    //it triggers by pressing the enter key
    if (e.charCode === 13) {
      response.remove();
      setIsEnabled(true);
    }
  };
  const [allBytesAreStrings, setAllBytesAreStrings] = React.useState(false);

  return (
    <Flex
      direction={"column"}
      p={4}
      bgColor={useColorModeValue("blue.200", "blue.800")}
      my={4}
    >
      <Flex direction={"row"}>
        <Flex>{abiItem.name}</Flex> <Spacer />
        {abiItem.inputs?.length !== 0 && (
          <Switch
            size="sm"
            ml={4}
            justifySelf={"flex-end"}
            aria-label="as string"
            onChange={() => {
              setAllBytesAreStrings((old) => {
                dispatchArguments({
                  allBytesAsStrings: !old,
                });
                return !old;
              });
            }}
          >
            All Bytes as strings
          </Switch>
        )}
      </Flex>
      {state.inputs?.length !== 0 && (
        <Box>
          {state?.inputs?.map((item, idx) => {
            return (
              <Box key={`state-${idx}`}>
                <Web3MethodField
                  abiItem={item}
                  uiFragment={state.ui[idx]}
                  index={idx}
                  dispatchArguments={dispatchArguments}
                  onKeyPress={handleKeypress}
                />
              </Box>
            );
          })}
          <Button
            onClick={() => {
              response.remove();
              setIsEnabled(true);
            }}
            isLoading={response.isLoading}
            alignSelf={"center"}
            variant={"solid"}
            size="sm"
            colorScheme={"orange"}
          >
            Submit
          </Button>
        </Box>
      )}

      <Skeleton isLoaded={!response.isLoading}>
        {response?.data && (
          <Box cursor="crosshair" overflowWrap={"break-word"}>
            {typeof response.data !== "string" && (
              <ReactJson
                name="response"
                collapsed={false}
                style={{
                  cursor: "text",
                  lineBreak: "anywhere",
                }}
                src={response?.data}
                theme="harmonic"
                displayDataTypes={false}
                displayObjectSize={false}
                collapseStringsAfterLength={128}
              />
            )}
            {typeof response.data === "string" && response.data}
          </Box>
        )}
      </Skeleton>
    </Flex>
  );
};

const StateItem = chakra(_StateItem);
export default StateItem;
