import { useState, useMemo } from 'react';
import { getAllTags } from '../utils/projectHelpers';

/**
 * Hook for project filtering, sorting, and search state.
 */
export function useProjectFilters(projects) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [filterTag, setFilterTag] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const allTags = useMemo(() => getAllTags(projects), [projects]);

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        if (!project) return false;
        if (!searchTerm && !filterTag) return true;
        const searchLower = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !searchLower ||
          project.title?.toLowerCase().includes(searchLower) ||
          project.desc?.toLowerCase().includes(searchLower) ||
          (Array.isArray(project.tags) && project.tags.some((tag) => tag?.toLowerCase().includes(searchLower)));
        const matchesTag = !filterTag || (Array.isArray(project.tags) && project.tags.some((tag) => tag === filterTag));
        return matchesSearch && matchesTag;
      }),
    [projects, searchTerm, filterTag],
  );

  const sortedProjects = useMemo(
    () =>
      [...filteredProjects].sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        try {
          if (sortOrder === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          if (sortOrder === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          if (sortOrder === 'alphabetical') return (a.title || '').localeCompare(b.title || '');
          if (sortOrder === 'updated') return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        } catch {}
        return 0;
      }),
    [filteredProjects, sortOrder],
  );

  const getProjectIndex = (projectId) => projects.findIndex((p) => p.id === projectId);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterTag('');
  };

  return {
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    filterTag,
    setFilterTag,
    viewMode,
    setViewMode,
    allTags,
    filteredProjects,
    sortedProjects,
    getProjectIndex,
    clearFilters,
  };
}
