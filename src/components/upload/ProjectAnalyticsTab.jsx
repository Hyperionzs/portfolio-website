export function ProjectAnalyticsTab({ projects, projectStats, visitorStats, isLoadingStats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Projects */}
        <StatCard
          label="Total Projects" value={projects.length} icon={
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          footer={<><span className="text-gray-400">Last month: </span><span className="ml-2 text-green-400">{projectStats?.createdLastMonth || 0} new</span></>}
          gradient="from-purple-900/50 to-purple-800/30" border="border-purple-700/30" iconBg="bg-purple-500/20"
        />

        {/* Featured Projects */}
        <StatCard
          label="Featured Projects" value={projectStats?.featured || 0} icon={
            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
          footer={<><span className="text-gray-400">Of total: </span><span className="ml-2 text-yellow-400">{projectStats?.featured ? ((projectStats.featured / projects.length) * 100).toFixed(1) : 0}%</span></>}
          gradient="from-yellow-900/50 to-yellow-800/30" border="border-yellow-700/30" iconBg="bg-yellow-500/20"
        />

        {/* Links Stats */}
        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-6 rounded-xl border border-blue-700/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm">With Links</p>
              <div className="flex gap-4 mt-1">
                <div><p className="text-xs text-gray-500">GitHub</p><p className="text-xl font-bold text-white">{projectStats?.withGithub || 0}</p></div>
                <div><p className="text-xs text-gray-500">Demo</p><p className="text-xl font-bold text-white">{projectStats?.withDemo || 0}</p></div>
              </div>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-400">Connected: </span>
            <span className="ml-2 text-blue-400">{projectStats?.withGithub && projectStats?.withDemo ? ((Math.min(projectStats.withGithub, projectStats.withDemo) / projects.length) * 100).toFixed(1) : 0}%</span>
          </div>
        </div>

        {/* Visitor Analytics */}
        <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 p-6 rounded-xl border border-green-700/30 shadow-lg transition-transform hover:scale-[1.02] duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm">Unique Visitors</p>
              <h3 className="text-3xl font-bold text-white mt-1">
                {isLoadingStats ? <span className="animate-pulse">Loading...</span> : visitorStats?.totals?.[0]?.values?.[0] || '0'}
              </h3>
            </div>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-400">Last 30 days: </span>
            <span className="ml-2 text-green-400">{isLoadingStats ? 'Loading...' : `${visitorStats?.totals?.[0]?.values?.[1] || '0'} sessions`}</span>
          </div>
        </div>

        {/* Page Views */}
        <div className="bg-gradient-to-br from-cyan-900/50 to-cyan-800/30 p-6 rounded-xl border border-cyan-700/30 shadow-lg transition-transform hover:scale-[1.02] duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Page Views</p>
              <h3 className="text-3xl font-bold text-white mt-1">
                {isLoadingStats ? <span className="animate-pulse">Loading...</span> : visitorStats?.totals?.[0]?.values?.[2] || '0'}
              </h3>
            </div>
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-400">Avg. per session: </span>
            <span className="ml-2 text-cyan-400">
              {isLoadingStats ? 'Loading...' : ((visitorStats?.totals?.[0]?.values?.[2] || 0) / (visitorStats?.totals?.[0]?.values?.[1] || 1)).toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Visitor Timeline */}
      {visitorStats?.rows && <VisitorTimeline visitorStats={visitorStats} />}
    </div>
  );
}

function StatCard({ label, value, icon, footer, gradient, border, iconBg }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} p-6 rounded-xl border ${border}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
        </div>
        <div className={`p-2 ${iconBg} rounded-lg`}>{icon}</div>
      </div>
      <div className="mt-4 flex items-center text-sm">{footer}</div>
    </div>
  );
}

function VisitorTimeline({ visitorStats }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Daily Visitors</h3>
        {visitorStats.rows.length > 0 && (
          <div className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">
            {new Date(visitorStats.rows[0].dimensions[0].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).toLocaleDateString()} -
            {new Date(visitorStats.rows[visitorStats.rows.length - 1].dimensions[0].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).toLocaleDateString()}
          </div>
        )}
      </div>
      <div className="h-60 relative">
        <div className="absolute inset-0 flex items-end">
          {visitorStats.rows.map((row, index) => {
            const maxVal = Math.max(...visitorStats.rows.map((r) => parseInt(r.metrics[0].values[0])));
            const height = `${(row.metrics[0].values[0] / maxVal) * 100}%`;
            const date = new Date(row.dimensions[0].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isToday = new Date().toISOString().split('T')[0] === date.toISOString().split('T')[0];

            return (
              <div key={row.dimensions[0]} className="flex-1 mx-0.5 group relative" style={{ height }}>
                <div className={`absolute inset-x-0 bottom-0 transition-all duration-300 rounded-t ${
                  isToday ? 'bg-purple-500/80 group-hover:bg-purple-500' : isWeekend ? 'bg-purple-400/30 group-hover:bg-purple-400/50' : 'bg-purple-500/30 group-hover:bg-purple-500/50'
                }`} style={{ height: '100%' }}>
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                    {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}<br />{row.metrics[0].values[0]} visitors
                  </div>
                </div>
                {index % 5 === 0 && <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-gray-500 text-xs">{date.getDate()}</div>}
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-700/50" />
      </div>
      <div className="mt-6 pt-2 border-t border-gray-700/30 flex justify-between text-xs text-gray-500">
        <span>Hover over bars for details</span>
        <span>Weekend days shown in lighter color</span>
      </div>
    </div>
  );
}