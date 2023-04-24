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
  Heading,
} from "@chakra-ui/react";
import { JsonFragmentType } from "@ethersproject/abi";
import Web3Context from "../providers/Web3Provider/context";
import BN from "bn.js";
import FileUpload from "./FileUpload";
import Papa from "papaparse";
import { AbiInput } from "web3-utils";
import { ethers } from "ethers";
import {
  UIFragmentField,
  UINumberFragmentField,
  UINUmberFragmentFieldArray,
  UIStringFragmentField,
  UIStringFragmentFieldArray,
  UITupleFragmentField,
} from "../types";
const BoolInputItem = ({
  uiFragment,
  abiItem,
  dispatchArguments,
  index,
  colorScheme,
}: {
  colorScheme?: string;
  abiItem: JsonFragmentType;
  uiFragment: UIFragmentField;
  dispatchArguments: React.Dispatch<{
    value: any;
    index: any;
  }>;
  index: number;
}) => {
  return (
    <Box display="flex">
      <FormLabel mb="8px" wordBreak={"break-all"} w="fit-content">
        {uiFragment.label}
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
  uiFragment,
  abiItem,
  dispatchArguments,
  index,
  onKeyPress,
  colorScheme,
}: {
  abiItem: JsonFragmentType;
  uiFragment: UIStringFragmentField;
  dispatchArguments: any;
  index: any;
  onKeyPress: any;
  colorScheme?: string;
}) => {
  return (
    <>
      <Flex
        direction="row"
        alignSelf={"flex-start"}
        alignItems="baseline"
        w="100%"
      >
        <FormLabel mb="8px" wordBreak={"break-all"} w="fit-content"></FormLabel>
        {uiFragment.label}
      </Flex>
      <InputGroup
        // textColor={"blue.400"}
        key={`argument-string-${abiItem.name}${abiItem.type}`}
        fontSize={"sm"}
        w="100%"
        variant={"outline"}
      >
        <Input
          onFocus={(event) => event.target.select()}
          type="search"
          value={
            uiFragment.convertToBytes &&
            uiFragment.value &&
            ethers.utils.isBytesLike(uiFragment.value)
              ? ethers.utils.parseBytes32String(uiFragment.value)
              : uiFragment.value
          }
          onKeyPress={onKeyPress}
          placeholder={
            abiItem.type && abiItem.type.includes("[]")
              ? `[value, value] `
              : uiFragment.placeholder ?? ("" || abiItem.name || abiItem.type)
          }
          onChange={(event) =>
            dispatchArguments({
              value: uiFragment.convertToBytes
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
  uiFragment,
  abiItem,
  dispatchArguments,
  index,
  onKeyPress,
  colorScheme,
}: {
  onKeyPress: any;
  colorScheme?: string;
  abiItem: JsonFragmentType;
  uiFragment: UINumberFragmentField;
  dispatchArguments: React.Dispatch<{
    value?: any;
    index: number;
    valueIsEther?: boolean;
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
        {uiFragment.label}
      </FormLabel>{" "}
      <Flex direction={"row"} w="100%">
        <NumberInput variant={"outline"} flexBasis="75px" flexGrow={1}> 
          <NumberInputField
            onFocus={(event) => event.target.select()}
            placeholder={uiFragment.placeholder ?? ""}
            // textColor={("blue.800")}
            onKeyPress={onKeyPress}
            key={`argument-address-${abiItem.name}`}
            value={uiFragment.value}
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
  uiFragment,
  abiItem,
  dispatchArguments,
  index,
  onKeyPress,
  colorScheme,
}: {
  colorScheme?: string;
  onKeyPress: any;
  abiItem: JsonFragmentType;
  uiFragment: UIStringFragmentField;
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
        {uiFragment.label}
      </FormLabel>{" "}
      <Input
        onFocus={(event) => event.target.select()}
        textColor={"blue.500"}
        defaultValue={ethers.constants.AddressZero}
        onKeyPress={onKeyPress}
        type="search"
        key={`argument-address-${abiItem.name}`}
        value={uiFragment.value}
        onChange={(event) =>
          dispatchArguments({
            value: event.target.value,
            index,
          })
        }
        fontSize={"sm"}
        w="100%"
        variant={"outline"}
        placeholder={uiFragment.placeholder ?? ""}
      />
    </>
  );
};

const StringInputItem = ({
  uiFragment,
  abiItem,
  dispatchArguments,
  index,
  onKeyPress,
  colorScheme,
}: {
  colorScheme?: string;
  onKeyPress: any;
  abiItem: JsonFragmentType;
  uiFragment: UIStringFragmentField;
  dispatchArguments: any;
  index: any;
}) => {
  return (
    <>
      <Flex direction="row" alignSelf={"flex-start"} alignItems="baseline">
        <FormLabel mb="8px" wordBreak={"break-all"} w="fit-content"></FormLabel>
        {uiFragment.label}
      </Flex>

      <InputGroup
        // textColor={"blue.800"}
        key={`argument-string-${abiItem.name}${abiItem.type}`}
        fontSize={"sm"}
        w="100%"
        variant={"outline"}
      >
        <Input
          onFocus={(event) => event.target.select()}
          type="search"
          value={uiFragment.value}
          onKeyPress={onKeyPress}
          placeholder={
            abiItem.type && abiItem?.type.includes("[]")
              ? `[value, value] `
              : uiFragment.placeholder ?? ("" || abiItem.name || abiItem.type)
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
  uiFragment,
  abiItem,
  dispatchArguments,
  index,
  onKeyPress,
  colorScheme,
}: {
  colorScheme?: string;
  onKeyPress: any;
  abiItem: JsonFragmentType;
  uiFragment: UIStringFragmentFieldArray;
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
        {uiFragment.label}
      </FormLabel>{" "}
      <Textarea
        placeholder="[0x..., 0x...., 0x....]"
        // textColor={"blue.800"}
        onKeyPress={onKeyPress}
        key={`argument-address-${abiItem.name}`}
        value={uiFragment.value}
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
  uiFragment,
  abiItem,
  dispatchArguments,
  index,
  onKeyPress,
  colorScheme,
}: {
  colorScheme?: string;
  onKeyPress: any;
  abiItem: JsonFragmentType;
  uiFragment: UINUmberFragmentFieldArray;
  dispatchArguments: React.Dispatch<{
    value: any;
    index: number;
  }>;
  index: number;
}) => {
  return (
    <>
      <Flex direction={"row"} alignItems="baseline" alignSelf={"flex-start"}>
        <FormLabel
          mb="8px"
          wordBreak={"break-all"}
          w="fit-content"
          alignSelf={"baseline"}
        >
          {uiFragment.label}
        </FormLabel>{" "}
        <Select
          size="sm"
          onChange={(e) => console.warn("UNFINISHED")}
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
        // textColor={"blue.800"}
        onKeyPress={onKeyPress}
        key={`argument-address-${abiItem.name}`}
        value={uiFragment.value}
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
  uiFragment,
  abiItem,
  dispatchArguments,
  index,
  onKeyPress,
  colorScheme,
}: {
  colorScheme?: string;
  onKeyPress: any;
  abiItem: JsonFragmentType;
  uiFragment: UITupleFragmentField;
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
    const newComponents = [...uiFragment.components] as any;
    newComponents[internalIndex]["value"] = internalValue;
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
      // borderColor={"blue.500"}
      borderWidth="2px"
    >
      <Heading as="h4" size="sm">
        {abiItem.name}
      </Heading>
      {abiItem?.components &&
        abiItem.components?.map(
          (internalProperty: JsonFragmentType, idx: number) => {
            return (
              <Web3MethodField
                key={`tuple-${idx}`}
                dispatchArguments={({ index, value }) => {
                  dispatchTupleArguments({
                    internalIndex: index,
                    internalValue: value,
                  });
                }}
                abiItem={internalProperty}
                uiFragment={uiFragment.components[idx]}
                index={idx}
                onKeyPress={onKeyPress}
              />
            );
          }
        )}
    </Box>
  );
};

const Web3MethodField = ({
  dispatchArguments,
  abiItem,
  uiFragment,
  index,
  //   inputsProps,
  onKeyPress,
  colorScheme,
}: {
  dispatchArguments: React.Dispatch<{
    value?: any;
    index: number;
    valueIsEther?: boolean;
    convertToBytes?: boolean;
  }>;
  abiItem: JsonFragmentType;
  uiFragment: UIFragmentField;
  index: number;
  onKeyPress: (e: KeyboardEvent) => void;
  colorScheme?: string;
  //   inputsProps: any;
}) => {
  const item = (type: string) => {
    if (!item) return "";
    switch (type) {
      case "bool":
        return (
          <BoolInputItem
            dispatchArguments={
              dispatchArguments as React.Dispatch<{
                value: any;
                index: any;
              }>
            }
            abiItem={abiItem}
            uiFragment={uiFragment}
            index={index}
            colorScheme={colorScheme}
          />
        );
      case "bytes32":
        return (
          <Bytes32InputItem
            dispatchArguments={dispatchArguments}
            abiItem={abiItem}
            uiFragment={uiFragment as UIStringFragmentField}
            index={index}
            onKeyPress={onKeyPress}
            colorScheme={colorScheme}
          />
        );
      case "address":
        return (
          <AddressInputItem
            dispatchArguments={dispatchArguments}
            abiItem={abiItem}
            uiFragment={uiFragment as UIStringFragmentField}
            index={index}
            onKeyPress={onKeyPress}
            colorScheme={colorScheme}
          />
        );
      case "bytes":
        return (
          <Bytes32InputItem
            dispatchArguments={dispatchArguments}
            abiItem={abiItem}
            uiFragment={uiFragment as UIStringFragmentField}
            index={index}
            onKeyPress={onKeyPress}
            colorScheme={colorScheme}
          />
        );

      //   case "bytes32":
      //     return <Bytes32InputItem />;
      case "string":
        return (
          <StringInputItem
            dispatchArguments={dispatchArguments}
            abiItem={abiItem}
            uiFragment={uiFragment as UIStringFragmentField}
            index={index}
            onKeyPress={onKeyPress}
            colorScheme={colorScheme}
          />
        );
      case "address[]":
        return (
          <BatchAddress
            dispatchArguments={dispatchArguments}
            abiItem={abiItem}
            uiFragment={uiFragment as UIStringFragmentFieldArray}
            index={index}
            onKeyPress={onKeyPress}
            colorScheme={colorScheme}
          />
        );
      case "tuple":
        return (
          <TupleInputItem
            dispatchArguments={dispatchArguments}
            abiItem={abiItem}
            uiFragment={uiFragment as UITupleFragmentField}
            index={index}
            onKeyPress={onKeyPress}
            colorScheme={colorScheme}
          />
        );
      //ToDo: This should have some kind of interactive button to add fields in it
      // case "tuple[]":
      //   return (

      //   )
      default:
        if (type && type.startsWith("uint")) {
          if (type.endsWith("[]"))
            return (
              <BatchNumber
                dispatchArguments={dispatchArguments}
                abiItem={abiItem}
                uiFragment={uiFragment as UINUmberFragmentFieldArray}
                index={index}
                onKeyPress={onKeyPress}
                colorScheme={colorScheme}
              />
            );
          else
            return (
              <NumberInputItem
                dispatchArguments={dispatchArguments}
                abiItem={abiItem}
                uiFragment={uiFragment as UINumberFragmentField}
                index={index}
                onKeyPress={onKeyPress}
                colorScheme={colorScheme}
              />
            );
        }
        if (type?.startsWith("bytes")) {
          if (type.endsWith("[]")) return "Batch bytes are not implemented yet";
          else
            return (
              <Bytes32InputItem
                dispatchArguments={dispatchArguments}
                abiItem={abiItem}
                uiFragment={uiFragment as UIStringFragmentField}
                index={index}
                onKeyPress={onKeyPress}
                colorScheme={colorScheme}
              />
            );
        }
        return <h1>Unimplemented input type {abiItem.type}</h1>;
    }
  };
  return <>{!!abiItem.type && item(abiItem.type)}</>;
};

export default Web3MethodField;
