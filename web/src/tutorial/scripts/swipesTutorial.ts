import type { SwipesLevelData } from '@/games/minzzle-swipes/engine/types';
import type { TutorialScript } from '../types';

export const SWIPES_TUTORIAL_LEVEL: SwipesLevelData = {
  schemaVersion: 1,
  title: '',
  board: {
    rows: 2,
    cols: 2,
    solved: [
      ['#2D63D9', '#D9B300'],
      ['#D92B2F', '#27A84A'],
    ],
    scrambleMoves: [{ type: 'row', index: 0 }],
  },
};

export const SWIPES_TUTORIAL_SCRIPT: TutorialScript = {
  gameKey: 'swipes',
  steps: [
    {
      hint: 'Swipe a row or column to rotate it. Swipe the top row to the right to solve the puzzle.',
      allowedAction: { kind: 'swipes-swipe', lineType: 'row', lineIndex: 0 },
    },
  ],
};
