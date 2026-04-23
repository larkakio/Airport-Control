'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { GameField } from '@/components/game/GameField';
import { LEVELS } from '@/components/game/levels';
import { loadProgress, saveMaxUnlockedLevel } from '@/components/game/progress';

type Screen = 'home' | 'levels' | 'play' | 'won' | 'lost';

export function AirportControlGame() {
  const [screen, setScreen] = useState<Screen>('home');
  const [levelIndex, setLevelIndex] = useState(0);
  const [runId, setRunId] = useState(0);
  const [maxUnlocked, setMaxUnlocked] = useState(1);

  function beginPlay(nextIndex: number) {
    setLevelIndex(nextIndex);
    setRunId((r) => r + 1);
    setScreen('play');
  }

  useEffect(() => {
    setMaxUnlocked(loadProgress(LEVELS.length).maxUnlockedLevel);
  }, []);

  const level = LEVELS[levelIndex] ?? LEVELS[0]!;

  const unlockNext = useCallback(() => {
    const next = level.id + 1;
    if (next <= LEVELS.length && next > maxUnlocked) {
      saveMaxUnlockedLevel(next, LEVELS.length);
      setMaxUnlocked(next);
    }
  }, [level.id, maxUnlocked]);

  const onWon = useCallback(() => {
    unlockNext();
    setScreen('won');
  }, [unlockNext]);

  const onLost = useCallback(() => {
    setScreen('lost');
  }, []);

  const hud = useMemo(() => {
    if (screen !== 'play') {
      return null;
    }
    return (
      <div className="flex w-full max-w-lg justify-between gap-3 px-2 text-[11px] text-slate-300">
        <div>
          <span className="text-slate-500">Sector </span>
          <span className="font-display text-cyan-200">{level.name}</span>
        </div>
        <div className="text-fuchsia-200/90">
          Landings <span className="text-white">{level.needLandings}</span> required
        </div>
      </div>
    );
  }, [screen, level.name, level.needLandings]);

  return (
    <div className="relative flex flex-1 flex-col items-center overflow-hidden">
      <div className="cyber-scanlines pointer-events-none absolute inset-0 z-10 opacity-[0.12]" />

      {screen === 'home' ? (
        <div className="relative z-20 flex min-h-[50vh] flex-col items-center justify-center gap-6 px-6 text-center">
          <p className="max-w-sm text-xs uppercase tracking-[0.35em] text-cyan-500/80">Tower link established</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-transparent sm:text-4xl cyber-title">
            AIRPORT CONTROL
          </h1>
          <p className="max-w-xs text-sm leading-relaxed text-slate-400">
            Swipe from each craft to its matching neon gate. Avoid collisions. Clear the sector.
          </p>
          <button
            type="button"
            className="cyber-primary-btn rounded-2xl px-8 py-3 font-display text-sm tracking-widest text-black"
            onClick={() => setScreen('levels')}
          >
            Enter airspace
          </button>
        </div>
      ) : null}

      {screen === 'levels' ? (
        <div className="relative z-20 mt-4 w-full max-w-lg px-4">
          <h2 className="font-display text-lg text-cyan-200">Select sector</h2>
          <p className="mt-1 text-xs text-slate-500">Completed sectors unlock the next route.</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {LEVELS.map((L) => {
              const locked = L.id > maxUnlocked;
              return (
                <button
                  key={L.id}
                  type="button"
                  disabled={locked}
                  onClick={() => beginPlay(L.id - 1)}
                  className={`rounded-xl border px-2 py-4 text-center transition ${
                    locked
                      ? 'cursor-not-allowed border-white/5 bg-white/[0.02] text-slate-600'
                      : 'border-cyan-500/40 bg-cyan-500/5 text-cyan-100 hover:border-fuchsia-400/50 hover:shadow-[0_0_24px_rgba(255,43,214,0.25)]'
                  }`}
                >
                  <div className="font-display text-xl">{L.id}</div>
                  <div className="mt-1 line-clamp-2 text-[10px] text-slate-400">{L.name}</div>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="mt-6 text-xs text-slate-500 underline decoration-dotted hover:text-slate-300"
            onClick={() => setScreen('home')}
          >
            Back
          </button>
        </div>
      ) : null}

      {screen === 'play' ? (
        <div className="relative z-20 flex w-full flex-col items-center gap-2 pb-2 pt-2">
          {hud}
          <GameField
            key={`${level.id}-${runId}`}
            level={level}
            onWon={onWon}
            onLost={onLost}
          />
          <button
            type="button"
            className="text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-300"
            onClick={() => setScreen('levels')}
          >
            Abort to map
          </button>
        </div>
      ) : null}

      {screen === 'won' ? (
        <div className="cyber-overlay relative z-30 flex min-h-[60vh] flex-col items-center justify-center gap-5 px-6 text-center">
          <div className="font-display text-xs tracking-[0.4em] text-lime-300/90">Sector cleared</div>
          <h2 className="font-display text-2xl text-white cyber-glitch-text">Vector locked</h2>
          <p className="max-w-xs text-sm text-slate-400">
            {level.id < LEVELS.length
              ? 'Next corridor is online. Proceed when ready.'
              : 'All neon corridors stable. Legendary run.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {level.id < LEVELS.length ? (
              <button
                type="button"
                className="cyber-primary-btn rounded-xl px-6 py-2 font-display text-xs tracking-widest text-black"
                onClick={() => beginPlay(level.id)}
              >
                Next sector
              </button>
            ) : null}
            <button
              type="button"
              className="rounded-xl border border-white/20 px-6 py-2 font-display text-xs tracking-widest text-slate-200 hover:border-cyan-400/50"
              onClick={() => setScreen('levels')}
            >
              Map
            </button>
          </div>
        </div>
      ) : null}

      {screen === 'lost' ? (
        <div className="cyber-overlay relative z-30 flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="font-display text-xs tracking-[0.35em] text-rose-400/90">Signal lost</div>
          <h2 className="font-display text-2xl text-rose-100">Collision cascade</h2>
          <p className="max-w-xs text-sm text-slate-400">Re-route vectors and try the approach again.</p>
          <div className="flex gap-3">
            <button
              type="button"
              className="cyber-primary-btn rounded-xl px-6 py-2 font-display text-xs tracking-widest text-black"
              onClick={() => {
                setRunId((r) => r + 1);
                setScreen('play');
              }}
            >
              Retry sector
            </button>
            <button
              type="button"
              className="rounded-xl border border-white/15 px-6 py-2 text-xs text-slate-300 hover:border-cyan-400/40"
              onClick={() => setScreen('levels')}
            >
              Map
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
