import type { RouteDefinition } from './types';

export const svMphRoute: RouteDefinition = {
  id: 'SV-mph',
  title: 'Student Village → MPH',
  fromNode: 'Student Village',
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

export const svLibraryRoute: RouteDefinition = {
  id: 'SV-hq',
  title: 'Student Village → HQ',
  fromNode: 'Student Village',
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

export const svHQRoute: RouteDefinition = {
  id: 'SV-shub',
  title: 'Student Village → Student Hub',
  fromNode: 'Student Village',
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

export const svDiningRoute: RouteDefinition = {
  id: 'SV-gblock',
  title: 'Student Village → G Block',
  fromNode: 'Student Village',
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
                image: '/images360/L-B-16.jpg',
                label: 'Left side got escalator can go up to Junction',
                initialYaw: 175,
                back : { yaw: 10, pitch: 0 },
                forward : { yaw: 180, pitch: -5 },
            },
  ],
};

export const svBorneoRoute: RouteDefinition = {
  id: 'SV-borneo',
  title: 'Student Village → Borneo Atrium',
  fromNode: 'Student Village',
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

export const svGblockRoute: RouteDefinition = {
  id: 'SV-gblock',
  title: 'Student Village → G Block',
  fromNode: 'Student Village',
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

export const svJunctionRoute: RouteDefinition = {
  id: 'SV-junction',
  title: 'Student Village → Junction',
  fromNode: 'Student Village',
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

export const svShubRoute: RouteDefinition = {
  id: 'SV-shub',
  title: 'Student Village → Student Hub',
  fromNode: 'Student Village',
  toNode: 'Student Hub',
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
    'SV-mph': svMphRoute,
    'SV-library': svLibraryRoute,
    'SV-hq': svHQRoute,
    'SV-dining':svDiningRoute,
    'SV-borneo': svBorneoRoute,
    'SV-gblock': svGblockRoute,
    'SV-junction': svJunctionRoute,
    'SV-shub': svShubRoute,
};