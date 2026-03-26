// src/route_bank/types.ts
export type YawPitch = { yaw: number; pitch: number };

export type RouteScene = {
  id: number;
  image: string;
  label: string;
  initialYaw: number;
  forward?: YawPitch;
  back?: YawPitch;
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
  | 'lobby-SV'

  | 'mph-borneo'
  | 'mph-library'
  | 'mph-junction'
  | 'mph-SV'
  | 'mph-hq'
  | 'mph-dining'
  | 'mph-gblock'
  | 'mph-shub'

  | 'dining-mph'
  | 'dining-hq'
  | 'dining-shub'
  | 'dining-gblock'
  | 'dining-borneo'
  | 'dining-junction'
  | 'dining-library'
  | 'dining-SV'

  | 'gblock-mph'
  | 'gblock-hq'
  | 'gblock-shub'
  | 'gblock-dining'
  | 'gblock-borneo'
  | 'gblock-junction'
  | 'gblock-library'
  | 'gblock-SV'

  | 'junction-mph'
  | 'junction-hq'
  | 'junction-shub'
  | 'junction-dining'
  | 'junction-borneo'
  | 'junction-gblock'
  | 'junction-library'
  | 'junction-SV'

  | 'library-mph'
  | 'library-hq'
  | 'library-shub'
  | 'library-dining'
  | 'library-borneo'
  | 'library-gblock'
  | 'library-junction'
  | 'library-SV'

  | 'hq-mph'
  | 'hq-library'
  | 'hq-shub'
  | 'hq-dining'
  | 'hq-borneo'
  | 'hq-gblock'
  | 'hq-junction'
  | 'hq-SV'

  | 'shub-mph'
  | 'shub-library'
  | 'shub-hq'
  | 'shub-dining'
  | 'shub-borneo'
  | 'shub-gblock'
  | 'shub-junction'
  | 'shub-SV'

  | 'SV-mph'
  | 'SV-library'
  | 'SV-hq'
  | 'SV-dining'
  | 'SV-borneo'
  | 'SV-gblock'
  | 'SV-junction'
  | 'SV-shub'

  | 'borneo-mph'
  | 'borneo-hq'
  | 'borneo-junction'
  | 'borneo-dining'
  | 'borneo-gblock'
  | 'borneo-library'
  | 'borneo-shub'
  | 'borneo-SV';

export type RouteDefinition = {
  id: RouteId;
  title: string;             // e.g. "Lobby → MPH"
  fromNode: string;          // "Lobby"
  toNode: string;            // "MPH"
  scenes: RouteScene[];
  nextRouteIds?: RouteId[];  // which routes can continue from here
};