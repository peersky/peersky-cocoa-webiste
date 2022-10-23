import { Wallet } from "ethers";
import { ethers } from "hardhat";
import { deployDiamond } from "./libraries/diamond";
import { transferOwnership } from "./libraries/utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export const deploy = async ({
  ownerAddress,
  signer,
  version,
  name,
}: {
  ownerAddress: string;
  signer?: Wallet | SignerWithAddress;
  version: string;
  name: string;
}) => {
  const _signer = signer ?? (await ethers.getSigners().then((s) => s[0]));
  if (!_signer || !ownerAddress || !version || !name)
    throw new Error("Missing properties");
  const diamondAddress = await deployDiamond(
    ["DiamondLoupeFacet", "OwnershipFacet", "DNSFacet", "EIP712InspectorFacet"],
    _signer,
    "MultipassInit",
    [name, version]
  );

  await transferOwnership(_signer, ownerAddress, diamondAddress);

  return diamondAddress;
};

if (require.main === module) {
  console.log("Executing trough require.main");
  if (!process.env.PRIVATE_KEY) throw new Error("PK not exported");
  if (!process.env.CONTRACTS_OWNER)
    throw new Error("CONTRACTS_OWNER not exported");
  if (
    !process.env.MULTIPASS_CONTRACT_VERSION ||
    !process.env.MULTIPASS_CONTRACT_NAME
  )
    throw new Error("Contract name/version not exported");
  // const signer = ethers.getSigners().then((signers) => signers[0]
  deploy({
    ownerAddress: process.env.CONTRACTS_OWNER,
    version: process.env.MULTIPASS_CONTRACT_VERSION,
    name: process.env.MULTIPASS_CONTRACT_NAME,
  })
    .then((resp: any) => {
      console.log("Multipass deployed:", resp);
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.deploy = deploy;
export default { deploy };
