// src/route_bank/index.ts
import type { RouteId, RouteDefinition } from './types';

import {
    diningMphRoute,
    diningHqRoute,
    diningShubRoute,
    diningGblockRoute,
    diningBorneoRoute,
    diningJunctionRoute,
    diningLibraryRoute,
    diningSvRoute,
} from './Dining_all';


import {
    gblockMphRoute,
    gblockHqRoute,
    gblockShubRoute,
    gblockDiningRoute,
    gblockBorneoRoute,
    gblockJunctionRoute,
    gblockLibraryRoute,
    gblockSvRoute,
} from './Gblock_all';

import {
    junctionMphRoute,
    junctionHqRoute,
    junctionShubRoute,
    junctionDiningRoute,
    junctionBorneoRoute,
    junctionGblockRoute,
    junctionLibraryRoute,
    junctionSvRoute,
} from './Junction_all';

import {
    libraryMphRoute,
    libraryHqRoute,
    libraryShubRoute,
    libraryDiningRoute,
    libraryBorneoRoute,
    libraryGblockRoute,
    libraryJunctionRoute,
    librarySvRoute,
} from './Library_all';

import {
    hqMphRoute,
    hqLibraryRoute,
    hqShubRoute,
    hqDiningRoute,
    hqBorneoRoute,
    hqGblockRoute,
    hqJunctionRoute,
    hqSvRoute,
} from './StudentHQ_all';

import {
    shubMphRoute,
    shubLibraryRoute,
    shubHQRoute,
    shubDiningRoute,
    shubBorneoRoute,
    shubGblockRoute,
    shubJunctionRoute,
    shubSvRoute,
} from './StudentHub_all';

import {
    svMphRoute,
    svLibraryRoute,
    svHQRoute,
    svDiningRoute,
    svBorneoRoute,
    svGblockRoute,
    svJunctionRoute,
    svShubRoute,
} from './SV_all';

import { 
    mphBorneoRoute,
    mphLibraryRoute,
    mphJunctionRoute,
    mphSvRoute,
    mphHQRoute,
    mphDiningRoute,
    mphGblockRoute,
    mphShubRoute,
} from './Mph_all';

import {
    lobbyMphRoute,
    lobbyBorneoRoute,
    lobbyGblockRoute,
    lobbyDiningRoute,
    lobbyShubRoute,
    lobbyJunctionRoute,
    lobbyHqRoute,
    lobbyLibraryRoute,
    lobbySvRoute,
} from './Lobby_all';

import {
    borneoMphRoute,
    borneoHqRoute,
    borneoShubRoute,
    borneoGblockRoute,
    borneoDiningRoute,
    borneoJunctionRoute,
    borneoLibraryRoute,
    borneoSvRoute,
} from './BorneoAtrium_all';

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
    'lobby-SV': lobbySvRoute,

    'dining-mph': diningMphRoute,
    'dining-hq': diningHqRoute,
    'dining-shub': diningShubRoute,
    'dining-gblock':diningGblockRoute,
    'dining-borneo': diningBorneoRoute,
    'dining-junction': diningJunctionRoute,
    'dining-library': diningLibraryRoute,
    'dining-SV': diningSvRoute,

    'gblock-mph': gblockMphRoute,
    'gblock-hq': gblockHqRoute,
    'gblock-shub': gblockShubRoute,
    'gblock-dining':gblockDiningRoute,
    'gblock-borneo': gblockBorneoRoute,
    'gblock-junction': gblockJunctionRoute,
    'gblock-library': gblockLibraryRoute,
    'gblock-SV': gblockSvRoute,

    'junction-mph': junctionMphRoute,
    'junction-hq': junctionHqRoute,
    'junction-shub': junctionShubRoute,
    'junction-dining':junctionDiningRoute,
    'junction-borneo': junctionBorneoRoute,
    'junction-gblock': junctionGblockRoute,
    'junction-library': junctionLibraryRoute,
    'junction-SV': junctionSvRoute,

    'library-mph': libraryMphRoute,
    'library-hq': libraryHqRoute,
    'library-shub': libraryShubRoute,
    'library-dining':libraryDiningRoute,
    'library-borneo': libraryBorneoRoute,
    'library-gblock': libraryGblockRoute,
    'library-junction': libraryJunctionRoute,
    'library-SV': librarySvRoute,

    'hq-mph': hqMphRoute,
    'hq-library': hqLibraryRoute,
    'hq-shub': hqShubRoute,
    'hq-dining':hqDiningRoute,
    'hq-borneo': hqBorneoRoute,
    'hq-gblock': hqGblockRoute,
    'hq-junction': hqJunctionRoute,
    'hq-SV': hqSvRoute,

    'shub-mph': shubMphRoute,
    'shub-library': shubLibraryRoute,
    'shub-hq': shubHQRoute,
    'shub-dining':shubDiningRoute,
    'shub-borneo': shubBorneoRoute,
    'shub-gblock': shubGblockRoute,
    'shub-junction': shubJunctionRoute,
    'shub-SV': shubSvRoute,

    'SV-mph': svMphRoute,
    'SV-library': svLibraryRoute,
    'SV-hq': svHQRoute,
    'SV-dining':svDiningRoute,
    'SV-borneo': svBorneoRoute,
    'SV-gblock': svGblockRoute,
    'SV-junction': svJunctionRoute,
    'SV-shub': svShubRoute,

    'mph-borneo': mphBorneoRoute,
    'mph-library': mphLibraryRoute,
    'mph-junction': mphJunctionRoute,
    'mph-SV': mphSvRoute,
    'mph-hq': mphHQRoute,
    'mph-dining':mphDiningRoute,
    'mph-gblock': mphGblockRoute,
    'mph-shub': mphShubRoute,

    'borneo-mph': borneoMphRoute,
    'borneo-junction': borneoJunctionRoute,
    'borneo-hq': borneoHqRoute,
    'borneo-dining': borneoDiningRoute,
    'borneo-gblock': borneoGblockRoute,
    'borneo-shub': borneoShubRoute,
    'borneo-library': borneoLibraryRoute,
    'borneo-SV': borneoSvRoute,
};

