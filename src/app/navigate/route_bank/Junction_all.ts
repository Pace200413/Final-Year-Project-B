import type { RouteDefinition } from './types';

export const junctionMphRoute: RouteDefinition = {
  id: 'junction-mph',
  title: 'Junction → MPH',
  fromNode: 'Junction',
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

export const junctionHqRoute: RouteDefinition = {
  id: 'junction-hq',
  title: 'Junction → HQ',
  fromNode: 'Junction',
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

export const junctionShubRoute: RouteDefinition = {
  id: 'junction-shub',
  title: 'Junction → Student Hub',
  fromNode: 'Junction',
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

export const junctionDiningRoute: RouteDefinition = {
  id: 'junction-dining',
  title: 'Junction → Dining Hall',
  fromNode: 'Junction',
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

export const junctionBorneoRoute: RouteDefinition = {
  id: 'junction-borneo',
  title: 'Junction → Borneo Atrium',
  fromNode: 'Junction',
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

export const junctionGblockRoute: RouteDefinition = {
  id: 'junction-gblock',
  title: 'Junction → G Block',
  fromNode: 'Junction',
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

export const junctionLibraryRoute: RouteDefinition = {
  id: 'junction-library',
  title: 'Junction → Library',
  fromNode: 'Junction',
  toNode: 'Library',
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

export const junctionSvRoute: RouteDefinition = {
  id: 'junction-SV',
  title: 'Junction → Student Village',
  fromNode: 'Junction',
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
    'junction-mph': junctionMphRoute,
    'junction-hq': junctionHqRoute,
    'junction-shub': junctionShubRoute,
    'junction-dining':junctionDiningRoute,
    'junction-borneo': junctionBorneoRoute,
    'junction-gblock': junctionGblockRoute,
    'junction-library': junctionLibraryRoute,
    'junction-SV': junctionSvRoute,
};