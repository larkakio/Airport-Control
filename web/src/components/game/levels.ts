export type Runway = {
  id: string;
  cx: number;
  cy: number;
  r: number;
  color: string;
  label: string;
};

export type LevelDef = {
  id: number;
  name: string;
  runways: Runway[];
  spawnPoints: { x: number; y: number }[];
  needLandings: number;
  lives: number;
  spawnIntervalMs: number;
  maxConcurrent: number;
  planeSpeed: number;
};

const cyan = '#00f5ff';
const magenta = '#ff2bd6';
const lime = '#b8ff2b';
const amber = '#ffaa00';

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    name: 'Vector Dawn',
    needLandings: 3,
    lives: 3,
    spawnIntervalMs: 4200,
    maxConcurrent: 3,
    planeSpeed: 20,
    runways: [
      { id: 'r1', cx: 14, cy: 52, r: 9, color: cyan, label: 'A' },
      { id: 'r2', cx: 86, cy: 48, r: 9, color: magenta, label: 'B' },
    ],
    spawnPoints: [
      { x: 8, y: 28 },
      { x: 92, y: 72 },
      { x: 8, y: 72 },
      { x: 92, y: 28 },
    ],
  },
  {
    id: 2,
    name: 'Triad Corridor',
    needLandings: 5,
    lives: 3,
    spawnIntervalMs: 3200,
    maxConcurrent: 4,
    planeSpeed: 26,
    runways: [
      { id: 'r1', cx: 50, cy: 14, r: 8, color: cyan, label: 'N' },
      { id: 'r2', cx: 14, cy: 72, r: 8, color: magenta, label: 'W' },
      { id: 'r3', cx: 86, cy: 72, r: 8, color: lime, label: 'E' },
    ],
    spawnPoints: [
      { x: 22, y: 42 },
      { x: 78, y: 38 },
      { x: 50, y: 88 },
      { x: 6, y: 52 },
    ],
  },
  {
    id: 3,
    name: 'Neon Crosswind',
    needLandings: 7,
    lives: 4,
    spawnIntervalMs: 2600,
    maxConcurrent: 5,
    planeSpeed: 32,
    runways: [
      { id: 'r1', cx: 18, cy: 22, r: 7.5, color: cyan, label: 'α' },
      { id: 'r2', cx: 82, cy: 24, r: 7.5, color: magenta, label: 'β' },
      { id: 'r3', cx: 22, cy: 82, r: 7.5, color: lime, label: 'γ' },
      { id: 'r4', cx: 80, cy: 78, r: 7.5, color: amber, label: 'δ' },
    ],
    spawnPoints: [
      { x: 50, y: 8 },
      { x: 50, y: 92 },
      { x: 6, y: 50 },
      { x: 94, y: 50 },
    ],
  },
];
