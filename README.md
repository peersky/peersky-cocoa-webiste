# DAO COCOA

## DISCLAIMER

This is Work in progress, bugs may reside.

## Introduction

This repository holds various ideas and their implementation made with solo purpose of make world around us better, safer. Author trully belives that decentralization is a key aspect to solving many today social and socio-economical problems so even though some of the projects might seem as silly game, they hold larger vision and values.

## Why COCOA?

Author is deeply inspired by fact that tribes of Mesoamerica [used cocoa beans as trading currency](https://books.google.com/books?id=urs9QCMKOw4C&q=ripe%20colour&pg=PA25). In a way it makes sense - what else you need in a bad day but a cup of hot cocoa?

## Projects

### Best Of

Best of Games. Best of Playlists. Best of <YOU_NAME_IT> is a game of delegated democracy.

Create your own party. Vote for best proposal for a set number of rounds. Winner gets an NFT that allows to play with cool kids in higher ranked league.

- Voting and proposing stages are anonymous
- Results and player actions after score calculations are verifiable and public

#### Implementation

For this game an intermediate - `Game Master`, is required. For each game, `Game Master` holds secret. `Game Master` uses it to calculate individual round salt for each round and based on that - individual secret per each round per each participant.

#### Terminology:

- `RankToken` - Token used to estimate how many games bearer has won;
- `Game` - the contract
- `Tournament` instance of game (can be many of those)
- `Proposal` string text (link, idea, etc) that player submits
- `vote` - array of three proposals that player selects as his favorites [3points, 2points, 1point]
- `Round, Turn` - One set of giving `proposals` and `votes`. First round only `proposals` exist, last round only `votes` exist.
  `GameMaster` - Trusted 3rd party (and a signing key) that executes some of transactions for sake of player privacy and fun. It can be a player, but for sake of automation - API server is provided.

#### Rules quick summary:

0. Initialize game contract with number of rounds
1. Create a game with fixed number of rounds
2. Start playing game with your friends - vote for best playlist, for best picture on instagram, whatever.
   - Send your links to game master and he will post them on to the contract on your behalf
   - Once there is enough links - start voting. Each player can give 6 points in a round divided as 3/2/1 and cannot vote for himself
   - Once turn is over - scores are updated
3. At the end of all rounds
   - Game will continue in overtime if and until winner scores are equal
   - Once game and overtime finishes:
     - 1th place will receive rankToken of `gameRank+1`, 1piece;
     - 2nd place will receive `gameRank`, 2 pieces;
     - 2rd place will receive `gameRank`, 1 piece;
4. Now winner of game can create his own new tornament of increased level ( has token of needed gameRank)
5. Become part of comunity who plays this game! It results a ladder: higher rank games are only avalible to very good players... or ones who can afford to buy rank token from such good player. (There is no other way to receive rank tokens)

#### Turn processing logic

There is three stages for each turn.

1. Proposals

In order to propose, a game `Participant` must: Send `Game Master` a message containing his `Proposal`, and his signature that lets `Game Master` later to prove that `Participant` indeed proposed this `Proposal`.

If `Game Master` accepts proposal, it must immediately submit it on chain on behalf of a participant which stays at this point anonymous. It also submits a signature received from `Participant` which is obfuscated with a secret. That way once turn salt is published - it later can be proven that `Game Master` submitted `Participants` proposal.

2. Voting

Once all proposals are submitted, or timeout was reached - second phase becomes active: no proposals can be submitted, votes are accepted.

In order to vote, players contact `Game Master` with their vote (three proposals they like). `Game Master` verifies that vote is legit and returns to player signed message containing information about player's vote.
Now `Participant` can submit his vote by submitting this signed message to the contract.

3.

Calculation
Once all votes are submitted, or if turn timeout has reached, `Game Master` can now end the turn. Ending turn involves publishing turnSalt - a secret value unique per turn. By doing that, `Game Master` makes it possible for anyone to check who proposed which proposal, and that votes are indeed correctly submitted. Smart contract at this stage will verify that votes indeed where correct.

If validation is OK, smart contract further will update scoreboard with each `Participant`'s score

Game ends after preset number of rounds has been reached and top three player scores are distributed in ranking (1/2/3). If top player scores are equal game keeps on in overtime until distribution is acheived.

Last and First turns are unique in a way: In First turn there yet no proposals to vote on, hence no votes can be submitted. Vice versa in the last turn - only votes are submitted, no proposals are expected.

#### Privacy

Votes are hidden until `Round` is present. `Game Master` holds a secret that together with tournament id and turn - hashes all votes, and proposals that way that noone can know who votes for whom until round is over.

The big challange is to decentralise `Game Master` so that we can be sure that nobody can access secret. This part is under research.

### Multipassport

Is a simple idea of having your own multiverse passport in crypto world.
On chain records holds openly and publically availible mapping that connects user address to his username and user id on some kind of domain.

#### Motivation

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

or even

```
You: Hey @MultipassportBot send @vitalik 1ETH
MultipassportBot: Here is the link to proceed: <LINK>
```

#### Terminology

- `domain`: A domain under which lookup is happening. Can be for example `Discord` or `Telegram` or `<YouNameItForum>`
- `registrar`: A private key holder who can be accessed only by `domain` owner

#### Implementation

Record on chain is structured as

```
Domain: <domain>
username: <user_name>
id: <user_uuid>
address: <verified_user_wallet_address>
```

All strings limited to 32 bytes and are stored as `bytes32` on chain.

#### `username` vs `user_id`

Username is something commonly used across some service or domain, however services such as Instragram for example - allow to mutate that name. You can change it. However userID is immutable property and has higher priority in resolving address.

#### Workflow

1. Contact bot or service that supplies verification process with request to validate user. Bot or service must have secure way to verify that user actually is correct (In discord bot case - we rely on discord servers as domain owner)
2. Follow response link from #1 it should bring you to transaction frontend, that will ask you to sign message that domain service provided to you with your signature.
3. Submit transaction that contains response data from #1 and it will associate user id and name with address that sent transaction.

Now, when you have registered, you can use it within any smart contracts OR trough RPC to get discord name from address or vice versa:

#### Querying chain data:

```ts
let query: LibMultipass.NameQueryStruct = {
  name: ethers.utils.formatBytes32String("peersky#6032"),
  id: ethers.utils.formatBytes32String(""), //You can leave this blank, however unique ID is most reliable way - this is immutable id which discord usually does not display to you, but bots do see it though!
  wallet: "<0x....>" // If you enter wallet address - query can find user name and id by it
  domainName: ethers.utils.formatBytes32String("Discord"),
  targetDomain: ethers.utils.formatBytes32String(""), //You can take Discord user id and find his id in other domain by that
};

let resp = await env.multipass.resolveRecord(query);
```

Hurry to register on Discord name service: TODO: URL Here

Once free registrations run out, we will start charging for registration

What else?

Once you registered - you can generate referral code and once someone pays for registration - give them discount by that and bonus for yourself:
`@botname my referral` or go to TODO: add URL here

## Libraries

### NPM packages

NPM packages are provided to ease work with the projects:

#### Multipass-js

    Library with common helper functions for interacting with multipass smart contract

#### next-web3-chakra

    React library that depends on chakra-ui and Next-js.

### LibTurnBasedGame

Implements generic methods to manage a turn based game.

Supports TURNS, ROUNDS, GAMES, and unique storage space for individual games.

### LibCoinVending

This library is used to simulate the vending machine coin acceptor state machine that: - Supports large number of positions; Each represents requirements to acess different goods of the virtual vending machine. - Accepts multiple assets of following types: Native (Eth), ERC20, ERC721, and ERC1155 tokens that can be stacked together. - Allows for each individual asset action promise can be one of following: - Lock: The asset is locked in the acceptor with promise that asset will be returned to the sender at release funds time. - Bet: The asset is locked in the acceptor with promise that asset will be awarded to benificiary at release funds time. - Pay: The asset is locked in the acceptor with promise that asset will be paid to payee at release funds time. - Burn: The asset is locked in the acceptor with promise that asset will be destroyed at release funds time. - Maintains each position balance, hence allowing multiple participants to line up for the same position. - Allows three actions: - Fund position with assets - Refund assets to user - Consume assets and provide goods to user - Consuming asset might take a form of - Transferring assets to payee - Burning assets - Awarding beneficiary with assets - Returning locked assets back to sender

        This library DOES enforces that any position can only be refunded or processed only within amount funded boundaries.
        This library DOES NOT store the addresses of senders, nor benificiaries, nor payees.
        This is to be stored within implementation contract.


        !!!!! IMPORTANT !!!!!
        This library does NOT invocates reentrancy guards. It is implementation contract's responsibility to enforce reentrancy guards.
        Reentrancy guards MUST be implemented in an implementing contract.

        Usage:
            0. Configure position via configure(...)
            1. fund position with assets via fund(...)
            2. release or refund assets via release(...) or refund(...)
            3. repeat steps 1 and 2 as needed.
                Position can be recofigured at any time when it's effective balance is zero: `timesFunded - timesRefuned - timesReleased = 0`


        Test state:
            This library most functionality has been tested: see ../tests/LibCoinVending.ts and ../tests/report.md for details.
            ERC721 token is checked only for "HAVE" condition since putting requirements on non fungable token id yet to be resolved
                (see ERC721 section in the code below)
            This library has not been yet audited

### LibMultipass

Implements generic methods to manage and query lookups for a multipass

### LibReentrancyGuard

Reentrancy guard for diamond proxy pattern

### LibBestOf

Implements generic methods for Best Of Proposals project:

## Why there is no <you_name_it>

Author works on this package for pure enthusiasm. If you want to contribute or request a feature: please contact on github:
https://github.com/peersky/daococoa/issues

## Collaborate

Collaboration is super-duper welcome. You can hop in just by starting a discussion in issues or creating your PR. If you have any questions feel free to reach out to me.

## Fund

You can fund this project @ `0x60D5fe6238bBd887632d90C480B013C32cA29804`. All funding trough this will receive dao tokens distributed on initial token mint for Daocoacoa
