import { ethers } from "hardhat";
export const deploy = async ({
  owner,
  uri,
}: {
  owner: string;
  uri: string;
}) => {
  if (!owner) throw new Error("Missing properties");

  const BananaChips = await ethers.getContractFactory("OneLoveCandyshop");

  const bananaChips = await BananaChips.deploy(uri, owner);
  await bananaChips.deployed();
  if (require.main === module) {
    console.log("One love candyshop hash:", bananaChips.deployTransaction.hash);
  }
  return bananaChips.address;
};

if (require.main === module) {
  if (!process.env.PRIVATE_KEY) throw new Error("PK not exported");
  if (!process.env.CONTRACT_OWNER)
    throw new Error("CONTRACT_OWNER not exported");
  if (!process.env.BASE_URI) throw new Error("BASE_URI not exported");

  deploy({
    owner: process.env.CONTRACT_OWNER,
    uri: process.env.BASE_URI,
  })
    .then((resp) => {
      console.log("one love candyshop token deployed:", resp);
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.deploy = deploy;
export default { deploy };
