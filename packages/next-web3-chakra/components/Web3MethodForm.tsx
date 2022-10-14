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
interface argumentField {
  placeholder?: string;
  initialValue?: string;
  label?: string;
  valueIsEther?: boolean;
  convertToBytes: boolean;
  // hide: boolean;
}
interface argumentFields {
  [Key: string]: argumentField;
}
interface extendedInputs extends Omit<AbiInput, "components"> {
  components?: extendedInputs[];
  meta: {
    value: string;
    placeholder: string;
    hide: boolean;
    label: string;
    valueIsEther?: boolean;
    convertToBytes: boolean;
  };
}

interface stateInterface extends Omit<AbiItem, "inputs"> {
  inputs: Array<extendedInputs>;
}

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
  argumentFields?: argumentFields;
  hide?: string[];
  BatchInputs?: string[];
  rendered: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onSuccess?: (resp: any) => void;
  beforeSubmit?: (state: stateInterface) => any;
  contractAddress: string;
  // inputsProps?: ThemingProps<"Input">;
  props?: any;
}) => {
  const setTupleBytesFormat = (tuple: extendedInputs, value: boolean) => {
    tuple.components?.forEach((internalElement, idx) => {
      if (internalElement.type === "tuple") {
        setTupleBytesFormat(internalElement, value);
      } else {
        internalElement.meta.convertToBytes = value;
      }
    });
  };
  const setArguments = (
    state: stateInterface,
    {
      value,
      index,
      type,
    }: { value: any; index: any; type?: "bytesFormat" | undefined }
  ) => {
    const newState = { ...state };
    if (type !== "bytesFormat") {
      if (newState.inputs[index].type === "tuple") {
        newState.inputs[index].components = [...value];
      } else {
        newState.inputs[index].meta.value = value;
      }
    } else {
      newState.inputs.forEach((inputElement, idx) => {
        if (inputElement.type === "tuple") {
          setTupleBytesFormat(inputElement, value);
        } else {
          console.log("buggy", newState.inputs[idx], idx);
          newState.inputs[idx] = { ...inputElement };
          newState.inputs[idx].meta.convertToBytes = !!value;
        }
      });
    }

    return { ...newState };
  };

  const extendInputs = (element: extendedInputs): any => {
    console.log("extendInputs", element);
    if (element.type === "tuple") {
      return {
        ...element,
        components: element.components?.map((comp) => {
          return {
            ...comp,
            meta: {
              placeholder: comp.name,
              value: "",
              hide: false,
              label: ` ${comp.name}  [${comp.type}]`,
              valueIsEther: false,
              convertToBytes: false,
            },
          };
        }),
      };
    } else
      return {
        ...element,
        meta: {
          placeholder:
            (argumentFields && argumentFields[element.name]?.placeholder) ??
            element.name,
          value:
            (argumentFields && argumentFields[element.name]?.initialValue) ??
            "",
          hide: hide?.includes(element.name) ?? false,
          label:
            (argumentFields && argumentFields[element.name]?.label) ??
            ` ${element.name}  [${element.type}]`,
          valueIsEther:
            (argumentFields && argumentFields[element.name]?.valueIsEther) ??
            false,
          convertToBytes:
            (argumentFields && argumentFields[element.name]?.convertToBytes) ??
            false,
        },
      };
  };

  const toast = useToast();
  const _BatchInputs = BatchInputs ?? [];
  const initialState = React.useMemo(() => {
    const newState: stateInterface = { ...(method as any) };
    newState.inputs?.forEach((element: extendedInputs, index: number) => {
      newState.inputs[index] = extendInputs(element);
    });
    return newState;
    //eslint-disable-next-line
  }, [method]);

  const [state, dispatchArguments] = React.useReducer(
    setArguments,
    initialState
  );
  const [allBytesAreStrings, setAllBytesAreStrings] = React.useState(false);
  const [wasSent, setWasSent] = React.useState(false);

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
  const web3ctx = useContext(Web3Context);
  const handleSubmit = () => {
    const extractTupleParams = (tuple: extendedInputs) => {
      return tuple?.components?.map((internalElement: any): any[] =>
        internalElement.type === "tuple"
          ? extractTupleParams(internalElement)
          : internalElement.meta.value
      );
    };
    console.log("submited state", state);
    const returnedObject: any = [];
    state.inputs.forEach((inputElement: any, index: number) => {
      returnedObject[index] =
        inputElement.type === "address"
          ? web3ctx.web3.utils.isAddress(
              web3ctx.web3.utils.toChecksumAddress(inputElement.meta.value)
            )
            ? web3ctx.web3.utils.toChecksumAddress(inputElement.meta.value)
            : console.error("not an address", returnedObject[index])
          : inputElement.type === "tuple"
          ? extractTupleParams(inputElement)
          : inputElement.meta.value;
      if (inputElement.type.includes("[]")) {
        returnedObject[index] = JSON.parse(returnedObject[index]);
      }
      if (
        inputElement.type.includes("uint") &&
        inputElement.meta?.valueIsEther
      ) {
        if (inputElement.type.includes("[]")) {
          returnedObject[index] = returnedObject.map((value: string) =>
            web3ctx.web3.utils.toWei(value, "ether")
          );
        } else {
          returnedObject[index] = web3ctx.web3.utils.toWei(
            returnedObject[index],
            "ether"
          );
        }
      }
    });
    beforeSubmit && beforeSubmit(returnedObject);
    console.log("returnedObject", returnedObject);
    tx.mutate({ args: returnedObject });

    // if (onClose) {
    //   onClose();
    // }
  };

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
  if (method.name === "deleteName") console.log("deleteName", state);
  if (!rendered) return <></>;
  console.log("from state", state);
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
          console.log("state input map", inputItem);
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
