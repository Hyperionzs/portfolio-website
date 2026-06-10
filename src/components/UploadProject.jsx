import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, serverTimestamp } from '../config/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { checkAuth } from './admin_auth/authUtils';

// Extracted utilities & hooks
import { isValidUrl, validateProject, normalizeFirestoreTimestamp, mapDocToProject, getAllTags, parseTagsString, validateProjectDates } from '../utils/projectHelpers';
import { useNotification } from '../hooks/useNotification';
import { useImageUpload } from '../hooks/useImageUpload';

// Extracted sub-components
import { NotificationToast } from './upload/NotificationToast';
import { TabNavigation } from './upload/TabNavigation';
import { ProjectCard } from './upload/ProjectCard';
import { ProjectForm } from './upload/ProjectForm';
import { ProjectHistoryTab } from './upload/ProjectHistoryTab';
import { ProjectAnalyticsTab } from './upload/ProjectAnalyticsTab';
import { DeleteConfirmModal, ProjectPreviewModal, BulkActionBar } from './upload/Modals';

export function UploadProject({ onAddProject, isAdmin, onLogout }) {
  // ─── Core State ─────────────────────────────────────────────
  const [projects, setProjects] = useState([]);
  const [projectHistory, setProjectHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showImportModal, setShowImportModal] = useState(false);
  const [filterTag, setFilterTag] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewProject, setPreviewProject] = useState(null);
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [projectStats, setProjectStats] = useState(null);
  const [visitorStats, setVisitorStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', desc: '', github: '', demo: '', tags: '', featured: false });
  const [activeTab, setActiveTab] = useState('display');
  const navigate = useNavigate();

  // ─── Extracted Hooks ────────────────────────────────────────
  const { notification, showNotification } = useNotification();
  const imageUpload = useImageUpload({ onError: (msg) => showNotification(msg, 'error') });

  // ─── Firestore Data Fetching + Realtime Sync ────────────────
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        setProjects(querySnapshot.docs.map(mapDocToProject));
      } catch (error) {
        if (error.name !== 'BloomFilterError') showNotification('Error loading projects from database', 'error');
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

    // Realtime listeners
    const unsubProjects = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const changes = snapshot.docChanges().map((change) => ({ type: change.type, doc: mapDocToProject(change.doc) }));
      if (changes.length > 0) {
        setProjects((prev) => {
          let updated = [...prev];
          changes.forEach(({ type, doc }) => {
            if (type === 'added') { if (!updated.some((p) => p.id === doc.id)) updated.push(doc); }
            else if (type === 'modified') { const idx = updated.findIndex((p) => p.id === doc.id); if (idx !== -1) updated[idx] = doc; }
            else if (type === 'removed') { updated = updated.filter((p) => p.id !== doc.id); }
          });
          return updated;
        });
      }
    }, (error) => { if (error.name !== 'BloomFilterError') showNotification('Error syncing with database', 'error'); });

    const unsubHistory = onSnapshot(collection(db, 'history'), (snapshot) => {
      const changes = snapshot.docChanges().map((change) => ({ type: change.type, doc: { ...change.doc.data(), id: change.doc.id } }));
      if (changes.length > 0) {
        setProjectHistory((prev) => {
          let updated = [...prev];
          changes.forEach(({ type, doc }) => {
            if (type === 'added') { if (!updated.some((h) => h.id === doc.id)) updated.push(doc); }
            else if (type === 'modified') { const idx = updated.findIndex((h) => h.id === doc.id); if (idx !== -1) updated[idx] = doc; }
            else if (type === 'removed') { updated = updated.filter((h) => h.id !== doc.id); }
          });
          return updated.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        });
      }
    });

    return () => { unsubProjects(); unsubHistory(); };
  }, []);

  // Cleanup image preview on unmount
  useEffect(() => imageUpload.cleanup, [imageUpload.cleanup]);

  // ─── Project Stats ──────────────────────────────────────────
  useEffect(() => {
    if (projects.length === 0) return;
    const featured = projects.filter((p) => p.featured).length;
    const withGithub = projects.filter((p) => p.github).length;
    const withDemo = projects.filter((p) => p.demo).length;
    const tagFrequency = {};
    projects.forEach((p) => p.tags?.forEach((tag) => { tagFrequency[tag] = (tagFrequency[tag] || 0) + 1; }));
    const topTags = Object.entries(tagFrequency).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag, count]) => ({ tag, count }));
    const lastMonth = new Date(); lastMonth.setMonth(lastMonth.getMonth() - 1);
    const createdLastMonth = projects.filter((p) => new Date(p.createdAt) > lastMonth).length;
    setProjectStats({ total: projects.length, featured, withGithub, withDemo, topTags, createdLastMonth, oldestProject: projects.reduce((o, p) => new Date(p.createdAt) < new Date(o.createdAt) ? p : o, projects[0]) });
  }, [projects]);

  // ─── Visitor Stats ──────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'stats' || visitorStats) return;
    setIsLoadingStats(true);
    (typeof getAnalyticsData === 'function' ? getAnalyticsData() : Promise.resolve(null))
      .then((data) => { if (data) setVisitorStats(data); })
      .catch((err) => { console.error('Error fetching visitor stats:', err); showNotification('Failed to load visitor statistics', 'error'); })
      .finally(() => setIsLoadingStats(false));
  }, [activeTab]);

  // ─── Form Handling ──────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProject((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetForm = () => {
    setNewProject({ title: '', desc: '', github: '', demo: '', tags: '', featured: false });
    imageUpload.clearImage();
    setIsEditing(false);
    setEditIndex(null);
  };

  // ─── Add Project ────────────────────────────────────────────
  const addProjectWithImage = async (imageData) => {
    const tagsArray = parseTagsString(newProject.tags);
    const projectData = { title: newProject.title, desc: newProject.desc, img: imageData, github: newProject.github || '', demo: newProject.demo || '', tags: tagsArray, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), featured: Boolean(newProject.featured) };
    const { isValid, errors, formattedProject } = validateProject(projectData);
    if (!isValid) { showNotification(`Invalid project data: ${errors.join(', ')}`, 'error'); return; }

    try {
      const docRef = await addDoc(collection(db, 'projects'), formattedProject);
      const ts = new Date().toISOString();
      const projectWithId = { ...formattedProject, id: docRef.id, createdAt: ts, updatedAt: ts };
      setProjects((prev) => [...prev, projectWithId]);
      await addDoc(collection(db, 'history'), { project: JSON.parse(JSON.stringify(projectWithId)), action: 'added', timestamp: ts });
      onAddProject?.(projectWithId);
      resetForm();
      showNotification(`Project "${projectWithId.title}" added successfully!`);
    } catch (error) {
      console.error('Error adding project:', error);
      showNotification('Error saving project to database', 'error');
    }
  };

  // ─── Update Project ─────────────────────────────────────────
  const finalizeProjectUpdate = async (updatedProject) => {
    const { isValid, errors, formattedProject } = validateProject(updatedProject, { isUpdate: true });
    if (!isValid) { showNotification(`Invalid project data: ${errors.join(', ')}`, 'error'); return; }

    try {
      await updateDoc(doc(db, 'projects', formattedProject.id), formattedProject);
      const updatedProjects = projects.map((p) => (p.id === formattedProject.id ? formattedProject : p));
      setProjects(updatedProjects);
      await addDoc(collection(db, 'history'), { project: JSON.parse(JSON.stringify(formattedProject)), action: 'edited', timestamp: new Date().toISOString() });
      onAddProject?.(updatedProjects, false, true);
      resetForm();
      setActiveTab('display');
      showNotification(`Project "${formattedProject.title}" updated successfully!`);
    } catch (error) {
      console.error('Error updating project:', error);
      showNotification('Error updating project in database', 'error');
    }
  };

  const handleUpdateProject = () => {
    if (editIndex === null) return;
    const oldProject = JSON.parse(JSON.stringify(projects[editIndex]));
    const tagsArray = parseTagsString(newProject.tags);
    const updatedProject = { title: newProject.title, desc: newProject.desc, img: oldProject.img || 'https://source.unsplash.com/random/400x300?tech', github: newProject.github || '', demo: newProject.demo || '', tags: tagsArray, createdAt: oldProject.createdAt, updatedAt: serverTimestamp(), id: oldProject.id, featured: Boolean(newProject.featured) };
    const { isValid, errors } = validateProject(updatedProject, { isUpdate: true });
    if (!isValid) { showNotification(`Invalid project data: ${errors.join(', ')}`, 'error'); return; }

    if (imageUpload.newImage) {
      const reader = new FileReader();
      reader.onloadend = () => finalizeProjectUpdate({ ...updatedProject, img: reader.result });
      reader.readAsDataURL(imageUpload.newImage);
    } else {
      finalizeProjectUpdate(updatedProject);
    }
  };

  // ─── Delete Project ─────────────────────────────────────────
  const handleConfirmDelete = async () => {
    const auth = checkAuth();
    if (!auth.isAuthenticated) { showNotification('Error: You must be logged in to delete projects', 'error'); setShowModal(false); setDeleteIndex(null); return; }
    if (deleteIndex === null || deleteIndex === undefined || !projects?.length) { showNotification('Error: Invalid project selection', 'error'); setShowModal(false); setDeleteIndex(null); return; }
    if (deleteIndex < 0 || deleteIndex >= projects.length) { showNotification('Error: Project index out of bounds', 'error'); setShowModal(false); setDeleteIndex(null); return; }

    const projectToDelete = projects[deleteIndex];
    if (!projectToDelete) { showNotification('Error: Cannot find project', 'error'); setShowModal(false); setDeleteIndex(null); return; }

    try {
      if (!projectToDelete.id) {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        let docToDelete = null;
        querySnapshot.forEach((d) => { const data = d.data(); if (data.title === projectToDelete.title && data.desc === projectToDelete.desc) docToDelete = d; });
        if (docToDelete) { await deleteDoc(doc(db, 'projects', docToDelete.id)); projectToDelete.id = docToDelete.id; }
        else throw new Error('Could not find matching document in Firestore');
      } else {
        await deleteDoc(doc(db, 'projects', projectToDelete.id));
      }

      const updatedProjects = projects.filter((_, i) => i !== deleteIndex);
      setProjects(updatedProjects);
      const ts = new Date().toISOString();
      const historyEntry = { project: JSON.parse(JSON.stringify(projectToDelete)), action: 'deleted', timestamp: ts, id: `history-${Date.now()}` };
      setProjectHistory((prev) => [...prev, historyEntry]);
      onAddProject?.(updatedProjects, true);
      setShowModal(false);
      setDeleteIndex(null);
      showNotification(`Project "${projectToDelete.title}" deleted.`, 'warning');
    } catch (error) {
      console.error('Error deleting project:', error);
      showNotification(`Error deleting project: ${error.message}`, 'error');
      setShowModal(false);
      setDeleteIndex(null);
    }
  };

  // ─── Submit Handler ─────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newProject.title || !newProject.desc) { showNotification('Please fill in all required fields (title and description)', 'error'); return; }
    if (newProject.github && !isValidUrl(newProject.github)) { showNotification('Please enter a valid GitHub URL', 'error'); return; }
    if (newProject.demo && !isValidUrl(newProject.demo)) { showNotification('Please enter a valid Demo URL', 'error'); return; }
    if (isEditing) { handleUpdateProject(); return; }

    if (imageUpload.newImage) {
      const reader = new FileReader();
      reader.onloadend = async () => { try { await addProjectWithImage(reader.result); } catch { showNotification('Failed to save project.', 'error'); } };
      reader.onerror = () => showNotification('Error reading image file.', 'error');
      reader.readAsDataURL(imageUpload.newImage);
    } else {
      addProjectWithImage('https://source.unsplash.com/random/400x300?tech').catch(() => showNotification('Failed to save project.', 'error'));
    }
  };

  // ─── Edit / Delete / Featured ───────────────────────────────
  const handleEditProject = (index) => {
    const p = projects[index];
    setNewProject({ title: p.title, desc: p.desc, github: p.github || '', demo: p.demo || '', tags: p.tags ? p.tags.join(', ') : '', featured: p.featured || false });
    imageUpload.setPreviewOnly(p.img);
    setIsEditing(true);
    setEditIndex(index);
    setActiveTab('add');
  };

  const confirmDelete = (index) => { setDeleteIndex(index); setShowModal(true); };

  const toggleFeatured = (index) => {
    const updatedProjects = [...projects];
    const project = updatedProjects[index];
    const previousProject = { ...project };
    project.featured = !project.featured;
    try {
      updateDoc(doc(db, 'projects', project.id), { featured: project.featured, updatedAt: serverTimestamp() });
      const ts = new Date().toISOString();
      project.updatedAt = ts;
      setProjects(updatedProjects);
      setProjectHistory((prev) => [...prev, { project: JSON.parse(JSON.stringify(project)), previousProject: JSON.parse(JSON.stringify(previousProject)), action: 'edited', changes: { featured: { from: previousProject.featured, to: project.featured } }, timestamp: ts, id: `history-${Date.now()}` }]);
      showNotification(`Project "${project.title}" ${project.featured ? 'marked as featured' : 'removed from featured'}`, 'info');
    } catch (error) {
      console.error('Error updating featured status:', error);
      showNotification('Error updating featured status', 'error');
    }
  };

  // ─── Bulk Actions ───────────────────────────────────────────
  const toggleProjectSelection = (projectId, e) => {
    if (e) e.stopPropagation();
    setSelectedProjects((prev) => prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]);
  };

  const selectProject = (projectId, e) => { if (!bulkActionMode) return; e.preventDefault(); e.stopPropagation(); toggleProjectSelection(projectId); };

  const handleBulkDelete = async () => {
    const auth = checkAuth();
    if (!auth.isAuthenticated) { showNotification('You must be logged in to delete projects', 'error'); return; }
    if (selectedProjects.length === 0) return;
    if (!window.confirm(`Delete ${selectedProjects.length} selected projects?`)) return;

    const ts = new Date().toISOString();
    const deletedProjects = projects.filter((p) => selectedProjects.includes(p.id));
    try {
      for (const project of deletedProjects) await deleteDoc(doc(db, 'projects', project.id));
      const historyEntries = deletedProjects.map((project) => ({ project: JSON.parse(JSON.stringify(project)), action: 'deleted', timestamp: ts, id: `history-bulk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` }));
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
  };

  const handleBulkToggleFeatured = (setFeatured) => {
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
        historyEntries.push({ project: JSON.parse(JSON.stringify(updatedProjects[idx])), previousProject: JSON.parse(JSON.stringify(prev)), action: 'edited', timestamp: ts, id: `history-bulk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` });
        return updateDoc(doc(db, 'projects', projectId), { featured: setFeatured, updatedAt: serverTimestamp() });
      }
      return Promise.resolve();
    });

    Promise.all(promises)
      .then(() => { setProjects(updatedProjects); setProjectHistory((prev) => [...prev, ...historyEntries]); setSelectedProjects([]); setBulkActionMode(false); showNotification(`${historyEntries.length} projects ${setFeatured ? 'marked as featured' : 'removed from featured'}`, 'info'); })
      .catch((error) => { console.error('Error updating featured:', error); showNotification('Error updating featured status', 'error'); });
  };

  // ─── Other Actions ──────────────────────────────────────────
  const openProjectPreview = (project) => { setPreviewProject(project); setShowPreviewModal(true); };
  const navigateToHome = () => { onLogout?.(); navigate('/#hero'); };

  const exportProjects = () => {
    const blob = new Blob([JSON.stringify(projects, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `portfolio-projects-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    showNotification(`${projects.length} projects exported successfully`);
  };

  const importProjects = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (!Array.isArray(importedData)) throw new Error('Invalid data format');
        const validProjects = importedData.filter((p) => p.title && p.desc && p.img);
        if (!validProjects.length) { showNotification('No valid projects found.', 'error'); return; }
        const ts = new Date().toISOString();
        const processed = validProjects.map((project) => {
          const firestoreProject = { ...project, id: project.id || `project-import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), tags: project.tags || [], featured: project.featured || false };
          addDoc(collection(db, 'projects'), firestoreProject).catch((err) => console.error('Error importing:', err));
          return { ...project, id: project.id || `project-import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, createdAt: ts, updatedAt: ts, tags: project.tags || [], featured: project.featured || false };
        });
        setProjects((prev) => [...prev, ...processed]);
        setProjectHistory((prev) => [...prev, ...processed.map((p) => ({ project: p, action: 'imported', timestamp: ts, id: `history-import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }))]);
        showNotification(`Successfully imported ${processed.length} projects.`);
        setShowImportModal(false);
      } catch (error) { showNotification(`Error importing projects: ${error.message}`, 'error'); }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const resetAllData = () => { if (window.confirm('Reset all data?')) { localStorage.removeItem('projects'); localStorage.removeItem('projectHistory'); setProjects([]); setProjectHistory([]); showNotification('All data has been reset', 'warning'); } };

  const duplicateProject = (index) => {
    const original = JSON.parse(JSON.stringify(projects[index]));
    const ts = new Date().toISOString();
    const duplicated = { ...original, title: `${original.title} (Copy)`, id: `project-${Date.now()}`, createdAt: ts, updatedAt: ts };
    setProjects((prev) => [...prev, duplicated]);
    setProjectHistory((prev) => [...prev, { project: duplicated, action: 'added', timestamp: ts, id: `history-${Date.now()}` }]);
    showNotification(`Project "${original.title}" duplicated.`);
  };

  const restoreFromHistory = (entry) => {
    if (entry.action !== 'deleted') return;
    const ts = new Date().toISOString();
    const restored = { ...entry.project, updatedAt: ts };
    setProjects((prev) => [...prev, restored]);
    setProjectHistory((prev) => [...prev, { project: JSON.parse(JSON.stringify(restored)), action: 'restored', timestamp: ts, id: `history-${Date.now()}` }]);
    showNotification(`Project "${restored.title}" restored`);
  };

  const generateAISuggestions = () => {
    if (!aiPrompt) return;
    setShowAIModal(false);
    showNotification('Processing your request...', 'info');
    setTimeout(() => {
      const suggestedTags = aiPrompt.toLowerCase().split(' ').filter((w) => w.length > 4).filter((w, i, a) => a.indexOf(w) === i).slice(0, 5);
      if (isEditing) { setNewProject((prev) => ({ ...prev, tags: suggestedTags.join(', ') })); showNotification('AI suggested tags added to the form', 'success'); }
      else { showNotification(`AI suggested tags: ${suggestedTags.join(', ')}`, 'success'); }
    }, 1500);
  };

  // ─── Filtering & Sorting ────────────────────────────────────
  const filteredProjects = projects.filter((project) => {
    if (!project) return false;
    if (!searchTerm && !filterTag) return true;
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = !searchLower || project.title?.toLowerCase().includes(searchLower) || project.desc?.toLowerCase().includes(searchLower) || (Array.isArray(project.tags) && project.tags.some((tag) => tag?.toLowerCase().includes(searchLower)));
    const matchesTag = !filterTag || (Array.isArray(project.tags) && project.tags.some((tag) => tag === filterTag));
    return matchesSearch && matchesTag;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    try {
      if (sortOrder === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortOrder === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortOrder === 'alphabetical') return (a.title || '').localeCompare(b.title || '');
      if (sortOrder === 'updated') return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    } catch {}
    return 0;
  });

  const allTags = getAllTags(projects);
  const getProjectIndex = (projectId) => projects.findIndex((p) => p.id === projectId);

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl shadow-xl ring-1 ring-purple-700/30 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-500 to-pink-600 bg-clip-text text-transparent drop-shadow text-center sm:text-left">
          Admin Project Manager
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center w-full sm:w-auto">
          <div className="text-xs sm:text-sm text-center sm:text-right space-y-1">
            <div className="flex gap-1 items-center justify-center sm:justify-end">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <p className="text-gray-300"><span className="font-semibold">{isAdmin ? 'Admin' : 'Guest'}</span> • {isAdmin ? 'Logged In' : 'Logged Out'}</p>
            </div>
          </div>
          <button onClick={navigateToHome}
            className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-md text-white text-xs sm:text-sm font-medium transition-all duration-200 shadow-md shadow-blue-600/20 flex items-center justify-center sm:justify-start gap-2">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            Logout
          </button>
        </div>
      </div>

      <NotificationToast notification={notification} />
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} isEditing={isEditing} />

      {/* ── Display Tab ── */}
      {activeTab === 'display' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-center bg-gray-800/30 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-gray-700/50 shadow-sm">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input type="text" placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 bg-gray-700/50 focus:bg-gray-700/70 rounded-lg focus:ring-2 focus:ring-purple-500 border-none text-sm text-white transition-colors duration-200" />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 w-full md:w-auto">
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-700/50 hover:bg-gray-700/70 rounded-lg border-none text-sm text-white focus:ring-2 focus:ring-purple-500">
                <option value="newest">Newest First</option><option value="oldest">Oldest First</option><option value="alphabetical">A-Z</option><option value="updated">Recently Updated</option>
              </select>
              <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-700/50 hover:bg-gray-700/70 rounded-lg border-none text-sm text-white focus:ring-2 focus:ring-purple-500">
                <option value="">All Tags</option>
                {allTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
              </select>
              <div className="flex gap-1 bg-gray-700/50 rounded-lg p-1">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-600/70'} transition-colors`} title="Grid view">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                </button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-600/70'} transition-colors`} title="List view">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
            <button onClick={() => setBulkActionMode(true)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center sm:justify-start gap-2 shadow-md shadow-blue-600/20">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /></svg>
              <span className="hidden sm:inline">Bulk Edit</span><span className="sm:hidden">Edit</span>
            </button>
            <button onClick={() => setShowImportModal(true)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center sm:justify-start gap-2 shadow-md shadow-green-600/20">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
              Import
            </button>
            <button onClick={exportProjects}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center sm:justify-start gap-2 shadow-md shadow-green-600/20">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /><path fillRule="evenodd" d="M10 3a1 1 0 011 1v9a1 1 0 11-2 0V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
              Export
            </button>
            <button onClick={() => setShowAIModal(true)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center sm:justify-start gap-2 shadow-md shadow-purple-600/20">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
              <span className="hidden sm:inline">AI Suggestions</span><span className="sm:hidden">AI</span>
            </button>
          </div>

          {/* Project Count */}
          <div className="flex items-center mt-4 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-gray-700/0 via-gray-700 to-gray-700/0" />
            <div className="px-4 text-xs sm:text-sm text-gray-400 font-medium">{filteredProjects.length} of {projects.length} projects shown</div>
            <div className="h-px flex-1 bg-gradient-to-r from-gray-700/0 via-gray-700 to-gray-700/0" />
          </div>

          {/* Projects Grid */}
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' : 'space-y-4'}`}>
            {sortedProjects.map((project, index) => {
              const realIndex = getProjectIndex(project.id);
              return (
                <ProjectCard
                  key={`${project.id || 'project'}-${index}`}
                  project={project} index={realIndex} viewMode={viewMode}
                  bulkActionMode={bulkActionMode} isSelected={selectedProjects.includes(project.id)} filterTag={filterTag}
                  onPreview={openProjectPreview} onDuplicate={duplicateProject} onEdit={handleEditProject}
                  onDelete={confirmDelete} onToggleFeatured={toggleFeatured} onSelect={selectProject} onFilterTag={setFilterTag}
                />
              );
            })}
          </div>

          {/* Empty state */}
          {sortedProjects.length === 0 && (
            <div className="text-center py-16 px-4 bg-gradient-to-b from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-700/50">
              <svg className="w-16 h-16 mx-auto text-gray-500 mb-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
              <p className="text-gray-300 text-lg font-medium mb-1">No projects found</p>
              <p className="text-gray-400 mb-4">{searchTerm || filterTag ? 'Try changing your search or filter criteria.' : 'Start by adding your first project using the "Add Project" tab.'}</p>
              {(searchTerm || filterTag) && (
                <button onClick={() => { setSearchTerm(''); setFilterTag(''); }} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Bulk Action Toolbar */}
          {bulkActionMode && (
            <BulkActionBar selectedCount={selectedProjects.length} onFeature={() => handleBulkToggleFeatured(true)} onUnfeature={() => handleBulkToggleFeatured(false)} onDelete={handleBulkDelete} onCancel={() => { setBulkActionMode(false); setSelectedProjects([]); }} />
          )}
        </div>
      )}

      {/* ── Add/Edit Tab ── */}
      {activeTab === 'add' && (
        <ProjectForm
          newProject={newProject} isEditing={isEditing} previewUrl={imageUpload.previewUrl} isDragging={imageUpload.isDragging}
          onChange={handleChange} onImageUpload={imageUpload.handleImageUpload} onDragOver={imageUpload.handleDragOver}
          onDragLeave={imageUpload.handleDragLeave} onDrop={imageUpload.handleDrop} onClearImage={imageUpload.clearImage}
          onSubmit={handleSubmit} onReset={resetForm} onShowAIModal={() => setShowAIModal(true)}
        />
      )}

      {/* ── History Tab ── */}
      {activeTab === 'history' && (
        <ProjectHistoryTab projectHistory={projectHistory} onRestore={restoreFromHistory} onClearHistory={resetAllData} onAddProject={() => setActiveTab('add')} />
      )}

      {/* ── Analytics Tab ── */}
      {activeTab === 'stats' && (
        <ProjectAnalyticsTab projects={projects} projectStats={projectStats} visitorStats={visitorStats} isLoadingStats={isLoadingStats} />
      )}

      {/* ── Modals ── */}
      {showModal && <DeleteConfirmModal onConfirm={handleConfirmDelete} onCancel={() => { setShowModal(false); setDeleteIndex(null); }} />}
      {showPreviewModal && <ProjectPreviewModal project={previewProject} onClose={() => setShowPreviewModal(false)} />}

      {/* Import Modal (kept inline since it's simple) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 border border-green-500/30">
            <h3 className="text-xl font-bold text-green-400 mb-4">Import Projects</h3>
            <p className="text-gray-400 mb-4">Upload a JSON file containing project data.</p>
            <input type="file" accept=".json" onChange={importProjects} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-600 file:text-white hover:file:bg-green-700" />
            <div className="mt-6 flex justify-end"><button onClick={() => setShowImportModal(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">Cancel</button></div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 border border-purple-500/30">
            <h3 className="text-xl font-bold text-purple-400 mb-4">AI Tag Suggestions</h3>
            <p className="text-gray-400 mb-4">Describe your project and we'll suggest relevant tags.</p>
            <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows={3} placeholder="Describe your project..." className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 text-white mb-4" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAIModal(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">Cancel</button>
              <button onClick={generateAISuggestions} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm">Generate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadProject;