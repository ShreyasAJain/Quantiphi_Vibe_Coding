import { useState, useEffect } from 'react';
import { api } from './services/api';
import { Project, ProjectBoardState } from './types';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [boardState, setBoardState] = useState<ProjectBoardState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Initial Load: Fetch Projects
  useEffect(() => {
    loadProjects();
  }, []);

  // 2. Fetch Board State when Selected Project changes
  useEffect(() => {
    if (selectedProjectId) {
      loadBoard(selectedProjectId);
    }
  }, [selectedProjectId]);

  async function loadProjects() {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getProjects();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProjectId(data[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadBoard(projectId: string) {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getBoardState(projectId);
      setBoardState(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load project board');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={(id) => setSelectedProjectId(id)}
        onOpenNewTaskModal={() => alert('Task Modal will be connected in Phase 10')}
        onOpenNewProjectModal={() => alert('Project Modal will be connected in Phase 11')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-200 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-lg">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => selectedProjectId && loadBoard(selectedProjectId)}
              className="px-3 py-1 bg-red-900/60 hover:bg-red-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && !boardState && (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Connecting to Kanban API Server...</p>
          </div>
        )}

        {/* Project Shell Details */}
        {boardState && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {boardState.project.name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {boardState.project.description || 'No description provided'}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                    To-Do: <strong className="text-white">{boardState.columnCounts.TODO}</strong>
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800 text-indigo-300">
                    In Progress: <strong className="text-white">{boardState.columnCounts.IN_PROGRESS}</strong>
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                    Done: <strong className="text-white">{boardState.columnCounts.DONE}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Kanban Columns with Drag-and-Drop */}
            <KanbanBoard
              initialColumns={boardState.columns}
              columnCounts={boardState.columnCounts}
              onRefreshBoard={() => loadBoard(selectedProjectId)}
              onError={(msg) => setError(msg)}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
