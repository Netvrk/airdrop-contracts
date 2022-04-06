/**
 * @type import('hardhat/config').HardhatUserConfig
 */

 require("@nomiclabs/hardhat-waffle");

 module.exports = {
   defaultNetwork: "hardhat",
   networks: {
     hardhat: {
     },
     // polygon: {
     //   url: "",
     //   accounts: ['']
     // },
    //  mumbai: {
    //    //url: "",
    //    accounts: ['']
    //  },
   },
   solidity: {
     version: "0.8.11",
     settings: {
       optimizer: {
         enabled: true,
         runs: 200
       }
     }
   }
 }