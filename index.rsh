"reach 0.1";

const shoeLess = (a, b) => {
  return a > b ? b : a;
};

export const main = Reach.App(() => {
  setOptions({ untrustworthyMaps: true });

  const Starter = Participant("Starter", {
    alert: Fun([], Null),
    participantAmount: UInt,
    tokenDetails: Tuple(Token, UInt),
  });
  const Users = API("Users", {
    airDrop: Fun([UInt], Bool),
    claim: Fun([], Null),
  });

  init();
  // The first one to publish deploys the contract
  Starter.only(() => {
    const [token, amount] = declassify(interact.tokenDetails);
    const participantAmount = declassify(interact.participantAmount);
  });
  Starter.publish(token, amount, participantAmount);
  commit();
  Starter.pay([[amount, token]]);
  const distributorMap = new Map(UInt);
  const airDropArray = Array.replicate(100, Starter);
  Starter.interact.alert();

  const [users, total, registered] = parallelReduce([0, 0, airDropArray])
    .invariant(balance() == total)
    .while(users < participantAmount)
    .api(
      Users.airDrop,
      (_) => {
        check(users <= 100, "Limit Exceeded cannot join");
      },
      (amt) => amt,
      (amt, k) => {
        const airdop_array = registered.set(users % 100, this);
        distributorMap[this] = fromSome(distributorMap[this], 0) + amt;
        k(true);
        return [users + 1, total + amt, registered];
      }
    )
    .timeout(false);

  const [withdrawn] = parallelReduce([0])
    .invariant(balance() == total)
    .while(withdrawn < users)
    .api(
      Users.claim,
      () => {
        check(withdrawn < 1, "Already withdrawn");
        check(isSome(distributorMap[this]), "Not part of the airdrop");
      },
      () => 0,
      (k) => {
        const currentAmt = fromSome(distributorMap[this], 0);
        const correctAmt = shoeLess(
          balance(token) / (balance() / currentAmt),
          balance(token)
        );
        transfer(correctAmt, token).to(this);
        // distributorMap[this] = 0;
        delete distributorMap[this];
        k(null);
        return [withdrawn + 1];
      }
    )
    .timeout(false);
  transfer(balance()).to(Starter);
  transfer(balance(token), token).to(Starter);
  commit();
  exit();
});
