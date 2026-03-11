'use client';

import { usePlayerStore } from '@/store/usePlayerStore';
import { useState, useCallback } from 'react';

/**
 * Hook that provides auth-gated action wrapper.
 * If user is not logged in, opens the auth modal.
 * Usage: const { requireAuth, showAuthModal, setShowAuthModal } = useAuthGuard();
 * Then: requireAuth(() => { ...do authenticated action... });
 */
export function useAuthGuard() {
  const { user } = usePlayerStore();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const requireAuth = useCallback(
    (action: () => void) => {
      if (user) {
        action();
      } else {
        setShowAuthModal(true);
      }
    },
    [user]
  );

  return { requireAuth, showAuthModal, setShowAuthModal, isAuthenticated: !!user };
}
