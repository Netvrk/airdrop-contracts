// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GOLD is ERC20 {
    constructor() ERC20("Gold", "GLD") {
        _mint(msg.sender, 10000000 ether);
    }
}
