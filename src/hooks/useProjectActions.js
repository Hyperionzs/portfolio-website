import { useCallback } from 'react';
import { db, serverTimestamp } from '../config/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import { checkAuth } from '../components/admin_auth/authUtils';
import { validateProject, parseTagsString, isValidUrl } from '../utils/projectHelpers';

/**
 * Hook encapsulating all project CRUD actions.
 *
 * @param {Object} state  – Mutable refs / setters shared with the host component.
 * @param {Function} state.setProjects
 * @param {Function} state.setProjectHistory
 * @param {Function} state.showNotification
 * @param {Function} state.onAddProject       – Parent callback (projects, isDelete, isUpdate)
 * @param {Function} state.resetForm          – Clears the add/edit form
 */
export function useProjectActions({
  projects,
  setProjects,
  setProjectHistory,
  showNotification,
  onAddProject,
  resetForm,
  setActiveTab,
}) {
  // ─── Add Project ─────────────────────────────────────────────
  const addProjectWithImage = useCallback(
    async (newProject, imageData) => {
      const tagsArray = parseTagsString(newProject.tags);
      const projectData = {
        title: newProject.title,
        desc: newProject.desc,
        img: imageData,
        github: newProject.github || '',
        demo: newProject.demo || '',
        tags: tagsArray,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        featured: Boolean(newProject.featured),
      };

      const { isValid, errors, formattedProject } = validateProject(projectData);
      if (!isValid) {
        showNotification(`Invalid project data: ${errors.join(', ')}`, 'error');
        return;
      }

      try {
        const docRef = await addDoc(collection(db, 'projects'), formattedProject);
        const ts = new Date().toISOString();
        const projectWithId = { ...formattedProject, id: docRef.id, createdAt: ts, updatedAt: ts };
        setProjects((prev) => [...prev, projectWithId]);
        await addDoc(collection(db, 'history'), {
          project: JSON.parse(JSON.stringify(projectWithId)),
          action: 'added',
          timestamp: ts,
        });
        onAddProject?.(projectWithId);
        resetForm();
        showNotification(`Project "${projectWithId.title}" added successfully!`);
      } catch (error) {
        console.error('Error adding project:', error);
        showNotification('Error saving project to database', 'error');
      }
    },
    [showNotification, onAddProject, resetForm, setProjects],
  );

  // ─── Update Project ──────────────────────────────────────────
  const finalizeProjectUpdate = useCallback(
    async (updatedProject) => {
      const { isValid, errors, formattedProject } = validateProject(updatedProject, { isUpdate: true });
      if (!isValid) {
        showNotification(`Invalid project data: ${errors.join(', ')}`, 'error');
        return;
      }

      try {
        await updateDoc(doc(db, 'projects', formattedProject.id), formattedProject);
        const updatedProjects = projects.map((p) => (p.id === formattedProject.id ? formattedProject : p));
        setProjects(updatedProjects);
        await addDoc(collection(db, 'history'), {
          project: JSON.parse(JSON.stringify(formattedProject)),
          action: 'edited',
          timestamp: new Date().toISOString(),
        });
        onAddProject?.(updatedProjects, false, true);
        resetForm();
        setActiveTab?.('display');
        showNotification(`Project "${formattedProject.title}" updated successfully!`);
      } catch (error) {
        console.error('Error updating project:', error);
        showNotification('Error updating project in database', 'error');
      }
    },
    [projects, showNotification, onAddProject, resetForm, setActiveTab, setProjects],
  );

  const handleUpdateProject = useCallback(
    (editIndex, newProject, newImage) => {
      if (editIndex === null) return;
      const oldProject = JSON.parse(JSON.stringify(projects[editIndex]));
      const tagsArray = parseTagsString(newProject.tags);
      const updatedProject = {
        title: newProject.title,
        desc: newProject.desc,
        img: oldProject.img || 'https://source.unsplash.com/random/400x300?tech',
        github: newProject.github || '',
        demo: newProject.demo || '',
        tags: tagsArray,
        createdAt: oldProject.createdAt,
        updatedAt: serverTimestamp(),
        id: oldProject.id,
        featured: Boolean(newProject.featured),
      };

      const { isValid, errors } = validateProject(updatedProject, { isUpdate: true });
      if (!isValid) {
        showNotification(`Invalid project data: ${errors.join(', ')}`, 'error');
        return;
      }

      if (newImage) {
        const reader = new FileReader();
        reader.onloadend = () => finalizeProjectUpdate({ ...updatedProject, img: reader.result });
        reader.readAsDataURL(newImage);
      } else {
        finalizeProjectUpdate(updatedProject);
      }
    },
    [projects, showNotification, finalizeProjectUpdate],
  );

  // ─── Delete Project ──────────────────────────────────────────
  const handleConfirmDelete = useCallback(
    async (deleteIndex) => {
      const auth = checkAuth();
      if (!auth.isAuthenticated) {
        showNotification('Error: You must be logged in to delete projects', 'error');
        return false;
      }
      if (deleteIndex === null || deleteIndex === undefined || !projects?.length) {
        showNotification('Error: Invalid project selection', 'error');
        return false;
      }
      if (deleteIndex < 0 || deleteIndex >= projects.length) {
        showNotification('Error: Project index out of bounds', 'error');
        return false;
      }

      const projectToDelete = projects[deleteIndex];
      if (!projectToDelete) {
        showNotification('Error: Cannot find project', 'error');
        return false;
      }

      try {
        if (!projectToDelete.id) {
          const querySnapshot = await getDocs(collection(db, 'projects'));
          let docToDelete = null;
          querySnapshot.forEach((d) => {
            const data = d.data();
            if (data.title === projectToDelete.title && data.desc === projectToDelete.desc) docToDelete = d;
          });
          if (docToDelete) {
            await deleteDoc(doc(db, 'projects', docToDelete.id));
            projectToDelete.id = docToDelete.id;
          } else {
            throw new Error('Could not find matching document in Firestore');
          }
        } else {
          await deleteDoc(doc(db, 'projects', projectToDelete.id));
        }

        const updatedProjects = projects.filter((_, i) => i !== deleteIndex);
        setProjects(updatedProjects);
        const ts = new Date().toISOString();
        const historyEntry = {
          project: JSON.parse(JSON.stringify(projectToDelete)),
          action: 'deleted',
          timestamp: ts,
          id: `history-${Date.now()}`,
        };
        setProjectHistory((prev) => [...prev, historyEntry]);
        onAddProject?.(updatedProjects, true);
        showNotification(`Project "${projectToDelete.title}" deleted.`, 'warning');
        return true;
      } catch (error) {
        console.error('Error deleting project:', error);
        showNotification(`Error deleting project: ${error.message}`, 'error');
        return false;
      }
    },
    [projects, showNotification, onAddProject, setProjects, setProjectHistory],
  );

  // ─── Toggle Featured ─────────────────────────────────────────
  const toggleFeatured = useCallback(
    (index) => {
      const updatedProjects = [...projects];
      const project = updatedProjects[index];
      const previousProject = { ...project };
      project.featured = !project.featured;

      try {
        updateDoc(doc(db, 'projects', project.id), { featured: project.featured, updatedAt: serverTimestamp() });
        const ts = new Date().toISOString();
        project.updatedAt = ts;
        setProjects(updatedProjects);
        setProjectHistory((prev) => [
          ...prev,
          {
            project: JSON.parse(JSON.stringify(project)),
            previousProject: JSON.parse(JSON.stringify(previousProject)),
            action: 'edited',
            changes: { featured: { from: previousProject.featured, to: project.featured } },
            timestamp: ts,
            id: `history-${Date.now()}`,
          },
        ]);
        showNotification(
          `Project "${project.title}" ${project.featured ? 'marked as featured' : 'removed from featured'}`,
          'info',
        );
      } catch (error) {
        console.error('Error updating featured status:', error);
        showNotification('Error updating featured status', 'error');
      }
    },
    [projects, showNotification, setProjects, setProjectHistory],
  );

  // ─── Duplicate ───────────────────────────────────────────────
  const duplicateProject = useCallback(
    (index) => {
      const original = JSON.parse(JSON.stringify(projects[index]));
      const ts = new Date().toISOString();
      const duplicated = { ...original, title: `${original.title} (Copy)`, id: `project-${Date.now()}`, createdAt: ts, updatedAt: ts };
      setProjects((prev) => [...prev, duplicated]);
      setProjectHistory((prev) => [...prev, { project: duplicated, action: 'added', timestamp: ts, id: `history-${Date.now()}` }]);
      showNotification(`Project "${original.title}" duplicated.`);
    },
    [projects, showNotification, setProjects, setProjectHistory],
  );

  // ─── Restore from History ────────────────────────────────────
  const restoreFromHistory = useCallback(
    (entry) => {
      if (entry.action !== 'deleted') return;
      const ts = new Date().toISOString();
      const restored = { ...entry.project, updatedAt: ts };
      setProjects((prev) => [...prev, restored]);
      setProjectHistory((prev) => [
        ...prev,
        { project: JSON.parse(JSON.stringify(restored)), action: 'restored', timestamp: ts, id: `history-${Date.now()}` },
      ]);
      showNotification(`Project "${restored.title}" restored`);
    },
    [showNotification, setProjects, setProjectHistory],
  );

  // ─── Submit Handler ──────────────────────────────────────────
  const handleSubmit = useCallback(
    (e, newProject, isEditing, editIndex, newImage) => {
      e.preventDefault();
      if (!newProject.title || !newProject.desc) {
        showNotification('Please fill in all required fields (title and description)', 'error');
        return;
      }
      if (newProject.github && !isValidUrl(newProject.github)) {
        showNotification('Please enter a valid GitHub URL', 'error');
        return;
      }
      if (newProject.demo && !isValidUrl(newProject.demo)) {
        showNotification('Please enter a valid Demo URL', 'error');
        return;
      }

      if (isEditing) {
        handleUpdateProject(editIndex, newProject, newImage);
        return;
      }

      if (newImage) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            await addProjectWithImage(newProject, reader.result);
          } catch {
            showNotification('Failed to save project.', 'error');
          }
        };
        reader.onerror = () => showNotification('Error reading image file.', 'error');
        reader.readAsDataURL(newImage);
      } else {
        addProjectWithImage(newProject, 'https://source.unsplash.com/random/400x300?tech').catch(() =>
          showNotification('Failed to save project.', 'error'),
        );
      }
    },
    [showNotification, handleUpdateProject, addProjectWithImage],
  );

  return {
    addProjectWithImage,
    handleUpdateProject,
    handleConfirmDelete,
    toggleFeatured,
    duplicateProject,
    restoreFromHistory,
    handleSubmit,
  };
}
