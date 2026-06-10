export function SearchFilterBar({
  searchTerm,
  onSearchChange,
  sortOrder,
  onSortChange,
  filterTag,
  onFilterTagChange,
  viewMode,
  onViewModeChange,
  allTags,
}) {
  return (
    <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-center bg-gray-800/30 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-gray-700/50 shadow-sm">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 bg-gray-700/50 focus:bg-gray-700/70 rounded-lg focus:ring-2 focus:ring-purple-500 border-none text-sm text-white transition-colors duration-200"
        />
        {searchTerm && (
          <button onClick={() => onSearchChange('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Sort / Filter / View Mode */}
      <div className="flex flex-wrap gap-2 sm:gap-3 w-full md:w-auto">
        <select value={sortOrder} onChange={(e) => onSortChange(e.target.value)}
          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-700/50 hover:bg-gray-700/70 rounded-lg border-none text-sm text-white focus:ring-2 focus:ring-purple-500">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="alphabetical">A-Z</option>
          <option value="updated">Recently Updated</option>
        </select>
        <select value={filterTag} onChange={(e) => onFilterTagChange(e.target.value)}
          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-700/50 hover:bg-gray-700/70 rounded-lg border-none text-sm text-white focus:ring-2 focus:ring-purple-500">
          <option value="">All Tags</option>
          {allTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
        </select>
        <div className="flex gap-1 bg-gray-700/50 rounded-lg p-1">
          <button onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-600/70'} transition-colors`}
            title="Grid view">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-600/70'} transition-colors`}
            title="List view">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function ActionBar({ onBulkEdit, onImport, onExport, onAI }) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
      <button onClick={onBulkEdit}
        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center sm:justify-start gap-2 shadow-md shadow-blue-600/20">
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        </svg>
        <span className="hidden sm:inline">Bulk Edit</span><span className="sm:hidden">Edit</span>
      </button>
      <button onClick={onImport}
        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center sm:justify-start gap-2 shadow-md shadow-green-600/20">
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        Import
      </button>
      <button onClick={onExport}
        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center sm:justify-start gap-2 shadow-md shadow-green-600/20">
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v9a1 1 0 11-2 0V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Export
      </button>
      <button onClick={onAI}
        className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center sm:justify-start gap-2 shadow-md shadow-purple-600/20">
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
        <span className="hidden sm:inline">AI Suggestions</span><span className="sm:hidden">AI</span>
      </button>
    </div>
  );
}

export function ProjectCountDivider({ shown, total }) {
  return (
    <div className="flex items-center mt-4 mb-6">
      <div className="h-px flex-1 bg-gradient-to-r from-gray-700/0 via-gray-700 to-gray-700/0" />
      <div className="px-4 text-xs sm:text-sm text-gray-400 font-medium">{shown} of {total} projects shown</div>
      <div className="h-px flex-1 bg-gradient-to-r from-gray-700/0 via-gray-700 to-gray-700/0" />
    </div>
  );
}

export function EmptyState({ hasFilters, onClearFilters }) {
  return (
    <div className="text-center py-16 px-4 bg-gradient-to-b from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-700/50">
      <svg className="w-16 h-16 mx-auto text-gray-500 mb-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
      <p className="text-gray-300 text-lg font-medium mb-1">No projects found</p>
      <p className="text-gray-400 mb-4">
        {hasFilters ? 'Try changing your search or filter criteria.' : 'Start by adding your first project using the "Add Project" tab.'}
      </p>
      {hasFilters && (
        <button onClick={onClearFilters} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Clear filters
        </button>
      )}
    </div>
  );
}
