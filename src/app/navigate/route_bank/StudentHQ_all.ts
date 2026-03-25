import type { RouteDefinition } from './types';

export const hqMphRoute: RouteDefinition = {
  id: 'hq-mph',
  title: 'HQ → MPH',
  fromNode: 'HQ',
  toNode: 'MPH',
  scenes: [
            {
              id: 1,
              image: '/images360/L-H-4.jpg',
              label: 'Student HQ Lobby',
              initialYaw: 340,
              forward: { yaw: 250, pitch: 0 },
            },
            {
              id: 1,
              image: '/images360/lobby_c1.jpg',
              label: 'Block A Lobby',
              initialYaw: 0,
              forward: { yaw: 360, pitch: 0 },
            },
            {
              id: 2,
              image: '/images360/lobby2.jpg',
              label: 'Outside Block A Lobby',
              initialYaw: 30,
              forward: { yaw: 50, pitch: 0 },
              back: { yaw: 180, pitch: 0 },
            },
            {
              id: 3,
              image: '/images360/L-M-7.jpg',
              label: 'Towards MPH',
              initialYaw: 250,
              forward: { yaw: 235, pitch: 0 },
              back: { yaw: 90, pitch: 0 },
            },
            {
              id: 4,
              image: '/images360/L-M-10.jpg',
              label: 'Go Straight',
              initialYaw: 0,
              forward: { yaw: 353, pitch: 0 },
              back: { yaw: 190, pitch: -4 },
            },
            {
              id: 5,
              image: '/images360/L-M-13.jpg',
              label: 'Ready to turn right into MPH',
              initialYaw: 360,
              forward: { yaw: 360, pitch: 0 },
              back: { yaw: 175, pitch: -5 },
            },
            {
              id: 6,
              image: '/images360/L-M-16.jpg',
              label: 'Enter the MPH Door',
              initialYaw: 360,
              forward: { yaw: 360, pitch: 0 },
              back: { yaw: 87, pitch: -5 },
            },
            {
              id: 7,
              image: '/images360/L-M-17.jpg',
              label: 'Multi Purpose Hall Lobby',
              initialYaw: 345,
              forward: { yaw: 340, pitch: 0 },
              back: { yaw: 165, pitch: -4 },
            },
            {
              id: 8,
              image: '/images360/L-M-18.jpg',
              label: 'You arrived at the MPH! Welcome!',
              initialYaw: 0,
              back: { yaw: 160, pitch: 0 },
            },
  ],
};

export const hqLibraryRoute: RouteDefinition = {
  id: 'hq-library',
  title: 'HQ → Library',
  fromNode: 'HQ',
  toNode: 'Library',
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

export const hqShubRoute: RouteDefinition = {
  id: 'hq-shub',
  title: 'HQ → Student Hub',
  fromNode: 'HQ',
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

export const hqDiningRoute: RouteDefinition = {
  id: 'hq-dining',
  title: 'HQ → Dining Hall',
  fromNode: 'HQ',
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

export const hqBorneoRoute: RouteDefinition = {
  id: 'hq-borneo',
  title: 'HQ → Borneo Atrium',
  fromNode: 'HQ',
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

export const hqGblockRoute: RouteDefinition = {
  id: 'hq-gblock',
  title: 'HQ → G Block',
  fromNode: 'HQ',
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

export const hqJunctionRoute: RouteDefinition = {
  id: 'hq-junction',
  title: 'HQ → Junction',
  fromNode: 'HQ',
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

export const hqSvRoute: RouteDefinition = {
  id: 'hq-SV',
  title: 'HQ → Student Village',
  fromNode: 'HQ',
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
    'hq-mph': hqMphRoute,
    'hq-library': hqLibraryRoute,
    'hq-shub': hqShubRoute,
    'hq-dining':hqDiningRoute,
    'hq-borneo': hqBorneoRoute,
    'hq-gblock': hqGblockRoute,
    'hq-junction': hqJunctionRoute,
    'hq-SV': hqSvRoute,
};