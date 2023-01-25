import React, { Fragment, KeyboardEventHandler, useContext } from "react";
import {
  Flex,
  Button,
  chakra,
  // Fade,
  Input,
  Stack,
  // Text,
  Heading,
  Box,
  Switch,
  FormLabel,
  ThemingProps,
  InputGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spacer,
} from "@chakra-ui/react";
import { AbiInput, AbiItem } from "web3-utils";
import { useMutation } from "react-query";
import Web3Context from "../providers/Web3Provider/context";
import useToast from "../hooks/useToast";
import FileUpload from "./FileUpload";
import Web3MethodField from "./We3MethodField";

import { ArgumentFields, StateInterface, ExtendedInputs } from "../types";
import useABIItemForm from "../hooks/useAbiItemForm";
// interface

const Web3MethodForm = ({
  method,
  argumentFields,
  hide,
  key,
  rendered,
  title,
  // onClose,
  onCancel,
  onSuccess,
  beforeSubmit,
  contractAddress,
  BatchInputs,
  className,
  ...props
}: {
  title?: string;
  key: string;
  method: AbiItem;
  className?: string;
  argumentFields?: ArgumentFields;
  hide?: string[];
  BatchInputs?: string[];
  rendered: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onSuccess?: (resp: any) => void;
  beforeSubmit?: (state: StateInterface) => any;
  contractAddress: string;
  // inputsProps?: ThemingProps<"Input">;
  props?: any;
}) => {
  const toast = useToast();
  const _BatchInputs = BatchInputs ?? [];

  const [allBytesAreStrings, setAllBytesAreStrings] = React.useState(false);
  const [wasSent, setWasSent] = React.useState(false);
  const { state, dispatchArguments, getArgs } = useABIItemForm(method);
  const handleClose = React.useCallback(() => {
    if (onCancel) {
      state.inputs.forEach((inputElement: any, index: any) => {
        dispatchArguments({
          value:
            (argumentFields &&
              argumentFields[inputElement.name]?.initialValue) ??
            "",
          index,
        });
      });
      onCancel();
    }
  }, [state, argumentFields, onCancel]);

  const [queryEnabled, setQueryEnabled] = React.useState(false);

  const web3call = async ({ args }: { args: any }) => {
    const contract = new web3ctx.web3.eth.Contract([method]);

    contract.options.address = contractAddress;
    const response =
      method.name &&
      (await contract.methods[method.name](...args).send({
        from: web3ctx.account,
        // gasPrice:
        //   process.env.NODE_ENV !== "production" ? "100000000000" : undefined,
      }));
    return response;
  };

  const tx = useMutation(({ args }: { args: any }) => web3call({ args }), {
    onSuccess: (resp) => {
      toast("Transaction went to the moon!", "success");
      onSuccess && onSuccess(resp);
    },
    onError: () => {
      toast("Transaction failed >.<", "error");
    },
  });

  console.log("state", state);
  const handleSubmit = () => {
    if (
      method.stateMutability === "view" ||
      method.stateMutability === "pure"
    ) {
    } else {
      const returnedObject = getArgs();
      beforeSubmit && beforeSubmit(returnedObject);
      tx.mutate({ args: returnedObject });
    }
  };

  const web3ctx = useContext(Web3Context);

  React.useEffect(() => {
    if (!tx.isLoading && wasSent) {
      setWasSent(false);
      handleClose();
    }
    if (!wasSent && tx.isLoading) {
      setWasSent(true);
    }
  }, [tx.isLoading, state, argumentFields, onCancel, wasSent, handleClose]);

  const handleKeypress = (e: any) => {
    //it triggers by pressing the enter key
    if (e.charCode === 13) {
      handleSubmit();
    }
  };

  const [isUploading, setIsUploading] = React.useState(false);
  const handleParsingError = function (error: string): void {
    setIsUploading(false);
    toast(error, "error", "CSV Parse Error");
    throw error;
  };

  const validateHeader = function (
    headerValue: string,
    column: number
    // expected: string
  ): string {
    const expected = _BatchInputs && _BatchInputs[column].trim().toLowerCase();
    const header = headerValue.trim().toLowerCase();
    if (column == 0 && header != expected) {
      handleParsingError(
        `First column header must be '${expected}' but got ${headerValue}.`
      );
    }
    if (column == 1 && header != expected) {
      handleParsingError(
        `Second column header must be '${expected}' but got ${headerValue}`
      );
    }
    return header;
  };
  if (!rendered) return <></>;
  return (
    <>
      <Stack
        className={className}
        justifyContent="center"
        px={2}
        alignItems="center"
        m={0}
        key={key}
        {...props}
      >
        {/* <Fade in={rendered}> */}
        <Flex direction={"row"} w="100%">
          <Heading
            wordBreak={"break-all"}
            fontSize={
              method?.name?.length && method?.name?.length > 12 ? "xl" : "3xl"
            }
          >
            {title ?? method.name}
          </Heading>
          <Spacer />
          <Switch
            size="sm"
            ml={4}
            justifySelf={"flex-end"}
            aria-label="as string"
            onChange={() => {
              setAllBytesAreStrings((old) => {
                dispatchArguments({
                  value: !old,
                  index: 0,
                  type: "bytesFormat",
                });
                return !old;
              });
            }}
          >
            All Bytes as strings
          </Switch>
        </Flex>
        {state.inputs.map((inputItem: any, index: any) => {
          if (
            !inputItem?.meta?.hide &&
            !_BatchInputs?.includes(inputItem.name)
          ) {
            return (
              <Web3MethodField
                key={`${inputItem.name}-${index}-abiitems`}
                dispatchArguments={dispatchArguments}
                inputItem={inputItem}
                index={index}
                onKeyPress={handleKeypress}
                // inputsProps={inputsProps}
              />
            );
          }
        })}
        <Flex direction={"row"} flexWrap="wrap">
          <Button
            variant={"solid"}
            colorScheme={"orange"}
            size="sm"
            onClick={handleSubmit}
            isLoading={tx.isLoading}
          >
            Submit
          </Button>
          {onCancel && (
            <Button
              variant={"solid"}
              colorScheme={"orange"}
              size="sm"
              onClick={() => handleClose()}
            >
              Cancel
            </Button>
          )}
        </Flex>
        {/* </Fade> */}
      </Stack>
    </>
  );
};

export default chakra(React.memo(Web3MethodForm));
