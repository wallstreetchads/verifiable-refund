# WSC Refund Program

Contains code for the smart contract deployed, the ABI, the Ethereum addresses of the WSC ERC-721 
tokens, and finally, the root hash, generated and stored in the smart contract to allow efficient
and cheap validation of ownership.

## Purpose

 - Provides necessary ABI to interact with contract, which is verified on Etherscan.
 - Provides smart contract code for general auditing.
 - Provides reproducible steps and code to allow anyone to validate that an accurate merkle tree hash containing only WSC NFT addresses has been
 stored in the contract.

## References
 - Using Merkle Trees for NFT Whitelist: https://medium.com/@ItsCuzzo/using-merkle-trees-for-nft-whitelists-523b58ada3f9
 - [Deployed Contract Address](https://etherscan.io/address/0x03e4ED57c77034e1e7d742C99a5434679897d192)

## Steps 

Note: The WSC addresses within (`wscOwnerAddressesSnapshot.json`) were provided so that any contributor can use them and reverse engineer the generation of the root hash, before cross referencing the hash stored in the smart contract, which allows any individual to validate that the hash stored within the deployed contract represents the true merkle tree of addresses at snapshot.

In order to validate the **only** the WSC ERC-721 addresses are allowed to get a refund from the contract:
- Read through the reference to understand logic behind Merkle Trees
- Install the necessary packages with `npm install`
- Run the verify script.js with `node verify.js` within your terminal of choice

# NEW REFUND CONTRACT

## High Level

- The second stage of the refund process involves directly depositing ETH into the NFT owner's wallets.
- In order to do so, the script to generate the wallets and their respective refund amount has been created and can be found within function `generateAmountOfETHForEveryWallet.js` 
- The script above saves the wallets in batches of 200, which will then be sent to the `MultiRecipientETHDistributionContract.sol` created in order to provide a direct deposit.

# OLD REFUND CONTRACT

## Steps to Validate Properties of Contract

1. Head to [Etherscan link of contract]((https://etherscan.io/address/0x03e4ED57c77034e1e7d742C99a5434679897d192))
2. Click on Contract and then on "Read Contract"
3. Validate that the merkle root `merkleRoot` is equivalent to the hash stored in `root.js` 
4. Validate that the `nftContract` is the NFT contract
5. Validate that the `multiSignatureWallet` is the treasury wallet

## Steps for Refund Activation

1. [x] Set the correct NFT contract address internally `setNFTContract`
2. [x] Set the merkle tree hash `setMerkleRoot`
3. [x] Set multisignature wallet for emergency withdrawal with `setMultiSignatureWallet`
4. Send crypto to contract
5. Save original balance `saveOriginalBalance`
6. Lock contract to prevent NFT adress, merkle tree hash, or original balance change.
7. Activate contract

## Contract Description

- The main refund method is called `goToValhalla()`
