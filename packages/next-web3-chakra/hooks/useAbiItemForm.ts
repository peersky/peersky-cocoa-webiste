import React from "react";
import {
  UIFragment,
  UIFragmentField,
  UITupleFragmentField,
  UINumberFragmentField,
  UIStringFragmentField,
  UINUmberFragmentFieldArray,
  UIStringFragmentFieldArray,
  ArgumentFields,
} from "../types";
import { ethers } from "ethers";
import { JsonFragment, JsonFragmentType } from "@ethersproject/abi";

const makeTupleField = (element: JsonFragmentType): UITupleFragmentField => {
  let tupleUI: UITupleFragmentField = {
    components: [],
    hide: false,
    label: element.name ?? "",
  };
  if (!element.components) throw new Error("tuple has no components");
  if (!element.type) throw new Error("not defined");
  if (!element.name) throw new Error("Element has no name");

  tupleUI = {
    hide: false,
    label: element.name ?? "",
    components: element.components.map((comp) => {
      switch (element.type) {
        case "tuple":
          return makeUIFields<UITupleFragmentField>(comp);
        case "tuple[]":
          return makeUIFields<UITupleFragmentField>(comp);
        case "uint256":
          return makeUIFields<UINumberFragmentField>(comp);
        case "uint256[]":
          return makeUIFields<UINUmberFragmentFieldArray>(comp);
        default:
          if (element.type && element.type.includes("int")) {
            if (element.type.includes("[]")) {
              return makeUIFields<UINUmberFragmentFieldArray>(comp);
            } else {
              return makeUIFields<UINumberFragmentField>(comp);
            }
          } else {
            if (!element.type) throw new Error("element has no type");
            if (element.type.includes("[]")) {
              return makeUIFields<UIStringFragmentFieldArray>(comp);
            } else {
              return makeUIFields<UIStringFragmentField>(comp);
            }
          }
      }
    }),
  };
  return tupleUI;
};

// export interface ArgumentFields {
//   value: string;
//   placeholder: string;
//   hide: boolean;
//   label: string;
//   valueIsEther?: boolean;
//   convertToBytes: boolean;
//   initialValue: string;
// }

const isNumeric = (fragment: JsonFragmentType) => {
  return (fragment as UINumberFragmentField).valueIsEther !== undefined;
};
const makeUIFields = <T extends UIFragmentField>(
  element: JsonFragmentType,
  argumentFields?: ArgumentFields,
  hide?: string[]
): T => {
  if (!element.name) console.log("cauthg", element);
  if (!element.type) throw new Error("not defined");
  if (element.type === "tuple" || element.type === "tuple[]") {
    if (!element.components) throw new Error("tuple has no components");
    const retval = makeTupleField(element);
    hide &&
      element?.name &&
      hide.includes(element?.name) &&
      (retval.hide = true);
    return retval as any;
  } else {
    const retval = {
      convertToBytes:
        !isNumeric(element) &&
        !!element?.name &&
        !!argumentFields &&
        argumentFields[element?.name]?.convertToBytes,
      valueIsEther:
        isNumeric(element) &&
        !!element?.name &&
        !!argumentFields &&
        !!argumentFields[element.name]?.valueIsEther,
      placeholder:
        (element?.name &&
          argumentFields &&
          argumentFields[element.name]?.placeholder) ??
        element.name,
      hide: (!!element?.name && hide?.includes(element.name)) ?? false,
      value:
        (element.name &&
          argumentFields &&
          argumentFields[element.name]?.initialValue) ??
        "",

      label:
        (element.name &&
          argumentFields &&
          argumentFields[element.name]?.label) ??
        ` ${element.name}  [${element.type}]`,
    };

    return retval as any as T;
  }
};

// const setTupleBytesFormat = (tuple: ExtendedInputs, value: boolean) => {
//   tuple.components?.forEach((internalElement, idx) => {
//     if (internalElement.type === "tuple") {
//       setTupleBytesFormat(internalElement, value);
//     } else {
//       internalElement.meta.convertToBytes = value;
//     }
//   });
// };

// function isNumberish(
//   input: UIFragmentField,
//   fragment: UIFragment
// ): input is UINumberFragmentField {
//   return !!(input as UINumberFragmentField) && fragment !== undefined;
// }
const setArguments = (
  state: UIFragment,
  {
    value,
    index,
    valueIsEther,
    convertToBytes,
    allBytesAsStrings,
    allValuesAsEther,
  }: {
    value?: string | [] | UIFragmentField;
    index?: any;
    valueIsEther?: boolean;
    convertToBytes?: boolean;
    allBytesAsStrings?: boolean;
    allValuesAsEther?: boolean;
  }
) => {
  const newState = { ...state };
  newState.allBytesAsStrings = allBytesAsStrings;
  newState.allValuesAsEther = allValuesAsEther;

  if (index !== undefined) {
    if (!newState.inputs) throw new Error("no input fields found");
    if (
      newState.inputs[index]?.type === "tuple" ||
      newState.inputs[index]?.type === "tuple[]"
    ) {
      newState.ui[index] = value as UITupleFragmentField;
      return newState;
    } else {
      if (newState.inputs[index]?.type?.includes("int")) {
        let ui = newState.ui[index] as
          | UINumberFragmentField
          | UINUmberFragmentFieldArray;
        ui.value = (value as string | []) ?? "";
        ui.valueIsEther = valueIsEther;
      } else {
        let ui = newState.ui[index] as
          | UIStringFragmentField
          | UIStringFragmentFieldArray;
        ui.value = (value as string | []) ?? "";
        if (newState.inputs[index].type != "string") {
          ui.convertToBytes = convertToBytes;
        }
      }
    }
  }

  return { ...newState };
};

const useABIItemForm = (
  fragment: JsonFragment,
  argumentFields?: ArgumentFields,
  hideFields?: string[]
) => {
  const method: JsonFragment = fragment as JsonFragment;
  const initialState = React.useMemo(() => {
    const newState: UIFragment = { ...method, ui: [] };
    newState.inputs?.forEach((element: JsonFragmentType, index: number) => {
      if (newState.inputs && newState.inputs[index]) {
        newState.ui[index] = makeUIFields<UIFragmentField>(
          element,
          argumentFields,
          hideFields
        );
      }
    });
    return newState;
    //eslint-disable-next-line
  }, [method]);

  const [state, dispatchArguments] = React.useReducer(
    setArguments,
    initialState
  );

  const getArgs = () => {
    const extractTupleParams = (tuple: UITupleFragmentField) => {
      return tuple?.components?.map((internalElement: any): any =>
        !!internalElement["components"]
          ? extractTupleParams(internalElement as UITupleFragmentField)
          : internalElement
      );
    };
    const returnedObject: any = [];
    state?.inputs?.forEach((inputElement, index) => {
      returnedObject[index] =
        inputElement.type === "address"
          ? ethers.utils.isAddress(
              ethers.utils.getAddress(
                (state.ui[index] as any as UIStringFragmentField).value
              )
            )
            ? ethers.utils.getAddress(
                (state.ui[index] as any as UIStringFragmentField).value
              )
            : console.error("not an address", returnedObject[index])
          : inputElement.type === "tuple"
          ? extractTupleParams(state.ui[index] as any as UITupleFragmentField)
          : state.ui[index].value;
      if (inputElement.type && inputElement.type.includes("[]")) {
        returnedObject[index] = JSON.parse(returnedObject[index]);
      }
      if (inputElement.type && inputElement.type.includes("int")) {
        if (inputElement.type.includes("[]")) {
          returnedObject[index] = returnedObject.map((value: string) =>
            ethers.utils.parseUnits(
              value,
              (state.ui[index] as UINumberFragmentField).valueIsEther
                ? "ether"
                : "wei"
            )
          );
        } else {
          returnedObject[index] = ethers.utils.parseUnits(
            (state.ui[index] as UINumberFragmentField).value,
            (state.ui[index] as UINumberFragmentField).valueIsEther
              ? "ether"
              : "wei"
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
