// src/route_bank/types.ts
export type YawPitch = { yaw: number; pitch: number };

export type RouteScene = {
  id: number;
  image: string;
  label: string;
  initialYaw: number;
  forward?: YawPitch;
  back?: YawPitch;
  instruction?: string;
};

// src/route_bank/types.ts
export type RouteId =
  | 'lobby-mph'
  | 'lobby-borneo'
  | 'lobby-gblock'
  | 'lobby-dining'
  | 'lobby-shub'
  | 'lobby-junction'
  | 'lobby-hq'
  | 'lobby-library'
  | 'mph-borneo'
  | 'mph-library'
  | 'mph-junction'
  | 'borneo-mph'
  | 'borneo-hq'
  | 'borneo-junction'
  | 'borneo-dining'
  | 'borneo-gblock'
  | 'borneo-library'
  | 'borneo-shub';

export type RouteDefinition = {
  id: RouteId;
  title: string;             // e.g. "Lobby → MPH"
  fromNode: string;          // "Lobby"
  toNode: string;            // "MPH"
  scenes: RouteScene[];
  nextRouteIds?: RouteId[];  // which routes can continue from here
};
