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
  signer: Wallet | SignerWithAddress;
  owner: string;
}) => {
  if (!owner || !signer || !URI) throw new Error("Missing properties");

  const RankToken = await ethers.getContractFactory("RankToken", signer);

  const rankToken = await RankToken.deploy(URI, owner);
  await rankToken.deployed();
  process.env["TEST_IF_THIS_WORKS"] = rankToken.address;
  return rankToken.address;
};

if (require.main === module) {
  if (!process.env.PRIVATE_KEY) throw new Error("PK not exported");
  if (!process.env.CONTRACT_OWNER)
    throw new Error("CONTRACT OWNER not exported");
  if (!process.env.INFURA_URL || process.env.RANK_TOKEN_PATH)
    throw new Error("Rank token IPFS route not exported");
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY);
  deploy({
    URI: process.env.INFURA_URL + process.env.RANK_TOKEN_PATH,
    owner: process.env.CONTRACT_OWNER,
    signer: signer,
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
