import { ethers, BigNumber, Wallet, BytesLike } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Network } from "hardhat/types";

export interface SignerIdentity {
  name: string;
  id: string;
  wallet: Wallet | SignerWithAddress;
}
interface ReferrerMesage {
  referrerAddress: string;
}
interface RegisterMessage {
  name: BytesLike;
  id: BytesLike;
  domainName: BytesLike;
  deadline: BigNumber;
  nonce: BigNumber;
}

type signatureMessage = ReferrerMesage | RegisterMessage;

export class MultipassJs {
  // private JsonRpcProvider;
  private chainId;
  constructor(chainId: any) {
    // console.log("ProviderNetwork", ProviderNetwork);
    // if (!ProviderNetwork) throw new Error("Provider network not defined");
    // this.JsonRpcProvider = new ethers.providers.BaseProvider(ProviderNetwork);
    this.chainId = chainId;
  }
  public getDappURL(
    message: any,
    signature: string,
    // type: string,
    basepath: string,
    contractAddress: string,
    domain: string
  ) {
    console.dir(message);
    return (
      basepath +
      "/?message=" +
      Buffer.from(JSON.stringify(message)).toString("base64") +
      "&contractAddess=" +
      contractAddress +
      "&domain=" +
      domain +
      "&signature=" +
      signature +
      "&chainId=" +
      this.chainId
    );
  }
  public signRegistrarMessage = async (
    message: RegisterMessage,
    verifierAddress: string,
    signer: Wallet | SignerWithAddress
  ) => {
    let chainId = this.chainId;

    const domain = {
      name: process.env.MULTIPASS_CONTRACT_NAME,
      version: process.env.MULTIPASS_CONTRACT_VERSION,
      chainId,
      verifyingContract: verifierAddress,
    };

    const types = {
      registerName: [
        {
          type: "bytes32",
          name: "name",
        },
        {
          type: "bytes32",
          name: "id",
        },
        {
          type: "bytes32",
          name: "domainName",
        },
        {
          type: "uint256",
          name: "deadline",
        },
        {
          type: "uint96",
          name: "nonce",
        },
      ],
    };

    const s = await signer._signTypedData(domain, types, { ...message });
    return s;
  };
}
