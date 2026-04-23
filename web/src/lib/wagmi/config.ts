import { createConfig, createStorage, cookieStorage, http } from 'wagmi';
import { base, mainnet } from 'wagmi/chains';
import { baseAccount, injected, walletConnect } from 'wagmi/connectors';

const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const connectors = [
  injected(),
  baseAccount({ appName: 'Airport Control' }),
  ...(wcProjectId
    ? [
        walletConnect({
          projectId: wcProjectId,
          showQrModal: true,
        }),
      ]
    : []),
];

export const config = createConfig({
  chains: [base, mainnet],
  connectors,
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
