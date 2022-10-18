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
  private name;
  private version;
  constructor({
    chainId,
    contractName,
    version,
  }: {
    chainId: any;
    contractName: string;
    version: string;
  }) {
    // if (!ProviderNetwork) throw new Error("Provider network not defined");
    // this.JsonRpcProvider = new ethers.providers.BaseProvider(ProviderNetwork);
    this.chainId = chainId;
    this.name = contractName;
    this.version = version;
  }
  public getDappURL(
    message: any,
    signature: string,
    // type: string,
    basepath: string,
    contractAddress: string,
    domain: string
  ) {
    return (
      basepath +
      "/?message=" +
      Buffer.from(JSON.stringify(message)).toString("base64") +
      "&contractAddress=" +
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

  public getRegistrarMessage = ({
    username,
    id,
    domainName,
    validUntil,
  }: {
    username: string;
    id: string;
    domainName: string;
    validUntil: number;
  }) => {
    const registrarMessage = {
      name: ethers.utils.formatBytes32String(username),
      id: ethers.utils.formatBytes32String(id),
      domainName: ethers.utils.formatBytes32String(domainName),
      deadline: ethers.BigNumber.from(validUntil),
      nonce: ethers.BigNumber.from(0),
    };

    return registrarMessage;
  };
}
