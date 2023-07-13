import React, { Dispatch, ReducerAction } from "react";
import {
  Box,
  chakra,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  Portal,
  Button,
  InputGroup,
  Input,
  Select,
  Radio,
  RadioGroup,
  FormLabel,
  Stack,
} from "@chakra-ui/react";
import { LibCoinVending } from "../types/typechain/contracts/facets/RequirementsFacet";
import { BigNumberish, BytesLike, ethers } from "ethers";
import { v4 } from "uuid";
import { useAppRouter } from "../hooks/useRouter";

enum ContractTypes {
  ERC20 = 0,
  ERC1155 = 1,
  ERC721 = 2,
}
interface UIRequirementConfig {
  request: LibCoinVending.ConfigPositionStruct;
  ui: {
    lock: boolean;
    bet: boolean;
    have: boolean;
    pay: boolean;
    burn: boolean;
  };
  contractUIID: {
    id: string;
    lock?: boolean;
    bet?: boolean;
    have?: boolean;
    pay?: boolean;
    burn?: boolean;
  }[];
}

type FieldType = keyof UIRequirementConfig["ui"] | "contract";
type ActionType = "add" | "remove" | "update";

interface contractMust extends LibCoinVending.ConfigSmartRequirementStruct {
  type?: keyof UIRequirementConfig["ui"];
  // data: BytesLike;
  // amount: BigNumberish;
}
const reducer = (
  state: UIRequirementConfig,
  action: {
    fieldType: FieldType;
    actionType: ActionType;
    value?: BigNumberish | undefined | contractMust;
    uuid?: string;
  }
): UIRequirementConfig => {
  console.log("reducer");
  //   newState.ui[fieldType];
  let newState = { ...state };
  if (action.actionType === "add") {
    if (action.fieldType === "contract") {
      const _value = action.value as any as string;
      newState.request.contracts.push({
        contractType: ContractTypes.ERC20,
        contractAddress: "",
        contractId: "0",
        contractRequirement: {
          bet: { data: "0x00", amount: ethers.utils.parseEther("0") },
          have: { data: "0x00", amount: ethers.utils.parseEther("0") },
          lock: { data: "0x00", amount: ethers.utils.parseEther("0") },
          pay: { data: "0x00", amount: ethers.utils.parseEther("0") },
          burn: { data: "0x00", amount: ethers.utils.parseEther("0") },
        },
      });
      newState.contractUIID.push({ id: _value, pay: true });
      // console.log("pusing new contract", newState.request.contracts);
    } else {
      newState.ui[action.fieldType] = true;
    }
  }
  if (action.actionType === "remove") {
    if (action.fieldType === "contract") {
      const index = state.contractUIID?.findIndex(
        (cui) => cui.id == action.value
      );
      newState = { ...state };
      if (index != -1) {
        delete newState.contractUIID[index];
        delete newState.request.contracts[index];
      }
      // const _value =
      //   action.value as LibCoinVending.ConfigSmartRequirementStruct;
      // newState.request.contracts = state.request.contracts.filter(
      //   (contract) =>
      //     contract.contractAddress !== _value.contractAddress &&
      //     contract.contractRequirement != _value.contractRequirement
      // );
    } else {
      newState.ui[action.fieldType] = false;
      newState.request.ethValues[action.fieldType] = "0";
    }
  }
  if (action.actionType === "update") {
    if (action.fieldType === "contract") {
      const _value = action.value as any as contractMust;
      const idx = state.contractUIID?.findIndex(
        (contractUI) => contractUI.id == action.uuid
      );
      if (idx != -1) {
        newState.request.contracts[idx] = _value;
        if (_value.type) {
          newState.contractUIID[idx].bet = false;
          newState.contractUIID[idx].pay = false;
          newState.contractUIID[idx].lock = false;
          newState.contractUIID[idx].burn = false;
          newState.contractUIID[idx].have = false;
          newState.contractUIID[idx][_value.type] = true;
        }
      } else {
        console.error("NewRequirements: no contract found to update it");
      }
    }
  }
  return { ...newState };
};
const initialArgs: UIRequirementConfig = {
  ui: {
    lock: false,
    bet: false,
    have: false,
    pay: false,
    burn: false,
  },
  request: {
    contracts: [],
    ethValues: { pay: "0", bet: "0", lock: "0", have: "0", burn: "0" },
  },
  contractUIID: [],
};
const EthField = ({
  dispatch,
  reqs,
  type,
}: {
  dispatch: Dispatch<ReducerAction<typeof reducer>>;
  reqs: UIRequirementConfig;
  type: keyof UIRequirementConfig["ui"];
}) => {
  return (
    <Flex w="100%" alignItems="center">
      <NumberInput variant={"outline"} flexBasis="75px" flexGrow={1}>
        <NumberInputField
          placeholder={`Native tokens to ${type}`}
          // textColor={("blue.800")}
          // onKeyPress={onKeyPress}
          key={`eth-pay`}
          value={reqs.request.ethValues.pay.toString()}
          onChange={(event) =>
            dispatch({
              fieldType: type,
              actionType: "update",
              value: event.target.value,
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
      <Button
        onClick={() => dispatch({ fieldType: type, actionType: "remove" })}
        borderRadius="50%"
      >
        -
      </Button>
    </Flex>
  );
};

const ContractField = ({
  contract,
  dispatch,
  uuid,
  reqKey,
}: {
  contract: LibCoinVending.ConfigSmartRequirementStruct;
  dispatch: Dispatch<ReducerAction<typeof reducer>>;
  uuid: string;
  reqKey: keyof LibCoinVending.ContractConditionStruct;
}) => {
  return (
    <Flex
      direction={"column"}
      borderWidth="1px"
      borderColor={"blue.100"}
      p={2}
      my={4}
    >
      <Input
        type="search"
        value={
          typeof contract.contractAddress == "string"
            ? contract.contractAddress
            : ""
        }
        placeholder={"ContractAddress"}
        onChange={(event) =>
          dispatch({
            actionType: "update",
            fieldType: "contract",
            uuid: uuid,
            value: { ...contract, contractAddress: event.target.value },
          })
        }
      />
      <Flex direction="row" alignItems={"center"} mt="2">
        <Select
          minW="200px"
          mr={2}
          onChange={(e) =>
            dispatch({
              actionType: "update",
              fieldType: "contract",
              uuid: uuid,
              value: { ...contract, contractType: e.target.value },
            })
          }
          flexBasis="25px"
          flexGrow={1}
          maxW="200px"
          value={contract.contractType.toString()}
        >
          <option value={ContractTypes.ERC20}>ERC20</option>
          <option value={ContractTypes.ERC1155}>ERC1155</option>
          <option value={ContractTypes.ERC721}>ERC1155</option>
        </Select>

        {contract.contractType != ContractTypes.ERC20 && (
          <Input
            type="search"
            value={contract.contractId.toString()}
            placeholder={"token ID"}
            onChange={(event) =>
              dispatch({
                actionType: "update",
                uuid: uuid,
                fieldType: "contract",
                value: { ...contract, contractId: event.target.value },
              })
            }
          />
        )}
      </Flex>
      <RadioGroup
        onChange={(e) => {
          const _v = e as any as keyof UIRequirementConfig["ui"];
          dispatch({
            actionType: "update",
            uuid: uuid,
            fieldType: "contract",
            value: { ...contract, type: _v },
          });
        }}
      >
        <Stack direction={"row"} spacing={12} minH="48px">
          <Radio value="pay">Pay</Radio>
          <Radio value="bet">Bet</Radio>
          <Radio value="lock">Lock</Radio>
          <Radio value="have">Have</Radio>
        </Stack>
      </RadioGroup>
      <Flex direction={"row"} mt={2}>
        <Input
          type="search"
          value={contract.contractRequirement[reqKey].amount.toString()}
          placeholder={"amount"}
          onChange={(event) => {
            const newValue = { ...contract };
            newValue.contractRequirement[reqKey].amount = event.target.value;
            dispatch({
              actionType: "update",
              uuid: uuid,
              fieldType: "contract",
              value: { ...newValue },
            });
          }}
          mr={2}
        />
        <Input
          type="search"
          value={contract.contractRequirement[reqKey].data.toString()}
          placeholder={"data"}
          onChange={(event) => {
            const newValue = { ...contract };
            newValue.contractRequirement[reqKey].data = event.target.value;
            dispatch({
              actionType: "update",
              uuid: uuid,
              fieldType: "contract",
              value: { ...newValue },
            });
          }}
        />
      </Flex>
      <Button
        size="xs"
        onClick={() =>
          dispatch({ value: uuid, actionType: "remove", fieldType: "contract" })
        }
        mt={2}
      >
        Delete
      </Button>
    </Flex>
  );
};
// enum requirementType
const _NewRequirement = ({
  onSubmit,
  onCancel,
}: {
  onSubmit: (e: UIRequirementConfig) => void;
  onCancel?: () => void;
}) => {
  const [requirements, dispatch] = React.useReducer(reducer, initialArgs);

  return (
    <Flex direction={"column"} justifyItems="center">
      <Flex w="100%" direction={"column"} justifyItems="center">
        <>
          {Object.keys(requirements.ui)?.map((key) => {
            const _key = key as any as keyof UIRequirementConfig["ui"];
            if (!requirements.ui[_key]) return "";
            return (
              <EthField
                dispatch={dispatch}
                reqs={requirements}
                type={_key}
                key={key}
              />
            );
          })}
          {requirements.request.contracts.map((contract, idx) => {
            console.log("rxs", requirements.contractUIID[idx].id);
            return (
              <ContractField
                contract={contract}
                key={`ctrct-${requirements.contractUIID[idx].id}`}
                dispatch={dispatch}
                uuid={requirements.contractUIID[idx].id}
                reqKey={
                  Object.keys(requirements.contractUIID[idx])
                    .filter((key) => key != "id")
                    .filter(
                      (fkey) =>
                        (requirements.contractUIID[idx][
                          fkey
                        ] as any as boolean) == true
                    ) as any as keyof LibCoinVending.ContractConditionStruct
                }
              />
            );
          })}
        </>
      </Flex>
      <Menu variant={""}>
        <MenuButton as={Button} borderRadius="50%" mb={6}>
          +
        </MenuButton>
        {/* <Portal> */}
        <MenuList>
          <MenuGroup title="Native values">
            {!requirements.ui.pay && (
              <MenuItem
                onClick={() =>
                  dispatch({
                    actionType: "add",
                    fieldType: "pay",
                    value: "0",
                  })
                }
              >
                Pay ETH
              </MenuItem>
            )}
            {!requirements.ui.have && (
              <MenuItem
                onClick={() =>
                  dispatch({
                    actionType: "add",
                    fieldType: "have",
                    value: "0",
                  })
                }
              >
                Have ETH
              </MenuItem>
            )}
            {!requirements.ui.lock && (
              <MenuItem
                onClick={() =>
                  dispatch({
                    actionType: "add",
                    fieldType: "lock",
                    value: "0",
                  })
                }
              >
                Lock ETH
              </MenuItem>
            )}
            {!requirements.ui.bet && (
              <MenuItem
                onClick={() =>
                  dispatch({
                    actionType: "add",
                    fieldType: "bet",
                    value: "0",
                  })
                }
              >
                Bet ETH
              </MenuItem>
            )}
            {!requirements.ui.burn && (
              <MenuItem
                onClick={() =>
                  dispatch({
                    actionType: "add",
                    fieldType: "burn",
                    value: "0",
                  })
                }
              >
                Burn ETH
              </MenuItem>
            )}
          </MenuGroup>
          <MenuDivider />
          <MenuGroup title="Contracts">
            <MenuItem
              onClick={() => {
                console.log("onCLick!!!");
                dispatch({
                  actionType: "add",
                  fieldType: "contract",
                  value: v4(),
                });
              }}
            >
              contract
            </MenuItem>
          </MenuGroup>
        </MenuList>
        {/* </Portal> */}
      </Menu>
      <Flex dir="row">
        <Button
          onClick={() => {
            onSubmit(requirements);
          }}
        >
          Submit
        </Button>
        <Button onClick={onCancel}>Back</Button>
      </Flex>
    </Flex>
  );
};

export const NewRequirement = chakra(_NewRequirement);
