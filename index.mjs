import { loadStdlib } from "@reach-sh/stdlib";
import * as backend from "./build/index.main.mjs";
const stdlib = loadStdlib(process.env);

const participantAmount = 5

const startingBalance = stdlib.parseCurrency(200);
function resolvedPromise() {
  new Promise();
}

const Alice = await stdlib.newTestAccount(startingBalance);
const token = await stdlib.launchToken(Alice, "Hope Token", "HPTK");

const airDrop = async (amount=10) => {
  const who = await stdlib.newTestAccount(startingBalance);
  try {
    console.log("Attaching..... ");
    const contract = who.contract(backend, ctcAlice.getInfo());
    
    const response = await contract.apis.Users.airDrop(stdlib.parseCurrency(amount));

    console.log(
      "\nBalances in wallet\n",
      stdlib.formatCurrency(await stdlib.balanceOf(who)),
      "Algo\n"
    );
    console.log(
      stdlib.formatCurrency(await stdlib.balanceOf(who, token.id)),
      "HPTK"
    );
    return who;
  } catch (error) {
    console.log(error);
    return who;
  }
};

const claim = async (who) => {
  try {
    console.log("Attaching..... ");
    const contract = who.contract(backend, ctcAlice.getInfo());
    console.log("Token Launch")
    await who.tokenAccept(token.id);
    console.log("Claiming")
    const response = await contract.apis.ClaimAirdrop.claim();
    console.log("Claimed")
    console.log(
      "\nBalances in wallet\n",
      stdlib.formatCurrency(await stdlib.balanceOf(who)),
      "Algo\n",
      stdlib.formatCurrency(await stdlib.balanceOf(who, token.id)),
      "HPTK"
    );
  } catch (error) {
    console.log(error);
  }
};

console.log("Launching...");
const ctcAlice = Alice.contract(backend);

console.log("Starting backends...");
try {
  await Promise.all([
    backend.Starter(ctcAlice, {
      tokenDetails: [token.id, await stdlib.balanceOf(Alice, token.id)],
      alert: () => {
        console.log("Contract Initialized .......");
        throw 42;
      },
      participantAmount,
      // implement Alice's interact object here
    }),
  ]);
} catch (error) {
  if (error !== 42) console.log(error);
}
console.log("Hmmm")
let Accounts = []
for (let i = 1; i <= participantAmount +1; i++) {
  const acct = await airDrop(i);
  Accounts = [...Accounts, acct];
}
await stdlib.wait(30)
await Accounts.forEach(async(item)=>{
  console.log("running")
  await claim(item);
})

console.log("Goodbye, Everyone!");
