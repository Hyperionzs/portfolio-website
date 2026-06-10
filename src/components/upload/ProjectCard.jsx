import { formatDate } from '../../utils/projectHelpers';

export function ProjectCard({
  project,
  index,
  viewMode,
  bulkActionMode,
  isSelected,
  filterTag,
  onPreview,
  onDuplicate,
  onEdit,
  onDelete,
  onToggleFeatured,
  onSelect,
  onFilterTag,
}) {
  return (
    <div
      key={`${project.id || 'project'}-${index}`}
      onClick={bulkActionMode ? (e) => onSelect(project.id, e) : undefined}
      className={`${viewMode === 'grid' ? '' : 'flex flex-col sm:flex-row gap-4'}
        bg-gradient-to-br from-gray-800/80 to-gray-900/90 backdrop-blur-sm rounded-xl overflow-hidden
        border transition-all duration-300 ease-in-out transform hover:shadow-lg hover:shadow-purple-500/10
        ${bulkActionMode ? 'cursor-pointer hover:-translate-y-1' : 'hover:-translate-y-1 hover:shadow-lg'}
        ${project.featured ? 'border-yellow-500/50 shadow-yellow-500/20 shadow-sm' : 'border-gray-700/50'}
        ${bulkActionMode && isSelected ? 'ring-2 ring-purple-500 scale-[1.02]' : ''}`}
    >
      {/* Project Image */}
      <div className={`${viewMode === 'grid' ? 'w-full aspect-video' : 'h-48 sm:h-44 sm:w-44 sm:flex-shrink-0'} relative group overflow-hidden bg-gray-900/50`}>
        <img
          src={project.img}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://source.unsplash.com/random/400x300?tech';
          }}
        />
        {project.featured && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs px-2 py-1 rounded-md font-medium shadow-md z-10 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Featured
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(project); }}
            className="bg-purple-600 hover:bg-purple-700 p-2 rounded-full shadow-lg transform hover:scale-110 transition-transform"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(index); }}
            className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full shadow-lg transform hover:scale-110 transition-transform"
            title="Duplicate project"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
              <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Project Details */}
      <div className={`${viewMode === 'grid' ? 'p-4' : 'p-4 sm:flex-1 sm:flex sm:flex-col'}`}>
        <div className={`${viewMode === 'grid' ? '' : 'sm:flex-1'}`}>
          <h3 className="text-base sm:text-lg font-semibold mb-2 text-white group-hover:text-purple-300 transition-colors line-clamp-2">{project.title}</h3>
          <p className="text-gray-300 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{project.desc}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
            {project.tags?.map((tag, idx) => (
              <span
                key={idx}
                onClick={filterTag !== tag ? (e) => { e.stopPropagation(); onFilterTag(tag); } : undefined}
                className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors duration-200 cursor-pointer
                  ${filterTag === tag ? 'bg-purple-500/80 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 hover:text-white'}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="flex gap-2 mb-3">
          {project.github && (
            <a href={project.github} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 bg-gray-700/70 hover:bg-gray-600 rounded-lg text-xs sm:text-sm font-medium transition-colors">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          )}
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 sm:px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg text-xs sm:text-sm font-medium transition-all shadow-sm shadow-blue-500/20">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
              Demo
            </a>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span className="hidden sm:flex items-center gap-1">
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {formatDate(project.updatedAt)}
          </span>
          <span className="flex sm:hidden text-[10px] text-gray-500">{formatDate(project.updatedAt)}</span>
          {!bulkActionMode && (
            <div className="flex gap-1 sm:gap-2">
              <button onClick={(e) => { e.stopPropagation(); onEdit(index); }} className="p-1 sm:p-1.5 hover:text-blue-400 transition-colors" title="Edit">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(index); }} className="p-1 sm:p-1.5 hover:text-red-400 transition-colors" title="Delete">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFeatured(index); }}
                className={`p-1 sm:p-1.5 transition-colors ${project.featured ? 'text-yellow-400' : 'hover:text-yellow-400'}`}
                title={project.featured ? 'Remove from featured' : 'Add to featured'}
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
