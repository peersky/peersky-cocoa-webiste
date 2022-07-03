## THIS IS NOT PRODUCTION READY REPO

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
