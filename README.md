### Netvrk Airdrop Contracts for Quarterly Reserve Rewards Distribution

This project consists of smart contracts designed to distribute quarterly reserve rewards to Netvrk holders. The contracts use a Merkle tree to verify claims and ensure that each address can only claim their rewards once per snapshot. The distribution is managed through three main contracts:

- **NetvrkLandRewardDistribution**: Handles rewards for Netvrk Land holders.
- **NetvrkTransportRewardDistribution**: Handles rewards for Netvrk Transport holders.
- **NetvrkReserveDistributionEth**: Handles ETH rewards for Netvrk Reserve holders.

These contracts allow for the creation of airdrops, batch distribution of rewards, and secure withdrawal of remaining funds to a treasury address. Only authorized addresses with the `MANAGER_ROLE` can create and update airdrops, ensuring secure and controlled distribution.

#### Reward Airdrop (Polygon Network)

- **WETH Token (Token for distribution)**: [0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619](https://polygonscan.com/address/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619)
- **NetvrkLandRewardDistribution**: [0x83077c690e13853b0ee61f651f6fc24058e75f69](https://polygonscan.com/address/0x83077c690e13853b0ee61f651f6fc24058e75f69)
- **NetvrkTransportRewardDistribution**: [0x5161d60f549ebeafa9490f37169fc24a8c87a60a](https://polygonscan.com/address/0x5161d60f549ebeafa9490f37169fc24a8c87a60a)
- **NetvrkReserveDistributionEth**: [Contract Address](https://polygonscan.com/address/ContractAddress)

### Contracts Overview

These contracts handle the distribution of rewards for Netvrk holders. They use a Merkle tree to verify claims and ensure that each address can only claim their rewards once per snapshot.

**Key Functions:**

- `initialize`: Initializes the contract with the necessary parameters.
- `createAirdrop`: Creates a new airdrop with the given Merkle root and reward amount.
- `updateAirdrop`: Updates the current airdrop with a new Merkle root and additional reward amount.
- `batchAirdrop`: Performs a batch airdrop to multiple recipients.
- `withdrawFunds`: Withdraws all tokens or ETH from the contract to the specified treasury address.

### How to Use

1. **Deploy the Contracts**: Deploy the `NetvrkLandRewardDistribution`, `NetvrkTransportRewardDistribution`, and `NetvrkReserveDistributionEth` contracts to the Polygon network.
2. **Initialize the Contracts**: Call the `initialize` function on each contract with the appropriate parameters.
3. **Create Airdrops**: Use the `createAirdrop` function to create new airdrops with the Merkle root and reward amount.
4. **Batch Airdrop**: Use the `batchAirdrop` function to distribute rewards to multiple recipients.
5. **Withdraw Funds**: Use the `withdrawFunds` function to withdraw any remaining funds to the treasury address.

### Security Considerations

- Ensure that the Merkle root is correctly generated and corresponds to the intended recipients and amounts.
- Only authorized addresses (with the `MANAGER_ROLE`) should be able to create and update airdrops.
- Regularly audit the contracts to ensure there are no vulnerabilities.

### License

This project is licensed under the UNLICENSED License.
