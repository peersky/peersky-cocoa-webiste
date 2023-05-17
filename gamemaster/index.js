"use strict";
const ethers = require("ethers");

// const ethAuth = require("@peersky/eth-auth");
const besofgame = require("@daocoacoa/bestofgame-js");
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
// while (!provider.network?.chainId) {}
const signer = new ethers.Wallet(
  process.env.DISCORD_REGISTRAR_PRIVATE_KEY,
  provider
);
const PORT = process.env.PORT ?? 8000;
("use strict");

const Koa = require("koa");
const Router = require("@koa/router");

const app = new Koa();
const router = new Router();

const authenticated = async (ctx, next) => {
  const ethAuth = await import("@peersky/eth-auth");
  console.log("authenticated");
  const authorization = ctx.request.header.authorization;
  const token = authorization.split(" ")[1];
  console.log(token);
  try {
    ctx.status.account = ethAuth.tryGetAuthenticated(token);
  } catch (e) {
    ctx.status = 403;
    ctx.throw("EAA token is invalid\n", 403);
  }
  next();
};

router.use(["/player/salt"], authenticated);

router.get("playerSalt", "/player/salt", (ctx) => {
  console.log(ctx.status.account);
  const turn = ctx.query.turn;
  console.log(ctx.query.turn);
  ctx.body = "Player salt\n";
});
router.get("GM Address", "/gm/address", async (ctx) => {
  ctx.body = await signer.getAddress();
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT);

// const http = (config, noAuth = false) => {
//   const token = localStorage.getItem("APP_ACCESS_TOKEN");
//   const authorization = token && !noAuth ? { Authorization: `Moonstream ${token}` } : {};
//   const defaultHeaders = config.headers ?? {};
//   const options = {
//     ...config,
//     headers: {
//       ...defaultHeaders,
//       ...authorization,
//     },
//   };

//   return axios(options);
// };
