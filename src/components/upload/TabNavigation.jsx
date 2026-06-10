const TAB_CONFIG = [
  { key: 'display', gradient: 'from-purple-600 to-blue-600', shadow: 'shadow-purple-500/30', label: { sm: 'Display', xs: 'Projects' }, icon: 'M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { key: 'add', gradient: 'from-blue-600 to-green-600', shadow: 'shadow-blue-500/30', isAddTab: true },
  { key: 'history', gradient: 'from-indigo-600 to-purple-600', shadow: 'shadow-indigo-500/30', label: { sm: 'History', xs: 'History' }, icon: 'M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' },
  { key: 'stats', gradient: 'from-orange-500 to-red-500', shadow: 'shadow-orange-500/30', label: { sm: 'Analytics', xs: 'Stats' }, icon: 'M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z' },
  { key: 'profile', gradient: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/30', label: { sm: 'Profile', xs: 'Photo' }, icon: 'M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' },
];

export function TabNavigation({ activeTab, setActiveTab, isEditing }) {
  return (
    <div className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2 mb-5 sm:mb-6 px-0 sm:px-1">
      {TAB_CONFIG.map((tab) => {
        const isActive = activeTab === tab.key;

        const getLabel = () => {
          if (tab.isAddTab) {
            return isEditing ? (
              <span className="flex items-center gap-1 sm:gap-1.5">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <span className="hidden sm:inline">Update Project</span>
                <span className="sm:hidden">Update</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 sm:gap-1.5">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Add Project</span>
                <span className="sm:hidden">Add</span>
              </span>
            );
          }
          return (
            <span className="flex items-center gap-1 sm:gap-1.5">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d={tab.icon} clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">{tab.label.sm}</span>
              <span className="sm:hidden">{tab.label.xs}</span>
            </span>
          );
        };

        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
              isActive
                ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg ${tab.shadow} -translate-y-0.5`
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 hover:text-white'
            }`}
          >
            {getLabel()}
            {isActive && (
              <span className="absolute inset-0 overflow-hidden rounded-lg">
                <span className="absolute -inset-[100%] animate-[spin_3s_linear_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
