import type { Hex } from 'viem';
import { Attribution } from 'ox/erc8021';

const override = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX as Hex | undefined;
const code = process.env.NEXT_PUBLIC_BUILDER_CODE;

/** ERC-8021 calldata suffix for Base builder attribution. */
export function getCheckInDataSuffix(): Hex | undefined {
  if (override && override.startsWith('0x')) {
    return override;
  }
  if (!code) {
    return undefined;
  }
  return Attribution.toDataSuffix({ codes: [code] });
}
