import type { TutorialStep } from './types';

interface TutorialOverlayProps {
  step: TutorialStep;
  stepIndex: number;
  totalSteps: number;
  onSkip: () => void;
}

export function TutorialOverlay({ step, stepIndex, totalSteps, onSkip }: TutorialOverlayProps) {
  return (
    <div className="absolute inset-0 z-40 pointer-events-none">
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute bottom-24 left-4 right-4 pointer-events-auto bg-background/95 border border-border rounded-xl p-4 shadow-xl">
        <p className="font-body text-sm text-foreground">{step.hint}</p>
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-muted-foreground">{stepIndex + 1} / {totalSteps}</span>
          <button
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tutorial
          </button>
        </div>
      </div>
    </div>
  );
}
