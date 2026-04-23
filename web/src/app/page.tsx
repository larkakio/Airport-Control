import { AirportControlGame } from '@/components/game/AirportControlGame';
import { CheckInPanel } from '@/components/wallet/CheckInPanel';
import { WalletBar } from '@/components/wallet/WalletBar';

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <WalletBar />
      <main className="relative flex flex-1 flex-col">
        <AirportControlGame />
        <footer className="relative z-20 mt-auto border-t border-white/5 p-3">
          <CheckInPanel />
        </footer>
      </main>
    </div>
  );
}
