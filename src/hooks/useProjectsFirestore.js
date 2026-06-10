import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { mapDocToProject } from '../utils/projectHelpers';

/**
 * Hook that manages Firestore projects & history data,
 * including initial fetch and realtime sync via onSnapshot.
 */
export function useProjectsFirestore(onError) {
  const [projects, setProjects] = useState([]);
  const [projectHistory, setProjectHistory] = useState([]);

  useEffect(() => {
    // ── Initial Fetch ──────────────────────────────────────────
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        setProjects(querySnapshot.docs.map(mapDocToProject));
      } catch (error) {
        if (error.name !== 'BloomFilterError') onError?.('Error loading projects from database');
      }
    };

    const fetchHistory = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'history'));
        const historyData = querySnapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
        historyData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setProjectHistory(historyData);
      } catch (error) {
        console.error('Error loading history:', error);
      }
    };

    fetchProjects();
    fetchHistory();

    // ── Realtime Listeners ─────────────────────────────────────
    const unsubProjects = onSnapshot(
      collection(db, 'projects'),
      (snapshot) => {
        const changes = snapshot.docChanges().map((change) => ({
          type: change.type,
          doc: mapDocToProject(change.doc),
        }));
        if (changes.length > 0) {
          setProjects((prev) => applySnapshotChanges(prev, changes));
        }
      },
      (error) => {
        if (error.name !== 'BloomFilterError') onError?.('Error syncing with database');
      },
    );

    const unsubHistory = onSnapshot(collection(db, 'history'), (snapshot) => {
      const changes = snapshot.docChanges().map((change) => ({
        type: change.type,
        doc: { ...change.doc.data(), id: change.doc.id },
      }));
      if (changes.length > 0) {
        setProjectHistory((prev) => {
          const updated = applySnapshotChanges(prev, changes);
          return updated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        });
      }
    });

    return () => {
      unsubProjects();
      unsubHistory();
    };
  }, []);

  return { projects, setProjects, projectHistory, setProjectHistory };
}

// ── Helper: Apply Firestore docChanges to a local array ──
function applySnapshotChanges(prev, changes) {
  let updated = [...prev];
  changes.forEach(({ type, doc }) => {
    if (type === 'added') {
      if (!updated.some((item) => item.id === doc.id)) updated.push(doc);
    } else if (type === 'modified') {
      const idx = updated.findIndex((item) => item.id === doc.id);
      if (idx !== -1) updated[idx] = doc;
    } else if (type === 'removed') {
      updated = updated.filter((item) => item.id !== doc.id);
    }
  });
  return updated;
}
