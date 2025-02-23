# Compute Hardware RWA

## Overview

This project is used to fractionalize expensive compute hardware, which implies:
1. Hardwares such as GPUs, ASICs, etc. can be owned and fractionalized among multiple users.
2. The fractional owners can sell their fractional ownership on the open market.
3. The hardware can be rented out to a single user for a period of time.
4. The rent is distributed to the fractional owners.

The contract treats the Compute Hardware RWA as an NFT. (RWA in the following discussion shall refer to a Compute Hardware.)
Creates N tokens to fractionalize the NFT.
Starts over with handing out the tokens to the NFT owner after locking up the NFT in the contract.
The NFT owner can then sell their tokens on the open market or on the contract itself.
Buyers need to pay a 2% fee to the contract.
The contract allows for rent payment.
The contract represents a DAO (RWADao) of the token holders.
The RWADao can vote on the following:
- Rent payment
- Commission fee for the RWA DAO
- Can vote to remove a certain listing from the platform or not
60% Vote Share is required for decisions to be made.
The token holders get share of the rent payment.
The NFT gets unlocked when the DAO decides with a 100% vote.
Everything is orchestrated by the Marketplace DAO which includes the following:
- Create an RWA DAO to govern the RWA
- Decide upon the commission fee for the RWA DAO (e.g. 2% of the rent payment)
- Since the Marketplace DAO is the owner of every RWA DAO contract, the commissions from rent paying and withdrawals, selling fo the RWA, selling tokens, etc. shall be withdrawn by the Marketplace DAO
- MarketplaceDAO can vote upon whether to remove a certain listing from the platform or not

There are 4 contracts:
- RWA NFT
- RWA Token
- RWA DAO
- Marketplace DAO

The RWA contract is the main contract that handles the RWA NFT.
The RWA Token contract is the contract that handles the tokenization of the RWA.
The RWA DAO contract is the contract that handles the DAO of the token holders.
The Marketplace DAO contract is the contract that handles the Marketplace votes on the commission fee, etc.
