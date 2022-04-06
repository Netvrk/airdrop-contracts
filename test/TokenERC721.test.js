const { expect } = require('chai');
const { ethers } = require("hardhat")

describe('TokenERC721 contract', () => {
  let TokenERC721, tokenERC721, owner, addr1, addr2, addr3;

  let name = "AndrewToken721"
  let symbol = "AT721"
  let numTokens = 4
  let airdropAddresses
  let transferTokenIds

  beforeEach(async () => {
    [owner, addr1, addr2, addr3, _] = await ethers.getSigners();

    airdropAddresses = [addr1.address, addr2.address, addr3.address]
    transferTokenIds = [1, 2, 3]

    TokenERC721 = await ethers.getContractFactory('TokenERC721');
    tokenERC721 = await TokenERC721.deploy(name, symbol);
  })

  describe('Deployment', () => {
    // Ownable - owner
    it('tracks the owner', async () => {
      expect(await tokenERC721.connect(owner).owner()).to.equal(owner.address)
    })
    // name
    it('tracks the name', async () => {
      expect(await tokenERC721.connect(owner).name()).to.equal(name)
    })
    // symbol
    it('tracks the symbol', async () => {
      expect(await tokenERC721.connect(owner).symbol()).to.equal(symbol)
    })
    // adds minter
    it('adds sender as minter', async () => {
      let isMinter = await tokenERC721.minters(owner.address)
      expect(isMinter).to.equal(true)
    })
  })

  describe('minting control', () => {
    describe('Success', () => {
      // add and remove minters
      it('correctly adds and removes minters', async () => {
        let isMinter = await tokenERC721.minters(addr1.address)
        expect(isMinter).to.equal(false)
        await tokenERC721.connect(owner).addMinter(addr1.address)
        isMinter = await tokenERC721.minters(addr1.address)
        expect(isMinter).to.equal(true)
        await tokenERC721.connect(owner).removeMinter(addr1.address)
        isMinter = await tokenERC721.minters(addr1.address)
        expect(isMinter).to.equal(false)
      })
      // addMinter - event
      it('emits a MinterAdded event ', async () => {
        await expect(tokenERC721.connect(owner).addMinter(addr1.address))
          .to.emit(tokenERC721, 'MinterAdded')
          .withArgs(
            addr1.address
          );
      })
      // removeMinter - event
      it('emits a MinterRemoved event ', async () => {
        await expect(tokenERC721.connect(owner).removeMinter(addr1.address))
          .to.emit(tokenERC721, 'MinterRemoved')
          .withArgs(
            addr1.address
          );
      })
    })

    describe('Failure', () => {
      // addMinter: Ownable - caller must be owner
      it('addMinter: reverts if caller is not owner', async () => {
        await expect(tokenERC721.connect(addr1).addMinter(addr1.address)).to.be.revertedWith('Ownable: caller is not the owner')
      })
      // removeMinter: Ownable - caller must be owner
      it('removeMinter: reverts if caller is not owner', async () => {
        await expect(tokenERC721.connect(addr1).removeMinter(addr1.address)).to.be.revertedWith('Ownable: caller is not the owner')
      })
    })
  })

  describe('mint batch airdrop', () => {
    describe('Success', () => {
      // mint batch airdrop
      it('correctly mint batch airdrop', async () => {
        // check first batch token ids
        await tokenERC721.connect(owner).mintBatchAirdrop(airdropAddresses)
        let tokenOwner = await tokenERC721.connect(owner).ownerOf(1)
        expect(tokenOwner).to.equal(addr1.address)
        tokenOwner = await tokenERC721.connect(owner).ownerOf(2)
        expect(tokenOwner).to.equal(addr2.address)
        tokenOwner = await tokenERC721.connect(owner).ownerOf(3)
        expect(tokenOwner).to.equal(addr3.address)

        // check next batch token ids
        await tokenERC721.connect(owner).mintBatchAirdrop(airdropAddresses)
        tokenOwner = await tokenERC721.connect(owner).ownerOf(4)
        expect(tokenOwner).to.equal(addr1.address)
        tokenOwner = await tokenERC721.connect(owner).ownerOf(5)
        expect(tokenOwner).to.equal(addr2.address)
        tokenOwner = await tokenERC721.connect(owner).ownerOf(6)
        expect(tokenOwner).to.equal(addr3.address)
      })
      // mintBatchAirdrop - event
      it('emits a MintBatchAirdrop event ', async () => {
        await expect(tokenERC721.connect(owner).mintBatchAirdrop(airdropAddresses))
          .to.emit(tokenERC721, 'MintBatchAirdrop')
          .withArgs(
            airdropAddresses,
            1
          );
      })
    })

    describe('Failure', () => {
      // mintBatchAirdrop: caller must be minter
      it('mintBatchAirdrop: reverts if caller is not minter', async () => {
        await expect(tokenERC721.connect(addr1).mintBatchAirdrop(airdropAddresses)).to.be.revertedWith('sender is not a minter')
      })
      // mintBatchAirdrop: minting is locked
      it('mintBatchAirdrop: reverts if minting is locked', async () => {
        await tokenERC721.connect(owner).lockMinting()
        await expect(tokenERC721.connect(owner).mintBatchAirdrop(airdropAddresses)).to.be.revertedWith('minting is locked')
      })
    })
  })

  describe('mint to owner', () => {
    describe('Success', () => {
      // mint to owner
      it('correctly mints to owner', async () => {
        // check first batch of tokens
        await tokenERC721.connect(owner).mintToOwner(numTokens)
        let tokenOwner = await tokenERC721.connect(owner).ownerOf(1)
        expect(tokenOwner).to.equal(owner.address)
        tokenOwner = await tokenERC721.connect(owner).ownerOf(2)
        expect(tokenOwner).to.equal(owner.address)
        tokenOwner = await tokenERC721.connect(owner).ownerOf(3)
        expect(tokenOwner).to.equal(owner.address)
        tokenOwner = await tokenERC721.connect(owner).ownerOf(4)
        expect(tokenOwner).to.equal(owner.address)

        // check next batch of tokens
        await tokenERC721.connect(owner).mintToOwner(numTokens)
        tokenOwner = await tokenERC721.connect(owner).ownerOf(5)
        expect(tokenOwner).to.equal(owner.address)
        tokenOwner = await tokenERC721.connect(owner).ownerOf(6)
        expect(tokenOwner).to.equal(owner.address)
        tokenOwner = await tokenERC721.connect(owner).ownerOf(7)
        expect(tokenOwner).to.equal(owner.address)
        tokenOwner = await tokenERC721.connect(owner).ownerOf(8)
        expect(tokenOwner).to.equal(owner.address)
      })
      // mintToOwner - event
      it('emits a MintToOwner event ', async () => {
        await expect(tokenERC721.connect(owner).mintToOwner(numTokens))
          .to.emit(tokenERC721, 'MintToOwner')
          .withArgs(
            owner.address,
            1,
            numTokens
          );
      })
    })

    describe('Failure', () => {
      // mintToOwner: caller must be owner
      it('mintToOwner: reverts if caller is not minter', async () => {
        await expect(tokenERC721.connect(addr1).mintToOwner(numTokens)).to.be.revertedWith('Ownable: caller is not the owner')
      })
      // mintToOwner: minting is locked
      it('mintToOwner: reverts if minting is locked', async () => {
        await tokenERC721.connect(owner).lockMinting()
        await expect(tokenERC721.connect(owner).mintToOwner(numTokens)).to.be.revertedWith('minting is locked')
      })
    })
  })

  describe('mint to owner', () => {
    describe('Success', () => {
      // mint to owner
      it('correctly mints to owner', async () => {
        // check first batch of tokens
        await tokenERC721.connect(owner).mintToOwner(numTokens)
        await tokenERC721.connect(owner).transferBatchAirdrop(airdropAddresses, transferTokenIds)

        // check owners
        let tokenOwner = await tokenERC721.connect(owner).ownerOf(1)
        expect(tokenOwner).to.equal(addr1.address)
        tokenOwner = await tokenERC721.connect(owner).ownerOf(2)
        expect(tokenOwner).to.equal(addr2.address)
        tokenOwner = await tokenERC721.connect(owner).ownerOf(3)
        expect(tokenOwner).to.equal(addr3.address)
      })
      // transferBatchAirdrop - event
      it('emits a TransferBatchAirdrop event ', async () => {
        await tokenERC721.connect(owner).mintToOwner(numTokens)
        await expect(tokenERC721.connect(owner).transferBatchAirdrop(airdropAddresses, transferTokenIds))
          .to.emit(tokenERC721, 'TransferBatchAirdrop')
          .withArgs(
            owner.address,
            airdropAddresses,
            transferTokenIds
          );
      })
    })

    describe('Failure', () => {
      // transferBatchAirdrop: caller must be minter
      it('mintBatchAirdrop: reverts if caller is not minter', async () => {
        await expect(tokenERC721.connect(addr1).transferBatchAirdrop(airdropAddresses, transferTokenIds)).to.be.revertedWith('sender is not a minter')
      })
    })
  })
})