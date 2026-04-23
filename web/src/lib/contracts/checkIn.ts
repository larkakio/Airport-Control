import type { Abi, Address } from 'viem';

export const checkInAbi = [
  {
    type: 'function',
    name: 'checkIn',
    stateMutability: 'payable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'event',
    name: 'CheckedIn',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'day', type: 'uint256', indexed: true },
      { name: 'streakCount', type: 'uint256', indexed: false },
    ],
  },
] as const satisfies Abi;

export function getCheckInAddress(): Address | undefined {
  const raw = process.env.NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS;
  if (!raw || !raw.startsWith('0x') || raw.length !== 42) {
    return undefined;
  }
  return raw as Address;
}
