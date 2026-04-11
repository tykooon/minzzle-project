import { useState } from 'react';

export function useTutorialSession(gameKey: string): { shouldShow: boolean; dismiss: () => void } {
  const storageKey = `tutorial_seen_${gameKey}`;

  const [shouldShow] = useState<boolean>(
    () => !sessionStorage.getItem(storageKey)
  );

  const [dismissed, setDismissed] = useState(false);

  const dismiss = () => {
    sessionStorage.setItem(storageKey, '1');
    setDismissed(true);
  };

  return { shouldShow: shouldShow && !dismissed, dismiss };
}
