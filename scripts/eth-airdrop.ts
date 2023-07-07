import { ethers, upgrades } from "hardhat";
import { NetvrkReserveDistributionEth } from "../typechain-types";

async function main() {
  const airdropContract = await ethers.getContractFactory(
    "NetvrkReserveDistributionEth"
  );
  const manager = "0xa840AcF5DC804E74BD88C4Bf4Bfe5f16b65024b2";
  const airdrop = (await upgrades.deployProxy(airdropContract, [manager], {
    kind: "uups",
  })) as NetvrkReserveDistributionEth;

  await airdrop.deployed();

  console.log(
    `NetvrkReserveDistributionEth contract deployed to ${airdrop.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
