'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import type { LevelDef, Runway } from '@/components/game/levels';
import type { Plane } from '@/components/game/types';

const PLANE_PICK_R = 7;
const COLLISION_R = 5.2;
const OFF_MARGIN = 2;

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by);
}

function runwayForPoint(level: LevelDef, x: number, y: number): Runway | null {
  let best: Runway | null = null;
  let bestD = Infinity;
  for (const r of level.runways) {
    const d = dist(x, y, r.cx, r.cy);
    if (d <= r.r && d < bestD) {
      best = r;
      bestD = d;
    }
  }
  return best;
}

type GamePhase = 'playing' | 'won' | 'lost';

type GameState = {
  planes: Plane[];
  landed: number;
  lives: number;
  phase: GamePhase;
  nextSpawnAt: number;
  spawnRotor: number;
};

function spawnPlane(level: LevelDef, rotor: number): { plane: Plane; nextRotor: number } {
  const ri = rotor % level.runways.length;
  const si = rotor % level.spawnPoints.length;
  const runway = level.runways[ri]!;
  const sp = level.spawnPoints[si]!;
  const plane: Plane = {
    id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    x: sp.x,
    y: sp.y,
    targetRunwayId: runway.id,
    color: runway.color,
    path: null,
    pathTraveled: 0,
    pathLength: 0,
    status: 'active',
  };
  return { plane, nextRotor: rotor + 1 };
}

function updatePhysics(
  level: LevelDef,
  state: GameState,
  dt: number,
  needLandings: number,
): GameState {
  if (state.phase !== 'playing') {
    return state;
  }

  const { planes: initialPlanes, landed: startLanded, lives: startLives, phase: startPhase } = state;
  let landed = startLanded;
  let lives = startLives;
  let phase: GamePhase = startPhase;
  const nextPlanes: Plane[] = initialPlanes.map((p) => ({ ...p }));

  for (const p of nextPlanes) {
    if (p.status !== 'active') {
      continue;
    }
    if (!p.path) {
      continue;
    }
    const seg = p.path;
    const len = p.pathLength;
    const nx = p.pathTraveled + level.planeSpeed * dt;
    if (nx >= len) {
      const rw = level.runways.find((r) => r.id === p.targetRunwayId);
      if (rw) {
        p.status = 'landed';
        landed += 1;
        p.x = rw.cx;
        p.y = rw.cy;
      } else {
        p.status = 'crashed';
        lives -= 1;
        p.x = seg.x1;
        p.y = seg.y1;
      }
      p.path = null;
    } else {
      const t = nx / len;
      p.x = seg.x0 + (seg.x1 - seg.x0) * t;
      p.y = seg.y0 + (seg.y1 - seg.y0) * t;
      p.pathTraveled = nx;
    }
  }

  const active = nextPlanes.filter((p) => p.status === 'active');
  const seen = new Set<string>();
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i]!;
      const b = active[j]!;
      const key = [a.id, b.id].sort().join(':');
      if (seen.has(key)) {
        continue;
      }
      if (dist(a.x, a.y, b.x, b.y) < COLLISION_R * 2) {
        seen.add(key);
        a.status = 'crashed';
        b.status = 'crashed';
        lives -= 1;
      }
    }
  }

  for (const p of nextPlanes) {
    if (p.status !== 'active') {
      continue;
    }
    if (
      p.x < -OFF_MARGIN ||
      p.x > 100 + OFF_MARGIN ||
      p.y < -OFF_MARGIN ||
      p.y > 100 + OFF_MARGIN
    ) {
      p.status = 'crashed';
      lives -= 1;
    }
  }

  if (landed >= needLandings) {
    phase = 'won';
  } else if (lives <= 0) {
    phase = 'lost';
  }

  return {
    ...state,
    planes: nextPlanes,
    landed,
    lives,
    phase,
  };
}

type Props = {
  level: LevelDef;
  onWon: () => void;
  onLost: () => void;
};

export function GameField({ level, onWon, onLost }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const [, setTick] = useState(0);
  const wonRef = useRef(false);
  const lostRef = useRef(false);
  const onWonRef = useRef(onWon);
  const onLostRef = useRef(onLost);
  onWonRef.current = onWon;
  onLostRef.current = onLost;

  const draftRef = useRef<{
    planeId: string;
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  } | null>(null);
  const [, setDraftVersion] = useState(0);

  const clientToSvg = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) {
      return { x: 0, y: 0 };
    }
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) {
      return { x: 0, y: 0 };
    }
    const cur = pt.matrixTransform(ctm.inverse());
    return { x: cur.x, y: cur.y };
  }, []);

  useEffect(() => {
    wonRef.current = false;
    lostRef.current = false;
    const { plane, nextRotor } = spawnPlane(level, 0);
    stateRef.current = {
      planes: [plane],
      landed: 0,
      lives: level.lives,
      phase: 'playing',
      nextSpawnAt: performance.now() + level.spawnIntervalMs * 0.4,
      spawnRotor: nextRotor,
    };
    draftRef.current = null;
  }, [level]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      let st = stateRef.current;
      if (st && st.phase === 'playing') {
        const dt = Math.min(0.045, (now - last) / 1000);
        last = now;
        if (
          st.planes.filter((p) => p.status === 'active').length < level.maxConcurrent &&
          now >= st.nextSpawnAt
        ) {
          const { plane, nextRotor } = spawnPlane(level, st.spawnRotor);
          st = {
            ...st,
            planes: [...st.planes, plane],
            nextSpawnAt: now + level.spawnIntervalMs,
            spawnRotor: nextRotor,
          };
          stateRef.current = st;
        }
        st = updatePhysics(level, st, dt, level.needLandings);
        stateRef.current = st;
        if (st.phase === 'won' && !wonRef.current) {
          wonRef.current = true;
          onWonRef.current();
        }
        if (st.phase === 'lost' && !lostRef.current) {
          lostRef.current = true;
          onLostRef.current();
        }
      }
      setTick((t) => t + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [level]);

  const state = stateRef.current;

  function pickPlane(x: number, y: number): Plane | null {
    const st = stateRef.current;
    if (!st) {
      return null;
    }
    let best: Plane | null = null;
    let bestD = PLANE_PICK_R;
    for (const p of st.planes) {
      if (p.status !== 'active' || p.path) {
        continue;
      }
      const d = dist(x, y, p.x, p.y);
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    return best;
  }

  function onPointerDown(e: React.PointerEvent) {
    const st = stateRef.current;
    if (!st || st.phase !== 'playing') {
      return;
    }
    const { x, y } = clientToSvg(e.clientX, e.clientY);
    const plane = pickPlane(x, y);
    if (!plane) {
      return;
    }
    svgRef.current?.setPointerCapture(e.pointerId);
    draftRef.current = { planeId: plane.id, x0: plane.x, y0: plane.y, x1: x, y1: y };
    setDraftVersion((v) => v + 1);
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = draftRef.current;
    if (!d) {
      return;
    }
    const { x, y } = clientToSvg(e.clientX, e.clientY);
    d.x1 = x;
    d.y1 = y;
    setDraftVersion((v) => v + 1);
  }

  function onPointerUp(e: React.PointerEvent) {
    const d = draftRef.current;
    if (!d || !stateRef.current) {
      return;
    }
    draftRef.current = null;
    setDraftVersion((v) => v + 1);
    const { x, y } = clientToSvg(e.clientX, e.clientY);
    const rw = runwayForPoint(level, x, y);
    const st = stateRef.current;
    const plane = st.planes.find((p) => p.id === d.planeId);
    if (!plane || plane.status !== 'active') {
      return;
    }

    if (!rw) {
      st.lives -= 1;
      plane.status = 'crashed';
      if (st.lives <= 0) {
        st.phase = 'lost';
        if (!lostRef.current) {
          lostRef.current = true;
          onLostRef.current();
        }
      }
      return;
    }

    if (rw.id !== plane.targetRunwayId) {
      st.lives -= 1;
      plane.status = 'crashed';
      if (st.lives <= 0) {
        st.phase = 'lost';
        if (!lostRef.current) {
          lostRef.current = true;
          onLostRef.current();
        }
      }
      return;
    }

    const len = dist(plane.x, plane.y, rw.cx, rw.cy);
    if (len < 0.5) {
      plane.status = 'landed';
      st.landed += 1;
      if (st.landed >= level.needLandings) {
        st.phase = 'won';
        if (!wonRef.current) {
          wonRef.current = true;
          onWonRef.current();
        }
      }
      return;
    }

    plane.path = {
      x0: plane.x,
      y0: plane.y,
      x1: rw.cx,
      y1: rw.cy,
    };
    plane.pathLength = len;
    plane.pathTraveled = 0;
  }

  const draft = draftRef.current;

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 100"
      className="game-surface h-[min(72vh,560px)] w-full max-w-lg touch-none select-none"
      style={{ touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        draftRef.current = null;
        setDraftVersion((v) => v + 1);
      }}
    >
      <defs>
        <radialGradient id="vignette" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="rgba(0,245,255,0.08)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
        </radialGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="100" height="100" fill="#060810" />
      <rect width="100" height="100" fill="url(#vignette)" />
      <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
        <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(0,245,255,0.06)" strokeWidth="0.15" />
      </pattern>
      <rect width="100" height="100" fill="url(#grid)" opacity={0.9} />

      {level.runways.map((r) => (
        <g key={r.id}>
          <circle
            cx={r.cx}
            cy={r.cy}
            r={r.r + 1.2}
            fill="none"
            stroke={r.color}
            strokeOpacity={0.25}
            strokeWidth={0.6}
            className="runway-ring"
          />
          <circle
            cx={r.cx}
            cy={r.cy}
            r={r.r}
            fill="rgba(5,8,16,0.75)"
            stroke={r.color}
            strokeWidth={0.45}
            filter="url(#glow)"
          />
          <text
            x={r.cx}
            y={r.cy + 1}
            textAnchor="middle"
            fill={r.color}
            fontSize="4"
            className="font-display"
            style={{ fontFamily: 'var(--font-display), sans-serif' }}
          >
            {r.label}
          </text>
        </g>
      ))}

      {state?.planes.map((p) => {
        if (p.status === 'landed') {
          return null;
        }
        if (p.status === 'crashed') {
          return (
            <g key={p.id} opacity={0.35}>
              <circle cx={p.x} cy={p.y} r={2.5} fill="#ff4466" />
            </g>
          );
        }
        return (
          <g key={p.id} filter="url(#glow)">
            <circle cx={p.x} cy={p.y} r={3.2} fill={p.color} opacity={0.35} />
            <path
              d={`M ${p.x + 4} ${p.y} L ${p.x - 3} ${p.y - 2.5} L ${p.x - 2} ${p.y} L ${p.x - 3} ${p.y + 2.5} Z`}
              fill={p.color}
            />
          </g>
        );
      })}

      {draft ? (
        <line
          x1={draft.x0}
          y1={draft.y0}
          x2={draft.x1}
          y2={draft.y1}
          stroke="rgba(0,245,255,0.65)"
          strokeWidth={0.35}
          strokeDasharray="2 1"
        />
      ) : null}
    </svg>
  );
}
