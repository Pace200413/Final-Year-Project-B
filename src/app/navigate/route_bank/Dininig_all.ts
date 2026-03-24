import type { RouteDefinition } from './types';

export const dininigMphRoute: RouteDefinition = {
  id: 'dining-mph',
  title: 'Dining Hall → MPH',
  fromNode: 'Dining Hall',
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

export const diningHqRoute: RouteDefinition = {
  id: 'dining-hq',
  title: 'Dining Hall → HQ',
  fromNode: 'Dining Hall',
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

export const diningShubRoute: RouteDefinition = {
  id: 'dining-shub',
  title: 'Dining Hall → Student Hub',
  fromNode: 'Dining Hall',
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

export const diningGblockRoute: RouteDefinition = {
  id: 'dining-gblock',
  title: 'Dining Hall → G Block',
  fromNode: 'Dining Hall',
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

export const diningBorneoRoute: RouteDefinition = {
  id: 'dining-borneo',
  title: 'Dining Hall → Borneo Atrium',
  fromNode: 'Dining Hall',
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

export const diningJunctionRoute: RouteDefinition = {
  id: 'dining-junction',
  title: 'Dining Hall → Junction',
  fromNode: 'Dining Hall',
  toNode: 'Junction',
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

export const diningLibraryRoute: RouteDefinition = {
  id: 'dining-library',
  title: 'Dining Hall → Library',
  fromNode: 'Dining Hall',
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

export const diningSvRoute: RouteDefinition = {
  id: 'dining-SV',
  title: 'Dining Hall → Student Village',
  fromNode: 'Dining Hall',
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
  'dining-mph': dininigMphRoute,
  'dining-hq': diningHqRoute,
  'dining-shub': diningShubRoute,
  'dining-gblock':diningGblockRoute,
  'dining-borneo': diningBorneoRoute,
  'dining-junction': diningJunctionRoute,
  'dining-library': diningLibraryRoute,
  'dining-SV': diningSvRoute,
};