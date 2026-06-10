import { useState, useEffect, useCallback } from 'react';
import { db, serverTimestamp } from '../config/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const SETTINGS_DOC = doc(db, 'settings', 'profile');

/**
 * Hook to read/write the hero profile photo stored in Firestore `settings/profile`.
 * Returns { profilePhoto, isLoading, saveProfilePhoto }.
 */
export function useProfilePhoto() {
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Realtime listener so HeroSS updates instantly
  useEffect(() => {
    const unsub = onSnapshot(
      SETTINGS_DOC,
      (snap) => {
        setProfilePhoto(snap.exists() ? snap.data().photoUrl || null : null);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error listening to profile photo:', error);
        setIsLoading(false);
      },
    );
    return unsub;
  }, []);

  const saveProfilePhoto = useCallback(async (photoUrl) => {
    try {
      await setDoc(SETTINGS_DOC, { photoUrl, updatedAt: serverTimestamp() }, { merge: true });
      return true;
    } catch (error) {
      console.error('Error saving profile photo:', error);
      return false;
    }
  }, []);

  return { profilePhoto, isLoading, saveProfilePhoto };
}
