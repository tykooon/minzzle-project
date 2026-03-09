// Sample 6x4 rectangular grid level for Fillby5
// 6 columns x 4 rows = 24 nodes
// Horizontal edges: 5*4 = 20, Vertical edges: 6*3 = 18, Total = 38... not divisible by 5
// Let's use 5x3 grid: 15 nodes, horizontal: 4*3=12, vertical: 5*2=10, total=22... no
// 4x3: 12 nodes, h: 3*3=9, v: 4*2=8 = 17... no
// 5x2: 10 nodes, h: 4*2=8, v: 5*1=5 = 13... no
// 3x2: 6 nodes, h: 2*2=4, v: 3*1=3 = 7... no
// 6x2: 12 nodes, h: 5*2=10, v: 6*1=6 = 16... no
// 4x2: 8 nodes, h: 3*2=6, v: 4*1=4 = 10 ✓ (2 moves of 5)
// Let's also make a bigger one: 5x3: add some diagonals to make 25 edges (5 moves)

import { LevelData, LevelMeta } from '../engine/types';

// 4x2 grid: 8 nodes, 10 edges (2 moves)
const level001: LevelData = {
  schemaVersion: 1,
  moveLen: 5,
  nodes: [
    { id: 0, x: 0, y: 0 }, { id: 1, x: 1, y: 0 }, { id: 2, x: 2, y: 0 }, { id: 3, x: 3, y: 0 },
    { id: 4, x: 0, y: 1 }, { id: 5, x: 1, y: 1 }, { id: 6, x: 2, y: 1 }, { id: 7, x: 3, y: 1 },
  ],
  edges: [
    // horizontal top
    { id: 0, a: 0, b: 1 }, { id: 1, a: 1, b: 2 }, { id: 2, a: 2, b: 3 },
    // horizontal bottom
    { id: 3, a: 4, b: 5 }, { id: 4, a: 5, b: 6 }, { id: 5, a: 6, b: 7 },
    // vertical
    { id: 6, a: 0, b: 4 }, { id: 7, a: 1, b: 5 }, { id: 8, a: 2, b: 6 }, { id: 9, a: 3, b: 7 },
  ],
};

// 3x3 grid with diagonals for 20 edges (4 moves)
const level002: LevelData = {
  schemaVersion: 1,
  moveLen: 5,
  nodes: [
    { id: 0, x: 0, y: 0 }, { id: 1, x: 1, y: 0 }, { id: 2, x: 2, y: 0 },
    { id: 3, x: 0, y: 1 }, { id: 4, x: 1, y: 1 }, { id: 5, x: 2, y: 1 },
    { id: 6, x: 0, y: 2 }, { id: 7, x: 1, y: 2 }, { id: 8, x: 2, y: 2 },
  ],
  edges: [
    // horizontal
    { id: 0, a: 0, b: 1 }, { id: 1, a: 1, b: 2 },
    { id: 2, a: 3, b: 4 }, { id: 3, a: 4, b: 5 },
    { id: 4, a: 6, b: 7 }, { id: 5, a: 7, b: 8 },
    // vertical
    { id: 6, a: 0, b: 3 }, { id: 7, a: 1, b: 4 }, { id: 8, a: 2, b: 5 },
    { id: 9, a: 3, b: 6 }, { id: 10, a: 4, b: 7 }, { id: 11, a: 5, b: 8 },
    // diagonals (top-left to bottom-right)
    { id: 12, a: 0, b: 4 }, { id: 13, a: 1, b: 5 },
    { id: 14, a: 3, b: 7 }, { id: 15, a: 4, b: 8 },
    // diagonals (top-right to bottom-left)
    { id: 16, a: 1, b: 3 }, { id: 17, a: 2, b: 4 },
    { id: 18, a: 4, b: 6 }, { id: 19, a: 5, b: 7 },
  ],
};

// 5x3 grid: 15 nodes, h:4*3=12, v:5*2=10, total=22... not div by 5
// 5x3 + 3 diags = 25 edges (5 moves)
const level003: LevelData = {
  schemaVersion: 1,
  moveLen: 5,
  nodes: [
    { id: 0, x: 0, y: 0 }, { id: 1, x: 1, y: 0 }, { id: 2, x: 2, y: 0 }, { id: 3, x: 3, y: 0 }, { id: 4, x: 4, y: 0 },
    { id: 5, x: 0, y: 1 }, { id: 6, x: 1, y: 1 }, { id: 7, x: 2, y: 1 }, { id: 8, x: 3, y: 1 }, { id: 9, x: 4, y: 1 },
    { id: 10, x: 0, y: 2 }, { id: 11, x: 1, y: 2 }, { id: 12, x: 2, y: 2 }, { id: 13, x: 3, y: 2 }, { id: 14, x: 4, y: 2 },
  ],
  edges: [
    // horizontal row 0
    { id: 0, a: 0, b: 1 }, { id: 1, a: 1, b: 2 }, { id: 2, a: 2, b: 3 }, { id: 3, a: 3, b: 4 },
    // horizontal row 1
    { id: 4, a: 5, b: 6 }, { id: 5, a: 6, b: 7 }, { id: 6, a: 7, b: 8 }, { id: 7, a: 8, b: 9 },
    // horizontal row 2
    { id: 8, a: 10, b: 11 }, { id: 9, a: 11, b: 12 }, { id: 10, a: 12, b: 13 }, { id: 11, a: 13, b: 14 },
    // vertical col 0-4
    { id: 12, a: 0, b: 5 }, { id: 13, a: 1, b: 6 }, { id: 14, a: 2, b: 7 }, { id: 15, a: 3, b: 8 }, { id: 16, a: 4, b: 9 },
    { id: 17, a: 5, b: 10 }, { id: 18, a: 6, b: 11 }, { id: 19, a: 7, b: 12 }, { id: 20, a: 8, b: 13 }, { id: 21, a: 9, b: 14 },
    // 3 diagonals to reach 25
    { id: 22, a: 0, b: 6 }, { id: 23, a: 2, b: 8 }, { id: 24, a: 7, b: 11 },
  ],
};

export const LEVELS: LevelData[] = [level001, level002, level003];

export const LEVEL_METAS: LevelMeta[] = [
  { id: 'level-001', name: 'First Steps', difficulty: 1, edgeCount: 10 },
  { id: 'level-002', name: 'Crossroads', difficulty: 2, edgeCount: 20 },
  { id: 'level-003', name: 'Wide Grid', difficulty: 3, edgeCount: 25 },
];
