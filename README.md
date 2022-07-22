# DAO CACAO

### DISCLAIMER

This is Work in progress, bugs may reside.

## Introduction

This repository holds various ideas and their implementation made with solo purpose of make world around us better, safer. Author trully belives that decentralization is a key aspect to solving many today social and socio-economical problems so even though some of the projects might seem as silly game, they hold larger vision and values.

### Why cacao?

First things first: I love this drink and I find spirit of cacao to be bold, playful, truethworthy and interconnected: exactly same values which this repository represents.

Second, more objective: Instead of working on multiple different projects in different repositories or managing complicated monorepo with multiple build configuration - I decided to go with one repo which mixes it all together and allows developer to avoid hassle of importing from dependencies.
---> _building dao in cup of my cacao_

## Facets

### BestOf

Best of Games. Best of Playlists. Best of <YOU_NAME_IT> is a game of delegated democracy.

Idea is simple - vote for best ideas with small group of your fellows for many rounds to decide who has most support. Winner can represent your group on higher rank votings.

Terminology:
`RankToken` - Token used to estimate how many games bearer has won;
`Game` - the contract
`Tournament` instance of game (can be many of those)
`Proposal` string text (link, idea, etc) that player submits
`vote` - array of three proposals that player selects as his favorites
`Round, Turn` - One set of giving `proposals` and `votes`. First round only `proposals` exist, last round only `votes` exist.
`GameMaster` - Trusted wallet that executes some of transactions for sake of player privacy and fun. It can be a player, but for sake of automation - API server is being developed.

Privacy: Votes are hidden until `Round` is present. GameMaster holds a secret that together with tournament id and turn - hashes all votes, and proposals that way that noone can know who votes for whom until round is over.

0. Initialize game contract with number of rounds and basic entry requirements
1. Create a tornament with fixed number of rounds
2. Set up whatever additional entry requirement rules you want
3. Start playing game with your friends - vote for best playlist, for best picture on instagram, whatever.
   - Send your links to game master and he will post them on to the contract on your behalf
   - Once there is enough links - start voting. Each player can give 6 points in a round divided as 3/2/1 and cannot vote for himself
   - Once turn is over - scores is updated
4. At the end of all rounds winner will receive rankToken of corresponding game depth
5. Now winner of game can create his own new tornament of increased level ( has token of needed gameRank)
6. Become part of comunity who plays this game! It results a ladder: higher rank games are only avalible to very good players... or ones who can afford to buy rank token from such good player. (There is no other way to receive rank tokens)

### MultipassDNS

Is a simple idea of having your own multiverse passport in crypto world.

On chain records holds openly and publically availible mapping that connects user address to his username and user id on some kind of domain (can be any string).

example recored on chain:

```
Domain: Discord
username: <user_name>
id: <user_uuid>
address: <verified_user_wallet_address>
```

Initial implementation is working trough discord bot, however you can have other implementations upon request

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

### LibTurnBasedGame

Implements generic methods to manage a turn based game.

Supports TURNS, ROUNDS, GAMES, and unique storage space for individual games.

Structure of data:

```solidity
struct GameInstance {
  address gameMaster;
  uint256 currentRound;
  uint256 currentTurn;
  uint256 turnStartedAt;
  uint256 roundEndedAt;
  uint256 registrationOpenAt;
  bool hasStarted;
  EnumerableMap.UintToAddressMap players;
  mapping(address => bool) madeMove;
  uint256 numPlayersMadeMove;
  mapping(address => uint256) score;
  bool isRoundOver;
  bytes32 implemenationStoragePointer;
}

struct TBGStorageStruct {
  GameSettings settings;
  mapping(uint256 => GameInstance) games;
  // mapping(string => uint256) gameIdToNum;
  uint256 gameNum;
  mapping(address => uint256) playerInGame;
  uint256 totalGamesCreated;
}

```

### LibMultipass

Implements generic methods of managing records and querying them. Data model:

```solidity
struct Domain {
  bytes32 name; //32bytes
  uint256 fee; //32bytes
  uint256 freeRegistrationsNumber; //32bytes
  uint256 referrerReward; //32bytes
  uint256 referralDiscount; //32bytes
  bool isActive; //1byte
  address registrar; //20 bytes
  uint24 ttl; //3 bytes (not being used for now)
  uint256 registerSize; //32bytes
}
struct Record {
  address wallet;
  bytes32 name;
  bytes32 id;
  uint96 nonce;
  bytes32 domainName;
}
struct DomainNameService {
  Domain properties; //128 bytes
  mapping(bytes32 => address) idToAddress; //N*20bytes
  mapping(bytes32 => uint96) nonce; //N*12bytes
  mapping(address => bytes32) addressToId; //N*32 bytes
  mapping(bytes32 => bytes32) nameToId; //N*32 bytes
  mapping(bytes32 => bytes32) idToName; //N*32 bytes
  //Total: 128+N*160 Bytes
}

```
