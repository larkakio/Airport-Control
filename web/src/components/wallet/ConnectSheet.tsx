'use client';

import { useState } from 'react';
import { base } from 'wagmi/chains';
import { useConnect, useConnection, useConnectors, useDisconnect } from 'wagmi';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ConnectSheet({ open, onClose }: Props) {
  const connectors = useConnectors();
  const { connectAsync, isPending } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useConnection();
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  return (
    <div
      className="cyber-sheet-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Connect wallet"
      onClick={onClose}
    >
      <div
        className="cyber-sheet w-full max-h-[min(70vh,520px)] overflow-y-auto rounded-t-2xl border border-cyan-500/40 bg-[#070a12] p-4 shadow-[0_-8px_40px_rgba(0,245,255,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-cyan-500/50" />
        <h2 className="font-display text-lg tracking-wide text-cyan-200">Connect wallet</h2>
        <p className="mt-1 text-xs text-slate-400">Choose a wallet. Base mainnet is used for check-in.</p>
        {error ? (
          <p className="mt-2 text-xs text-amber-400" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-4 flex flex-col gap-2">
          {connectors.map((c) => (
            <button
              key={c.uid}
              type="button"
              disabled={isPending}
              className="cyber-btn flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-100 transition hover:border-cyan-400/50 hover:bg-cyan-500/10 disabled:opacity-40"
              onClick={async () => {
                setError(null);
                try {
                  await connectAsync({ connector: c, chainId: base.id });
                  onClose();
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Connection failed');
                }
              }}
            >
              <span>{c.name}</span>
            </button>
          ))}
        </div>
        {isConnected ? (
          <button
            type="button"
            className="mt-4 w-full rounded-xl border border-rose-500/40 py-2 text-sm text-rose-300 hover:bg-rose-500/10"
            onClick={async () => {
              await disconnectAsync();
              onClose();
            }}
          >
            Disconnect
          </button>
        ) : null}
      </div>
    </div>
  );
}
