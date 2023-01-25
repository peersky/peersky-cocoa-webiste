import { ethers } from "hardhat";
import fs from "fs";
import { Wallet } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
export const deploy = async ({
  owner,
  signer,
  URI,
}: {
  URI: string;
  signer?: Wallet | SignerWithAddress;
  owner?: string;
}) => {
  const _signer = signer ?? (await ethers.getSigners().then((s) => s[0]));
  if (!_signer || !URI) throw new Error("Missing properties");

  const RankToken = await ethers.getContractFactory("RankToken", _signer);

  const rankToken = await RankToken.deploy(URI, owner ?? _signer.address);
  await rankToken.deployed();
  return rankToken.address;
};

if (require.main === module) {
  if (!process.env.PRIVATE_KEY) throw new Error("PK not exported");
  if (!process.env.CONTRACTS_OWNER)
    throw new Error("CONTRACTS OWNER not exported");
  if (!process.env.IPFS_GATEWAY_URL)
    throw new Error("IPFS_GATEWAY_URL not exported");
  if (!process.env.RANK_TOKEN_PATH)
    throw new Error("RANK_TOKEN_PATH not exported");
  // const signer = new ethers.Wallet(process.env.PRIVATE_KEY);
  deploy({
    URI: process.env.IPFS_GATEWAY_URL + process.env.RANK_TOKEN_PATH,
    // owner: process.env.CONTRACTS_OWNER,
    // signer: signer,
  })
    .then((resp) => {
      console.log("Rank token deployed:", resp);
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.deploy = deploy;
export default { deploy };
