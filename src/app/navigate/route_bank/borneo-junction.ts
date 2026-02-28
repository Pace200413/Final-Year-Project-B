import type { RouteDefinition } from './types';

export const borneoJunctionRoute: RouteDefinition = {
  id: 'borneo-junction',
  title: 'Borneo Atrium → Junction',
  fromNode: 'Borneo Atrium',
  toNode: 'Junction',
  scenes: [
            {
                id: 1,
                image: '/images360/L-B-18.jpg',
                label: 'You arrive the Borneo Atrium! Welcome!',
                initialYaw: 180,
                forward: { yaw: 190, pitch: -7 },
                instruction: 'You have arrived at Borneo Atrium.',
            },
            {
                id: 2,
                image: '/images360/L-J-18.jpg',
                label: 'Go up escalator',
                initialYaw: 360,
                forward: { yaw: 360, pitch: 20 },
                back: { yaw: 290, pitch: -12 },
                instruction: 'Head up the escalator to reach Junction Level 1. Follow the arrow upward to continue.',
            },
            {
                id: 3,
                image: '/images360/L-J-19.jpg',
                label: 'Junction Balcony',
                initialYaw: 360,
                forward: { yaw: 10, pitch: -12 },
                back: { yaw: 175, pitch: -18 },
                instruction: 'Continue walking forward along the balcony area. Follow the arrow to approach the main walkway.',
            },
            {
                id: 4,
                image: '/images360/L-J-20.jpg',
                label: 'You arrive Junction Level 1',
                initialYaw: 270,
                back: { yaw: 180, pitch: -4 },
                instruction: 'You’ve reached Junction Level 1. You may continue exploring or select the next route.',
            },
  ],
};
