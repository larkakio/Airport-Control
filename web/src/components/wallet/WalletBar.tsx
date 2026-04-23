'use client';

import { useState } from 'react';
import { base } from 'wagmi/chains';
import { useConnection, useSwitchChain } from 'wagmi';

import { ConnectSheet } from '@/components/wallet/ConnectSheet';

function truncateAddress(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function WalletBar() {
  const { address, chainId, isConnected, status } = useConnection();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [sheetOpen, setSheetOpen] = useState(false);

  const wrongNetwork = isConnected && chainId !== undefined && chainId !== base.id;

  return (
    <>
      <header className="relative z-20 flex items-center justify-between gap-2 border-b border-cyan-500/20 bg-[#050508]/90 px-3 py-2 backdrop-blur-md">
        <div className="font-display text-xs tracking-[0.2em] text-cyan-300/90">AIRPORT CONTROL</div>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="cyber-chip rounded-full border border-fuchsia-500/50 bg-fuchsia-500/10 px-3 py-1.5 text-xs font-medium text-fuchsia-200 hover:bg-fuchsia-500/20"
        >
          {isConnected && address ? truncateAddress(address) : 'Connect wallet'}
        </button>
      </header>
      {wrongNetwork ? (
        <div className="relative z-20 flex items-center justify-between gap-2 border-b border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          <span>Wrong network — switch to Base for check-in.</span>
          <button
            type="button"
            disabled={isSwitching}
            onClick={() => switchChain({ chainId: base.id })}
            className="shrink-0 rounded-lg border border-amber-400/60 px-2 py-1 text-amber-50 hover:bg-amber-500/20 disabled:opacity-50"
          >
            {isSwitching ? '…' : 'Switch'}
          </button>
        </div>
      ) : null}
      {status === 'connecting' || status === 'reconnecting' ? (
        <div className="relative z-20 border-b border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-center text-[10px] text-cyan-200/80">
          Restoring wallet session…
        </div>
      ) : null}
      <ConnectSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
