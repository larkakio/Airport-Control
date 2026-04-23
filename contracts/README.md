# DailyCheckIn (Foundry)

Deploy to Base mainnet (chain id 8453), then set `NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS` in the Vercel `web` project.

Latest deploy (example): `0x4FF7264F93eb28556a1606BDa87c11D7A8f34dF2` — verify on [Basescan](https://basescan.org) before use.

```bash
forge build
forge test
# Deploy (example — use your own key management)
forge create src/DailyCheckIn.sol:DailyCheckIn --rpc-url $BASE_RPC_URL --private-key $DEPLOYER_KEY
```
