"use strict";
const ethers = require("ethers");
const aes = require("crypto-js/aes");
const bodyParser = require("koa-bodyparser");
const ethAuth = require("@peersky/eth-auth");
const besofgame = require("@daocoacoa/bestofgame-js");
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(
  process.env.DISCORD_REGISTRAR_PRIVATE_KEY,
  provider
);
const PORT = process.env.PORT ?? 8000;
("use strict");

console.log("Starting game master server...");
console.log("GM address:", signer.address);
const Koa = require("koa");
const Router = require("@koa/router");
const cors = require("@koa/cors");

const app = new Koa();
app.use(bodyParser());
const router = new Router();

const gameMaster = new besofgame.GameMaster({
  //TODO: This should be somehow based on deployment artifacts for a chain
  EIP712name: "BestOfGame",
  EIP712Version: "0.0.1",
  //ToDO: This should be based on env variable
  chain: "mumbai",
  signer: signer,
  //TODO: This should be detected from artifacts
  verifyingContract: "0xf08cFBE993A5154AB42B8BF0F1c548758a4A9Fe4",
});

const authenticated = (ctx, next) => {
  console.log("authentication middleware.. ");
  // const ethAuth = await import("@peersky/eth-auth");
  const authorization = ctx.request.header.authorization;
  const token = authorization.split(" ")[1];
  try {
    ctx.state.account = ethAuth.tryGetAuthenticated(token);
  } catch (e) {
    console.dir(e);
    ctx.status = 403;
    ctx.throw("EAA token is invalid\n", 403);
  }
  next();
};

router.use(["/player/salt", "/player/proposal/:gameId/:turn"], authenticated);

router.post("SubmitProposal", "/player/proposal/:gameId/:turn", async (ctx) => {
  console.log(
    "/player/salt",
    ctx.params.gameId,
    ctx.params.turn,
    ctx.state.account,
    ctx.request.body
  );
  const hiddenProposer = gameMaster.proposerHidden({
    gameId: ctx.params.gameId,
    turn: ctx.params.turn,
    proposer: ctx.state.account,
  });
  // const tx = await gameMaster.submitProposal(
  //   ctx.params.gameId,
  //   hiddenProposer,
  //   ctx.request.body.signature,
  //   ctx.request.body.proposal
  // );
  var encrypted = aes
    .encrypt(ctx.request.body.proposal, signer.privateKey)
    .toString();
  console.log("encrypted", encrypted);

  // console.dir(tx);
  // await tx.wait(1);
  ctx.satus = 200;
  // ctx.body = tx.hash;
});

router.get("gameMaster Address", "gm/address", (ctx) => {
  ctx.status = 200;
  ctx.body = signer.address;
});

router.get("playerSalt", "/player/salt", (ctx) => {
  console.log("/player/salt");
  console.log(ctx.state.account);
  const turn = ctx.query.turn;
  const gameId = ctx.query.gameId;
  const address = ctx.state.account;
  gameMaster.getTurnPlayersSalt({ gameId, turn, proposer: address });
  ctx.body = gameMaster.getTurnPlayersSalt({
    gameId,
    turn,
    proposer: address,
  });
});
router.get("GM Address", "/gm/address", async (ctx) => {
  console.log("/gm/address");
  ctx.body = await signer.getAddress();
});

app.use(cors());
app.use(router.routes()).use(router.allowedMethods());
console.log("Listening to PORT:", PORT);
app.listen(PORT);
