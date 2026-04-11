import type { HexLevelData } from '@/games/minzzle-swipes-hex/engine/types';
import type { TutorialScript } from '../types';

export const HEX_TUTORIAL_LEVEL: HexLevelData = {
  schemaVersion: 1,
  title: '',
  side: 2,
  colors: ['#2D63D9', '#D9B300', '#27A84A', '#D92B2F', '#F08A12', '#B8C0CC'],
  scrambleMoves: [{ axis: 'horizontal', lineIndex: 0 }],
};

export const HEX_TUTORIAL_SCRIPT: TutorialScript = {
  gameKey: 'hex',
  steps: [
    {
      hint: 'Swipe along a horizontal or diagonal line to rotate it. Swipe the center horizontal line to restore the colors.',
      allowedAction: { kind: 'hex-swipe', axis: 'horizontal', lineIndex: 0 },
    },
  ],
};
