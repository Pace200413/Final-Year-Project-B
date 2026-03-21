'use client';

import Link from 'next/link';
import React from 'react';
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html, Edges, Line } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";

const BUILDING_INFO: Record<
  string,
  {
    label: string;
    description: string;
    category: string;
    has360View: boolean;
    keywords?: string[];
    imageUrl?: string;
    address?: string;
    hours?: string;
    website?: string;
    phone?: string;
  }
> = {
  TPX_Buildings_0: {
    label: "Student Hub 1st Floor",
    description:
      "Student activity and collaboration area on the first floor of the Student Hub.",
    category: "student_facility",
    has360View: true,
    keywords: ["student hub", "Volleyball Court", "activity", "S Hub Sport Hall"],
    imageUrl: "/images/shub1_pic.jpg",
    hours: "Mon - Sun, 9:00 AM - 10:00 PM",
  },

  TPX_Buildings_1: {
    label: "Student Hub Ground Floor",
    description:
      "Main entrance area of the Student Hub with seating and student services.",
    category: "student_facility",
    has360View: true,
    keywords: ["student hub", "hub", "Dancing Room", "Gaming Room"],
    imageUrl: "/images/shub_pic.jpg",
    hours: "Mon - Sun, 9:00 AM - 10:00 PM",
  },

  TPX_Buildings_2: {
    label: "SV Male Building",
    description:
      "Male accommodation building within the Swinburne Student Village.",
    category: "residential",
    has360View: false,
    imageUrl: "/images/sv_inside_pic.jpg",
    hours: "-",
  },

  TPX_Buildings_3: {
    label: "SV Office and Kitchen",
    description:
      "Student Village management office and shared kitchen facilities.",
    category: "residential",
    has360View: false,
    keywords: ["sv kitchen", "SV Lobby", "SV Main Door", "Student Village"],
    imageUrl: "/images/sv_outside_pic.jpg",
    hours: "SV Office Mon - Fri, 8:00 AM - 5:00 PM",
  },

  TPX_Buildings_4: {
    label: "Dining Hall",
    description:
      "Main dining area serving meals for Student Village residents.",
    category: "food",
    has360View: true,
    keywords: ["canteen", "food", "dining", "hall"],
    imageUrl: "/images/diningpic.jpg",
    hours: "Mon - Fri, 7:00 AM - 5:00 PM",
  },

  TPX_Buildings_5: {
    label: "G Block",
    description:
      "Academic building containing classrooms, labs, and teaching facilities.",
    category: "academic",
    has360View: false,
    keywords: ["IT", "IT Deparment", "BlockG"],
    imageUrl: "/images/blockg_pic.jpg",
    hours: "Mon - Fri, 8:00 AM - 5:30 PM",
  },

  TPX_Buildings_6: {
    label: "A Block",
    description:
      "Central academic zone including A Block, E Block, and the Borneo Atrium.",
    category: "academic",
    has360View: true,
    keywords: ["Junction", "Library", "John's Pie", "Student HQ"],
    imageUrl: "/images/lobby.jpg",
    hours: "Student HQ Mon - Fri, 8:00 AM - 5:00 PM",
  },

  TPX_Buildings_7: {
    label: "Multi-Storey Carpark",
    description:
      "Campus multi-level parking facility for students and staff vehicles.",
    category: "parking",
    has360View: false,
    imageUrl: "/images/parking_pic.jpg",
    hours: "-",
  },

  TPX_Buildings_8: {
    label: "MPH & Angelus Fitness",
    description:
      "Multipurpose hall and Angelus Fitness gym facilities for sports and events.",
    category: "sports",
    has360View: true,
    keywords: ["Sport Hall", "Badminton Court", "Bastketball Court", "GYM"],
    imageUrl: "/images/mph_pic.jpg",
    hours: "Mon - Fri, 7:00 AM - 23:00 PM",
  },

  TPX_Buildings_9: {
    label: "SV Female Building",
    description:
      "Female accommodation building within the Swinburne Student Village.",
    category: "residential",
    has360View: false,
    imageUrl: "/images/sv_inside_pic.jpg",
    hours: "-",
  },

  TPX_Buildings_10: {
    label: "Lecture Theatre",
    description:
      "Large lecture theatre used for major classes, seminars, and presentations.",
    category: "academic",
    has360View: true,
    keywords: ["lt", "lecture", "theatre", "hall"],
    imageUrl: "/images/lecturetheater_pic.jpg",
    hours: "Mon - Fri, 8:00 AM - 6:00 PM",
  },

  TPX_Buildings_11: {
    label: "Dining Hall 1st Floor",
    description:
      "Upper level dining area with additional seating and student gathering space.",
    category: "food",
    has360View: true,
    imageUrl: "/images/diningpic.jpg",
    hours: "Mon - Fri, 7:00 AM - 5:00 PM",
  },
};

function getBuildingInfo(meshName: string): {
  label: string;
  description: string;
  category: string;
  has360View: boolean;
  keywords?: string[];
  imageUrl?: string;
  hours?: string;
} {
  return (
    BUILDING_INFO[meshName] || {
      label: meshName || "Building",
      description: "No description available.",
      category: "unknown",
      has360View: false,
    }
  );
}

function getSearchableBuildings(): Array<{
  meshName: string;
  poiId?: string;
  label: string;
  description: string;
  category: string;
  has360View: boolean;
  keywords?: string[];
}> {
  const buildingItems = Object.entries(BUILDING_INFO).map(([meshName, info]) => ({
    meshName,
    ...info,
  }));

  const poiItems = CAMPUS_POIS.map((poi) => ({
    meshName: poi.parentMeshName,
    poiId: poi.id,
    label: poi.label,
    description: poi.description,
    category: poi.category,
    has360View: poi.has360View,
    keywords: poi.keywords,
  }));

  return [...buildingItems, ...poiItems];
}

type RouteNode = {
  id: string;
  label: string;
  position: [number, number, number];
  color?: string;
  visible?: boolean;
};

const ROUTE_NODES: RouteNode[] = [
  { id: "a", label: "A", position: [20, 1, 50], color: "#f97316", visible: false }, //true

  { id: "a1", label: "a1", position: [20, 1, -16], color: "#06b6d4", visible: false },
  { id: "a2", label: "a2", position: [20, 1, 20], color: "#06b6d4", visible: false },
  { id: "a3", label: "a3", position: [35, 1, -16], color: "#06b6d4", visible: false },

  { id: "g", label: "G", position: [35, 1, -30], color: "#06b6d4", visible: false }, //true

  { id: "b1", label: "B1", position: [20, 1, 70], color: "#a855f7", visible: false },
  { id: "b2", label: "B2", position: [40, 1, 70], color: "#a855f7", visible: false },
  { id: "b3", label: "B3", position: [40, 1, 85], color: "#a855f7", visible: false },
  { id: "b4", label: "B4", position: [50, 1, 85], color: "#a855f7", visible: false },

  { id: "ae1", label: "AE", position: [20, 1, 100], color: "#06b6d4", visible: false },
  { id: "ae2", label: "E", position: [40, 1, 100], color: "#06b6d4", visible: false }, //true

  { id: "p1", label: "p1", position: [0, 1, 50], color: "#f97316", visible: false },
  { id: "p2", label: "p2", position: [0, 1, 75], color: "#f97316", visible: false },
  { id: "p", label: "P", position: [-15, 1, 75], color: "#f97316", visible: false }, //true

  { id: "r1", label: "r1", position: [0, 1, 20], color: "#f97316", visible: false },
  { id: "r2", label: "r2", position: [-35, 1, 20], color: "#f97316", visible: false },
  { id: "r", label: "R", position: [-35, 1, 5], color: "#f97316", visible: false },

  { id: "gl1", label: "gl1", position: [70, 1, -16], color: "#06b6d4", visible: false },
  { id: "l", label: "L", position: [70, 1, 5], color: "#06b6d4", visible: false }, //true
  { id: "al1", label: "al", position: [70, 1, 70], color: "#06b6d4", visible: false },

  //G to C
  { id: "c", label: "C", position: [35, 1, -60], color: "#06b6d4" },
  { id: "c1", label: "c1", position: [35, 1, -80], color: "#06b6d4" },
  { id: "c2", label: "c2", position: [25, 1, -95], color: "#06b6d4" },

  //D to sv1
  { id: "d", label: "D", position: [15, 1, -113], color: "#06b6d4" },
  { id: "d1", label: "D1", position: [0, 1, -100], color: "#06b6d4" },
  { id: "d2", label: "D2", position: [-40, 1, -80], color: "#06b6d4" },
];

const ROUTE_EDGES: [string, string][] = [
  ["a", "a2"],
  ["a2", "a1"],
  ["a1", "a3"],
  ["a3", "g"],

  ["a", "b1"],
  ["b1", "b2"],
  ["b2", "b3"],
  ["b3", "b4"],

  ["a", "E"],
  ["E", "ae2"],

  ["a", "p1"],
  ["p1", "p2"],
  ["p2", "p"],

  ["p1", "r1"],
  ["r1", "r2"],
  ["r2", "r"],

  ["a3", "gl1"],
  ["gl1", "l"],

  ["b2", "al1"],
  ["al1", "l"],

  ["g", "c"],
  ["c", "c1"],
  ["c1", "c2"],
  ["c2", "d"],

  ["d", "d1"],
  ["d1", "d2"],
];

const ROUTE_SETUP_MODE = false; //change to false for normal buildings back

const PLACE_TO_ROUTE_NODE: Record<string, string> = {
  TPX_Buildings_6: "a",   // A Block
  TPX_Buildings_5: "g",   // G Block
  TPX_Buildings_10: "l",  // Lecture Theatre
  TPX_Buildings_7: "p",   // Carpark
  TPX_Buildings_8: "r",   // MPH & Angelus Fitness
  TPX_Buildings_4: "c",   // Dining Hall / C
  TPX_Buildings_11: "c",
  TPX_Buildings_3: "d2",  // SV1 Office and Kitchen
  TPX_Buildings_2: "d2",  // SV3 -> reuse SV1 checkpoint
  TPX_Buildings_9: "d2",  // SV2 -> reuse SV1 checkpoint
  TPX_Buildings_0: "d",   // Student Hub 1st Floor / D area
  TPX_Buildings_1: "d",   // Student Hub Ground Floor / D area
  poi_a_block: "a",
  poi_e_block: "ae2",
  poi_borneo_atrium: "b4",
};

const BUILDING_SHORT_LABELS: Record<string, string> = {
  TPX_Buildings_0: "D",
  TPX_Buildings_1: "D",
  TPX_Buildings_2: "SV3",
  TPX_Buildings_3: "SV1",
  TPX_Buildings_4: "C",
  TPX_Buildings_5: "G",
  TPX_Buildings_6: "A",
  TPX_Buildings_7: "P",
  TPX_Buildings_8: "R",
  TPX_Buildings_9: "SV2",
  TPX_Buildings_10: "L",
  TPX_Buildings_11: "C",
};

type CampusPOI = {
  id: string;
  parentMeshName: string;
  label: string;
  description: string;
  category: string;
  has360View: boolean;
  keywords?: string[];
  shortLabel: string;
  offset: [number, number, number];
  imageUrl?: string;
  hours?: string;
};

const CAMPUS_POIS: CampusPOI[] = [
  {
    id: "poi_a_block",
    parentMeshName: "TPX_Buildings_6",
    label: "Block A",
    description: "Academic block for classes, offices, and student access.",
    category: "academic",
    has360View: true,
    keywords: ["a block", "block a"],
    imageUrl: "/images/lobby.jpg",
    hours: "Student HQ Mon - Fri, 8:00 AM - 5:00 PM",
    shortLabel: "A",
    offset: [-10, 8, -7],  //[-10, 3, 8]
  },
  {
    id: "poi_e_block",
    parentMeshName: "TPX_Buildings_6",
    label: "Block E",
    description: "Academic block connected within the same main building zone.",
    category: "academic",
    has360View: true,
    keywords: ["e block", "block e"],
    imageUrl: "/images/blockE_pic.jpg",
    hours: "-",
    shortLabel: "E",
    offset: [0, 3, 46],
  },
  {
    id: "poi_borneo_atrium",
    parentMeshName: "TPX_Buildings_6",
    label: "Borneo Atrium",
    description: "Open central atrium area inside the A/E Block complex.",
    category: "student_facility",
    has360View: true,
    keywords: ["borneo atrium", "atrium"],
    imageUrl: "/images/borneoatrium_pic.jpg",
    hours: "Open 24 hours (Mon–Sun)",
    shortLabel: "BA",
    offset: [10, 3, 23],
  },
];

function buildRouteGraph(edges: [string, string][]) {
  const graph: Record<string, string[]> = {};

  edges.forEach(([a, b]) => {
    if (!graph[a]) graph[a] = [];
    if (!graph[b]) graph[b] = [];

    graph[a].push(b);
    graph[b].push(a);
  });

  return graph;
}

const ROUTE_GRAPH = buildRouteGraph(ROUTE_EDGES);

function findRouteBFS(
  graph: Record<string, string[]>,
  start: string,
  goal: string
): string[] {
  if (start === goal) return [start];

  const queue: string[][] = [[start]];
  const visited = new Set<string>([start]);

  while (queue.length > 0) {
    const path = queue.shift();
    if (!path) continue;

    const current = path[path.length - 1];
    const neighbors = graph[current] || [];

    for (const next of neighbors) {
      if (visited.has(next)) continue;

      const newPath = [...path, next];

      if (next === goal) {
        return newPath;
      }

      visited.add(next);
      queue.push(newPath);
    }
  }

  return [];
}

function buildEdgesFromPath(path: string[]): [string, string][] {
  const edges: [string, string][] = [];

  for (let i = 0; i < path.length - 1; i++) {
    edges.push([path[i], path[i + 1]]);
  }

  return edges;
}

/* ---------- CAMERA FIT ---------- */
function FitCameraToObject({
  object,
  view = "angled",
  distanceMultiplier = 1.0,
}: {
  object: THREE.Object3D;
  view?: "top" | "angled";
  distanceMultiplier?: number;
}) {
  const { camera } = useThree();
  const didFit = useRef(false);

  useEffect(() => {
    if (!object || didFit.current) return;
    didFit.current = true;

    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);

    if (view === "top") {
      camera.position.set(center.x, center.y + maxDim * 2.2, center.z);
    } else {
      const d = maxDim * 1.2 * distanceMultiplier;
      const h = maxDim * 0.9 * distanceMultiplier;

      camera.position.set(center.x - d * 4.2, center.y + h, center.z + d);
    }

    camera.lookAt(center);
    camera.updateProjectionMatrix();
  }, [object, camera, view, distanceMultiplier]);

  return null;
}

/* ---------- FOCUS CAMERA ON SELECTED BUILDING ---------- */
function FocusCameraOnSelection({
  selectedUuid,
  selectedPoint,
  selectedPoiId,
  rootObject,
  routeActive,
}: {
  selectedUuid?: string | null;
  selectedPoint?: THREE.Vector3 | null;
  selectedPoiId?: string | null;
  rootObject: THREE.Object3D | null;
  routeActive?: boolean;
}) {
  const { camera, controls } = useThree() as any;

  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const isAnimating = useRef(false);

  const previousCameraPos = useRef(new THREE.Vector3());
  const previousTarget = useRef(new THREE.Vector3());
  const hasSavedView = useRef(false);
  const lastSelectedUuid = useRef<string | null>(null);

  useEffect(() => {
    if (!rootObject || !controls) return;
    if (routeActive) return;

    // Unselect -> zoom back out to previous saved view
    if (!selectedUuid) {
      if (hasSavedView.current) {
        targetPos.current.copy(previousCameraPos.current);
        targetLookAt.current.copy(previousTarget.current);
        isAnimating.current = true;
      }

      lastSelectedUuid.current = null;
      return;
    }

    // New selection -> save current camera view first
    if (lastSelectedUuid.current !== selectedUuid) {
      previousCameraPos.current.copy(camera.position);
      previousTarget.current.copy(controls.target);
      hasSavedView.current = true;
    }

    const selectedObj = rootObject.getObjectByProperty("uuid", selectedUuid);
    if (!selectedObj) return;

    let center = new THREE.Vector3();
    let maxDim = 1;

    if (selectedPoiId && selectedPoint) {
      center.copy(selectedPoint);
      maxDim = 18;
    } else {
      const box = new THREE.Box3().setFromObject(selectedObj);
      center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      maxDim = Math.max(size.x, size.y, size.z, 1);
    }

    // Keep current view direction
    const currentOffset = new THREE.Vector3().subVectors(
      camera.position,
      controls.target
    );

    if (currentOffset.lengthSq() < 0.0001) {
      currentOffset.set(1, 1, 1);
    }

    const dir = currentOffset.clone().normalize();
    const newDistance = Math.max(maxDim * 2.2, 26);

    targetLookAt.current.copy(center);
    targetPos.current.copy(center).add(dir.multiplyScalar(newDistance));

    isAnimating.current = true;
    lastSelectedUuid.current = selectedUuid;
  }, [selectedUuid, selectedPoint, selectedPoiId, rootObject, controls, camera, routeActive]);

  useEffect(() => {
    if (!controls) return;

    const stopAnimation = () => {
      isAnimating.current = false;
    };

    controls.addEventListener("start", stopAnimation);

    return () => {
      controls.removeEventListener("start", stopAnimation);
    };
  }, [controls]);

  useFrame(() => {
    if (!isAnimating.current || !controls) return;

    camera.position.lerp(targetPos.current, 0.08);
    controls.target.lerp(targetLookAt.current, 0.08);
    controls.update();

    const camDone = camera.position.distanceTo(targetPos.current) < 0.5;
    const targetDone = controls.target.distanceTo(targetLookAt.current) < 0.5;

    if (camDone && targetDone) {
      isAnimating.current = false;
    }
  });

  return null;
}

/* ---------- SWITCH BETWEEN 2D / 3D VIEW ---------- */
function ApplyViewMode({
  rootObject,
  viewMode,
  resetSignal,
}: {
  rootObject: THREE.Object3D | null;
  viewMode: "2D" | "3D";
  resetSignal: number;
}) {
  const { camera, controls } = useThree() as any;

  useEffect(() => {
    if (!rootObject || !controls) return;

    const box = new THREE.Box3().setFromObject(rootObject);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    if (viewMode === "2D") {
      const topHeight = maxDim * 1.1;

      camera.position.set(center.x, center.y + topHeight, center.z);
      controls.target.copy(center);
      controls.update();
    } else {
      const d = maxDim * 1.2 * 0.34;
      const h = maxDim * 1.9 * 0.34;

      camera.position.set(center.x - d * 2.0, center.y + h, center.z + d);
      controls.target.copy(center);
      controls.update();
    }

    camera.updateProjectionMatrix();
  }, [rootObject, viewMode, resetSignal, camera, controls]);

  return null;
}

/* ---------- CAMPUS MODEL ---------- */
function CampusModel({
  pickedUuid,
  hoveredUuid,
  onPick,
  onHover,
  onHoverOut,
  onReadyRoot,
}: {
  pickedUuid?: string | null;
  hoveredUuid?: string | null;
  onPick?: (payload: {
    name: string;
    uuid: string;
    meshName: string;
    point: THREE.Vector3;
    description: string;
    category: string;
    has360View: boolean;
  }) => void;
  onHover?: (payload: { name: string; uuid: string }) => void;
  onHoverOut?: () => void;
  onReadyRoot?: (obj: THREE.Object3D) => void;
}) {
  const { scene } = useGLTF("/maps/topoexport_3D_modeling.glb");

  const groupRef = useRef<THREE.Group>(null);
  const [rootObj, setRootObj] = useState<THREE.Object3D | null>(null);

  const ROAD_COLOR = new THREE.Color("#4b5563");
  const GROUND_COLOR = new THREE.Color("#7cb342");

  const classifyMesh = (name: string) => {
    const n = (name || "").toLowerCase();

    if (
      n.includes("road") ||
      n.includes("street") ||
      n.includes("lane") ||
      n.includes("path") ||
      n.includes("walkway")
    ) {
      return "road";
    }

    if (
      n.includes("ground") ||
      n.includes("terrain") ||
      n.includes("floor") ||
      n.includes("land")
    ) {
      return "ground";
    }

    if (
      n.includes("block") ||
      n.includes("building") ||
      n.includes("library") ||
      n.includes("canteen") ||
      n.includes("lab") ||
      n.includes("office") ||
      n.includes("hall")
    ) {
      return "building";
    }

    // Default fallback:
    // if name doesn't match road/ground, treat as building for now
    return "other";
  };

  /* Prepare meshes */
  useEffect(() => {
    scene.traverse((obj: any) => {
      if (!obj?.isMesh) return;

      const kind = classifyMesh(obj.name);
      obj.userData.kind = kind;
      obj.userData.clickable = kind === "building";

      // Clone material once so one mesh change won't affect all others
      if (!obj.userData.materialCloned) {
        if (Array.isArray(obj.material)) {
          obj.material = obj.material.map((mat: any) => mat.clone());
        } else if (obj.material) {
          obj.material = obj.material.clone();
        }
        obj.userData.materialCloned = true;
      }

      // Store base colors
      if (Array.isArray(obj.material)) {
        if (!obj.userData.baseColors) {
          obj.userData.baseColors = obj.material.map((mat: any) => {
            if (!mat?.color) return null;

            if (kind === "road") return ROAD_COLOR.clone();
            if (kind === "ground") return GROUND_COLOR.clone();
            return mat.color.clone();
          });
        }
      } else {
        if (!obj.userData.baseColor && obj.material?.color) {
          if (kind === "road") {
            obj.userData.baseColor = ROAD_COLOR.clone();
          } else if (kind === "ground") {
            obj.userData.baseColor = GROUND_COLOR.clone();
          } else {
            obj.userData.baseColor = obj.material.color.clone();
          }
        }
      }

      // Apply base color immediately
      if (Array.isArray(obj.material)) {
        obj.material.forEach((mat: any, index: number) => {
          const baseColor = obj.userData.baseColors?.[index];
          if (mat?.color && baseColor) {
            mat.color.copy(baseColor);
          }
          if (mat?.emissive) {
            mat.emissive.set("#000000");
          }
          mat.needsUpdate = true;
        });
      } else if (obj.material) {
        if (obj.material.color && obj.userData.baseColor) {
          obj.material.color.copy(obj.userData.baseColor);
        }
        if (obj.material.emissive) {
          obj.material.emissive.set("#000000");
        }
        obj.material.needsUpdate = true;
      }
    });
  }, [scene]);

  /* Highlight hovered / selected building only */
  useEffect(() => {
    const applyMaterialState = (
      mat: any,
      state: "selected" | "hovered" | "normal",
      baseColor?: THREE.Color | null,
      isBuilding?: boolean
    ) => {
      if (!mat) return;

      if (state === "selected") {
        if (mat.color) mat.color.set("#ff8c42");
        if (mat.emissive) mat.emissive.set("#331100");
        mat.transparent = false;
        mat.opacity = 1;
        mat.depthWrite = true;
      } else if (state === "hovered") {
        if (mat.color && baseColor) mat.color.copy(baseColor);
        if (mat.emissive) mat.emissive.set("#000000");
      } else {
        if (mat.color && baseColor) mat.color.copy(baseColor);
        if (mat.emissive) mat.emissive.set("#000000");

        if (isBuilding) {
          if (mat.color) mat.color.set("#f8fafc");
          mat.transparent = true;
          mat.opacity = 0.32;
          mat.depthWrite = false;
        } else {
          mat.transparent = false;
          mat.opacity = 1;
          mat.depthWrite = true;
        }
      }

      mat.needsUpdate = true;
    };

    scene.traverse((obj: any) => {
      if (!obj?.isMesh) return;

      const isBuilding = obj.userData.kind === "building";
      const isSelected = isBuilding && obj.uuid === pickedUuid;
      const isHovered = isBuilding && obj.uuid === hoveredUuid;

      // ⭐ ADD THIS PART
      if (isBuilding) {
        if (isSelected) {
          obj.scale.set(1.01, 1.01, 1.01);
        } else if (isHovered) {
          obj.scale.set(1.015, 1.015, 1.015);
        } else {
          obj.scale.set(1, 1, 1);
        }
      }

      if (Array.isArray(obj.material)) {
        obj.material.forEach((mat: any, index: number) => {
          const baseColor = obj.userData.baseColors?.[index] ?? null;

          applyMaterialState(mat, "normal", baseColor, isBuilding);
        });
      } else {
        const baseColor = obj.userData.baseColor ?? null;

        if (isHovered) {
          applyMaterialState(obj.material, "hovered", baseColor, isBuilding);
        } else {
          applyMaterialState(obj.material, "normal", baseColor, isBuilding);
        }
      }
    });
  }, [scene, pickedUuid, hoveredUuid]);

  /* Rotate + center model */
  useEffect(() => {
    if (!groupRef.current) return;

    groupRef.current.rotation.set(-Math.PI / 2, 0, 0);

    const box = new THREE.Box3().setFromObject(groupRef.current);
    const center = box.getCenter(new THREE.Vector3());
    const minY = box.min.y;

    groupRef.current.position.set(-center.x, -minY, -center.z);

    setRootObj(groupRef.current);
    onReadyRoot?.(groupRef.current);
  }, [scene]);

  return (
    <group
      ref={groupRef}
      onPointerMove={(e) => {
        e.stopPropagation();

        const obj: any = e.object;
        if (!obj?.isMesh) return;
        if (!obj.userData.clickable) return;

        const buildingInfo = getBuildingInfo(obj.name);

        document.body.style.cursor = "pointer";

        onHover?.({
          name: buildingInfo.label,
          uuid: obj.uuid,
        });
      }}
      onPointerOut={(e) => {
        e.stopPropagation();

        document.body.style.cursor = "default";

        onHoverOut?.();
      }}
      onPointerDown={(e) => {
        e.stopPropagation();

        const obj: any = e.object;
        if (!obj?.isMesh) return;
        if (!obj.userData.clickable) return;

        const buildingInfo = getBuildingInfo(obj.name);

        onPick?.({
          name: buildingInfo.label,
          uuid: obj.uuid,
          meshName: obj.name,
          point: e.point.clone(),
          description: buildingInfo.description,
          category: buildingInfo.category,
          has360View: buildingInfo.has360View,
        });
        console.log("clicked building:", buildingInfo.label, obj.name);
      }}
    >
      <primitive object={scene} />


      {/* Just added for building transparent */}
      {rootObj &&
        (() => {
          const outlineMeshes: React.ReactNode[] = [];

          rootObj.traverse((obj: any) => {
            if (!obj?.isMesh) return;
            if (obj.userData.kind !== "building") return;

            outlineMeshes.push(
              <Edges
                key={`edge-${obj.uuid}`}
                geometry={obj.geometry}
                position={obj.position}
                rotation={obj.rotation}
                scale={obj.scale}
                color="#475569"
                lineWidth={1.5}
                threshold={15}
              />
            );
          });

          return outlineMeshes;
        })()}

      {rootObj && (
        <FitCameraToObject
          object={rootObj}
          view="angled"
          distanceMultiplier={0.34}
        />
      )}
    </group>
  );
}

function GrassBase({ rootObject }: { rootObject: THREE.Object3D | null }) {
  const [baseData, setBaseData] = useState<{
    width: number;
    depth: number;
    center: THREE.Vector3;
  } | null>(null);

  useEffect(() => {
    if (!rootObject) return;

    const box = new THREE.Box3().setFromObject(rootObject);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    setBaseData({
      width: size.x * 1.08,
      depth: size.z * 1.08,
      center,
    });
  }, [rootObject]);

  if (!baseData) return null;

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[baseData.center.x, 0.01, baseData.center.z]}
    >
      <planeGeometry args={[baseData.width, baseData.depth]} />
      <meshStandardMaterial color="#b7c4a8" />
    </mesh>
  );
}

function BuildingTopLabels({
  rootObject,
  onPickPoi,
}: {
  rootObject: THREE.Object3D | null;
  onPickPoi?: (poi: CampusPOI) => void;
}) {
  const [labels, setLabels] = useState<
    {
      key: string;
      text: string;
      position: [number, number, number];
      poi?: CampusPOI;
    }[]
  >([]);

  useEffect(() => {
    if (!rootObject) return;

    const nextLabels: {
      key: string;
      text: string;
      position: [number, number, number];
      poi?: CampusPOI;
    }[] = [];

    rootObject.traverse((obj: any) => {
      if (!obj?.isMesh) return;
      if (obj.userData.kind !== "building") return;

      const box = new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      const relatedPois = CAMPUS_POIS.filter(
        (poi) => poi.parentMeshName === obj.name
      );

      if (relatedPois.length > 0) {
        relatedPois.forEach((poi) => {
          nextLabels.push({
            key: poi.id,
            text: poi.shortLabel,
            position: [
              center.x + poi.offset[0],
              box.max.y + poi.offset[1],
              center.z + poi.offset[2],
            ],
            poi,
          });
        });
        return;
      }

      const shortLabel = BUILDING_SHORT_LABELS[obj.name];
      if (!shortLabel) return;

      nextLabels.push({
        key: obj.uuid,
        text: shortLabel,
        position: [
          center.x,
          box.max.y + Math.max(size.y * 0.08, 2),
          center.z,
        ],
        poi: undefined,
      });
    });

    setLabels(nextLabels);
  }, [rootObject]);

  return (
    <>
      {labels.map((label) => (
        <Html
          key={label.key}
          position={label.position}
          center
          transform={false}
          zIndexRange={[0, 0]}
          style={{ pointerEvents: label.poi ? "auto" : "none" }}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (label.poi && onPickPoi) {
                onPickPoi(label.poi);
              }
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pointerEvents: label.poi ? "auto" : "none",
              cursor: label.poi ? "pointer" : "default",
            }}
          >
            <div
              style={{
                minWidth: 40,
                height: 40,
                padding: "0 8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#8b1e3f",
                color: "#ffffff",
                fontSize: 17,
                fontWeight: 800,
                fontFamily: "system-ui",
                lineHeight: 1,
                borderRadius: 4,
                boxShadow: "0 4px 10px rgba(0,0,0,0.22)",
              }}
            >
              {label.text}
            </div>

            <div
              style={{
                width: 26,
                height: 8,
                background: "#6e1632",
                marginTop: 2,
                borderRadius: 2,
              }}
            />
          </div>
        </Html>
      ))}
    </>
  );
}

function RouteDots() {
  return (
    <>
      {ROUTE_NODES.filter((node) => node.visible).map((node) => (
        <group key={node.id} position={node.position}>
          <mesh position={[0, 0.7, 0]}>
            <sphereGeometry args={[1.8, 24, 24]} />
            <meshStandardMaterial
              color={node.color || "#f97316"}
              emissive={node.color || "#f97316"}
              emissiveIntensity={0.5}
            />
          </mesh>

          <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.2, 2.9, 32]} />
            <meshBasicMaterial
              color={node.color || "#f97316"}
              transparent
              opacity={0.9}
            />
          </mesh>

          <Html
            position={[0, 4.2, 0]}
            center
            transform={false}
            zIndexRange={[0, 0]}
            style={{ pointerEvents: "none" }}
          >
            <div
              style={{
                padding: "5px 10px",
                borderRadius: 999,
                background: "rgba(15,23,42,0.92)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 800,
                fontFamily: "system-ui",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
              }}
            >
              {node.label}
            </div>
          </Html>
        </group>
      ))}
    </>
  );
}

function CurrentLocationPin({ nodeId }: { nodeId: string }) {
  const node = ROUTE_NODES.find((n) => n.id === nodeId);
  if (!node) return null;

  return (
    <group position={node.position}>
      {/* red head */}
      <mesh position={[0, 10, 0]}>
        <sphereGeometry args={[4.5, 36, 36]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#7f1d1d"
          emissiveIntensity={0.65}
        />
      </mesh>

      {/* pin body */}
      <mesh position={[0, 6.2, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[3, 8.5, 36]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>

      {/* ground ring */}
      <mesh position={[0, 0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.8, 7.8, 48]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function RouteLines({
  edges,
  color = "#ec1515",
}: {
  edges: [string, string][];
  color?: string;
}) {
  const nodeMap = new Map(
    ROUTE_NODES.map((node) => [node.id, node.position] as const)
  );

  return (
    <>
      {edges.map(([startId, endId], index) => {
        const start = nodeMap.get(startId);
        const end = nodeMap.get(endId);

        if (!start || !end) return null;

        return (
          <Line
            key={`${startId}-${endId}-${index}`}
            points={[
              [start[0], start[1] + 3, start[2]],
              [end[0], end[1] + 3, end[2]],
            ]}
            color={color}
            lineWidth={7}
          />
        );
      })}
    </>
  );
}

function FocusCameraOnRoute({
  rootObject,
  activeRoute,
}: {
  rootObject: THREE.Object3D | null;
  activeRoute: string[];
}) {
  const { camera, controls } = useThree() as any;

  const targetPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const isAnimating = useRef(false);

  useEffect(() => {
    if (!rootObject || !controls) return;
    if (!activeRoute || activeRoute.length < 2) return;

    const routePositions = activeRoute
      .map((id) => ROUTE_NODES.find((node) => node.id === id)?.position)
      .filter(Boolean) as [number, number, number][];

    if (routePositions.length < 2) return;

    const box = new THREE.Box3();

    routePositions.forEach((pos) => {
      box.expandByPoint(new THREE.Vector3(pos[0], pos[1], pos[2]));
    });

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 40);

    const newDistance = maxDim * 1.8;
    const newHeight = maxDim * 3.05;

    targetLookAt.current.copy(center);
    targetPos.current.set(
      center.x - newDistance * 1.15,
      center.y + newHeight,
      center.z + newDistance * 0.9
    );

    isAnimating.current = true;
  }, [rootObject, controls, activeRoute]);

    useEffect(() => {
    if (!controls) return;

    const stopAnimation = () => {
      isAnimating.current = false;
    };

    controls.addEventListener("start", stopAnimation);

    return () => {
      controls.removeEventListener("start", stopAnimation);
    };
  }, [controls]);

  useFrame(() => {
    if (!isAnimating.current || !controls) return;

    camera.position.lerp(targetPos.current, 0.08);
    controls.target.lerp(targetLookAt.current, 0.08);
    controls.update();

    const camDone = camera.position.distanceTo(targetPos.current) < 0.6;
    const targetDone = controls.target.distanceTo(targetLookAt.current) < 0.6;

    if (camDone && targetDone) {
      isAnimating.current = false;
    }
  });

  return null;
}

/* ---------- MAIN PAGE ---------- */
export default function CampusMapPage() {
  const [picked, setPicked] = useState<{
    name: string;
    uuid: string;
    meshName: string;
    point: THREE.Vector3;
    description: string;
    category: string;
    has360View: boolean;
    imageUrl?: string;
    hours?: string;
    poiId?: string;
  } | null>(null);

  const [hovered, setHovered] = useState<{
    name: string;
    uuid: string;
  } | null>(null);

  const [campusRoot, setCampusRoot] = useState<THREE.Object3D | null>(null);
  const [resetViewSignal, setResetViewSignal] = useState(0);
  const [viewMode, setViewMode] = useState<"2D" | "3D">("3D");

  const [startNode, setStartNode] = useState<string>("");
  const [endNode, setEndNode] = useState<string>("");
  const [activeRoute, setActiveRoute] = useState<string[]>([]);

  const [currentLocationNode, setCurrentLocationNode] = useState<string>("");
  const [currentLocationLabel, setCurrentLocationLabel] = useState<string>("");

  const [searchText, setSearchText] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [locationPanelOpen, setLocationPanelOpen] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [mobileSheetExpanded, setMobileSheetExpanded] = useState(false);

  const searchPanelRef = useRef<HTMLDivElement | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!startNode || !endNode) {
      setActiveRoute([]);
      return;
    }

    const result = findRouteBFS(ROUTE_GRAPH, startNode, endNode);
    setActiveRoute(result);
  }, [startNode, endNode]);

  const activeRouteEdges = useMemo(() => {
    return buildEdgesFromPath(activeRoute);
  }, [activeRoute]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchPanelRef.current &&
        !searchPanelRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      // desktop always keep open
      if (!mobile) {
        setLocationPanelOpen(true);
      } else {
        setLocationPanelOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const searchableBuildings = useMemo(() => getSearchableBuildings(), []);

  function getPoiWorldPosition(
    rootObject: THREE.Object3D,
    poi: CampusPOI
  ): THREE.Vector3 | null {
    const parentObj = rootObject.getObjectByName(poi.parentMeshName);
    if (!parentObj) return null;

    const box = new THREE.Box3().setFromObject(parentObj);
    const center = box.getCenter(new THREE.Vector3());

    return new THREE.Vector3(
      center.x + poi.offset[0],
      box.max.y + poi.offset[1],
      center.z + poi.offset[2]
    );
  }

  const filteredSuggestions = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    if (!q) {
      return searchableBuildings.slice(0, 6);
    }

    return searchableBuildings
      .filter((b) => {
        const labelMatch = b.label.toLowerCase().includes(q);
        const descMatch = b.description.toLowerCase().includes(q);
        const categoryMatch = b.category.toLowerCase().includes(q);
        const keywordMatch = (b.keywords || []).some((k) =>
          k.toLowerCase().includes(q)
        );

        return labelMatch || descMatch || categoryMatch || keywordMatch;
      })
      .slice(0, 8);
  }, [searchText, searchableBuildings]);

  const overlayText = useMemo(() => {
    if (picked) return `Picked: ${picked.name} (${picked.uuid.slice(0, 8)}...)`;
    if (hovered) return `Hovering: ${hovered.name}`;
    return "Click a building/block to test picking";
  }, [picked, hovered]);

  const activeLabel = picked?.name || hovered?.name || null;

  const handleSearchSelect = (meshName: string, poiId?: string) => {
    if (!campusRoot) return;

    const matchedObj = campusRoot.getObjectByName(meshName);
    if (!matchedObj) return;

    if (poiId) {
      const poi = CAMPUS_POIS.find((item) => item.id === poiId);
      if (!poi) return;

      const poiPosition = getPoiWorldPosition(campusRoot, poi);
      if (!poiPosition) return;

      setPicked({
        name: poi.label,
        uuid: matchedObj.uuid,
        meshName,
        point: poiPosition,
        description: poi.description,
        category: poi.category,
        has360View: poi.has360View,
        imageUrl: poi.imageUrl,
        hours: poi.hours,
        poiId: poi.id,
      });

      setHovered(null);
      setSearchText(poi.label);
      setSearchOpen(false); //false

      if (isMobile) {
        setLocationPanelOpen(false);
        setMobileSheetOpen(true);
        setMobileSheetExpanded(true);
      }
      return;
    }

    const info = getBuildingInfo(meshName);
    const box = new THREE.Box3().setFromObject(matchedObj);
    const center = box.getCenter(new THREE.Vector3());

    setPicked({
      name: info.label,
      uuid: matchedObj.uuid,
      meshName,
      point: center,
      description: info.description,
      category: info.category,
      has360View: info.has360View,
      imageUrl: info.imageUrl,
      hours: info.hours,
    });

    setHovered(null);
    setSearchText(info.label); 
    setSearchOpen(false); //false

    if (isMobile) {
      setLocationPanelOpen(false);
      setMobileSheetOpen(true);
      setMobileSheetExpanded(true);
    }
  };

  function handleSetCurrentLocation(nodeId: string, label: string) {
    setCurrentLocationNode(nodeId);
    setCurrentLocationLabel(label);

    if (isMobile) {
      setLocationPanelOpen(false);
    }
  }

  function handleClearCurrentLocation() {
    setCurrentLocationNode("");
    setCurrentLocationLabel("");
    setStartNode("");
    setEndNode("");
    setActiveRoute([]);
  }

  function handleNavigateHere() {
    if (!picked) return;

    if (!currentLocationNode) {
      alert("Please set your current location first.");
      return;
    }

    const targetNode = picked.poiId
      ? PLACE_TO_ROUTE_NODE[picked.poiId]
      : PLACE_TO_ROUTE_NODE[picked.meshName];

    if (!targetNode) {
      alert("This place does not have a route node yet.");
      return;
    }

    if (currentLocationNode === targetNode) {
      alert("You are already at this location.");
      setStartNode("");
      setEndNode("");
      setActiveRoute([]);
      return;
    }

    const isSameRouteShown =
      startNode === currentLocationNode &&
      endNode === targetNode &&
      activeRoute.length > 0;

    if (isSameRouteShown) {
      setStartNode("");
      setEndNode("");
      setActiveRoute([]);
      return;
    }

    setStartNode(currentLocationNode);
    setEndNode(targetNode);
  }

  return (
    <main className="flex flex-col h-auto">
        <div className="w-full mx-auto px-2 md:px-4 py-3 md:py-6 flex-1">
          {/* Header */}
          <header className="flex items-center gap-3 p-3 mb-4 bg-white border-2 border-red-700 rounded-2xl shadow-md shadow-red-200">
            <Link
              href="/navigate"
              aria-label="Back"
              className="grid place-items-center w-10 h-10 border border-slate-300 rounded-xl bg-white text-slate-900 hover:bg-slate-100 transition"
            >
              ←
            </Link>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900">Campus Map</h1>
              <p className="text-sm text-slate-500 mt-0.5">3D campus view</p>
            </div>
          </header>
      <div
        style={{
          width: "100%",
          maxWidth: 1400,
          height: isMobile ? "calc(100dvh - 16px)" : "88vh",
          position: "relative",
          border: "3px solid red",
          borderRadius: isMobile ? 16 : 20,
          background: "linear-gradient(to bottom, #1e293b, #0b1220)",
          overflow: "hidden",
          boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
        }}
      >
        {mounted && (
          <div
            ref={searchPanelRef}
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 10,
              width: isMobile ? "calc(100% - 24px)" : 340,
              maxWidth: isMobile ? "calc(100% - 24px)" : 340,
              borderRadius: isMobile ? 14 : 16,
              background: "rgba(255,255,255,0.96)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
              overflow: "hidden",
              fontFamily: "system-ui",
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                padding: isMobile ? 12 : 14,
                background: "#ffffff",
                borderBottom: searchOpen ? "1px solid rgba(0,0,0,0.08)" : "none",
              }}
            >
              {searchOpen && (
                <div
                  style={{
                    fontSize: isMobile ? 13 : 14,
                    fontWeight: 700,
                    color: "#0f172a",
                    marginBottom: isMobile ? 8 : 10,
                  }}
                >
                  Search campus places
                </div>
              )}

              <div style={{ position: "relative" }}>
                <input
                  suppressHydrationWarning
                  type="text"
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setPicked(null);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search building, hall, hub..."
                  style={{
                    width: "100%",
                    height: isMobile ? 40 : 42,
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    padding: "0 40px 0 12px",
                    outline: "none",
                    fontSize: isMobile ? 13 : 14,
                    boxSizing: "border-box",
                    color: "#000000",
                    background: "#ffffff",
                  }}
                />

                {searchText && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchText("");
                      setSearchOpen(false);
                      setPicked(null);
                      setHovered(null);
                    }}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border: "none",
                      background: "#e2e8f0",
                      color: "#0f172a",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                    }}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {picked && !isMobile ? (
              <div style={{ background: "#ffffff" }}>
                {picked.imageUrl && (
                  <img
                    src={picked.imageUrl}
                    alt={picked.name}
                    style={{
                      width: "100%",
                      height: isMobile ? 120 : 180,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                )}

                <div style={{ padding: isMobile ? "12px 12px 14px" : "14px 14px 16px" }}>
                  <div
                    style={{
                      fontSize: isMobile ? 18 : 22,
                      fontWeight: 800,
                      color: "#0f172a",
                      marginBottom: 6,
                    }}
                  >
                    {picked.name}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      textTransform: "capitalize",
                      marginBottom: 10,
                    }}
                  >
                    {picked.category.replaceAll("_", " ")}
                  </div>

                  <div
                    style={{
                      fontSize: isMobile ? 13 : 14,
                      color: "#334155",
                      lineHeight: 1.5,
                      marginBottom: 12,
                    }}
                  >
                    {picked.description}
                  </div>

                  {picked.hours && (
                    <div
                      style={{
                        fontSize: isMobile ? 13 : 14,
                        color: "#0f172a",
                        marginBottom: 14,
                      }}
                    >
                      <strong>Hours:</strong> {picked.hours}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexDirection: isMobile ? "column" : "row",
                    }}
                  >
                    <button
                      disabled={!picked.has360View}
                      style={{
                        flex: 1,
                        padding: isMobile ? "9px 12px" : "10px 12px",
                        borderRadius: 10,
                        border: "none",
                        background: picked.has360View ? "#38bdf8" : "#94a3b8",
                        color: "#0f172a",
                        fontWeight: 700,
                        fontSize: isMobile ? 13 : 14,
                        cursor: picked.has360View ? "pointer" : "not-allowed",
                      }}
                    >
                      Open 360 View
                    </button>

                    <button
                      onClick={handleNavigateHere}
                      style={{
                        flex: 1,
                        padding: isMobile ? "9px 12px" : "10px 12px",
                        borderRadius: 10,
                        border: "none",
                        background: "#f59e0b",
                        color: "#111827",
                        fontWeight: 700,
                        fontSize: isMobile ? 13 : 14,
                        cursor: "pointer",
                      }}
                    >
                      {(() => {
                        const targetNode = picked
                          ? picked.poiId
                            ? PLACE_TO_ROUTE_NODE[picked.poiId]
                            : PLACE_TO_ROUTE_NODE[picked.meshName]
                          : "";

                        const isSameRouteShown =
                          !!picked &&
                          !!currentLocationNode &&
                          startNode === currentLocationNode &&
                          endNode === targetNode &&
                          activeRoute.length > 0;

                        return isSameRouteShown ? "Clear Route" : "Navigate Here";
                      })()}
                    </button>
                  </div>
                </div>
              </div>
            ) : searchOpen ? (
              <div
                style={{
                  maxHeight: isMobile ? 240 : 300,
                  overflowY: "auto",
                  background: "#f8fafc",
                }}
              >
                <div
                  style={{
                    padding: "10px 14px 6px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  Suggested places
                </div>

                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((item) => (
                    <button
                      key={item.poiId ?? item.meshName}
                      onClick={() => handleSearchSelect(item.meshName, item.poiId)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: isMobile ? "10px 12px" : "12px 14px",
                        border: "none",
                        background: "transparent",
                        borderTop: "1px solid rgba(0,0,0,0.05)",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          fontSize: isMobile ? 13 : 14,
                          fontWeight: 700,
                          color: "#0f172a",
                          marginBottom: 4,
                        }}
                      >
                        {item.label}
                      </div>

                      <div
                        style={{
                          fontSize: isMobile ? 11 : 12,
                          color: "#64748b",
                          textTransform: "capitalize",
                          marginBottom: 3,
                        }}
                      >
                        {item.category.replaceAll("_", " ")}
                      </div>

                      <div
                        style={{
                          fontSize: isMobile ? 11 : 12,
                          color: "#475569",
                          lineHeight: 1.4,
                        }}
                      >
                        {item.description}
                      </div>
                    </button>
                  ))
                ) : (
                  <div
                    style={{
                      padding: 14,
                      fontSize: 13,
                      color: "#64748b",
                    }}
                  >
                    No matching place found.
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Mobile toggle button */}
        {isMobile && (
          <button
            onClick={() => {
              setLocationPanelOpen((v) => {
                const next = !v;

                if (next) {
                  setMobileSheetOpen(false);
                  setMobileSheetExpanded(false);
                  setPicked(null);
                }

                return next;
              });
            }}
            style={{
              position: "absolute",
              top: 72,
              right: 12,
              zIndex: 20,
              border: "none",
              background: "rgba(255,255,255,0.96)",
              color: "#0f172a",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
              backdropFilter: "blur(8px)",
            }}
          >
            {locationPanelOpen ? "Close Location" : "Set Location"}
          </button>
        )}

          <div
            style={{
              position: "absolute",
              zIndex: 20,
              background: "rgba(255,255,255,0.96)",
              padding: 10,
              borderRadius: isMobile ? 16 : 14,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              overflowY: "auto",
              boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
              color: "#0f172a",
              fontFamily: "system-ui",
              backdropFilter: "blur(8px)",

              // desktop
              ...(isMobile
                ? {
                    left: 12,
                    right: 12,
                    bottom: 12,
                    maxHeight: "42%",
                    transform: locationPanelOpen
                      ? "translateY(0)"
                      : "translateY(calc(100% + 20px))",
                    opacity: locationPanelOpen ? 1 : 0,
                    pointerEvents: locationPanelOpen ? "auto" : "none",
                    transition: "transform 0.28s ease, opacity 0.28s ease",
                  }
                : {
                    top: 72,
                    right: 12,
                    width: 200,
                    maxHeight: 300,
                  }),
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700 }}>
                Set Current Location
              </div>

              {currentLocationNode && (
                <button
                  onClick={handleClearCurrentLocation}
                  style={{
                    border: "none",
                    background: "#fee2e2",
                    color: "#b91c1c",
                    borderRadius: 8,
                    padding: "6px 8px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Clear Pin
                </button>
              )}
            </div>

            <button onClick={() => handleSetCurrentLocation("a", "A Block")}>
              A Block
            </button>

            <button onClick={() => handleSetCurrentLocation("g", "G Block")}>
              G Block
            </button>

            <button onClick={() => handleSetCurrentLocation("l", "Lecture Theatre")}>
              Lecture Theatre
            </button>

            <button onClick={() => handleSetCurrentLocation("p", "Carpark")}>
              Carpark
            </button>

            <button onClick={() => handleSetCurrentLocation("r", "MPH & Gym")}>
              MPH & Gym
            </button>

            <button onClick={() => handleSetCurrentLocation("c", "Dining Hall")}>
              Dining Hall
            </button>

            <button onClick={() => handleSetCurrentLocation("d", "Student Hub")}>
              Student Hub
            </button>

            <button onClick={() => handleSetCurrentLocation("d2", "SV1")}>
              SV1
            </button>

            <button onClick={() => handleSetCurrentLocation("ae2", "E Block")}>
              E Block
            </button>

            <button onClick={() => handleSetCurrentLocation("b4", "Borneo Atrium")}>
              Borneo Atrium
            </button>
          </div>

        {isMobile && picked && mobileSheetOpen && (
            <div
              style={{
                position: "absolute",
                left: 12,
                right: 12,
                bottom: 12,
                zIndex: 110,
                background: "rgba(255,255,255,0.98)",
                borderRadius: 20,
                boxShadow: "0 16px 36px rgba(0,0,0,0.22)",
                overflow: "hidden",
                fontFamily: "system-ui",
                transition: "all 0.25s ease",
                maxHeight: mobileSheetExpanded ? "62%" : "96px",
                display: "flex",
                flexDirection: "column",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  paddingTop: 8,
                  paddingBottom: 4,
                  cursor: "pointer",
                }}
                onClick={() => setMobileSheetExpanded((v) => !v)}
              >
                <div
                  style={{
                    width: 42,
                    height: 5,
                    borderRadius: 999,
                    background: "#cbd5e1",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "6px 14px 0",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: "#0f172a",
                      lineHeight: 1.1,
                      marginBottom: 6,
                    }}
                  >
                    {picked.name}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      textTransform: "capitalize",
                      marginBottom: 8,
                    }}
                  >
                    {picked.category.replaceAll("_", " ")}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileSheetOpen(false);
                    setMobileSheetExpanded(false);
                    setPicked(null);
                  }}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "none",
                    background: "#f1f5f9",
                    color: "#0f172a",
                    fontSize: 20,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              </div>
            
            {mobileSheetExpanded && (
              <div
                style={{
                  overflowY: "auto",
                  padding: "0 14px 14px",
                }}
              >
                {picked.imageUrl && (
                  <img
                    src={picked.imageUrl}
                    alt={picked.name}
                    style={{
                      width: "100%",
                      height: mobileSheetExpanded ? 150 : 110,
                      objectFit: "cover",
                      borderRadius: 14,
                      display: "block",
                      marginBottom: 12,
                    }}
                  />
                )}

                <div
                  style={{
                    fontSize: 14,
                    color: "#334155",
                    lineHeight: 1.5,
                    marginBottom: 12,
                  }}
                >
                  {picked.description}
                </div>

                {picked.hours && (
                  <div
                    style={{
                      fontSize: 14,
                      color: "#0f172a",
                      marginBottom: 14,
                    }}
                  >
                    <strong>Hours:</strong> {picked.hours}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <button
                    disabled={!picked.has360View}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "none",
                      background: picked.has360View ? "#38bdf8" : "#94a3b8",
                      color: "#0f172a",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: picked.has360View ? "pointer" : "not-allowed",
                    }}
                  >
                    Open 360 View
                  </button>

                  <button
                    onClick={handleNavigateHere}
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "none",
                      background: "#f59e0b",
                      color: "#111827",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    {(() => {
                      const targetNode = picked
                        ? picked.poiId
                          ? PLACE_TO_ROUTE_NODE[picked.poiId]
                          : PLACE_TO_ROUTE_NODE[picked.meshName]
                        : "";

                      const isSameRouteShown =
                        !!picked &&
                        !!currentLocationNode &&
                        startNode === currentLocationNode &&
                        endNode === targetNode &&
                        activeRoute.length > 0;

                      return isSameRouteShown ? "Clear Route" : "Navigate Here";
                    })()}
                  </button>
                </div>
              </div>
            )}
            </div>
          )}
        
        {activeLabel && !isMobile && (
          <div
            style={{
              position: "absolute",
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 20,  //20
              padding: "8px 14px",
              borderRadius: 999,
              background: "rgba(15, 23, 42, 0.9)",
              color: "#ffffff",
              fontFamily: "system-ui",
              fontSize: 14,
              fontWeight: 600,
              pointerEvents: "none",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            }}
          >
            {activeLabel}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            right: 18,
            bottom: isMobile && picked && mobileSheetOpen ? 240 : 18,
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <button
            onClick={() => {
              setPicked(null);
              setHovered(null);
              setResetViewSignal((v) => v + 1);
            }}
            title="Reset view"
            aria-label="Reset view"
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.95)",
              color: "#0f172a",
              fontSize: 24,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}
          >
            ⟳
          </button>

          <button
            onClick={() => {
              setPicked(null);
              setHovered(null);
              setViewMode((v) => (v === "3D" ? "2D" : "3D"));
            }}
            title={`Switch to ${viewMode === "3D" ? "2D" : "3D"} view`}
            aria-label={`Switch to ${viewMode === "3D" ? "2D" : "3D"} view`}
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.95)",
              color: "#0f172a",
              fontSize: 14,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(8px)",
              letterSpacing: 0.3,
            }}
          >
            {viewMode === "3D" ? "2D" : "3D"}
          </button>
        </div>

        <Canvas
          camera={{ fov: 50 }}
          onCreated={({ camera, gl, scene }) => {
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            (camera as THREE.PerspectiveCamera).near = 0.01;
            (camera as THREE.PerspectiveCamera).far = 100000;
            camera.updateProjectionMatrix();

            scene.background = new THREE.Color("#ffffff");
            scene.fog = new THREE.Fog(0xffffff, 400, 3000);
          }}
        >
          <ambientLight intensity={1} />
          <directionalLight position={[30, 50, 30]} intensity={1.2} />
          <directionalLight position={[-30, 30, -20]} intensity={0.6} />

          <RouteLines edges={activeRouteEdges} color="#ec1515" />
          <RouteDots />

          {currentLocationNode && <CurrentLocationPin nodeId={currentLocationNode} />}

          <GrassBase rootObject={campusRoot} />

          <BuildingTopLabels
            rootObject={campusRoot}
            onPickPoi={(poi) => {
              if (!campusRoot) return;

              const matchedObj = campusRoot.getObjectByName(poi.parentMeshName);
              if (!matchedObj) return;

              const poiPosition = getPoiWorldPosition(campusRoot, poi);
              if (!poiPosition) return;

              setPicked({
                name: poi.label,
                uuid: matchedObj.uuid,
                meshName: poi.parentMeshName,
                point: poiPosition,
                description: poi.description,
                category: poi.category,
                has360View: poi.has360View,
                imageUrl: poi.imageUrl,
                hours: poi.hours,
                poiId: poi.id,
              });

              setHovered(null);
              setSearchText(poi.label);
              setSearchOpen(false);

              if (isMobile) {
                setLocationPanelOpen(false);
                setMobileSheetOpen(true);
                setMobileSheetExpanded(true);
              }
            }}
          />

          <CampusModel
            pickedUuid={picked?.uuid ?? null}
            hoveredUuid={hovered?.uuid ?? null}
            onPick={(p) => {
              if (picked?.uuid === p.uuid) {
                setPicked(null);
                if (isMobile) {
                  setMobileSheetOpen(false);
                  setMobileSheetExpanded(false);
                }
              } else {
                setPicked(p);
                if (isMobile) {
                  setLocationPanelOpen(false);
                  setMobileSheetOpen(true);
                  setMobileSheetExpanded(true);
                }
              }
            }}
            onHover={(p) => setHovered(p)}
            onHoverOut={() => setHovered(null)}
            onReadyRoot={(obj) => setCampusRoot(obj)}
          />

          <FocusCameraOnSelection
            selectedUuid={picked?.uuid ?? null}
            selectedPoint={picked?.point ?? null}
            selectedPoiId={picked?.poiId ?? null}
            rootObject={campusRoot}
            routeActive={activeRoute.length > 0}
          />

          <FocusCameraOnRoute
            rootObject={campusRoot}
            activeRoute={activeRoute}
          />

          <ApplyViewMode
            rootObject={campusRoot}
            viewMode={viewMode}
            resetSignal={resetViewSignal}
          />

          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            enableRotate={viewMode === "3D"}
            minPolarAngle={viewMode === "3D" ? 0.35 : 0.001}
            maxPolarAngle={viewMode === "3D" ? Math.PI / 2 - 0.15 : 0.001}
            minDistance={80}
            maxDistance={600}
            enablePan={true}
            screenSpacePanning={true}
            mouseButtons={{
              LEFT: viewMode === "2D" ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: THREE.MOUSE.PAN,
            }}
            touches={{
              ONE: viewMode === "2D" ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE,
              TWO: THREE.TOUCH.DOLLY_PAN,
            }}
          />
        </Canvas>
      </div>
    
      <p className="mt-4 p-3 bg-white rounded-xl text-center text-slate-500 text-sm border border-slate-200">
        🖱️ Click + drag to look around • 🔍 Scroll to zoom
      </p>
    </div>
    </main>
  );
}

/* Preload model */
useGLTF.preload("/maps/topoexport_3D_modeling.glb");