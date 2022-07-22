import { ethers } from "hardhat";
export const deploy = async ({ owner }: { owner: string }) => {
  if (!owner) throw new Error("Missing properties");

  const BananaChips = await ethers.getContractFactory("BananaChips");

  const bananaChips = await BananaChips.deploy(owner);
  await bananaChips.deployed();
  if (require.main === module) {
    console.log(
      "Deploy banana chips hash:",
      bananaChips.deployTransaction.hash
    );
  }
  return bananaChips.address;
};

if (require.main === module) {
  if (!process.env.PRIVATE_KEY) throw new Error("PK not exported");
  if (!process.env.BANANA_OWNER) throw new Error("BANANA_OWNER not exported");

  deploy({
    owner: process.env.BANANA_OWNER,
  })
    .then((resp) => {
      console.log("banana token deployed:", resp);
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.deploy = deploy;
export default { deploy };
