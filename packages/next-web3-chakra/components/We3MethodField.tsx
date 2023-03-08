import React, { useContext } from "react";
import {
  Box,
  Flex,
  FormLabel,
  InputGroup,
  Input,
  Switch,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Heading,
  Spacer,
} from "@chakra-ui/react";
import Web3Context from "../providers/Web3Provider/context";
import BN from "bn.js";
import FileUpload from "./FileUpload";
import Papa from "papaparse";
import { AbiInput } from "web3-utils";
import { ethers } from "ethers";
const BoolInputItem = ({
  inputItem,
  dispatchArguments,
  index,
}: {
  inputItem: any;
  dispatchArguments: React.Dispatch<{
    value: any;
    index: any;
  }>;
  index: number;
}) => {
  return (
    <Box display="flex">
      <FormLabel mb="8px" wordBreak={"break-all"} w="fit-content">
        {inputItem["meta"].label}
      </FormLabel>
      <Switch
        display={"inline"}
        colorScheme="orange"
        onChange={(e) => {
          dispatchArguments({
            value: !e.target.value,
            index,
          });
        }}
      />
    </Box>
  );
};
const Bytes32InputItem = ({
  inputItem,
  dispatchArguments,
  index,
  onKeyPress,
}: {
  inputItem: any;
  dispatchArguments: any;
  index: any;
  onKeyPress: any;
}) => {
  const web3ctx = useContext(Web3Context);
  return (
    <>
      <Flex
        direction="row"
        alignSelf={"flex-start"}
        alignItems="baseline"
        w="100%"
      >
        <FormLabel mb="8px" wordBreak={"break-all"} w="fit-content"></FormLabel>
        {inputItem["meta"].label}
      </Flex>
      <InputGroup
        textColor={"blue.800"}
        key={`argument-string-${inputItem.name}${inputItem.type}`}
        fontSize={"sm"}
        w="100%"
        variant={"outline"}
      >
        <Input
          type="search"
          value={
            inputItem.meta.convertToBytes &&
            inputItem.meta.value &&
            ethers.utils.isBytesLike(inputItem.meta.value)
              ? ethers.utils.parseBytes32String(inputItem.meta.value)
              : inputItem.meta.value
          }
          onKeyPress={onKeyPress}
          placeholder={
            inputItem.type.includes("[]")
              ? `[value, value] `
              : inputItem.meta.placeholder || inputItem.name || inputItem.type
          }
          onChange={(event) =>
            dispatchArguments({
              value: inputItem.meta.convertToBytes
                ? //  web3ctx.provider.utils.padLeft(
                  ethers.utils.formatBytes32String(event.target.value)
                : // 32
                  // )
                  event.target.value,
              index,
            })
          }
        />
      </InputGroup>
    </>
  );
};

const NumberInputItem = ({
  inputItem,
  dispatchArguments,
  index,
  onKeyPress,
}: {
  onKeyPress: any;
  inputItem: any;
  dispatchArguments: React.Dispatch<{
    value?: any;
    index: number;
    valueIsEther?: boolean;
  }>;
  index: number;
}) => {
  const [multiplier, setMultiplier] = React.useState("1");

  return (
    <>
      {" "}
      <FormLabel
        mb="8px"
        wordBreak={"break-all"}
        w="fit-content"
        alignSelf={"flex-start"}
      >
        {inputItem["meta"].label}
      </FormLabel>{" "}
      <Flex direction={"row"} w="100%">
        <NumberInput variant={"outline"} flexBasis="75px" flexGrow={1}>
          <NumberInputField
            placeholder={inputItem.meta.placeholder}
            textColor={"blue.800"}
            onKeyPress={onKeyPress}
            key={`argument-address-${inputItem.name}`}
            value={inputItem.meta.value}
            onChange={(event) =>
              dispatchArguments({
                value: event.target.value,
                index,
              })
            }
            fontSize={"sm"}
            w="100%"
          />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Select
          onChange={(e) =>
            dispatchArguments({
              index,
              valueIsEther: e.target.value === "1" ? false : true,
            })
          }
          flexBasis="25px"
          flexGrow={1}
          maxW="200px"
          ml={4}
        >
          <option value="1">wei (**1)</option>
          <option value="18">Eth (**18)</option>
        </Select>
      </Flex>
    </>
  );
};

const AddressInputItem = ({
  inputItem,
  dispatchArguments,
  index,
  onKeyPress,
}: {
  onKeyPress: any;
  inputItem: any;
  dispatchArguments: React.Dispatch<{
    value: any;
    index: number;
  }>;
  index: number;
}) => {
  return (
    <>
      {" "}
      <FormLabel
        mb="8px"
        wordBreak={"break-all"}
        w="fit-content"
        alignSelf={"flex-start"}
      >
        {inputItem["meta"].label}
      </FormLabel>{" "}
      <Input
        textColor={"blue.800"}
        onKeyPress={onKeyPress}
        type="search"
        key={`argument-address-${inputItem.name}`}
        value={inputItem.meta.value}
        onChange={(event) =>
          dispatchArguments({
            value: event.target.value,
            index,
          })
        }
        fontSize={"sm"}
        w="100%"
        variant={"outline"}
        placeholder={inputItem.meta.placeholder}
      />
    </>
  );
};

const StringInputItem = ({
  inputItem,
  dispatchArguments,
  index,
  onKeyPress,
}: {
  onKeyPress: any;
  inputItem: any;
  dispatchArguments: any;
  index: any;
}) => {
  return (
    <>
      <Flex direction="row" alignSelf={"flex-start"} alignItems="baseline">
        <FormLabel mb="8px" wordBreak={"break-all"} w="fit-content"></FormLabel>
        {inputItem["meta"].label}
      </Flex>

      <InputGroup
        textColor={"blue.800"}
        key={`argument-string-${inputItem.name}${inputItem.type}`}
        fontSize={"sm"}
        w="100%"
        variant={"outline"}
      >
        <Input
          type="search"
          value={inputItem.meta.value}
          onKeyPress={onKeyPress}
          placeholder={
            inputItem.type.includes("[]")
              ? `[value, value] `
              : inputItem.meta.placeholder || inputItem.name || inputItem.type
          }
          onChange={(event) =>
            dispatchArguments({
              value: event.target.value,
              index,
            })
          }
        />
      </InputGroup>
    </>
  );
};

const BatchAddress = ({
  inputItem,
  dispatchArguments,
  index,
  onKeyPress,
}: {
  onKeyPress: any;
  inputItem: any;
  dispatchArguments: React.Dispatch<{
    value: any;
    index: number;
  }>;
  index: number;
}) => {
  return (
    <>
      <FormLabel
        mb="8px"
        wordBreak={"break-all"}
        w="fit-content"
        alignSelf={"flex-start"}
      >
        {inputItem["meta"].label}
      </FormLabel>{" "}
      <Textarea
        placeholder="[0x..., 0x...., 0x....]"
        textColor={"blue.800"}
        onKeyPress={onKeyPress}
        key={`argument-address-${inputItem.name}`}
        value={inputItem.meta.value}
        onChange={(event) =>
          dispatchArguments({
            value: event.target.value,
            index,
          })
        }
        fontSize={"sm"}
        w="100%"
        variant={"outline"}
      />
    </>
  );
};

const BatchNumber = ({
  inputItem,
  dispatchArguments,
  index,
  onKeyPress,
}: {
  onKeyPress: any;
  inputItem: any;
  dispatchArguments: React.Dispatch<{
    value: any;
    index: number;
  }>;
  index: number;
}) => {
  const [multiplier, setMultiplier] = React.useState("1");

  return (
    <>
      <Flex direction={"row"} alignItems="baseline" alignSelf={"flex-start"}>
        <FormLabel
          mb="8px"
          wordBreak={"break-all"}
          w="fit-content"
          alignSelf={"baseline"}
        >
          {inputItem["meta"].label}
        </FormLabel>{" "}
        <Select
          size="sm"
          onChange={(e) => setMultiplier(e.target.value)}
          flexBasis="25px"
          flexGrow={1}
          maxW="200px"
          ml={4}
        >
          <option value="1">wei (**1)</option>
          <option value="18">Eth (**18)</option>
        </Select>
      </Flex>
      <Textarea
        placeholder="[number,...,number]"
        textColor={"blue.800"}
        onKeyPress={onKeyPress}
        key={`argument-address-${inputItem.name}`}
        value={inputItem.meta.value}
        onChange={(event) =>
          dispatchArguments({
            value: event.target.value,
            index,
          })
        }
        fontSize={"sm"}
        w="100%"
        variant={"outline"}
      />
    </>
  );
};

const TupleInputItem = ({
  inputItem,
  dispatchArguments,
  index,
  onKeyPress,
}: {
  onKeyPress: any;
  inputItem: any;
  dispatchArguments: React.Dispatch<{
    value: any;
    index: number;
  }>;
  index: number;
}) => {
  const dispatchTupleArguments = ({
    internalIndex,
    internalValue,
  }: {
    internalIndex: any;
    internalValue: any;
  }) => {
    const newComponents = [...inputItem.components];
    newComponents[internalIndex]["meta"]["value"] = internalValue;
    dispatchArguments({
      value: newComponents,
      index,
    });
  };
  return (
    <Box
      w="100%"
      p={4}
      borderRadius="md"
      borderColor={"blue.500"}
      borderWidth="2px"
    >
      <Heading as="h4" size="sm">
        {inputItem.name}
      </Heading>
      {inputItem.components.map((internalProperty: any, idx: number) => {
        return (
          <Web3MethodField
            key={`tuple-${idx}`}
            dispatchArguments={({ index, value }) => {
              dispatchTupleArguments({
                internalIndex: index,
                internalValue: value,
              });
            }}
            inputItem={internalProperty}
            index={idx}
            onKeyPress={onKeyPress}
          />
        );
      })}
    </Box>
  );
};

interface extendedInputs extends AbiInput {
  meta?: {
    value: string;
    placeholder: string;
    hide: boolean;
    label: string;
    valueIsEther?: boolean;
  };
}

const Web3MethodField = ({
  dispatchArguments,
  inputItem,
  index,
  //   inputsProps,
  onKeyPress,
}: {
  dispatchArguments: React.Dispatch<{
    value: any;
    index: any;
  }>;
  inputItem: extendedInputs;
  index: number;
  onKeyPress: (e: KeyboardEvent) => void;
  //   inputsProps: any;
}) => {
  const item = () => {
    switch (inputItem.type) {
      case "bool":
        return (
          <BoolInputItem
            dispatchArguments={
              dispatchArguments as React.Dispatch<{
                value: any;
                index: any;
              }>
            }
            inputItem={inputItem}
            index={index}
          />
        );
      case "bytes32":
        return (
          <Bytes32InputItem
            dispatchArguments={dispatchArguments}
            inputItem={inputItem}
            index={index}
            onKeyPress={onKeyPress}
          />
        );
      case "address":
        return (
          <AddressInputItem
            dispatchArguments={dispatchArguments}
            inputItem={inputItem}
            index={index}
            onKeyPress={onKeyPress}
          />
        );
      case "bytes":
        return (
          <Bytes32InputItem
            dispatchArguments={dispatchArguments}
            inputItem={inputItem}
            index={index}
            onKeyPress={onKeyPress}
          />
        );

      //   case "bytes32":
      //     return <Bytes32InputItem />;
      case "string":
        return (
          <StringInputItem
            dispatchArguments={dispatchArguments}
            inputItem={inputItem}
            index={index}
            onKeyPress={onKeyPress}
          />
        );
      case "address[]":
        return (
          <BatchAddress
            dispatchArguments={dispatchArguments}
            inputItem={inputItem}
            index={index}
            onKeyPress={onKeyPress}
          />
        );
      case "tuple":
        return (
          <TupleInputItem
            dispatchArguments={dispatchArguments}
            inputItem={inputItem}
            index={index}
            onKeyPress={onKeyPress}
          />
        );

      default:
        if (inputItem?.type.startsWith("uint")) {
          if (inputItem.type.endsWith("[]"))
            return (
              <BatchNumber
                dispatchArguments={dispatchArguments}
                inputItem={inputItem}
                index={index}
                onKeyPress={onKeyPress}
              />
            );
          else
            return (
              <NumberInputItem
                dispatchArguments={dispatchArguments}
                inputItem={inputItem}
                index={index}
                onKeyPress={onKeyPress}
              />
            );
        }
        if (inputItem?.type.startsWith("bytes")) {
          if (inputItem.type.endsWith("[]"))
            return "Batch bytes are not implemented yet";
          else
            return (
              <Bytes32InputItem
                dispatchArguments={dispatchArguments}
                inputItem={inputItem}
                index={index}
                onKeyPress={onKeyPress}
              />
            );
        }
        return <h1>Unimplemented input type {inputItem.type}</h1>;
    }
  };
  return <>{item()}</>;
};

export default Web3MethodField;
