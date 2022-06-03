/* global ethers */
/* eslint prefer-const: "off" */

// const { getSelectors, FacetCutAction } = require("./libraries/diamond.js");
// import { getSelectors, FacetCutAction } from "./libraries/diamond";

async function cutFacets({
  facets,
  initializer,
  diamondAddress,
  signer,
  initializerArgs,
}) {
  const getSelectors = await import("./libraries/diamond.js").then(
    (m) => m.getSelectors
  );

  const FacetCutAction = await import("./libraries/diamond.js").then(
    (m) => m.FacetCutAction
  );

  const cut = [];
  for (const facet of facets) {
    cut.push({
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facet),
    });
  }

  const diamondCut = await ethers.getContractAt("IDiamondCut", diamondAddress);
  let tx;
  let receipt;
  // call to init function
  let functionCall = initializer.interface.encodeFunctionData(
    "init",
    initializerArgs
  );
  tx = await diamondCut
    .connect(signer)
    .diamondCut(cut, initializer.address, functionCall);
  // console.log("Diamond cut tx: ", tx.hash);
  receipt = await tx.wait();
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`);
  }
}

async function deployDiamond(FacetNames, signer) {
  // deploy DiamondCutFacet
  const DiamondCutFacet = await ethers.getContractFactory(
    "DiamondCutFacet",
    signer
  );
  const diamondCutFacet = await DiamondCutFacet.deploy();
  await diamondCutFacet.deployed();
  // console.log("DiamondCutFacet deployed:", diamondCutFacet.address);

  // deploy Diamond
  const Diamond = await ethers.getContractFactory("Diamond", signer);
  const diamond = await Diamond.deploy(signer.address, diamondCutFacet.address);
  await diamond.deployed();
  // console.log("Diamond deployed:", diamond.address);

  // deploy DiamondInit
  // DiamondInit provides a function that is called when the diamond is upgraded to initialize state variables
  // Read about how the diamondCut function works here: https://eips.ethereum.org/EIPS/eip-2535#addingreplacingremoving-functions
  const DiamondInit = await ethers.getContractFactory("DiamondInit", signer);
  const diamondInit = await DiamondInit.deploy();
  await diamondInit.deployed();
  // console.log("DiamondInit deployed:", diamondInit.address);

  // deploy facets
  // console.log("Deploying facets");
  const facets = [];
  for (const FacetName of FacetNames) {
    const Facet = await ethers.getContractFactory(FacetName, signer);

    const facet = await Facet.deploy();
    await facet.deployed();
    facets.push(facet);
  }

  await cutFacets({
    facets,
    initializer: diamondInit,
    diamondAddress: diamond.address,
    signer: signer,
  });

  return diamond.address;
}

async function deployAndCutMultipass(
  diamondAddress,
  version,
  name,
  signer,
  multipassInitializerFacetName
) {
  const Facet = await ethers.getContractFactory("Multipass", signer);
  const facet = await Facet.deploy();
  await facet.deployed();

  const DiamondInit = await ethers.getContractFactory(
    multipassInitializerFacetName,
    signer
  );
  const diamondInit = await DiamondInit.deploy();
  await diamondInit.deployed();

  await cutFacets({
    facets: [facet],
    initializer: diamondInit,
    diamondAddress: diamondAddress,
    signer: signer,
    initializerArgs: [name, version],
  });
  return facet.address;
}

async function transferOwnership(signer, newOwnerAddress, diamondAddress) {
  const ownershipFacet = await ethers.getContractAt(
    "OwnershipFacet",
    diamondAddress
  );
  tx = await ownershipFacet.connect(signer).transferOwnership(newOwnerAddress);
  // console.log("Diamond cut tx: ", tx.hash);
  receipt = await tx.wait();
  if (!receipt.status) {
    throw Error(`Transfer ownership failed: ${tx.hash}`);
  }
}

async function deploySequence(
  signer,
  ownerAddress,
  contractVersion,
  contractName,
  FacetNames,
  multipassInitializerFacetName
) {
  const diamondAddress = await deployDiamond(FacetNames, signer);
  // console.log("diamond address:", diamondAddress);
  const multipassFacetAddress = await deployAndCutMultipass(
    diamondAddress,
    contractVersion,
    contractName,
    signer,
    multipassInitializerFacetName
  );
  // console.log("multipass Facet address:", multipassFacetAddress);

  await transferOwnership(signer, ownerAddress, diamondAddress);

  return diamondAddress;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deployDiamond()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.deployAndCutMultipass = deployAndCutMultipass;
exports.deployDiamond = deployDiamond;
exports.transferOwnership = transferOwnership;
exports.deploySequence = deploySequence;
