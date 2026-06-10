import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db, serverTimestamp } from '../config/firebase';

// ─── Custom Hooks ─────────────────────────────────────────────
import { useNotification } from '../hooks/useNotification';
import { useImageUpload } from '../hooks/useImageUpload';
import { useProjectsFirestore } from '../hooks/useProjectsFirestore';
import { useProjectActions } from '../hooks/useProjectActions';
import { useBulkActions } from '../hooks/useBulkActions';
import { useProjectFilters } from '../hooks/useProjectFilters';

// ─── Utility Functions ────────────────────────────────────────
import { exportProjectsJSON, parseImportFile } from '../utils/projectHelpers';

// ─── Sub-Components ───────────────────────────────────────────
import { NotificationToast } from './upload/NotificationToast';
import { TabNavigation } from './upload/TabNavigation';
import { ProjectCard } from './upload/ProjectCard';
import { ProjectForm } from './upload/ProjectForm';
import { ProjectHistoryTab } from './upload/ProjectHistoryTab';
import { ProjectAnalyticsTab } from './upload/ProjectAnalyticsTab';
import { DeleteConfirmModal, ProjectPreviewModal, BulkActionBar, ImportModal, AIModal } from './upload/Modals';
import { SearchFilterBar, ActionBar, ProjectCountDivider, EmptyState } from './upload/SearchFilterBar';

const INITIAL_PROJECT = { title: '', desc: '', github: '', demo: '', tags: '', featured: false };

export function UploadProject({ onAddProject, isAdmin, onLogout }) {
  const navigate = useNavigate();

  // ─── UI State ─────────────────────────────────────────────
  const [newProject, setNewProject] = useState(INITIAL_PROJECT);
  const [activeTab, setActiveTab] = useState('display');
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewProject, setPreviewProject] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [projectStats, setProjectStats] = useState(null);
  const [visitorStats, setVisitorStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // ─── Extracted Hooks ──────────────────────────────────────
  const { notification, showNotification } = useNotification();
  const imageUpload = useImageUpload({ onError: (msg) => showNotification(msg, 'error') });
  const { projects, setProjects, projectHistory, setProjectHistory } = useProjectsFirestore((msg) => showNotification(msg, 'error'));
  const filters = useProjectFilters(projects);
  const bulk = useBulkActions({ projects, setProjects, setProjectHistory, showNotification, onAddProject });
  const actions = useProjectActions({
    projects, setProjects, setProjectHistory, showNotification, onAddProject, resetForm, setActiveTab,
  });

  // ─── Cleanup ──────────────────────────────────────────────
  useEffect(() => imageUpload.cleanup, [imageUpload.cleanup]);

  // ─── Project Stats ────────────────────────────────────────
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
    setProjectStats({
      total: projects.length, featured, withGithub, withDemo, topTags, createdLastMonth,
      oldestProject: projects.reduce((o, p) => new Date(p.createdAt) < new Date(o.createdAt) ? p : o, projects[0]),
    });
  }, [projects]);

  // ─── Visitor Stats ────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'stats' || visitorStats) return;
    setIsLoadingStats(true);
    (typeof getAnalyticsData === 'function' ? getAnalyticsData() : Promise.resolve(null))
      .then((data) => { if (data) setVisitorStats(data); })
      .catch((err) => { console.error('Error fetching visitor stats:', err); showNotification('Failed to load visitor statistics', 'error'); })
      .finally(() => setIsLoadingStats(false));
  }, [activeTab]);

  // ─── Form Handling ────────────────────────────────────────
  function resetForm() {
    setNewProject(INITIAL_PROJECT);
    imageUpload.clearImage();
    setIsEditing(false);
    setEditIndex(null);
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProject((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // ─── Edit / Delete / Preview ──────────────────────────────
  const handleEditProject = (index) => {
    const p = projects[index];
    setNewProject({ title: p.title, desc: p.desc, github: p.github || '', demo: p.demo || '', tags: p.tags ? p.tags.join(', ') : '', featured: p.featured || false });
    imageUpload.setPreviewOnly(p.img);
    setIsEditing(true);
    setEditIndex(index);
    setActiveTab('add');
  };

  const confirmDelete = (index) => { setDeleteIndex(index); setShowModal(true); };

  const handleConfirmDeleteWrapper = async () => {
    const success = await actions.handleConfirmDelete(deleteIndex);
    setShowModal(false);
    setDeleteIndex(null);
  };

  const handleSubmit = (e) => actions.handleSubmit(e, newProject, isEditing, editIndex, imageUpload.newImage);

  const openProjectPreview = (project) => { setPreviewProject(project); setShowPreviewModal(true); };
  const navigateToHome = () => { onLogout?.(); navigate('/#hero'); };

  // ─── Import / Export ──────────────────────────────────────
  const exportProjects = () => {
    exportProjectsJSON(projects);
    showNotification(`${projects.length} projects exported successfully`);
  };

  const importProjects = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { validProjects, error } = await parseImportFile(file);
    if (error) { showNotification(`Error importing projects: ${error}`, 'error'); e.target.value = null; return; }
    if (!validProjects.length) { showNotification('No valid projects found.', 'error'); e.target.value = null; return; }

    const ts = new Date().toISOString();
    const processed = validProjects.map((project) => {
      const id = project.id || `project-import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const firestoreProject = { ...project, id, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), tags: project.tags || [], featured: project.featured || false };
      addDoc(collection(db, 'projects'), firestoreProject).catch((err) => console.error('Error importing:', err));
      return { ...project, id, createdAt: ts, updatedAt: ts, tags: project.tags || [], featured: project.featured || false };
    });
    setProjects((prev) => [...prev, ...processed]);
    setProjectHistory((prev) => [...prev, ...processed.map((p) => ({ project: p, action: 'imported', timestamp: ts, id: `history-import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }))]);
    showNotification(`Successfully imported ${processed.length} projects.`);
    setShowImportModal(false);
    e.target.value = null;
  };

  const resetAllData = () => {
    if (window.confirm('Reset all data?')) {
      localStorage.removeItem('projects');
      localStorage.removeItem('projectHistory');
      setProjects([]);
      setProjectHistory([]);
      showNotification('All data has been reset', 'warning');
    }
  };

  // ─── AI Suggestions ──────────────────────────────────────
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

  // ─── Render ───────────────────────────────────────────────
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
          <SearchFilterBar
            searchTerm={filters.searchTerm} onSearchChange={filters.setSearchTerm}
            sortOrder={filters.sortOrder} onSortChange={filters.setSortOrder}
            filterTag={filters.filterTag} onFilterTagChange={filters.setFilterTag}
            viewMode={filters.viewMode} onViewModeChange={filters.setViewMode}
            allTags={filters.allTags}
          />
          <ActionBar
            onBulkEdit={() => bulk.setBulkActionMode(true)}
            onImport={() => setShowImportModal(true)}
            onExport={exportProjects}
            onAI={() => setShowAIModal(true)}
          />
          <ProjectCountDivider shown={filters.filteredProjects.length} total={projects.length} />

          <div className={`${filters.viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' : 'space-y-4'}`}>
            {filters.sortedProjects.map((project, index) => {
              const realIndex = filters.getProjectIndex(project.id);
              return (
                <ProjectCard
                  key={`${project.id || 'project'}-${index}`}
                  project={project} index={realIndex} viewMode={filters.viewMode}
                  bulkActionMode={bulk.bulkActionMode} isSelected={bulk.selectedProjects.includes(project.id)} filterTag={filters.filterTag}
                  onPreview={openProjectPreview} onDuplicate={actions.duplicateProject} onEdit={handleEditProject}
                  onDelete={confirmDelete} onToggleFeatured={actions.toggleFeatured} onSelect={bulk.selectProject} onFilterTag={filters.setFilterTag}
                />
              );
            })}
          </div>

          {filters.sortedProjects.length === 0 && (
            <EmptyState hasFilters={!!filters.searchTerm || !!filters.filterTag} onClearFilters={filters.clearFilters} />
          )}

          {bulk.bulkActionMode && (
            <BulkActionBar selectedCount={bulk.selectedProjects.length} onFeature={() => bulk.handleBulkToggleFeatured(true)} onUnfeature={() => bulk.handleBulkToggleFeatured(false)} onDelete={bulk.handleBulkDelete} onCancel={bulk.exitBulkMode} />
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
        <ProjectHistoryTab projectHistory={projectHistory} onRestore={actions.restoreFromHistory} onClearHistory={resetAllData} onAddProject={() => setActiveTab('add')} />
      )}

      {/* ── Analytics Tab ── */}
      {activeTab === 'stats' && (
        <ProjectAnalyticsTab projects={projects} projectStats={projectStats} visitorStats={visitorStats} isLoadingStats={isLoadingStats} />
      )}

      {/* ── Modals ── */}
      {showModal && <DeleteConfirmModal onConfirm={handleConfirmDeleteWrapper} onCancel={() => { setShowModal(false); setDeleteIndex(null); }} />}
      {showPreviewModal && <ProjectPreviewModal project={previewProject} onClose={() => setShowPreviewModal(false)} />}
      {showImportModal && <ImportModal onImport={importProjects} onClose={() => setShowImportModal(false)} />}
      {showAIModal && <AIModal aiPrompt={aiPrompt} onPromptChange={setAiPrompt} onGenerate={generateAISuggestions} onClose={() => setShowAIModal(false)} />}
    </div>
  );
}

export default UploadProject;
