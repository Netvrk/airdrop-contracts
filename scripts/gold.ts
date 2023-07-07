import { ethers } from "hardhat";

async function main() {
  const Gold = await ethers.getContractFactory("GOLD");
  const gold = await Gold.deploy();
  await gold.deployed();

  console.log("GOLD deployed to:", gold.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
