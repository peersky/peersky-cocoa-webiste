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
Best of Games. Best of Playlists. Best of <YOU_NAME_IT> is a game of delegated democracy. Each game round players make their proposals and vote for best proposal of previous turn. Game might have multiple rounds, each round top scored players will receive ERC1155 token as a reward. This token, also named as `rankToken` allows to join games of same contract but with higher rank. 

Multiple games can co-exist and play simulteniously, hence winners of those games can join higher rank.

Therefore, higher rank games represent voting processo of delegates, who had most support from previous games. 

Important game theory aspect is that votes and proposals are uploaded by a `gameMaster` - a wallet that is stored on secure signing server that ensures anonymusness of votes and proposals until turn is over, hence you know who you vote for only after turn is over. 

When you create an instance you allow set of players to join, where join requirements can be added such as requirements to bet, pay or have some kind of tokens (ERC1155/ERC721/ERC20 are supported).

Once game started - winning each game requires N turns. 


### Multipassport

Is a simple idea of having your own multiverse passport in crypto world.

Initial implementation is working trough discord bot, however you can have other implementations upon request

How to register:

- Contact discord bot or add it to your channel (TODO: add bot id here )
- Ask bot to register you : `@<botname> register me`
- Follow the link bot sends you
- Sign a message and submit a transaction

Now, when you have registered, you can use it within any smart contracts OR trough RPC to get discord name from address or vice versa:

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
