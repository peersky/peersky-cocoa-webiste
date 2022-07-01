import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, Wallet } from "ethers";
export function getSelectors(contract: any): any;
export function getSelector(func: any): any;
export const FacetCutAction: any;
export function deployDiamond(
  FacetNames: string[],
  signer: Wallet | SignerWithAddress,
  initializer?: string,
  initializerArgs?: any
): Promise<string>;
