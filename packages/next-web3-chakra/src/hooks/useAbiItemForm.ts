import React from "react";
import { StateInterface, ExtendedInputs, Web3InpuUIField } from "../types";
import { ethers } from "ethers";
import { AbiItem } from "web3-utils";

const extendInputs = (
  element: ExtendedInputs,
  argumentFields?: { [key: string]: Web3InpuUIField },
  hide?: string[]
): any => {
  if (element.type === "tuple" || element.type === "tuple[]") {
    return {
      ...element,
      components: element.components?.map((comp) => {
        if (element.type === "tuple" || element.type === "tuple[]") {
          return extendInputs(comp);
        } else
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
          (argumentFields && argumentFields[element.name]?.initialValue) ?? "",
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

const setTupleBytesFormat = (tuple: ExtendedInputs, value: boolean) => {
  tuple.components?.forEach((internalElement, idx) => {
    if (internalElement.type === "tuple") {
      setTupleBytesFormat(internalElement, value);
    } else {
      internalElement.meta.convertToBytes = value;
    }
  });
};

const setArguments = (
  state: StateInterface,
  {
    value,
    index,
    type,
    valueIsEther,
  }: {
    value: any;
    index: any;
    type?: "bytesFormat" | undefined;
    valueIsEther?: boolean;
  }
) => {
  const newState = { ...state };
  if (type !== "bytesFormat") {
    if (newState.inputs[index]?.type === "tuple") {
      newState.inputs[index].components = [...value];
    } else {
      value && (newState.inputs[index].meta.value = value);
      newState.inputs[index].meta.valueIsEther = valueIsEther;
    }
  } else {
    newState.inputs.forEach((inputElement, idx) => {
      if (inputElement.type === "tuple") {
        setTupleBytesFormat(inputElement, value);
      } else {
        newState.inputs[idx] = { ...inputElement };
        newState.inputs[idx].meta.convertToBytes = !!value;
        if (
          !!value &&
          !ethers.utils.isBytesLike(newState.inputs[idx].meta.value) &&
          (newState.inputs[idx].type == "bytes" ||
            newState.inputs[idx].type == "bytes32")
        ) {
          newState.inputs[idx].meta.value = ethers.utils.formatBytes32String(
            newState.inputs[idx].meta.value
          );
        }
      }
    });
  }

  return { ...newState };
};

const useABIItemForm = (method: AbiItem) => {
  const initialState = React.useMemo(() => {
    const newState: StateInterface = { ...(method as any) };
    newState.inputs?.forEach((element: ExtendedInputs, index: number) => {
      newState.inputs[index] = extendInputs(element);
    });
    return newState;
    //eslint-disable-next-line
  }, [method]);

  const [state, dispatchArguments] = React.useReducer(
    setArguments,
    initialState
  );

  const getArgs = () => {
    const extractTupleParams = (tuple: ExtendedInputs) => {
      return tuple?.components?.map((internalElement: any): any[] =>
        internalElement.type === "tuple"
          ? extractTupleParams(internalElement)
          : internalElement.meta.value
      );
    };
    const returnedObject: any = [];
    state.inputs.forEach((inputElement: any, index: number) => {
      returnedObject[index] =
        inputElement.type === "address"
          ? ethers.utils.isAddress(
              ethers.utils.getAddress(inputElement.meta.value)
            )
            ? ethers.utils.getAddress(inputElement.meta.value)
            : console.error("not an address", returnedObject[index])
          : inputElement.type === "tuple"
          ? extractTupleParams(inputElement)
          : inputElement.meta.value;
      if (inputElement.type.includes("[]")) {
        returnedObject[index] = JSON.parse(returnedObject[index]);
      }
      if (
        inputElement.type.includes("uint")
        // &&
        // inputElement.meta?.valueIsEther
      ) {
        if (inputElement.type.includes("[]")) {
          returnedObject[index] = returnedObject.map((value: string) =>
            ethers.utils.parseUnits(
              value,
              inputElement.meta.valueIsEther ? "ether" : "wei"
            )
          );
        } else {
          console.log("returned uint", inputElement.meta);
          returnedObject[index] = ethers.utils.parseUnits(
            inputElement.meta.value,
            inputElement.meta.valueIsEther ? "ether" : "wei"
          );
        }
      }
    });
    return returnedObject;

    // if (onClose) {
    //   onClose();
    // }
  };

  return { state, dispatchArguments, getArgs };
};

export default useABIItemForm;
