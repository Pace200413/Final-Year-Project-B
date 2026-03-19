// src/app/exit-navigation/page.tsx
"use client";

import { useMemo, useState, useEffect, useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  FaDoorOpen,
  FaPhoneAlt,
  FaMapPin,
  FaExclamationTriangle,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaTools,
  FaExclamationCircle,
} from "react-icons/fa";
import Link from "next/link";

/* ---------- Types ---------- */
interface PannellumViewer {
  destroy?: () => void;
  resize?: () => void;
}
type PannellumApi = {
  viewer: (el: HTMLElement, opts: Record<string, unknown>) => PannellumViewer;
};
type PannellumWindow = Window & { pannellum?: PannellumApi };

type ExitInfo = {
  key: string;
  location: string;
  name: string;
  distance: string;
  direction: string;
  estimatedTime: string;
  status: "Open" | "Closed" | "Under Maintenance";
};

type YawPitch = { yaw: number; pitch: number };
type RouteScene = {
  id: number;
  image: string;
  label: string;
  initialYaw: number;
  forward?: YawPitch;
  // optional partial-pano hints
  haov?: number;
  vaov?: number;
  vOffset?: number;
};

/* ======================================================
   PAGE
====================================================== */
export default function ExitNavigationPage() {
  /* ------------------- Master Data ------------------- */

  // Exits (local demo data)
  const exits: ExitInfo[] = [
    {
      key: "MAIN_A",
      location: "Block A, Ground Floor",
      name: "Main Entrance — Block A",
      distance: "45m",
      direction: "Head straight, then turn left near the stairwell",
      estimatedTime: "1 minute",
      status: "Open",
    },
    {
      key: "LIB_ATRIUM",
      location: "Library, Level 2",
      name: "Exit Link to Borneo Atrium",
      distance: "25m",
      direction:
        "Walk straight to the corridor, turn left at the corner. Take the stairs down; John's Pie on the right. Continue to main atrium.",
      estimatedTime: "1 minute",
      status: "Open",
    },
    {
      key: "WEST_GROUND",
      location: "Exit outside Student Hub",
      name: "Exit to Spring Mall",
      distance: "30m",
      direction: "Take the stairs down, exit through the red door",
      estimatedTime: "2 minutes",
      status: "Open",
    },
    {
      key: "STUD_EXIT",
      location: "Block E, Level 3",
      name: "Student Village Exit",
      distance: "40m",
      direction: "Follow the hallway past the lab, exit through the steel door",
      estimatedTime: "2 minutes",
      status: "Open",
    },
  ];

  const LOCATION_OPTIONS = [
    "Block A, Ground floor",
    "Library",
    "Block G",
    "Borneo Atrium",
    "Dining Area",
  ] as const;

  // ---------- ROUTE MATRIX (Origin → ExitKey) ----------
  const ROUTE_MATRIX: Record<string, Record<string, RouteScene[]>> = {
    /* Block A, Ground floor */
    "Block A, Ground floor": {
      MAIN_A: [
        {
          id: 1,
          image: "/images360/lobby_c3.jpg",
          label: "You are here • Block A Ground Floor",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 2,
          image: "/images360/lobby_c2.jpg",
          label: "Follow corridor, keep left at stairwell",
          initialYaw: 180,
          forward: { yaw: 195, pitch: 0 },
        },
        {
          id: 3,
          image: "/images360/lobby_c1.jpg",
          label: "Main Entrance — Block A",
          initialYaw: 0,
        },
      ],
      LIB_ATRIUM: [
        {
          id: 1,
          image: "/images360/L-B-1.jpg",
          label: "You are here • Block A Ground Floor",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 2,
          image: "/images360/L-B-2.jpg",
          label: "Follow corridor, keep left at stairwell",
          initialYaw: 15,
          forward: { yaw: 20, pitch: 0 },
        },
        {
          id: 3,
          image: "/images360/L-B-3.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 4,
          image: "/images360/L-B-4.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 5,
          image: "/images360/L-B-5.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 6,
          image: "/images360/L-B-6.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 7,
          image: "/images360/L-B-7.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 8,
          image: "/images360/L-B-8.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 9,
          image: "/images360/L-B-9.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 10,
          image: "/images360/L-B-10.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 11,
          image: "/images360/L-B-11.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id:12,
          image: "/images360/L-B-12.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 13,
          image: "/images360/L-B-13.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 14,
          image: "/images360/L-B-14.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 15,
          image: "/images360/exit_ba.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
      ],
      WEST_GROUND: [
        {
          id: 1,
          image: "/images360/LobbyA_1_Dining.jpg",
          label: "You are here • Block A Ground Floor",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 2,
          image: "/images360/LobbyA_3_Dining.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 3,
          image: "/images360/LobbyA_5_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 4,
          image: "/images360/LobbyA_7_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 220,
          forward: { yaw: 220, pitch: 0 },
        },
        {
          id: 5,
          image: "/images360/LobbyA_9_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 6,
          image: "/images360/LobbyA_11_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 7,
          image: "/images360/LobbyA_13_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 8,
          image: "/images360/LobbyA_17_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 9,
          image: "/images360/LobbyA_15_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 10,
          image: "/images360/shub_exit_1.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 11,
          image: "/images360/shub_exit_2.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 12,
          image: "/images360/shub_exit_3.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 13,
          image: "/images360/shub_exit_4.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
        },

      ],
      STUD_EXIT: [
        {
          id: 1,
          image: "/images360/lobby_c1.jpg",
          label: "You are here • Block A Ground Floor",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 2,
          image: "/images360/lobby2.jpg",
          label: "Go straight along the corridor leading to the MPH.",
          initialYaw: 30,
          forward: { yaw: 50, pitch: 0 },
        },
        {
          id: 3,
          image: "/images360/L-M-7.jpg",
          label: "Towards MPH",
          initialYaw: 280,
          forward: { yaw: 280, pitch: 0 },
        },
        {
          id: 4,
          image: "/images360/mph_exit_4.jpg",
          label: "Go Straight",
          initialYaw: 20,
          forward: { yaw: 20, pitch: 0 },
        },
        {
          id: 5,
          image: "/images360/mph_exit_5.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 6,
          image: "/images360/mph_exit_1.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 15,
          forward: { yaw: 15, pitch: 0 },
        },
        {
          id: 7,
          image: "/images360/mph_exit_2.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 8,
          image: "/images360/mph_exit_3.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 300,
          forward: { yaw: 300, pitch: 0 },
        },
        {
          id: 9,
          image: "/images360/mph_exit_6.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 10,
          image: "/images360/mph_exit_7.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 11,
          image: "/images360/mph_exit_8.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
        },
      ],
    },

    /* Library, Level 1 */
    "Library": {
      MAIN_A: [
        {
          id: 1,
          image: "/images360/exit_library.jpg",
          label: "You are here • Library L1",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 2,
          image: "/images360/exit_library1.jpg",
          label: "Walk along the corridor",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 3,
          image: "/images360/john1.jpg",
          label: "Stairs down near John's Pie",
          initialYaw: -10,
          forward: { yaw: -10, pitch: 0 },
        },
        {
          id: 4,
          image: "/images360/lobby_c1.jpg",
          label: "Main Entrance — Block A",
          initialYaw: 0,
        },
      ],
      LIB_ATRIUM: [
        {
          id: 1,
          image: "/images360/exit_library.jpg",
          label: "You are here • Library L1",
          initialYaw: 0,
          forward: { yaw: 40, pitch: -10 },
        },
        {
          id: 2,
          image: "/images360/litojunc1.jpg",
          label: "Go through that door",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 3,
          image: "/images360/litojunc2.jpg",
          label: "Go to counter there",
          initialYaw: 0,
          forward: { yaw: 340, pitch: 0 },
        },
        {
          id: 4,
          image: "/images360/litojunc3.jpg",
          label: "Use your card to go through the scanner",
          initialYaw: 0,
          forward: { yaw: 350, pitch: 0 },
        },
        {
          id: 5,
          image: "/images360/litojunc4.jpg",
          label: "Use your card to exit junction",
          initialYaw: 0,
          forward: { yaw: 5, pitch: 0 },
        },
        {
          id: 6,
          image: "/images360/escaba.jpg",
          label: "Use the escalator to ground floor (borneo atrium)",
          initialYaw: 180,
          forward: { yaw: 160, pitch: -20 },
        },
        {
          id: 7,
          image: "/images360/escaba1.jpg",
          label: "Use the escalator to ground floor (borneo atrium)",
          initialYaw: 220,
          forward: { yaw: 220, pitch: -20 },
        },
        {
          id: 8,
          image: "/images360/borneo_atrium.jpg",
          label: "Use the escalator to ground floor (borneo atrium)",
          initialYaw: 30,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 9,
          image: "/images360/exit_ba.jpg",
          label: "Borneo Atrium (Library Exit Link)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
      ],
      WEST_GROUND:[
        {
          id: 1,
          image: "/images360/exit_library.jpg",
          label: "You are here • Library L1",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 2,
          image: "/images360/exit_library1.jpg",
          label: "Walk along the corridor",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 3,
          image: "/images360/john1.jpg",
          label: "Stairs down near John's Pie",
          initialYaw: -10,
          forward: { yaw: -10, pitch: 0 },
        },
        {
          id: 4,
          image: "/images360/LobbyA_1_Dining.jpg",
          label: "You are here • Block A Ground Floor",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 5,
          image: "/images360/LobbyA_3_Dining.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 6,
          image: "/images360/LobbyA_5_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 7,
          image: "/images360/LobbyA_7_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 220,
          forward: { yaw: 220, pitch: 0 },
        },
        {
          id: 8,
          image: "/images360/LobbyA_9_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 9,
          image: "/images360/LobbyA_11_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 10,
          image: "/images360/LobbyA_13_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 11,
          image: "/images360/LobbyA_17_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 12,
          image: "/images360/LobbyA_15_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 13,
          image: "/images360/shub_exit_1.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 14,
          image: "/images360/shub_exit_2.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 15,
          image: "/images360/shub_exit_3.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 16,
          image: "/images360/shub_exit_4.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
        },
      ],
      STUD_EXIT: [
        {
          id: 1,
          image: "/images360/exit_library.jpg",
          label: "You are here • Library L1",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 2,
          image: "/images360/exit_library1.jpg",
          label: "Walk along the corridor",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 3,
          image: "/images360/john1.jpg",
          label: "Stairs down near John's Pie",
          initialYaw: -10,
          forward: { yaw: -10, pitch: 0 },
        },
        {
          id: 1,
          image: "/images360/lobby_c1.jpg",
          label: "You are here • Block A Ground Floor",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 2,
          image: "/images360/lobby2.jpg",
          label: "Go straight along the corridor leading to the MPH.",
          initialYaw: 30,
          forward: { yaw: 50, pitch: 0 },
        },
        {
          id: 3,
          image: "/images360/L-M-7.jpg",
          label: "Towards MPH",
          initialYaw: 280,
          forward: { yaw: 280, pitch: 0 },
        },
        {
          id: 4,
          image: "/images360/mph_exit_4.jpg",
          label: "Go Straight",
          initialYaw: 20,
          forward: { yaw: 20, pitch: 0 },
        },
        {
          id: 5,
          image: "/images360/mph_exit_5.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 6,
          image: "/images360/mph_exit_1.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 15,
          forward: { yaw: 15, pitch: 0 },
        },
        {
          id: 7,
          image: "/images360/mph_exit_2.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 8,
          image: "/images360/mph_exit_3.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 300,
          forward: { yaw: 300, pitch: 0 },
        },
        {
          id: 9,
          image: "/images360/mph_exit_6.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 10,
          image: "/images360/mph_exit_7.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 11,
          image: "/images360/mph_exit_8.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
        },
      ],
    },

    "Block G": {
      MAIN_A: [
        {
          id: 1,
          image: '/images360/LobbyA_11_Dining.jpg',
          label: "Atrium Link from Library",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 2,
          image: '/images360/LobbyA_9_Dining.jpg',
          label: 'Corridor Midpoint',
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 3,
          image: '/images360/LobbyA_8_Dining.jpg',
          label: 'Connecting Corridor',
          initialYaw: 180,
          forward: { yaw: 190, pitch: 0 },
        },
        {
          id: 5,
          image: '/images360/LobbyA_7_Dining.jpg',
          label: 'Lobby A → G Block Corridor Entrance',
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 5,
          image: '/images360/LobbyA_6_Dining.jpg',
          label: 'Lobby A → G Block Corridor Entrance',
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 5,
          image: '/images360/LobbyA_4_Dining.jpg',
          label: 'Lobby A → G Block Corridor Entrance',
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 5,
          image: '/images360/LobbyA_2_Dining.jpg',
          label: 'Lobby A → G Block Corridor Entrance',
          initialYaw: 200,
          forward: { yaw: 200, pitch: 0 },
        },
        {
          id: 6,
          image: "/images360/lobby_c1.jpg",
          label: "Main Entrance — Block A",
          initialYaw: 0,
        },

      ],
      LIB_ATRIUM: [
        {
          id: 1,
          image: '/images360/LobbyA_11_Dining.jpg',
          label: "Atrium Link from Library",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 2,
          image: '/images360/LobbyA_9_Dining.jpg',
          label: 'Corridor Midpoint',
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 3,
          image: '/images360/LobbyA_8_Dining.jpg',
          label: 'Connecting Corridor',
          initialYaw: 180,
          forward: { yaw: 190, pitch: 0 },
        },
        {
          id: 4,
          image: '/images360/LobbyA_7_Dining.jpg',
          label: 'Lobby A → G Block Corridor Entrance',
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 5,
          image: '/images360/LobbyA_6_Dining.jpg',
          label: 'Lobby A → G Block Corridor Entrance',
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 6,
          image: '/images360/LobbyA_4_Dining.jpg',
          label: 'Lobby A → G Block Corridor Entrance',
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 1,
          image: "/images360/L-B-1.jpg",
          label: "You are here • Block A Ground Floor",
          initialYaw: 30,
          forward: { yaw: 30, pitch: 0 },
        },
        {
          id: 3,
          image: "/images360/L-B-3.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 7,
          image: "/images360/L-B-7.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 10,
          image: "/images360/L-B-10.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 11,
          image: "/images360/L-B-11.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id:12,
          image: "/images360/L-B-12.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 13,
          image: "/images360/L-B-13.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 14,
          image: "/images360/L-B-14.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 15,
          image: "/images360/exit_ba.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
      ],
      WEST_GROUND: [
        {
          id: 1,
          image: "/images360/LobbyA_9_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 2,
          image: "/images360/LobbyA_11_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 3,
          image: "/images360/LobbyA_13_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 4,
          image: "/images360/LobbyA_17_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 5,
          image: "/images360/LobbyA_15_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 6,
          image: "/images360/shub_exit_1.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 7,
          image: "/images360/shub_exit_2.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 8,
          image: "/images360/shub_exit_3.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 9,
          image: "/images360/shub_exit_4.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
        },
      ],
      STUD_EXIT: [
        {
          id: 1,
          image: "/images360/LobbyA_9_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 2,
          image: "/images360/LobbyA_11_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 3,
          image: "/images360/LobbyA_13_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 4,
          image: "/images360/LobbyA_17_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 5,
          image: "/images360/LobbyA_14_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 345,
          forward: { yaw: 300, pitch: 0 },
        },
        {
          id: 6,
          image: "/images360/mph_exit_9.jpg",
          label: "Towards MPH",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 7,
          image: "/images360/mph_exit_3.jpg",
          label: "Go Straight",
          initialYaw: 300,
          forward: { yaw: 300, pitch: 0 },
        },
        {
          id: 8,
          image: "/images360/mph_exit_6.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 9,
          image: "/images360/mph_exit_7.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 10,
          image: "/images360/mph_exit_8.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
        },
      ],
    },

    "Borneo Atrium": {
      STUD_EXIT: [
        {
          id: 1,
          image: "/images360/L-B-18.jpg",
          label: "You are here • Block E L3",
          initialYaw: 180,
          forward: { yaw: 190, pitch: 0 },
        },
        {
          id: 2,
          image: "/images360/L-B-11.jpg",
          label: "Follow the hallway past the labs",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 3,
          image: "/images360/L-B-10.jpg",
          label: "Use the emergency stair",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 4,
          image: "/images360/L-B-6.jpg",
          label: "Use the emergency stair",
          initialYaw: 90,
          forward: { yaw: 90, pitch: 0 },
        },{
          id: 5,
          image: "/images360/L-B-3.jpg",
          label: "Use the emergency stair",
          initialYaw: 50,
          forward: { yaw: 50, pitch: 0 },
        },{
          id: 6,
          image: "/images360/lobby_c1.jpg",
          label: "You are here • Block A Ground Floor",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 7,
          image: "/images360/lobby2.jpg",
          label: "Go straight along the corridor leading to the MPH.",
          initialYaw: 30,
          forward: { yaw: 50, pitch: 0 },
        },
        {
          id: 8,
          image: "/images360/L-M-7.jpg",
          label: "Towards MPH",
          initialYaw: 280,
          forward: { yaw: 280, pitch: 0 },
        },
        {
          id: 9,
          image: "/images360/mph_exit_4.jpg",
          label: "Go Straight",
          initialYaw: 20,
          forward: { yaw: 20, pitch: 0 },
        },
        {
          id: 10,
          image: "/images360/mph_exit_5.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 11,
          image: "/images360/mph_exit_1.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 15,
          forward: { yaw: 15, pitch: 0 },
        },
        {
          id: 12,
          image: "/images360/mph_exit_2.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 13,
          image: "/images360/mph_exit_3.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 300,
          forward: { yaw: 300, pitch: 0 },
        },
        {
          id: 14,
          image: "/images360/mph_exit_6.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 15,
          image: "/images360/mph_exit_7.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 16,
          image: "/images360/mph_exit_8.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
        },
      ],
      MAIN_A: [
        {
          id: 1,
          image: "/images360/L-B-18.jpg",
          label: "You are here • Block E L3",
          initialYaw: 180,
          forward: { yaw: 190, pitch: 0 },
        },
        {
          id: 2,
          image: "/images360/L-B-11.jpg",
          label: "Follow the hallway past the labs",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 3,
          image: "/images360/L-B-10.jpg",
          label: "Use the emergency stair",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 4,
          image: "/images360/L-B-6.jpg",
          label: "Use the emergency stair",
          initialYaw: 90,
          forward: { yaw: 90, pitch: 0 },
        },{
          id: 5,
          image: "/images360/L-B-3.jpg",
          label: "Use the emergency stair",
          initialYaw: 50,
          forward: { yaw: 50, pitch: 0 },
        },
        {
          id: 6,
          image: "/images360/lobby_c1.jpg",
          label: "Main Entrance — Block A",
          initialYaw: 0,
        },
      ],
      LIB_ATRIUM: [
        {
          id: 1,
          image: "/images360/L-B-18.jpg",
          label: "You are here • Block E L3",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 2,
          image: "/images360/exit_ba.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
      ],
      WEST_GROUND: [
        {
          id: 1,
          image: "/images360/L-B-18.jpg",
          label: "You are here • Block E L3",
          initialYaw: 180,
          forward: { yaw: 190, pitch: 0 },
        },
        {
          id: 2,
          image: "/images360/L-B-11.jpg",
          label: "Follow the hallway past the labs",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 3,
          image: "/images360/L-B-10.jpg",
          label: "Use the emergency stair",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 4,
          image: "/images360/L-B-6.jpg",
          label: "Use the emergency stair",
          initialYaw: 90,
          forward: { yaw: 90, pitch: 0 },
        },{
          id: 5,
          image: "/images360/L-B-3.jpg",
          label: "Use the emergency stair",
          initialYaw: 50,
          forward: { yaw: 50, pitch: 0 },
        },
        {
          id: 6,
          image: "/images360/LobbyA_1_Dining.jpg",
          label: "You are here • Block A Ground Floor",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 7,
          image: "/images360/LobbyA_3_Dining.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 8,
          image: "/images360/LobbyA_5_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 9,
          image: "/images360/LobbyA_7_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 220,
          forward: { yaw: 220, pitch: 0 },
        },
        {
          id: 10,
          image: "/images360/LobbyA_9_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 11,
          image: "/images360/LobbyA_11_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 12,
          image: "/images360/LobbyA_13_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 13,
          image: "/images360/LobbyA_17_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 14,
          image: "/images360/LobbyA_15_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 15,
          image: "/images360/shub_exit_1.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 16,
          image: "/images360/shub_exit_2.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 17,
          image: "/images360/shub_exit_3.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 18,
          image: "/images360/shub_exit_4.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
        },
      ],
    },

    /* Leisure Area, GF */
    "Dining Area": {
      WEST_GROUND: [
        {
          id: 1,
          image: "/images360/LobbyA_13_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 2,
          image: "/images360/LobbyA_17_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 3,
          image: "/images360/LobbyA_15_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 4,
          image: "/images360/shub_exit_1.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 5,
          image: "/images360/shub_exit_2.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 6,
          image: "/images360/shub_exit_3.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 7,
          image: "/images360/shub_exit_4.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
        },
      ],
      MAIN_A: [
        {
          id: 1,
          image: "/images360/LobbyA_13_Dining.jpg",
          label: "You are here • Library L1",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 2,
          image: "/images360/LobbyA_12_Dining.jpg",
          label: "Walk along the corridor",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 3,
          image: "/images360/LobbyA_11_Dining.jpg",
          label: "Stairs down near John's Pie",
          initialYaw: 180,
          forward: { yaw: 200, pitch: 0 },
        },
        {
          id: 4,
          image: "/images360/LobbyA_10_Dining.jpg",
          label: "Main Entrance — Block A",
          initialYaw: 220,
          forward: { yaw: 220, pitch: 0 },
        },
        {
          id: 5,
          image: "/images360/LobbyA_9_Dining.jpg",
          label: "Stairs down near John's Pie",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 6,
          image: "/images360/LobbyA_8_Dining.jpg",
          label: "Stairs down near John's Pie",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 7,
          image: "/images360/LobbyA_7_Dining.jpg",
          label: "Stairs down near John's Pie",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 8,
          image: "/images360/LobbyA_5_Dining.jpg",
          label: "Stairs down near John's Pie",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 9,
          image: "/images360/LobbyA_2_Dining.jpg",
          label: "Stairs down near John's Pie",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 10,
          image: "/images360/lobby_c1.jpg",
          label: "Stairs down near John's Pie",
          initialYaw: 0,
        },
      ],
      LIB_ATRIUM: [
        {
          id: 1,
          image: "/images360/LobbyA_13_Dining.jpg",
          label: "You are here • Library L1",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 2,
          image: "/images360/LobbyA_12_Dining.jpg",
          label: "Walk along the corridor",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 3,
          image: "/images360/LobbyA_11_Dining.jpg",
          label: "Stairs down near John's Pie",
          initialYaw: 180,
          forward: { yaw: 200, pitch: 0 },
        },
        {
          id: 4,
          image: "/images360/LobbyA_10_Dining.jpg",
          label: "Main Entrance — Block A",
          initialYaw: 220,
          forward: { yaw: 220, pitch: 0 },
        },
        {
          id: 5,
          image: "/images360/LobbyA_9_Dining.jpg",
          label: "Stairs down near John's Pie",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 6,
          image: "/images360/LobbyA_8_Dining.jpg",
          label: "Stairs down near John's Pie",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 7,
          image: "/images360/LobbyA_7_Dining.jpg",
          label: "Stairs down near John's Pie",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 8,
          image: "/images360/LobbyA_5_Dining.jpg",
          label: "Stairs down near John's Pie",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 9,
          image: "/images360/LobbyA_2_Dining.jpg",
          label: "Stairs down near John's Pie",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 10,
          image: "/images360/L-B-1.jpg",
          label: "You are here • Block A Ground Floor",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 11,
          image: "/images360/L-B-2.jpg",
          label: "Follow corridor, keep left at stairwell",
          initialYaw: 15,
          forward: { yaw: 20, pitch: 0 },
        },
        {
          id: 12,
          image: "/images360/L-B-3.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 13,
          image: "/images360/L-B-4.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 14,
          image: "/images360/L-B-5.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 15,
          image: "/images360/L-B-6.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 16,
          image: "/images360/L-B-7.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 17,
          image: "/images360/L-B-8.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 18,
          image: "/images360/L-B-9.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 19,
          image: "/images360/L-B-10.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 20,
          image: "/images360/L-B-11.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 21,
          image: "/images360/L-B-12.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 22,
          image: "/images360/L-B-13.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 23,
          image: "/images360/L-B-14.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 24,
          image: "/images360/exit_ba.jpg",
          label: "Borneo Atrium — Library Link",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
      ],
      STUD_EXIT: [
        {
          id: 1,
          image: "/images360/LobbyA_13_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 2,
          image: "/images360/LobbyA_17_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 3,
          image: "/images360/LobbyA_14_Dining.jpg",
          label: "West Exit — Emergency Door (GF)",
          initialYaw: 345,
          forward: { yaw: 300, pitch: 0 },
        },
        {
          id: 4,
          image: "/images360/mph_exit_9.jpg",
          label: "Towards MPH",
          initialYaw: 180,
          forward: { yaw: 180, pitch: 0 },
        },
        {
          id: 5,
          image: "/images360/mph_exit_3.jpg",
          label: "Go Straight",
          initialYaw: 300,
          forward: { yaw: 300, pitch: 0 },
        },
        {
          id: 6,
          image: "/images360/mph_exit_6.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 7,
          image: "/images360/mph_exit_7.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
          forward: { yaw: 0, pitch: 0 },
        },
        {
          id: 8,
          image: "/images360/mph_exit_8.jpg",
          label: "Head towards Leisure Area",
          initialYaw: 0,
        },
      ],
    },
  };

  // ---------- Nearest Exit per location ----------
  const NEAREST_BY_LOCATION: Record<string, ExitInfo["key"]> = {
    "Block A, Ground floor": "MAIN_A",
    "Library, Level 1": "MAIN_A",
    "Library, Level 2": "LIB_ATRIUM",
    "Borneo Atrium, Level 3": "STUD_EXIT",
    "Dining Area": "WEST_GROUND",
  };

  /* ------------------- State ------------------- */
  const [activeLocation, setActiveLocation] = useState<string>("Block A, Ground floor");
  const [search, setSearch] = useState("");
  const [routeMode, setRouteMode] = useState(false);
  const [panoReady, setPanoReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Pannellum lib status
  const [libReady, setLibReady] = useState(false);

  const nearestExitKey = NEAREST_BY_LOCATION[activeLocation] ?? "MAIN_A";
  const nearestExit = exits.find((e) => e.key === nearestExitKey) ?? exits[0];
  const [selectedExit, setSelectedExit] = useState<ExitInfo | null>(nearestExit);
  const selectedExitKey = selectedExit?.key ?? nearestExitKey;

  const activeRoute: RouteScene[] = useMemo(() => {
    const originMap = ROUTE_MATRIX[activeLocation] ?? {};
    return originMap[selectedExitKey] ?? [];
  }, [activeLocation, selectedExitKey]);

  const defaultPanorama = useMemo(() => {
    return activeRoute[0]?.image ?? "/images360/lobby_c1.jpg";
  }, [activeRoute]);

  /* ------------------- Helpers ------------------- */
  const paneRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PannellumViewer | null>(null);

  const preload = (src: string) =>
    new Promise<boolean>((resolve) => {
      const i = new Image();
      i.onload = () => resolve(true);
      i.onerror = () => resolve(false);
      i.src = src;
    });

  useEffect(() => {
    console.log("[route effect] routeMode:", routeMode, "idx:", currentIdx);
    console.log("[route effect] activeRoute ref changed. len:", activeRoute.length);

    if (routeMode && libReady) {
      void initViewerForIndex(activeRoute, currentIdx);
    }
  }, [routeMode, currentIdx, activeRoute, libReady]);

  /* ------------------- Load Pannellum once ------------------- */
  useEffect(() => {
    const w = window as PannellumWindow;
    if (w.pannellum) {
      setLibReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js";
    script.async = true;
    script.onload = () => setLibReady(true);
    script.onerror = () => setErrorMsg("⚠️ Failed to load Pannellum from CDN.");
    document.body.appendChild(script);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css";
    document.head.appendChild(link);

    return () => {
      try { viewerRef.current?.destroy?.(); } catch {}
    };
  }, []);

  
  /* ------------------- Preload + show default ------------------- */
  useEffect(() => {
    let cancelled = false;
    setPanoReady(false);
    setErrorMsg(null);

    (async () => {
      if (!libReady) return; // wait for pannellum
      const ok = await preload(defaultPanorama);
      if (cancelled) return;
      if (!ok) {
        setErrorMsg(`❌ Could not load 360 image: ${defaultPanorama}`);
        return;
      }
      setPanoReady(true);
      initViewerDefault(defaultPanorama);
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultPanorama, libReady]);

  /* ------------------- Reset on location/exit change ------------------- */
  useEffect(() => {
    setRouteMode(false);
    setCurrentIdx(0);
    const suggested = exits.find((e) => e.key === nearestExitKey) ?? exits[0];
    setSelectedExit(suggested);
    // default viewer will be re-inited by the preload effect above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLocation]);

  useEffect(() => {
    setRouteMode(false);
    setCurrentIdx(0);
    // default viewer will be re-inited by the preload effect above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExit]);

  /* ------------------- Viewer initializers ------------------- */
  const initViewerDefault = (panorama: string) => {
    const w = window as PannellumWindow;
    if (!paneRef.current || !w.pannellum) return;

    const s = activeRoute[0]; // use first scene hints if available

    try { viewerRef.current?.destroy?.(); } catch {}

    viewerRef.current = w.pannellum.viewer(paneRef.current, {
      type: "equirectangular",
      panorama,                         // use function param
      autoLoad: true,
      yaw: s?.initialYaw ?? 0,
      showZoomCtrl: true,
      showFullscreenCtrl: true,
      compass: false,
      autoRotate: 0,
      hfov: 100,
      minHfov: 60,
      maxHfov: 120,
      backgroundColor: [11, 16, 32],
      ...(s?.haov ? { haov: s.haov } : {}),
      ...(s?.vaov ? { vaov: s.vaov } : {}),
      ...(s?.vOffset != null ? { vOffset: s.vOffset } : {}),
      hotSpots: [], // no hotspots in preview
    });
  };

  const initViewerForIndex = async (route: RouteScene[], idx: number) => {
    const w = window as PannellumWindow;
    if (!paneRef.current || !w.pannellum) return;
    const s = route[idx];
    if (!s) return;

    setErrorMsg(null);
    setPanoReady(false);

    const ok = await preload(s.image);
    if (!ok) { setErrorMsg(`❌ Could not load 360 image: ${s.image}`); return; }
    setPanoReady(true);

    try { viewerRef.current?.destroy?.(); } catch {}

    const hotSpots: Array<{
      pitch: number;
      yaw: number;
      type: "info";
      createTooltipFunc: (div: HTMLElement) => void;
      clickHandlerFunc?: () => void;
    }> = [];

    if (s.forward && idx < route.length - 1) {
      hotSpots.push({
        pitch: s.forward.pitch,
        yaw: s.forward.yaw,
        type: "info",
        createTooltipFunc: (hs: HTMLElement) => {
          hs.innerHTML = `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <div style="position:absolute;width:64px;height:64px;border:3px solid rgba(239,68,68,.35);border-radius:9999px;animation:emergency-pulse 1.4s ease-out infinite;"></div>
              <div style="width:50px;height:50px;border-radius:9999px;background:radial-gradient(circle,#ef4444 0%,#b91c1c 90%);border:2px solid rgba(255,255,255,.8);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(239,68,68,.55);cursor:pointer;">
                <span style="color:#fff;font-weight:700;font-size:11px;line-height:1;text-align:center;">GO<br/>HERE</span>
              </div>
              <div class="exit-label" style="padding:5px 12px;background:linear-gradient(90deg,rgba(239,68,68,.95),rgba(220,38,38,.9));border-radius:12px;color:#fff;font-size:10px;font-weight:700;letter-spacing:.06em;border:1px solid rgba(255,255,255,.2);box-shadow:0 0 10px rgba(239,68,68,.4);text-transform:uppercase;backdrop-filter:blur(6px);margin-top:4px;">
                ⚠️ FOLLOW RED MARKERS TO EXIT
              </div>
            </div>
            <style>
              @keyframes emergency-pulse {
                0% { transform: scale(.4); opacity: 1; }
                100% { transform: scale(1); opacity: 0; }
              }
              @media (max-width: 768px) { .exit-label { display: none !important; } }
            </style>
          `;
          hs.style.cursor = "pointer";
        },
        clickHandlerFunc: () =>
          setCurrentIdx((cur) => Math.min(cur + 1, route.length - 1)),
      });
    }

    viewerRef.current = w.pannellum.viewer(paneRef.current, {
      type: "equirectangular",
      panorama: s.image,
      autoLoad: true,
      yaw: s.initialYaw,
      showZoomCtrl: true,
      showFullscreenCtrl: true,
      compass: false,
      autoRotate: 0,
      hfov: 100,
      minHfov: 60,
      maxHfov: 120,
      backgroundColor: [11, 16, 32],
      ...(s.haov ? { haov: s.haov } : {}),
      ...(s.vaov ? { vaov: s.vaov } : {}),
      ...(s.vOffset != null ? { vOffset: s.vOffset } : {}),
      hotSpots,
    });
  };

  // When in route mode, (re)render the current step
  useEffect(() => {
    if (routeMode && libReady) {
      void initViewerForIndex(activeRoute, currentIdx);
    }
  }, [routeMode, currentIdx, activeRoute, libReady]);

  /* ------------------- Actions ------------------- */
  const handleLocateMe = () => {
    toast.loading("Detecting your location…");
    setTimeout(() => {
      toast.dismiss();
      setActiveLocation("Library, Level 1");
      toast.success("Location set to Library, Level 1");
    }, 800);
  };

  const startExitRoute = () => {
    if (!selectedExit) return toast.error("Please choose an exit first.");
    if (selectedExit.status !== "Open")
      return toast.error("Selected exit is not open. Choose another.");
    if (!activeRoute.length) return toast.error("No route steps available.");
    setRouteMode(true);
    setCurrentIdx(0);
  };

  const stopExitRoute = () => {
    setRouteMode(false);
    // default viewer will re-init via preload effect
  };

  const filteredExits = useMemo(
    () =>
      exits.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.location.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const isSuggestedSelected = selectedExit?.key === nearestExit.key;

  /* ------------------- UI ------------------- */
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 16px) + 80px)" }}
    >
      <Toaster position="top-center" />

      {/* Sticky top bar */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2.5 flex items-center gap-2">
          <a
            href="tel:999"
            className="flex-1 inline-flex items-center justify-center rounded-lg px-3 py-2 bg-[#EF4444] text-white text-sm font-semibold shadow-sm active:scale-[.98]"
          >
            <FaPhoneAlt className="mr-2" /> Emergency 999
          </a>
          <Link
            href="/exit-navigation"
            className="hidden sm:inline-flex rounded-lg px-3 py-2 bg-gray-900 text-white text-sm font-semibold shadow-sm"
          >
            Exit Navigation Home
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="mx-auto max-w-6xl px-4 sm:px-6 pt-4 pb-2">
        <motion.h1 initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-xl sm:text-2xl font-bold text-gray-900">
          Exit Navigation
        </motion.h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Choose your current location and an exit. We’ll load a 360° route tailored to that pair.
        </p>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 space-y-5 pb-12">
        {/* Alert */}
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 sm:p-5 flex items-start gap-3">
          <FaExclamationTriangle className="text-red-600 mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-semibold text-red-700 text-sm">Evacuation Instructions</p>
            <ul className="text-[13px] sm:text-sm list-disc pl-4 space-y-0.5 mt-1">
              <li>Stay calm and move quickly — do not run.</li>
              <li>Select <strong>current location</strong>, then <strong>choose exit</strong>.</li>
              <li>Press <strong>Start 360 Route</strong> when ready.</li>
              <li>If a path is blocked, stop and choose another exit.</li>
            </ul>
          </div>
        </div>

        {/* Location Selector */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="font-semibold text-gray-900 text-base sm:text-lg flex items-center">
                <FaMapPin className="text-gray-500 mr-2" /> Your Current Location
              </h2>
              <p className="text-gray-700 text-sm sm:text-base">{activeLocation}</p>
            </div>
            <button onClick={handleLocateMe} className="text-xs sm:text-sm bg-[#EF4444] text-white px-3 py-2 rounded-lg hover:bg-red-600 transition">
              Auto detect
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {LOCATION_OPTIONS.map((loc) => (
              <button
                key={loc}
                onClick={() => setActiveLocation(loc)}
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border transition ${
                  activeLocation === loc
                    ? "bg-red-100 border-red-300 text-red-700 font-semibold"
                    : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Choose Exit */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <FaDoorOpen className="text-[#EF4444]" />
            <h2 className="font-semibold text-gray-900 text-base sm:text-lg">CHOOSE ROUTE TO EXIT</h2>
          </div>

          {/* Suggested Nearest */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-red-700 uppercase tracking-wide">
                  Suggested (Nearest from {activeLocation})
                </p>
                <p className="text-gray-900 font-semibold text-sm sm:text-base truncate">{nearestExit.name}</p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  {nearestExit.location} • {nearestExit.distance} • {nearestExit.estimatedTime}
                </p>
                <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">Direction: {nearestExit.direction}</p>
                <div className="mt-2">
                  <StatusBadge status={nearestExit.status} />
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedExit(nearestExit);
                  toast.success("Nearest exit selected");
                }}
                className={`shrink-0 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  isSuggestedSelected ? "bg-green-600 text-white" : "bg-white border border-gray-300 text-gray-900 hover:bg-gray-100"
                }`}
              >
                {isSuggestedSelected ? "Selected" : "Use"}
              </button>
            </div>
          </div>

          {/* Other exits */}
          <div className="space-y-2.5">
            <p className="text-sm text-gray-700 font-medium">Or pick another exit:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {exits.map((e) => (
                <div key={e.key} className="border rounded-xl p-4 flex items-start justify-between gap-3 hover:bg-gray-50 transition">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{e.name}</p>
                    <p className="text-gray-500 text-xs sm:text-sm truncate">{e.location} • {e.distance}</p>
                    <div className="mt-1">
                      <StatusBadge status={e.status} />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedExit(e);
                      toast.success("Exit selected");
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                      selectedExit?.key === e.key ? "bg-green-600 text-white" : "bg-white border border-gray-300 text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {selectedExit?.key === e.key ? "Selected" : "Choose"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 360° Viewer Section */}
          <section className="relative border border-slate-200 rounded-2xl bg-slate-950 shadow-inner overflow-hidden">
            {/* Viewer area */}

            {/* Here got error and problem */}
            <div className="relative w-full aspect-[9/14] sm:aspect-[4/3] md:aspect-[16/9] bg-black">
              <div
                ref={paneRef}
                className={`absolute inset-0 z-0 transition-opacity duration-500 ${panoReady ? "opacity-100" : "opacity-0"}`}
              />
              {!panoReady && !errorMsg && (
                <div className="absolute inset-0 grid place-items-center text-slate-300 font-semibold z-10">
                  Loading 360° viewer…
                </div>
              )}
              {errorMsg && (
                <div className="absolute inset-0 grid place-items-center text-red-200 font-semibold z-10">
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Info bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 text-slate-300 text-xs border-t border-white/10 z-10">
              <span className="truncate">
                {routeMode
                  ? activeRoute[currentIdx]?.label ?? "Evacuation step"
                  : `${(selectedExit ?? nearestExit).name} • 360° preview (from ${activeLocation})`}
              </span>
              {routeMode && (
                <div className="flex items-center gap-1">
                  <div className="w-20 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-1.5 bg-red-600 transition-all duration-300"
                      style={{ width: `${((currentIdx + 1) / activeRoute.length) * 100}%` }}
                    />
                  </div>
                  <span>{currentIdx + 1}/{activeRoute.length}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            {!routeMode ? (
              <div className="px-3 pb-3 pt-2">
                <button
                  onClick={startExitRoute}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md hover:shadow-lg active:scale-95 transition"
                  aria-label="Start Route"
                >
                  Start Route
                </button>
              </div>
            ) : (
              <div className="px-3 pb-3 pt-2 flex gap-3">
                <button
                  onClick={() => setCurrentIdx((i) => Math.min(i + 1, activeRoute.length - 1))}
                  disabled={currentIdx >= activeRoute.length - 1}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {currentIdx < activeRoute.length - 1 ? "Next Point" : "Reached"}
                </button>
                <button
                  onClick={stopExitRoute}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-red-600 shadow-sm hover:shadow transition"
                >
                  End Route
                </button>
              </div>
            )}
          </section>

          {/* Tiny helper */}
          <p className="text-[11px] sm:text-xs text-gray-400">
            📌 Drag to look around • Tap the red pulsing button to move to the next safe point • Pair-specific routes (origin → exit).
          </p>
        </motion.div>

        {/* All Exits (search) */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-gray-900 text-base sm:text-lg flex items-center">
              <FaDoorOpen className="text-[#EF4444] mr-2" /> All Campus Exits
            </h2>
            <label className="flex items-center border border-gray-300 rounded-lg px-3 py-2 shadow-sm bg-gray-50">
              <FaSearch className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search exits…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm focus:outline-none bg-transparent w-28 sm:w-40"
                aria-label="Search exits"
              />
            </label>
          </div>

          <div className="space-y-2.5">
            {filteredExits.map((e) => (
              <div key={e.key} className="flex justify-between items-center border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{e.name}</p>
                  <p className="text-gray-500 text-xs sm:text-sm truncate">{e.location} • {e.distance}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={e.status} />
                  <button
                    onClick={() => {
                      setSelectedExit(e);
                      toast.success("Exit selected");
                    }}
                    className={`ml-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                      selectedExit?.key === e.key ? "bg-green-600 text-white" : "bg-white border border-gray-300 text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {selectedExit?.key === e.key ? "Selected" : "Choose"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Mobile nudges */}
      <style jsx global>{`
        @media (max-width: 767px) {
          .pnlm-compass { right: 8px !important; bottom: 8px !important; }
          .pnlm-control.pnlm-zoom-controls { left: 8px !important; top: 8px !important; }
        }
      `}</style>
    </div>
  );
}

/* ---------- Small Components ---------- */
function StatusBadge({ status }: { status: ExitInfo["status"] }) {
  let styles =
    "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border";
  let icon: ReactNode = <FaExclamationCircle className="mr-1" />;

  if (status === "Open") {
    styles += " bg-green-50 text-green-700 border-green-200";
    icon = <FaCheckCircle className="mr-1" />;
  } else if (status === "Closed") {
    styles += " bg-red-50 text-[#EF4444] border-red-200";
    icon = <FaTimesCircle className="mr-1" />;
  } else {
    styles += " bg-yellow-50 text-yellow-700 border-yellow-200";
    icon = <FaTools className="mr-1" />;
  }

  return (
    <span className={styles} aria-live="polite">
      {icon}
      {status}
    </span>
  );
}

