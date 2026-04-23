'use client';

import { useState } from 'react';
import { base } from 'wagmi/chains';
import { useConnection, useSwitchChain, useWriteContract } from 'wagmi';

import { getCheckInDataSuffix } from '@/lib/builder/attribution';
import { checkInAbi, getCheckInAddress } from '@/lib/contracts/checkIn';

export function CheckInPanel() {
  const { isConnected, chainId } = useConnection();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();
  const [msg, setMsg] = useState<string | null>(null);

  const contract = getCheckInAddress();
  const baseId = base.id;
  const disabled =
    !isConnected || !contract || isWriting || isSwitching;

  async function onCheckIn() {
    setMsg(null);
    if (!contract) {
      setMsg('Check-in contract not configured.');
      return;
    }
    try {
      if (chainId !== baseId) {
        await switchChainAsync({ chainId: baseId });
      }
      await writeContractAsync({
        address: contract,
        abi: checkInAbi,
        functionName: 'checkIn',
        chainId: baseId,
        dataSuffix: getCheckInDataSuffix(),
      });
      setMsg('Check-in submitted.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Transaction failed');
    }
  }

  return (
    <div className="cyber-panel rounded-xl border border-white/10 bg-black/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500">On-chain</div>
          <div className="text-sm font-medium text-slate-200">Daily check-in</div>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => void onCheckIn()}
          className="rounded-lg border border-lime-400/50 bg-lime-400/10 px-3 py-2 text-xs font-semibold text-lime-200 hover:bg-lime-400/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSwitching || isWriting ? 'Working…' : 'Check in'}
        </button>
      </div>
      {!contract ? (
        <p className="mt-2 text-[10px] text-slate-500">Deploy contract and set NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS.</p>
      ) : null}
      {msg ? <p className="mt-2 text-[10px] text-cyan-300/90">{msg}</p> : null}
    </div>
  );
}
