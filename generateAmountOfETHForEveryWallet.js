/**
 * @IMPORTANT The refund process is executed through the scope of the refund policy, which
 * can be found in the #refund-policy channel.
 */

const fs = require('fs');
const { readFile } = require('fs/promises');
const wscOwnerAddresses = require('./wscOwnerAddressesSnapshot.json');
const path = require('path');

// WSC Contract
const SMART_CONTRACT_ADDRESS = "0xf341ed41475fedd4704902b4b82f1d2eb4d477e8";
// Multi-sig Wallet
const TREASURY_ADDRESS = "0x26a5A3f9707563e136a59cDE25805D8fE033b09C"; 

const ethers = require('ethers');
const { BigNumber } = require("ethers");
// const { AlchemyProvider } = require('ethers');

/**
 * @STEPS
 * 1- Insert API key below for Alchemy, Infura, or Provider
 * 1.B- If using provider other than Alchemy, comment out Alchemy and comment-in
 * the provider that you'll be using to avoid any re-assignment errors
 * 2- Run `npm install` in your terminal
 * 3- Run `node generateAmountOfETHForEveryWallet.js` in your terminal 
 * 
 * @DESCRIPTION 
 * - The program below will generate the amount of ETH that each wallet will receive
 * as part of the refund,  which you can validate against the actual ETH that is sent to 
 * every wallet.
 * 
 * @important The refund will be executed in 6-7 batches to 1,200+ wallets through a permission-less
 * smart contract, which can be found in this repository. This means that a certain amount
 * needs to be put aside to pay for the gas fee that will be used in order to make those
 * batch calls - this gas fee can be modified by changing the value of the variable
 * "num_amountOfEthToSetAsideForGas"
 * 
 * @example num_amountOfEthToSetAsideForGas = "0" means that nothing is set aside for gas - this means
 * that the entire amount of ETH in the treasury will be used to refund the wallets
 * @example num_amountOfEthToSetAsideForGas = "1" means that 1 ETH is set aside for gas costs 
 * 
 * @privateComment The goal will be to ensure that the batch deposit contract is alled in a low gas
 * environment.
 * 
 * @POTENTIAL_BUG
 * - If you run into an issue that says that "AlchemyProvider" is not present, you might have installed
 * the wrong version of the 'ethers' library - which you can fix by running
 * 
 * `npm uninstall ethers`
 * `npm install ethers@5.7.2` => Which will install version 5.7.2 of the ethers library
 * 
 */

const ALCHEMY_API_KEY = "-lOVAsrAaVEHjlsELV7a5ZxdcNghvteD";
const provider = new ethers.providers.AlchemyProvider(1, ALCHEMY_API_KEY);

// const INFURA_API_KEY = "INSERT_API_KEY_HERE";
// const provider = new ethers.providers.InfuraProvider(1, INFURA_API_KEY);

// const ETHERSCAN_API_KEY = "INSERT_API_KEY_HERE";
// const etherscanProvider = new ethers.providers.EtherscanProvider(1, ETHERSCAN_API_KEY);

async function generateAmountOfETHOfEveryWallet() {
    
    const num_amountOfEthToSetAsideForGas = "0";
    const bigNum_amountOfEthToSetAsideForGas = ethers.utils.parseEther(num_amountOfEthToSetAsideForGas);
    
    /** 
     * @ see https://etherscan.io/address/0x03e4ED57c77034e1e7d742C99a5434679897d192
     * and review the addresses that made a call to `goToValhalla` which is the
     * claim function
     */
    
    const addressesWhichHaveAlreadyClaimed =  {
        "0x7c3ef1c57c750a9f1b7a8e8b599a71e4cf4cc9e5": true, 
        "0xc1d821618c610a2bdf6d88336a541a898aa7804b": true, 
        "0x3c94f4a9bbffbb6587b41c8e084293438e6992e0": true, 
        "0x7a7f0f09eadbbb07f9794497a4b5ae332688cf69": true, 
    }

    const listOfAddressesWhichHaveAlreadyClaimed = Object.keys(addressesWhichHaveAlreadyClaimed).map(address => address.toLowerCase());

    const lowercased_addressesWhichHaveAlreadyClaimed = {};

    listOfAddressesWhichHaveAlreadyClaimed.forEach(address => {
        lowercased_addressesWhichHaveAlreadyClaimed[address.toLowerCase()] = true;
    });
    console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ listOfAddressesWhichHaveAlreadyClaimed:", listOfAddressesWhichHaveAlreadyClaimed)

    const addresses = Object.keys(wscOwnerAddresses);
    console.log("🚀 ~ generateMerkleTree ~ addresses:", addresses)

    const mappingOfWalletsToAmountOfGWEIOwed = {};

    const amountOfETHInTreasury = await provider.getBalance(TREASURY_ADDRESS);
    // const amountOfETHInTreasury = await web3.eth.getBalance(TREASURY_ADDRESS);

    const amountOfETHInTreasuryMinusGas = amountOfETHInTreasury.sub(bigNum_amountOfEthToSetAsideForGas);
    console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ amountOfETHInTreasuryMinusGas:", amountOfETHInTreasuryMinusGas)

    /**
     * @privateCommnent
     * Extracted from .originalBalance saved in the Merkle Distribution
     * contract deployed @see https://etherscan.io/address/0x03e4ED57c77034e1e7d742C99a5434679897d192
     */
    
    const num_originalBalance = "54073000000000000000";
    const bigNum_originalBalance = BigNumber.from(num_originalBalance);
    const bigNum_originalBalanceMinusGas = bigNum_originalBalance.sub(bigNum_amountOfEthToSetAsideForGas);

    console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ amountOfETHInTreasury:", amountOfETHInTreasury)
    
    for (let i = 0; i < addresses.length; i++) {
        
        // 1621865626874625 
        // 16218656268746250

        const address = addresses[i];
        const nftsOwnedByAddress = wscOwnerAddresses[address];
        console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ nftsOwnedByAddress:", nftsOwnedByAddress)

        const num_amountOfETHInTreasury = Number(amountOfETHInTreasury);
        console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ num_amountOfETHInTreasury:", num_amountOfETHInTreasury)
        
        // const amountOfGWEIOwed = (nftsOwnedByAddress / 3334) * Number(amountOfETHInTreasury);
        // const amountOfGWEIOwed = (nftsOwnedByAddress / 3334) * Number(bigNum_originalBalance);
        const amountOfGWEIOwed = (nftsOwnedByAddress / 3334) * Number(bigNum_originalBalanceMinusGas);
        // const amountOfGWEIOwed = BigNumber.from(nftsOwnedByAddress).div(3334).mul(amountOfETHInTreasury);
        console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ amountOfGWEIOwed:", amountOfGWEIOwed)

        // const amountOfETHOwed = ethers.utils.formatEther(BigNumber.from(amountOfGWEIOwed));
        // console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ amountOfETHOwed:", amountOfETHOwed)
        
        mappingOfWalletsToAmountOfGWEIOwed[address.toLowerCase()] = amountOfGWEIOwed;
        // mappingOfWalletsToAmountOfETHOwed[address] = amountOfETHOwed;
        
    }
    
    console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ mappingOfWalletsToAmountOfGWEIOwed:", mappingOfWalletsToAmountOfGWEIOwed)
    // console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ mappingOfWalletsToAmountOfETHOwed:", mappingOfWalletsToAmountOfETHOwed)

    /** Filtering */
    const totalCountOfAddresses = Object.keys(mappingOfWalletsToAmountOfGWEIOwed).length;
    console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ totalCountOfAddresses:", totalCountOfAddresses)
    const NUM_OF_WALLETS_PER_BATCH = 200;
    const NUM_OF_BATCHES = Math.ceil(totalCountOfAddresses / NUM_OF_WALLETS_PER_BATCH);
    console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ NUM_OF_BATCHES:", NUM_OF_BATCHES)
    const allWalletsInMapping = Object.keys(mappingOfWalletsToAmountOfGWEIOwed).map(address => address.toLowerCase());

    let currentCounter = 0;
    let walletToRefundAmountBatch = {};
    let batchNumber = 0;
    let actualIndexOfWallet = 0;

    // Filter out wallets that have already claimed
    // const filteredWallets = allWalletsInMapping.filter(wallet => !listOfAddressesWhichHaveAlreadyClaimed[wallet.toLowerCase()]);
    const filteredWallets = [];
    
    for (const walletAddress of allWalletsInMapping) {
        const walletAddressIsForbidden = lowercased_addressesWhichHaveAlreadyClaimed[walletAddress.toLowerCase()];
        if (walletAddressIsForbidden) {
            console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ walletAddressIsForbidden:", walletAddressIsForbidden)
            // filteredWallets.push(walletAddress);
        } else {
            filteredWallets.push(walletAddress);
        }
    }

    // Invariant
    const countOfFilteredWallets = filteredWallets.length;
    console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ filteredWallets:", filteredWallets)
    console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ countOfFilteredWallets:", countOfFilteredWallets)

    const countOfWalletsThatHaveClaimed = listOfAddressesWhichHaveAlreadyClaimed.length;
    console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ countOfWalletsThatHaveClaimed:", countOfWalletsThatHaveClaimed)
    
    const countValidated = (countOfFilteredWallets + countOfWalletsThatHaveClaimed) === totalCountOfAddresses;
    console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ countValidated:", countValidated)

    if (!countValidated) {
        throw new Error("The count of filtered wallets and the count of wallets that have already claimed does not match the total count of addresses");
    }
    
    const fileNames = [];
    
    while ((actualIndexOfWallet <= countOfFilteredWallets && batchNumber <= NUM_OF_BATCHES)) {

        const currentWalletAddress = filteredWallets[actualIndexOfWallet]
        
        if (currentWalletAddress !== undefined) {

            const lowerCasedAddress = currentWalletAddress.toLowerCase();
            console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ lowerCasedAddress:", lowerCasedAddress)
            // console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ filteredWallets:", filteredWallets)
            const walletAddressRefundAmountInGWEI = mappingOfWalletsToAmountOfGWEIOwed[lowerCasedAddress];
            console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ walletAddressRefundAmountInGWEI:", walletAddressRefundAmountInGWEI)
            
            walletToRefundAmountBatch[lowerCasedAddress] = walletAddressRefundAmountInGWEI;
    
            currentCounter++;
            actualIndexOfWallet++;
    
            if (currentCounter === NUM_OF_WALLETS_PER_BATCH) {
                const fileName = `batch_${batchNumber}.json`
                fs.writeFileSync(fileName, JSON.stringify(walletToRefundAmountBatch));
                fileNames.push(fileName);
                currentCounter = 0;
                batchNumber++;
                walletToRefundAmountBatch = {};
            }
        }
        console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ actualIndexOfWallet:", actualIndexOfWallet)
        console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ batchNumber:", batchNumber)

        if (actualIndexOfWallet === countOfFilteredWallets) {
            break;
        }
        
    }

    // Append the last one 
    fs.writeFileSync(`batch_${batchNumber}.json`, JSON.stringify(walletToRefundAmountBatch));
    fileNames.push(`batch_${batchNumber}.json`);
    
    /** Post-execution invariant => Checks that no all addresses are present + no claimed ones */

    console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ fileNames:", fileNames)

    // Loop through file names and merge wallets
    const allWalletsInBatches = {};

    for (let i = 0; i < fileNames.length; i++) {
        const fileName = fileNames[i];
        // Read file and convert to JSON
        // const walletsInBatch = JSON.parse(fs.readFileSync(`./${fileName}`, "utf8"));;
        // const walletsInBatch = fs.readFileSync(`./${fileName}`, "utf8");;
        const walletsInBatch = JSON.parse(await readFile(fileName, "utf8"));
        console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ walletsInBatch:", walletsInBatch)
        Object.assign(allWalletsInBatches, walletsInBatch);
    }

    const countOfWalletInBatches = Object.keys(allWalletsInBatches).length;
    console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ countOfWalletInBatches:", countOfWalletInBatches)

    if (countOfWalletInBatches !== countOfFilteredWallets) { 
        throw new Error("The count of wallets in batches does not match the count of filtered wallets");
    }
    
    const errorsEncountered = [];

    // Check all wallets in filtered batches are presetn
    for (let i = 0; i < filteredWallets.length; i++) {
        const walletAddress = filteredWallets[i];
        if (!allWalletsInBatches[walletAddress]) {
            try {
                throw new Error(`The wallet: ${walletAddress} is not present in the batch`);
            } catch (error) {
                errorsEncountered.push(error);
            }
        }
    }

    const errorEncountered = errorsEncountered.length > 0;

    if (errorEncountered) {
        console.log("🚀 ~ generateAmountOfETHOfEveryWallet ~ errorsEncountered:", errorsEncountered)
        throw new Error("Wallets missing from batch.");
    }

    console.log("Test cases passed.");
    console.log("Apollo ready for launch.");
    
    return mappingOfWalletsToAmountOfGWEIOwed;

}


/**
 * Use this function if you'd like to delete the `batch` files
 * created by the above program and re-generate them again.
 */
function deleteAllFilesWhichStartWithBatchInFileName() {

    const directory = "./";
    fs.readdir(directory, (err, files) => {
        if (err) throw err;
    
        for (const file of files) {
        if (file.startsWith("batch_")) {
            fs.unlink(path.join(directory, file), err => {
            if (err) throw err;
            });
        }
        }
    });
    
}


// generateAmountOfETHOfEveryWallet();
deleteAllFilesWhichStartWithBatchInFileName();