// Merkle Tree generation 
const wscOwnerAddresses = require('./wscOwnerAddressesSnapshot.json');
const { MerkleTree } = require('merkletreejs');
const keccac256 = require('keccak256');


function generateRealAddressList() {    
    const addresses = Object.keys(wscOwnerAddresses);
    return addresses;
}

function generateMerkleTreeAbstract(addresses) {
    const leaves = addresses.map(x => keccac256(x));
    const tree = new MerkleTree(leaves, keccac256, { sortPairs: true});
    return [tree, leaves];
}

/**
 * Allows any external auditor or individual to verify
 * that the root stored within the contract matches the 
 * root generated here, which is generated using all of the
 * addresses holding the ERC-721 token at snapshot time. 
 * 
 * @private_comment This means that we are using cryptography
 * to generate a hash that represents an "aggregate" of all 
 * the addresses that are whitelisted in the contract - if
 * an address is missing from the list in wscOwnerAddressesSnapshot.json
 * or if there is an additional address that isn't on the list, the
 * generated hash would be different.
 * 
 * In thi way, the hash is both a constraint and a "proof" as to the 
 * addresss that are allowed to be whitelisted. 
 * 
 * @further_reading
 * - Merkle Trees Wikipedia: https://en.wikipedia.org/wiki/Merkle_tree
 * - Merkle Trees in Blockchain: https://learn.bybit.com/blockchain/what-is-merkle-tree/
 */
function getRoot() {
    const addresses = generateRealAddressList();
    const [merkleTree, leaves] = generateMerkleTreeAbstract(addresses);
    const rootHash = merkleTree.getRoot().toString('hex');
    console.log("🚀 ~ getRoot ~ rootHash:", rootHash)
    const root = merkleTree.getRoot();
    console.log("🚀 ~ getRoot ~ root:", root)
    return root;
}

getRoot();


