import { ethers } from "hardhat";
export const deploy = async ({
  owner,
  uri,
}: {
  owner: string;
  uri: string;
}) => {
  if (!owner) throw new Error("Missing properties");

  const PeerskyFriends = await ethers.getContractFactory("PeerskyFriends");

  const peerskyFriends = await PeerskyFriends.deploy(uri, owner);
  await peerskyFriends.deployed();
  if (require.main === module) {
    console.log(
      "Deploy peerky friends hash:",
      peerskyFriends.deployTransaction.hash
    );
  }
  return peerskyFriends.address;
};

if (require.main === module) {
  if (!process.env.PRIVATE_KEY) throw new Error("PK not exported");
  if (!process.env.PEERSKY_FRIENDS_OWNER)
    throw new Error("PEERSKY_FRIENDS_OWNER not exported");
  if (!process.env.PEERSKY_FRIENDS_IPFS)
    throw new Error("PEERSKY_FRIENDS_IPFS not exported");
  deploy({
    owner: process.env.PEERSKY_FRIENDS_OWNER,
    uri: process.env.PEERSKY_FRIENDS_IPFS,
  })
    .then((resp) => {
      console.log("Peersky friends token deployed:", resp);
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.deploy = deploy;
export default { deploy };
