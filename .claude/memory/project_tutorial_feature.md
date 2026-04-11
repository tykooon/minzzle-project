---
name: Tutorial Feature Branch State
description: State of the feature/tutorial-pages branch — tutorial files exist but page integrations were accidentally lost and need to be redone
type: project
originSessionId: 066b104f-cdec-445d-aab1-48b4c71fbf42
---
The `feature/tutorial-pages` branch holds in-progress tutorial work. It is NOT meant for production/main.

## What is committed on `feature/tutorial-pages`
- `web/src/tutorial/TutorialOverlay.tsx` — overlay UI component
- `web/src/tutorial/types.ts` — TutorialScript, TutorialStep types
- `web/src/tutorial/useTutorialSession.ts` — hook that tracks whether a tutorial should be shown (uses sessionStorage key per game id, e.g. `'fives'`, `'swipes'`, `'hex'`)
- `web/src/tutorial/scripts/fivesTutorial.ts` — builds TutorialScript from a Fives level's solutionJson; gates wrong first-node taps
- `web/src/tutorial/scripts/swipesTutorial.ts` — exports `SWIPES_TUTORIAL_LEVEL` and `SWIPES_TUTORIAL_SCRIPT`
- `web/src/tutorial/scripts/hexTutorial.ts` — exports `HEX_TUTORIAL_LEVEL` and `HEX_TUTORIAL_SCRIPT`

## What is MISSING (needs to be redone)
The three play pages were integrated with tutorial support but those changes were **accidentally lost** (reverted on main before being committed to the feature branch). The following files need to be re-wired on `feature/tutorial-pages`:

### `web/src/pages/MinzzleFivesPlayPage.tsx`
- Import `useTutorialSession`, `TutorialOverlay`, `TutorialScript`, `buildFivesTutorialScript`
- `MinzzleFivesGame` props: add optional `tutorialScript?: TutorialScript` and `onTutorialDismiss?: () => void`
- Inside `MinzzleFivesGame`: add `tutorialStep` state, `tutorialDispatch` (gates wrong first-node taps), advance step on `state.history.length` change, render `<TutorialOverlay>` when step is active
- In `MinzzleFivesPlayPage`: call `useTutorialSession('fives')`, fetch tutorial level `001`, if `shouldShow` render `MinzzleFivesGame` with tutorial props

### `web/src/pages/MinzzleSwipesPlayPage.tsx`
- Import `useTutorialSession`, `TutorialOverlay`, `TutorialScript`, `SWIPES_TUTORIAL_LEVEL`, `SWIPES_TUTORIAL_SCRIPT`
- `SwipesGame` props: add optional `tutorialScript` and `onTutorialDismiss`
- Inside `SwipesGame`: add `tutorialStep` state, `tutorialDispatch` (gates wrong row/col swipe by checking `allowed.lineType` and `allowed.lineIndex`), advance step on `state.moveCount` change, render `<TutorialOverlay>`; hide win overlay when tutorial is active (`state.won && !tutorialScript`)
- In `MinzzleSwipesPlayPage`: call `useTutorialSession('swipes')`, if `shouldShow` return `<SwipesGame levelId="tutorial" levelData={SWIPES_TUTORIAL_LEVEL} tutorialScript={...} onTutorialDismiss={dismiss} />`

### `web/src/pages/MinzzleSwipesHexPlayPage.tsx`
- Same pattern as SwipesPlayPage but import from `hexTutorial`, use `useTutorialSession('hex')`, gate swipes by `allowed.axis` and `allowed.lineIndex`, advance on `state.moveCount`

## Why: tutorials are incomplete and not ready for prod. Keep all tutorial work on `feature/tutorial-pages` only.
