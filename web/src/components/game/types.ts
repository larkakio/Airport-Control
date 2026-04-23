export type PlaneStatus = 'active' | 'landed' | 'crashed';

export type Plane = {
  id: string;
  x: number;
  y: number;
  targetRunwayId: string;
  color: string;
  /** Straight path to runway center */
  path: { x0: number; y0: number; x1: number; y1: number } | null;
  /** Distance traveled along path */
  pathTraveled: number;
  pathLength: number;
  status: PlaneStatus;
};
