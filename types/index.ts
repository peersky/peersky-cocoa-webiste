import { BigNumberish, BytesLike } from "ethers";

export type SupportedChains =
  | "localhost"
  | "mumbai"
  | "polygon"
  | "ethereum"
  | "goerli";

export * as typechain from "typechain";
export * as enums from "./enums";

export const ProposalTypes = {
  signHashedProposal: [
    {
      type: "uint256",
      name: "gameId",
    },
    {
      type: "uint256",
      name: "turn",
    },
    {
      type: "bytes32",
      name: "salt",
    },
    {
      type: "string",
      name: "proposal",
    },
  ],
};

export interface ProposalMessage {
  gameId: BigNumberish;
  proposal: string;
  turn: BigNumberish;
  salt: BytesLike;
}
