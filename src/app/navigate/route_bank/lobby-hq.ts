import type { RouteDefinition } from './types';

export const lobbyHqRoute: RouteDefinition = {
  id: 'lobby-hq',
  title: 'Lobby → HQ',
  fromNode: 'Block A Lobby',
  toNode: 'HQ',
  scenes: [
    {
      id: 1,
      image: '/images360/lobby_c1.jpg',
      label: 'Block A Lobby',
      initialYaw: 230,
      forward: { yaw: 243, pitch: 0 },
      instruction: 'You are at Block A Lobby. Follow the arrow to enter Student HQ.',
    },
    {
      id: 2,
      image: '/images360/L-H-2.jpg',
      label: 'Student HQ Entrance',
      initialYaw: 0,
      forward: { yaw: 350, pitch: 0 },
      back: { yaw: 140, pitch: 0 },
      instruction: 'You are at the entrance. Move forward to approach the counter area.',
    },
    {
      id: 3,
      image: '/images360/L-H-3.jpg',
      label: 'Financial Desk Services Area',
      initialYaw: 18,
      forward: { yaw: 55, pitch: 0 },
      back: { yaw: 160, pitch: 0 },
      instruction: 'Left side is the Financial Desk. Continue walking forward to the lobby.',
    },
    {
      id: 4,
      image: '/images360/L-H-4.jpg',
      label: 'Student HQ Lobby',
      initialYaw: 340,
      back: { yaw: 250, pitch: 0 },
      instruction: 'You’ve arrived at Student HQ Lobby. End of route.',
    },
  ],
  nextRouteIds: ['borneo-mph', 'mph-borneo'],
};