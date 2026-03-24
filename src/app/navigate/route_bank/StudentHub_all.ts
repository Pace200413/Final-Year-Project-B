import type { RouteDefinition } from './types';

export const shubMphRoute: RouteDefinition = {
  id: 'shub-mph',
  title: 'Student Hub → MPH',
  fromNode: 'Student Hub',
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

export const shubLibraryRoute: RouteDefinition = {
  id: 'shub-library',
  title: 'Student Hub → Library',
  fromNode: 'Student Hub',
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

export const shubHQRoute: RouteDefinition = {
  id: 'shub-hq',
  title: 'Student Hub → HQ',
  fromNode: 'Student Hub',
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
                back : { yaw: 10, pitch: 0 },
                forward : { yaw: 180, pitch: -5 },
            },
  ],
};

export const shubDiningRoute: RouteDefinition = {
  id: 'shub-dining',
  title: 'Student Hub → Dining Hall',
  fromNode: 'Student Hub',
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

export const shubBorneoRoute: RouteDefinition = {
  id: 'shub-borneo',
  title: 'Student Hub → Borneo Atrium',
  fromNode: 'Student Hub',
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

export const shubGblockRoute: RouteDefinition = {
  id: 'shub-gblock',
  title: 'Student Hub → G Block',
  fromNode: 'Student Hub',
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

export const shubJunctionRoute: RouteDefinition = {
  id: 'shub-junction',
  title: 'Student Hub → Junction',
  fromNode: 'Student Hub',
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

export const shubSvRoute: RouteDefinition = {
  id: 'shub-SV',
  title: 'Student Hub → Student Village',
  fromNode: 'Student Hub',
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
    'shub-mph': shubMphRoute,
    'shub-library': shubLibraryRoute,
    'shub-hq': shubHQRoute,
    'shub-dining':shubDiningRoute,
    'shub-borneo': shubBorneoRoute,
    'shub-gblock': shubGblockRoute,
    'shub-junction': shubJunctionRoute,
    'shub-SV': shubSvRoute,
};