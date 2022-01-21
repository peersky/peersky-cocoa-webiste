async function main() {
  // We get the contract to deploy
  const contract = await ethers.getContractAt(
    "ScoreBoard",
    "0xc97E8dD55Fa75bBF1644f652625E3999772A87a7"
  );
  //   await contract.deployed();
  const response = await contract.readScoreBoard();
  console.log("exit", response);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
