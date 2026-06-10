import { useState, useCallback } from 'react';
import { db, serverTimestamp } from '../config/firebase';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { checkAuth } from '../components/admin_auth/authUtils';

/**
 * Hook for bulk project selection and actions (delete, toggle featured).
 */
export function useBulkActions({ projects, setProjects, setProjectHistory, showNotification, onAddProject }) {
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);

  const toggleProjectSelection = useCallback((projectId, e) => {
    if (e) e.stopPropagation();
    setSelectedProjects((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId],
    );
  }, []);

  const selectProject = useCallback(
    (projectId, e) => {
      if (!bulkActionMode) return;
      e.preventDefault();
      e.stopPropagation();
      toggleProjectSelection(projectId);
    },
    [bulkActionMode, toggleProjectSelection],
  );

  const handleBulkDelete = useCallback(async () => {
    const auth = checkAuth();
    if (!auth.isAuthenticated) {
      showNotification('You must be logged in to delete projects', 'error');
      return;
    }
    if (selectedProjects.length === 0) return;
    if (!window.confirm(`Delete ${selectedProjects.length} selected projects?`)) return;

    const ts = new Date().toISOString();
    const deletedProjects = projects.filter((p) => selectedProjects.includes(p.id));
    try {
      for (const project of deletedProjects) await deleteDoc(doc(db, 'projects', project.id));
      const historyEntries = deletedProjects.map((project) => ({
        project: JSON.parse(JSON.stringify(project)),
        action: 'deleted',
        timestamp: ts,
        id: `history-bulk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      }));
      setProjectHistory((prev) => [...prev, ...historyEntries]);
      const updatedProjects = projects.filter((p) => !selectedProjects.includes(p.id));
      setProjects(updatedProjects);
      onAddProject?.(updatedProjects, true);
      setSelectedProjects([]);
      setBulkActionMode(false);
      showNotification(`Deleted ${deletedProjects.length} projects successfully`, 'warning');
    } catch (error) {
      console.error('Error deleting projects:', error);
      showNotification('Error deleting projects from database', 'error');
    }
  }, [selectedProjects, projects, showNotification, onAddProject, setProjects, setProjectHistory]);

  const handleBulkToggleFeatured = useCallback(
    (setFeatured) => {
      if (selectedProjects.length === 0) return;
      const ts = new Date().toISOString();
      const updatedProjects = [...projects];
      const historyEntries = [];
      const promises = selectedProjects.map((projectId) => {
        const idx = updatedProjects.findIndex((p) => p.id === projectId);
        if (idx !== -1 && updatedProjects[idx].featured !== setFeatured) {
          const prev = { ...updatedProjects[idx] };
          updatedProjects[idx].featured = setFeatured;
          updatedProjects[idx].updatedAt = ts;
          historyEntries.push({
            project: JSON.parse(JSON.stringify(updatedProjects[idx])),
            previousProject: JSON.parse(JSON.stringify(prev)),
            action: 'edited',
            timestamp: ts,
            id: `history-bulk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          });
          return updateDoc(doc(db, 'projects', projectId), { featured: setFeatured, updatedAt: serverTimestamp() });
        }
        return Promise.resolve();
      });

      Promise.all(promises)
        .then(() => {
          setProjects(updatedProjects);
          setProjectHistory((prev) => [...prev, ...historyEntries]);
          setSelectedProjects([]);
          setBulkActionMode(false);
          showNotification(
            `${historyEntries.length} projects ${setFeatured ? 'marked as featured' : 'removed from featured'}`,
            'info',
          );
        })
        .catch((error) => {
          console.error('Error updating featured:', error);
          showNotification('Error updating featured status', 'error');
        });
    },
    [selectedProjects, projects, showNotification, setProjects, setProjectHistory],
  );

  const exitBulkMode = useCallback(() => {
    setBulkActionMode(false);
    setSelectedProjects([]);
  }, []);

  return {
    bulkActionMode,
    setBulkActionMode,
    selectedProjects,
    toggleProjectSelection,
    selectProject,
    handleBulkDelete,
    handleBulkToggleFeatured,
    exitBulkMode,
  };
}
