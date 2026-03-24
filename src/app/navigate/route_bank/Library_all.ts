import type { RouteDefinition } from './types';

export const libraryMphRoute: RouteDefinition = {
  id: 'library-mph',
  title: 'Library → MPH',
  fromNode: 'Library',
  toNode: 'MPH',
  scenes: [
            {
                id: 1,
                image: '/images360/L-B-18.jpg',
                label: 'You arrive the Borneo Atrium! Welcome!',
                initialYaw: 180,
                forward: { yaw: 190, pitch: -7 },
            },
            {
                id: 2,
                image: '/images360/L-B-16.jpg',
                label: 'Left side got escalator can go up to Junction',
                initialYaw: 175,
                back : { yaw: 10, pitch: 0 },
                forward : { yaw: 180, pitch: -5 },
            },
  ],
};

export const libraryHqRoute: RouteDefinition = {
  id: 'library-hq',
  title: 'Library → HQ',
  fromNode: 'Library',
  toNode: 'HQ',
  scenes: [
    {
      id: 1,
      image: '/images360/L-B-18.jpg',
      label: 'You arrive the Borneo Atrium! Welcome!',
      initialYaw: 180,
      forward: { yaw: 190, pitch: -7 },
    },
    {
      id: 2,
      image: '/images360/L-B-16.jpg',
      label: 'Left side got escalator can go up to Junction',
      initialYaw: 175,
      back: { yaw: 10, pitch: 0 },
      forward: { yaw: 180, pitch: -5 },
    },
  ],
};

export const libraryShubRoute: RouteDefinition = {
  id: 'library-shub',
  title: 'Library → Student Hub',
  fromNode: 'Library',
  toNode: 'Student Hub',
  scenes: [
            {
                id: 1,
                image: '/images360/L-B-18.jpg',
                label: 'You arrive the Borneo Atrium! Welcome!',
                initialYaw: 180,
                forward: { yaw: 190, pitch: -7 },
            },
            {
                id: 2,
                image: '/images360/L-B-16.jpg',
                label: 'Left side got escalator can go up to Junction',
                initialYaw: 175,
                back : { yaw: 10, pitch: 0 },
                forward : { yaw: 180, pitch: -5 },
            },
  ],
};

export const libraryDiningRoute: RouteDefinition = {
  id: 'library-dining',
  title: 'Library → Dining Hall',
  fromNode: 'Library',
  toNode: 'Dining Hall',
  scenes: [
            {
                id: 1,
                image: '/images360/L-B-18.jpg',
                label: 'You arrive the Borneo Atrium! Welcome!',
                initialYaw: 180,
                forward: { yaw: 190, pitch: -7 },
            },
            {
                id: 2,
                image: '/images360/L-B-16.jpg',
                label: 'Left side got escalator can go up to Junction',
                initialYaw: 175,
                back : { yaw: 10, pitch: 0 },
                forward : { yaw: 180, pitch: -5 },
            },
  ],
};

export const libraryBorneoRoute: RouteDefinition = {
  id: 'library-borneo',
  title: 'Library → Borneo Atrium',
  fromNode: 'Library',
  toNode: 'Borneo Atrium',
  scenes: [
            {
                id: 1,
                image: '/images360/L-B-18.jpg',
                label: 'You arrive the Borneo Atrium! Welcome!',
                initialYaw: 180,
                forward: { yaw: 190, pitch: -7 },
            },
            {
                id: 2,
                image: '/images360/L-B-16.jpg',
                label: 'Left side got escalator can go up to Junction',
                initialYaw: 175,
                back : { yaw: 10, pitch: 0 },
                forward : { yaw: 180, pitch: -5 },
            },
  ],
};

export const libraryGblockRoute: RouteDefinition = {
  id: 'library-gblock',
  title: 'Library → G Block',
  fromNode: 'Library',
  toNode: 'G Block',
  scenes: [
            {
                id: 1,
                image: '/images360/L-B-18.jpg',
                label: 'You arrive the Borneo Atrium! Welcome!',
                initialYaw: 180,
                forward: { yaw: 190, pitch: -7 },
            },
            {
                id: 2,
                image: '/images360/L-J-18.jpg',
                label: 'Go up escalator',
                initialYaw: 360,
                forward: { yaw: 360, pitch: 20 },
                back: { yaw: 290, pitch: -12 },
            },
    ],
};

export const libraryJunctionRoute: RouteDefinition = {
  id: 'library-junction',
  title: 'Library → Junction',
  fromNode: 'Library',
  toNode: 'Junction',
  scenes: [
    {
        id: 1,
        image: '/images360/L-B-18.jpg',
        label: 'Borneo Atrium Entrance',
        initialYaw: 180,
        forward: { yaw: 225, pitch: -7 },
    },
    {
        id: 2,
        image: '/images360/L-J-18.jpg',
        label: 'Escalator to Junction Level 1',
        initialYaw: 360,
        forward: { yaw: 360, pitch: 20 },
        back: { yaw: 290, pitch: -12 },
    },
  ],
};

export const librarySvRoute: RouteDefinition = {
  id: 'library-SV',
  title: 'Library → Student Village',
  fromNode: 'Library',
  toNode: 'Student Village',
  scenes: [
    {
        id: 1,
        image: '/images360/L-B-18.jpg',
        label: 'Borneo Atrium Entrance',
        initialYaw: 180,
        forward: { yaw: 225, pitch: -7 },
    },
    {
        id: 2,
        image: '/images360/L-J-18.jpg',
        label: 'Escalator to Junction Level 1',
        initialYaw: 360,
        forward: { yaw: 360, pitch: 20 },
        back: { yaw: 290, pitch: -12 },
    },
  ],
};

export const borneoRoutes = {
    'library-mph': libraryMphRoute,
    'library-hq': libraryHqRoute,
    'library-shub': libraryShubRoute,
    'library-dining':libraryDiningRoute,
    'library-borneo': libraryBorneoRoute,
    'library-gblock': libraryGblockRoute,
    'library-junction': libraryJunctionRoute,
    'library-SV': librarySvRoute,
};