pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; // Importing Ownable for access control
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/*

REFUND POLICY

I. Eligibility for Refund
Eligible Individuals: Only current holders of Non-Fungible Tokens (NFTs) located at Ethereum blockchain address 0xf341ed41475fedd4704902b4b82f1d2eb4d477e8 are eligible for a refund (“Refund”) under this policy.

II. Refundable Items
ERC-721 Token: The specific item eligible for a refund under this policy is the ERC-721 token (“NFT”) initially purchased by the holder.

III. Refund Process
Exclusive Website for Claim: This website is the sole authorized platform for initiating a refund claim. No other websites or platforms are recognized for this purpose.
Terms Acceptance and Warranties: By proceeding to process a refund, the holder / user / individual explicitly agrees to the terms and conditions set forth on this website and makes the warranties required in the refund procedure. 
Inclusion of Direct Contract Interactions: In addition to agreement through this website, any direct interaction by the Individual with the smart contract on the Ethereum blockchain pertaining to this refund process is also considered as an acceptance of these terms and conditions. By engaging with the smart contract, the user acknowledges and understands that it is agreeing to adhere to the stipulations set forth in this policy and makes the necessary agreements by this refund procedure.

IV. Timeframe
Duration of Contract: Absent unforeseen technological issues, the refund smart contract will remain available indefinitely, or until such a time as the Ethereum blockchain ceases to function, whichever comes first.
Notification and Disclaimer: Reasonable efforts are being made to notify eligible holders of the availability of this refund process. However, no person or group undertakes or assumes any liability for costs, damages, or claims arising from any inability to obtain a refund in a timely manner, however occurring.    

V. Review and Approval
Finality of Refund: This policy provides for a one-time refund opportunity only. No subsequent refunds or other distributions will be entertained or processed.

VI. Mutual Agreement
Project Wind Down: All users, by seeking a refund through the process provided herein, agree to the wind down and cessation of the Project.

VII. Tax Liability
Responsibility for Taxes: The individual requesting a refund acknowledges and agrees that they are solely responsible for determining any tax implications and liabilities associated with the refund.
Company’s Non-Liability: No person or group affiliated with the Project is providing tax advice or assuming any  responsibility for any tax obligations incurred by any user as a result of the refund process or the original NFT transaction.

VIII. Governing Jurisdiction
Jurisdiction for Claims: Any disputes, legal claims, or litigation arising in connection with this refund policy or the associated NFT transaction shall be governed by, and construed in accordance with, the laws of the State of New York, United States of America.

IX. Acknowledgement of Operational Cessation and Consequences
Cessation of Project Operations: It is hereby communicated to the individual that the operations of the Project are being discontinued. This cessation encompasses all activities, services, and support that were previously undertaken or facilitated as part of the Project.
Potential for Future Loss of Artwork: By proceeding with the refund, the individual recognizes that although the NFT may continue to exist in the individual’s possession, there is a possibility, either in the near or distant future, that the NFT's associated digital artwork, or any other linked digital assets, may become inaccessible or permanently lost. This risk arises due to the NFTs reliance on external technologies and infrastructures, such as APIs, hosting services, and the blockchain network itself, which are subject to changes, discontinuation, or failures.
Potential Loss of Community Engagement and Resources: The individual is informed that the discontinuation of the Project's operations may lead to a loss of community engagement, resources, updates, and interactive opportunities that were previously available. This includes the cessation of any community-driven developments, discussions, or collaborative efforts related to the NFT. The individual further understands and agrees that the loss of such community engagement and resources can have a direct impact on the utility of the NFT. 

X. Export Controls and Sanctions
Compliance with Export Controls and Sanctions: You agree to comply with all applicable export control laws and sanctions in your use of the refund process and any assets involved. By using or accessing the refund process, you represent and warrant that you and any of your directors, officers, and employees are not Restricted Persons. 
Prohibited Transactions: You are not permitted to transact in any way or use the refund process if doing so would be in violation of applicable sanctions laws, or if you intend to transact or deal with any restricted persons.

XI. Relationship of the Parties
Nature of Relationship: You acknowledge and agree that the Project is not acting in any fiduciary capacity for you, and that no communication from the Project shall be considered as financial or other advice.

XII. Class Action Waiver
Individual Capacity Only: All claims must be brought in an individual capacity, and to the greatest extent possible, you waive any right to be a plaintiff or class member in any purported class, collective action, or representative proceeding related to the Project. By agreeing to these terms, you waive the right to participate in a class action and a jury trial, to the extent permissible by law.

XIII. Blockchain Risk and Volatility Clause
General Acknowledgements: The individual acknowledges and understands that the use of blockchain technology, including but not limited to the ownership, trading, and transfer of NFTs (Non-Fungible Tokens), is inherently risky and subject to volatility. Blockchain technology operates in a decentralized and often rapidly changing environment, which may lead to various risks and uncertainties.

These risks may include, but are not limited to:

Market Volatility: The value of NFTs and cryptocurrencies can fluctuate significantly over short periods, and the individual may experience gains or losses.
Network Congestion: Blockchain networks may become congested, leading to delays or higher transaction fees.
Security Risks: Despite strong security measures, blockchain systems may be vulnerable to hacking, fraud, or other security breaches.
Regulatory Changes: Government regulations regarding blockchain and cryptocurrencies may change, impacting the individual's ability to use or trade NFTs.

Community-Source Advice Disclaimer: The individual acknowledges that the blockchain Project had and may have an active community of users and participants who may have offered and continue to offer advice, information, or opinions related to NFTs (Non-Fungible Tokens) or other blockchain-related matters. The individual understands that any advice, financial or otherwise, obtained from community members is provided without any endorsement or warranty by the Project and agrees not to hold the Project and its team members liable for any losses, damages, or consequences resulting from following or acting upon such advice or information, whether directly or indirectly. Additionally, the individual also acknowledges their sole responsibility, as well as that of all community members, to exercise caution, conduct thorough and independent research, and assess the credibility and accuracy of any advice or information obtained from the community or any other source, in the past, present, or future. 

XIV. Definitions and Interpretation 
Restricted Person means a person or legal entity who (a) is included in any trade embargoes or economic sanctions, terrorist or corrupt foreign officials list (such as the United Nations Security Council Sanctions List,  issued by a government agency including the list of specially designated nationals maintained by the office of foreign assets control of the U.S. Department of the Treasury (OFAC), or the denied persons or entity list of the U.S. Department of Commerce), or by the United Kingdom, European Union, Canada) or (b) resides, or is established, or has operations in, in any country listed in the List of Prohibited Countries: Cuba, Iran, Syria, Crimea region and any non-government controlled areas of Ukraine, and the Democratic People’s Republic of North Korea.

*/

/**
 * @title SnapshotMerkleDistribution
 * @dev General use of tx.origin was to prevent gaming through use of intermediary smart
 * contract but use of Merkle Proofs allows us to ignore that attack vector.
 */
contract SnapshotMerkleDistribution  is ReentrancyGuard, Ownable {

    ERC721Enumerable public nftContract;

    mapping(address => bool) public walletHasClaimedSnapshot;
    mapping(address => string) public userAgreements;

    bool public isRefundActive = false;
    bool public contractIsLocked = false;
    bool public lockedInPerpetuity = false;
    address public multisignatureWallet;

    // @dev Provides us with a snapshot of the wallets that are eligible for refund
    // @see https://medium.com/@ItsCuzzo/using-merkle-trees-for-nft-whitelists-523b58ada3f9
    bytes32 public merkleRoot;
    // @dev Ensures individual refund amount remains static even after claim process begins
    uint256 public originalBalance;
    // Temporary
    // uint16 public totalAmountOverride;

    constructor() Ownable(msg.sender) {}

    // @dev Necessary to allow us to retrieve the total supply of NFTs and 
    // amount owned by a specific wallet
    function setNFTContract(address _nftContract) external onlyOwner {
        require(_nftContract != address(0), "Invalid address.");
        // @dev - should we add locking (?)
        nftContract = ERC721Enumerable(_nftContract);
    }

    function setMutiSignatureWallet(address _multiSigWallet) external onlyOwner {
        // @dev - Prevents contract deployer from modifying the multisignatture wallet later on and
        // withdrawing the crypto to it instead of the original multisignature wallet.
        require(contractIsLocked == false, "Contract is locked.");
        multisignatureWallet = _multiSigWallet;
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        // @dev - Prevents contract deployer from uploading a merkle root hash representing a different
        // snapshot and authorizing a different set of wallets to claim the refund.
        require(contractIsLocked == false, "Contract is locked.");
        merkleRoot = _merkleRoot;
    }    

    // @dev Allows us to ensure that the amount returned to each wallet remains fixed throughout the 
    // whole liquidation process.
    function saveOriginalBalance() external onlyOwner() {
        // @dev - Prevents contract deployer from changing the original balance later on in order to reduce
        // the amount of funds returned to the users.
        require(contractIsLocked == false, "Contract is locked.");
        originalBalance = address(this).balance;
    }

    // @dev Activates refund
    function activate() external onlyOwner() {
        isRefundActive = true;
    }

    // @dev Deactivates refund
    function deactivate() external onlyOwner() {
        require(contractIsLocked == false, "Contract is locked.");
        isRefundActive = false;
    }

    // @dev Irreversible action - Contract lock prevents modification of 1- emergency 
    // multisignature wallet and merkle root change, which cements the snapshot forever.
    function lockContract() external onlyOwner() {
        contractIsLocked = true;
    }

    // @dev Irreversible action - Locks the contract in perpetuity, preventing any emergency
    // withdrawal.
    function lockInPerpetuity() external onlyOwner() {
        lockedInPerpetuity = true;
    }

    // @dev Sanity function in case something deeply wrong happens - allows the funds to be sent
    // to the multisignature wallet, thus protecting the funds from being lost. 
    function emergencyWithdrawalToMultiSignature() external onlyOwner {
        // @dev - lockedInPerpetuity allows funds to remain in claim process forever.
        require(lockedInPerpetuity == false, "Contract is locked in perpetuity.");
        uint256 balance = address(this).balance;
        require(multisignatureWallet != address(0), "Multi signature wallet not set.");
        (bool sent, ) = multisignatureWallet.call{value: balance}("");
        require(sent, "Failed to send Ether");
    }

    /** Dev Temporary Functions */

    // @dev Will be removed in production.
    // function unlockContract() external onlyOwner() {
    //     contractIsLocked = false;
    // }

    // function setTotalAmountOverride(uint16 _totalAmount) external onlyOwner {
    //     require(contractIsLocked == false, "Contract is locked.");
    //     totalAmountOverride = _totalAmount;
    // }

    receive() external payable {}

    // Allows us to test the structure based on @setSnapshotOfWalletsWithoutTokenCount
    function goToValhalla(string memory _userAgreement, bytes32[] calldata _merkleProof) external nonReentrant {
        
        require(isRefundActive, "Refund is not active.");
        require(address(this).balance > 0, "Contract balance is zero.");
        require(walletHasClaimedSnapshot[msg.sender] == false, "You have already claimed your ETH.");
        require(originalBalance > 0, "Original balance is zero.");

        // Helps calculate the share of user
        uint256 totalSupply = nftContract.totalSupply();
        require(totalSupply > 0, "No NFTs found in the contract.");
        uint256 userNFTBalance = nftContract.balanceOf(msg.sender);
        require(userNFTBalance > 0, "User balance of NFT is zero.");

        // Temporary override for testing
        // if (totalAmountOverride > 0) {
        //     totalSupply = totalAmountOverride;
        // }
        
        // Calculate amount owed to user
        // uint256 userShare = (address(this).balance) * userNFTBalance / totalSupply;
        uint256 userShare = originalBalance * userNFTBalance / totalSupply;
        require(userShare > 0, "User share is zero.");

        // Verify merkle proof
        // @dev Set to msg.sender instead of tx.origin to enable smart contract accounts
        // as opposed to only EOA accounts
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProof.verify(_merkleProof, merkleRoot, leaf), "Invalid proof.");

        (bool sent, ) = msg.sender.call{value: userShare}("");
        require(sent, "Failed to send Ether");

        // Prevents multiple claims from being made
        walletHasClaimedSnapshot[msg.sender] = true;
        userAgreements[msg.sender] = _userAgreement;
        
    }

    // Helper Functions
    // @dev Future improvement includes potentially storing all the addresses in an array instead of just a mapping

    function getClaimedStatusOfWallet(address _walletAddress) external view returns (bool) {
        return walletHasClaimedSnapshot[_walletAddress];
    }

    function getUserAgreementOfWallet(address _walletAddress) external view returns (string memory) {
        return userAgreements[_walletAddress];
    }
    
}


