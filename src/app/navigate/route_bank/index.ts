// src/route_bank/index.ts
import type { RouteId, RouteDefinition } from './types';
import { lobbyMphRoute } from './lobby-mph';
import { lobbyBorneoRoute } from './lobby-borneo';
import { lobbyGblockRoute } from './lobby-gblock';
import { lobbyDiningRoute } from './lobby-dining';
import { lobbyShubRoute } from './lobby-shub';
import { lobbyJunctionRoute} from './lobby-junction';
import { lobbyHqRoute} from './lobby-hq';
import { lobbyLibraryRoute} from './lobby-library';
import { mphBorneoRoute } from './mph-borneo';
import { mphLibraryRoute } from './mph-library';
import { mphJunctionRoute } from './mph-junction';
import { borneoMphRoute } from './borneo-mph';
import { borneoHqRoute } from './borneo-hq';
import { borneoShubRoute } from './borneo-shub';
import { borneoGblockRoute } from './borneo-gblock';
import { borneoDiningRoute } from './borneo-dining';
import { borneoJunctionRoute } from './borneo-junction';
import { borneoLibraryRoute } from './borneo-library';


export type { RouteId, RouteScene, RouteDefinition } from './types';

export const routeBank: Record<RouteId, RouteDefinition> = {
    'lobby-mph': lobbyMphRoute,
    'lobby-borneo': lobbyBorneoRoute,
    'lobby-gblock': lobbyGblockRoute,
    'lobby-dining': lobbyDiningRoute,
    'lobby-shub': lobbyShubRoute,
    'lobby-junction': lobbyJunctionRoute,
    'lobby-hq': lobbyHqRoute,
    'lobby-library': lobbyLibraryRoute,
    'mph-borneo': mphBorneoRoute,
    'mph-library': mphLibraryRoute,
    'mph-junction': mphJunctionRoute,
    'borneo-mph': borneoMphRoute,
    'borneo-junction': borneoJunctionRoute,
    'borneo-hq': borneoHqRoute,
    'borneo-dining': borneoDiningRoute,
    'borneo-gblock': borneoGblockRoute,
    'borneo-shub': borneoShubRoute,
    'borneo-library': borneoLibraryRoute,
};
