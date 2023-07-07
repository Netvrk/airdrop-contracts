import { ethers, upgrades } from "hardhat";
import { NetvrkTransportRewardDistribution } from "../typechain-types";

async function main() {
  const airdropContract = await ethers.getContractFactory("NetvrkTransportRewardDistribution");

  const manager = "0x8c1c319f13ABfA03342EF727911035134eFDbd9C";
  const tokenAddress = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";

  const upgrade = true;
  const airdropAddress = "0x5161d60f549eBEaFA9490F37169fc24A8c87a60a";

  if (upgrade) {
    const upgraded = await upgrades.upgradeProxy(airdropAddress, airdropContract, {
      kind: "uups",
    });

    await upgraded.deployed();
    console.log(`NetvrkTransportRewardDistribution contract upgraded to ${airdropAddress}`);
  } else {
    const airdrop = (await upgrades.deployProxy(airdropContract, [tokenAddress, manager], {
      kind: "uups",
    })) as NetvrkTransportRewardDistribution;

    await airdrop.deployed();

    console.log(`NetvrkTransportRewardDistribution contract deployed to ${airdrop.address}`);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
