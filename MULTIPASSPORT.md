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