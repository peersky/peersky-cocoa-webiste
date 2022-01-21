async function main() {
  // We get the contract to deploy
  const Token = await ethers.getContractFactory("ScoreBoard");
  const token = await Token.attach(
    "0xc97E8dD55Fa75bBF1644f652625E3999772A87a7"
  );
  await token.registerParticipant("0xCA618ea6Adb914B694E2acF1d77fe92894fbfA30");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
