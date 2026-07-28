import React from 'react';

/**
 * AuroraBackground — animated aurora backdrop for hero sections.
 * No external deps. Animations defined in index.css.
 */
export function AuroraBackground({ children, className = '' }) {
  return (
    <div className={`relative min-h-screen overflow-hidden bg-black w-full ${className}`}>
      {/* Aurora Background */}
      <div className="absolute inset-0">
        {/* Base aurora layer */}
        <div className="absolute inset-0 opacity-70">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-indigo-900/40" />
        </div>

        {/* Animated aurora waves */}
        <div className="absolute inset-0">
          {/* Wave 1 */}
          <div
            className="absolute inset-0 opacity-60 animate-aurora1"
            style={{
              background:
                'radial-gradient(ellipse 800px 600px at 50% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
            }}
          />
          {/* Wave 2 */}
          <div
            className="absolute inset-0 opacity-50 animate-aurora2"
            style={{
              background:
                'radial-gradient(ellipse 600px 400px at 80% 30%, rgba(139, 92, 246, 0.4) 0%, transparent 50%)',
            }}
          />
          {/* Wave 3 */}
          <div
            className="absolute inset-0 opacity-40 animate-aurora3"
            style={{
              background:
                'radial-gradient(ellipse 700px 500px at 20% 60%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
            }}
          />
          {/* Wave 4 */}
          <div
            className="absolute inset-0 opacity-30 animate-aurora4"
            style={{
              background:
                'radial-gradient(ellipse 900px 300px at 60% 80%, rgba(34, 197, 94, 0.2) 0%, transparent 50%)',
            }}
          />
        </div>

        {/* Overlay gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}