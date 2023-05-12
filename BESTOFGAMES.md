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
