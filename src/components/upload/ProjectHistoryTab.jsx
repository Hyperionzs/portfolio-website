import { useState } from 'react';
import { formatDate } from '../../utils/projectHelpers';

export function ProjectHistoryTab({ projectHistory, onRestore, onClearHistory, onAddProject }) {
  const [expandedEntry, setExpandedEntry] = useState(null);

  const actionCounts = {
    added: projectHistory.filter((e) => e.action === 'added').length,
    edited: projectHistory.filter((e) => e.action === 'edited').length,
    deleted: projectHistory.filter((e) => e.action === 'deleted').length,
    other: projectHistory.filter((e) => !['added', 'edited', 'deleted'].includes(e.action)).length,
  };

  const actionColorMap = {
    added: 'green',
    edited: 'purple',
    deleted: 'red',
  };

  const getColor = (action) => actionColorMap[action] || 'blue';

  return (
    <div className="space-y-6">
      {/* History Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-xl border border-gray-700/30 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Project History
          </h2>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 bg-purple-500/10 rounded-full text-sm text-purple-300 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              {projectHistory.length} {projectHistory.length === 1 ? 'entry' : 'entries'}
            </div>
            {projectHistory.length > 0 && (
              <button onClick={onClearHistory}
                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-full text-sm flex items-center gap-2 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear History
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 text-center">
          {Object.entries(actionCounts).map(([key, count]) => (
            <div key={key} className={`bg-${getColor(key)}-500/10 p-3 rounded-lg border border-${getColor(key)}-500/20`}>
              <span className="text-xs text-gray-400">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              <p className={`text-xl font-semibold text-${getColor(key)}-400 mt-1`}>{count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {projectHistory.map((entry) => {
          const color = getColor(entry.action);
          const isExpanded = expandedEntry === entry.id;

          return (
            <div key={entry.id}
              className="group relative bg-gradient-to-br from-gray-900/90 to-gray-800/70 rounded-xl overflow-hidden border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none" />

              {/* Header Bar */}
              <div className={`w-full px-6 py-4 bg-${color}-500/10 border-b border-${color}-500/20`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full backdrop-blur-sm bg-${color}-500/20 text-${color}-400 ring-1 ring-${color}-500/30`}>
                      {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                    </span>
                    <h3 className="font-medium text-white group-hover:text-purple-300 transition-colors line-clamp-1">{entry.project.title}</h3>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDate(entry.timestamp)}
                    </span>
                    <button onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-700/30 transition-colors">
                      {isExpanded ? 'Hide Details' : 'View Details'}
                      <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {entry.action === 'deleted' && (
                      <button onClick={() => onRestore(entry)}
                        className="flex items-center gap-2 px-3 py-1 text-sm text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 rounded-full transition-all duration-200 ml-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expandable Content */}
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3 lg:w-1/4">
                      <div className="aspect-video md:aspect-square bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                        <img src={entry.project.img} alt={entry.project.title} className="w-full h-full object-cover"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://source.unsplash.com/random/400x300?tech'; }} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="grid grid-cols-1 gap-5">
                        <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-800/30">
                          <h4 className="flex items-center gap-2 text-sm font-medium text-purple-300 mb-3">Description</h4>
                          <p className="text-white/90 text-sm leading-relaxed">{entry.project.desc || <span className="text-gray-500 italic">No description available</span>}</p>
                        </div>
                        <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-800/30">
                          <h4 className="flex items-center gap-2 text-sm font-medium text-purple-300 mb-3">Tags</h4>
                          {entry.project.tags?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {entry.project.tags.map((tag, i) => (
                                <span key={i} className="px-3 py-1 text-xs font-medium bg-purple-500/10 text-purple-300 rounded-full border border-purple-500/20 hover:bg-purple-500/20 transition-colors">{tag}</span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic text-sm">No tags added</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Changes Summary for Edited Items */}
                  {entry.action === 'edited' && entry.previousProject && (
                    <ChangesSummary entry={entry} />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {projectHistory.length === 0 && (
          <div className="text-center py-16 bg-gray-900/30 rounded-xl border border-gray-800/50">
            <div className="w-16 h-16 mx-auto mb-4">
              <svg className="w-full h-full text-gray-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No History Yet</h3>
            <p className="text-gray-500">Your project changes will appear here</p>
            <button onClick={() => onAddProject()} className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors">
              Add Your First Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Internal component for showing previous vs current version diff. */
function ChangesSummary({ entry }) {
  return (
    <div className="mt-6 pt-6 border-t border-gray-700/50">
      <h4 className="text-sm font-medium text-purple-400 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Changes Summary
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VersionBlock label="Previous Version" project={entry.previousProject} current={entry.project} color="red" />
        <VersionBlock label="Current Version" project={entry.project} previous={entry.previousProject} color="green" />
      </div>
    </div>
  );
}

function VersionBlock({ label, project, previous, color }) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-4">
      <div className="text-xs font-medium text-gray-500 mb-2">{label}</div>
      <div className="space-y-3">
        {previous.title !== project.title && (
          <div>
            <span className="text-xs text-gray-500">Title:</span>
            <p className={`text-sm text-${color}-400`}>{project.title}</p>
          </div>
        )}
        {previous.desc !== project.desc && (
          <div>
            <span className="text-xs text-gray-500">Description:</span>
            <p className={`text-sm text-${color}-400 line-clamp-2`}>{project.desc}</p>
          </div>
        )}
        {JSON.stringify(previous.tags) !== JSON.stringify(project.tags) && (
          <div>
            <span className="text-xs text-gray-500">Tags:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {project.tags?.length > 0
                ? project.tags.map((tag, i) => <span key={i} className={`text-xs bg-${color}-500/10 text-${color}-400 px-2 py-0.5 rounded`}>{tag}</span>)
                : <span className="text-gray-500 text-xs">No tags</span>}
            </div>
          </div>
        )}
        {previous.featured !== project.featured && (
          <div>
            <span className="text-xs text-gray-500">Featured Status:</span>
            <p className={`text-sm text-${color}-400`}>{project.featured ? 'Featured' : 'Not Featured'}</p>
          </div>
        )}
        {(previous.github !== project.github || previous.demo !== project.demo) && (
          <div><span className="text-xs text-gray-500">Links Changed</span></div>
        )}
      </div>
    </div>
  );
}