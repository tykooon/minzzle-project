export type TutorialAllowedAction =
  | { kind: 'fives-step'; nodeId: number }
  | { kind: 'swipes-swipe'; lineType: 'row' | 'col'; lineIndex: number }
  | { kind: 'hex-swipe'; axis: 'horizontal' | 'diagL' | 'diagR'; lineIndex: number };

export interface TutorialStep {
  hint: string;
  allowedAction: TutorialAllowedAction;
}

export interface TutorialScript {
  gameKey: 'fives' | 'swipes' | 'hex';
  steps: TutorialStep[];
}
