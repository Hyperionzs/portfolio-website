export function ProjectForm({
  newProject,
  isEditing,
  previewUrl,
  isDragging,
  onChange,
  onImageUpload,
  onDragOver,
  onDragLeave,
  onDrop,
  onClearImage,
  onSubmit,
  onReset,
  onShowAIModal,
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Project Title</label>
          <input type="text" name="title" value={newProject.title} onChange={onChange}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 text-white" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea name="desc" value={newProject.desc} onChange={onChange} rows={4}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 text-white" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Project Image</label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600'}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {previewUrl ? (
              <div className="relative">
                <img src={previewUrl} alt="Preview" className="mx-auto max-h-48 rounded"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x300?text=Image+Error'; }} />
                <button onClick={onClearImage} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full" title="Remove image">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="text-gray-400">
                <p>Drag and drop an image here, or</p>
                <input type="file" accept="image/*" onChange={onImageUpload} className="hidden" id="image-upload" />
                <label htmlFor="image-upload" className="inline-block mt-2 px-4 py-2 bg-purple-600 rounded-lg cursor-pointer hover:bg-purple-700">
                  Choose File
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">GitHub Link</label>
            <input type="url" name="github" value={newProject.github} onChange={onChange}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 text-white" placeholder="https://github.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Demo Link</label>
            <input type="url" name="demo" value={newProject.demo} onChange={onChange}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 text-white" placeholder="https://..." />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
          <input type="text" name="tags" value={newProject.tags} onChange={onChange}
            className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 text-white" placeholder="react, typescript, tailwind" />
        </div>

        <div className="flex items-center">
          <input type="checkbox" name="featured" checked={newProject.featured} onChange={onChange}
            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 bg-gray-700 border-gray-600" />
          <label className="ml-2 text-sm font-medium text-gray-300">Feature this project</label>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={onReset} className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">Cancel</button>
          {onShowAIModal && (
            <button type="button" onClick={onShowAIModal}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 rounded-lg text-sm font-medium flex items-center gap-2 shadow-md shadow-purple-600/20">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              AI Tags
            </button>
          )}
          <button type="submit" className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700">
            {isEditing ? 'Update Project' : 'Add Project'}
          </button>
        </div>
      </form>
    </div>
  );
}