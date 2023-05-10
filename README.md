# DAO COCOA

Idea here is to mainly test Proof of Concepts as well as develop some MVPs and codebase that later on will become products on it own.

Initially I was working on these code bases as a separate pieces however later it came to me that it is much easier to manage my limited capabilities on contributing to this by uniting everything in a monorepository.

## Why cocoa?

Tribes of Mesoamerica [used cocoa beans as trading currency](https://books.google.com/books?id=urs9QCMKOw4C&q=ripe%20colour&pg=PA25).

In a way it makes sense - what else you need in a bad day but a cup of hot cocoa?

## What's inside

### Peersky.xyz

Im hosting my personal website from this page. You can find frontend code in `/apps/bestofweb/` _TODO: I really need to clean up the directory or even structure here_

### BestOfGame

Best of Games. Best of Playlists. Best of <YOU_NAME_IT> is a game of delegated democracy.

Create your own party. Vote for best proposal for a set number of rounds. Winner gets an NFT that allows to play with cool kids in higher ranked league.

- Voting and proposing stages are anonymous
- Results and player actions after score calculations are verifiable and public

No Fancy stuff like ZK is used however it certainly can be implemented in some parts on later. [Here is a blog article on that](https://peersky.xyz/blog/aa-for-private-proposals/).

To read more about this refer to [BESTOFGAMES.md](./BESTOFGAMES.md)

### GameMaster Project

In order to support projects like BestOfGame there is a one missing key technology factor that Im trying to address here - **there must be a trusted third party, who can do data transformation and submittion to chain based on participants private input.**

Key challange is that it cannot be on-chain since GameMaster acts more of an oracle way, and also must be able to store participants secrets

There are many possible ways to implement it. The easiest way Im going initially is just a **centralized API server or Discord Bot that submits validity proofs**.

Another alternatives would be to use

- [iExec Confidential Computing](https://docs.iex.ec/for-developers/confidential-computing/intel-sgx-technology)
- [Homomorphic encryption](https://en.wikipedia.org/wiki/Homomorphic_encryption)

However I expect that with raise of Account Abstraction and ZK technology it all can be implemented as a sets of a simple api servers. More on that in blog post on [how account abstraction can support private proposals](https://peersky.xyz/blog/aa-for-private-proposals/).

### Multipassport

Multpass is a public open source registry enabling generic way of linking an addess in to another domains such as another chains or social media or chat platform. Utilizing Multipass alows to:

- Lookup address from an app by username in the app
- Lookup user name and Id in some other application
- Lookup user name and id from an address

This allows usecase scenarios where one can get Crypto by a command directly in his Slack/Telegram/Discord.
Imagine you can type in your messenger such conversation

```
You: Hey @MultipassportBot, what's @vitalik address?
MultipassportBot: 0x....
```

```
You: Hey @MultipassportBot, whois <address>
MultipassportBot: is @vitalik.
```

```
You: Hey @MultipassportBot, whois <address> @ <another_platform>
MultipassportBot: is @vitalik.
```

or even with use of Account Abstraction:

```
You: Hey @MultipassportBot send @vitalik 1ETH
```

To read more refer to [MULTIPASSPORT.md](./MULTIPASSPORT.md)

### next-web3-chakra

React library that depends on chakra-ui and Next-js.

Refer to [Specific readme](./packages/next-web3-chakra/README.md)

### [LibTurnBasedGame](./contracts/libraries/LibTurnBasedGame.sol)

Implements generic methods to manage a turn based game.

Supports TURNS, ROUNDS, GAMES, and unique storage space for individual games.

### [LibCoinVending](./contracts//libraries//LibCoinVending.sol)

This library is used to simulate the vending machine coin acceptor state machine that:

- Supports large number of positions; Each represents requirements to acess different goods of the virtual vending machine.
- Accepts multiple assets of following types: Native (Eth), ERC20, ERC721, and ERC1155 tokens that can be stacked together.
- Allows for each individual asset action promise can be one of following:
  - Lock: The asset is locked in the acceptor with promise that asset will be returned to the sender at release funds time.
  - Bet: The asset is locked in the acceptor with promise that asset will be awarded to benificiary at release funds time.
  - Pay: The asset is locked in the acceptor with promise that asset will be paid to payee at release funds time.
  - Burn: The asset is locked in the acceptor with promise that asset will be destroyed at release funds time.
- Maintains each position balance, hence allowing multiple participants to line up for the same position.
- Allows three actions:
  - Fund position with assets
  - Refund assets to user
  - Consume assets and provide goods to user. Consuming asset might take a form of
    - Transferring assets to payee
    - Burning assets
    - Awarding beneficiary with assets
    - Returning locked assets back to sender

This library **DOES** enforces that any position can only be refunded or processed only within amount funded boundaries.
This library **DOES NOT** store the addresses of senders, nor benificiaries, nor payees.
This is to be stored within implementation contract.

### LibReentrancyGuard

Reentrancy guard for diamond proxy pattern

## Collaborate

Collaboration is super-duper welcome. You can hop in just by starting a discussion in issues or creating your PR. If you have any questions feel free to reach out to me.

## DISCLAIMER

This is Work in progress, bugs may reside.
