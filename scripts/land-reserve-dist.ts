import { ethers, upgrades } from "hardhat";
import { NetvrkLandRewardDistribution } from "../typechain-types";

async function main() {
  const airdropContract = await ethers.getContractFactory("NetvrkLandRewardDistribution");

  const manager = "0x8c1c319f13ABfA03342EF727911035134eFDbd9C";
  const tokenAddress = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";

  const upgrade = true;
  const airdropAddress = "0x83077C690e13853B0eE61f651F6FC24058e75f69";

  if (upgrade) {
    const upgraded = await upgrades.upgradeProxy(airdropAddress, airdropContract, {
      kind: "uups",
    });

    await upgraded.deployed();
    console.log(`NetvrkLandRewardDistribution contract upgraded to ${airdropAddress}`);
  } else {
    const airdrop = (await upgrades.deployProxy(airdropContract, [tokenAddress, manager], {
      kind: "uups",
    })) as NetvrkLandRewardDistribution;

    await airdrop.deployed();

    console.log(`NetvrkLandRewardDistribution contract deployed to ${airdrop.address}`);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
