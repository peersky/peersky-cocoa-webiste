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
  private JsonRpcProvider;
  private chainId;
  constructor(ProviderNetwork: ethers.providers.Network) {
    if (!ProviderNetwork) throw new Error("Provider network not defined");
    this.JsonRpcProvider = new ethers.providers.BaseProvider(ProviderNetwork);
    this.chainId = ProviderNetwork.chainId;
  }

  public signRegistrarMessage = async (
    message: RegisterMessage,
    verifierAddress: string,
    signer: SignerIdentity
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

    const s = await signer.wallet._signTypedData(domain, types, { ...message });
    return s;
  };
}
