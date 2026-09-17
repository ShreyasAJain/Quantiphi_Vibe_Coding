import { useState, useEffect } from 'react';
import { api } from './services/api';
import { Project, ProjectBoardState } from './types';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { WorkloadBar } from './components/WorkloadBar';
import { BuildPipelinePanel } from './components/BuildPipelinePanel';
import { CreateTaskModal } from './components/CreateTaskModal';
import { CreateProjectModal } from './components/CreateProjectModal';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [boardState, setBoardState] = useState<ProjectBoardState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Parallel Inspector state
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState<boolean>(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState<boolean>(false);
  const [showBuildPipeline, setShowBuildPipeline] = useState<boolean>(true);

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

  async function loadProjects(selectProjectId?: string) {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getProjects();
      setProjects(data);

      if (selectProjectId) {
        setSelectedProjectId(selectProjectId);
      } else if (data.length > 0 && !selectedProjectId) {
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

  const handleTaskCreated = () => {
    if (selectedProjectId) {
      loadBoard(selectedProjectId);
    }
  };

  const handleProjectCreated = async (newProjectId: string) => {
    await loadProjects(newProjectId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* App Header with Project Switcher & Build Pipeline Toggle */}
      <Header
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={(id) => setSelectedProjectId(id)}
        onOpenNewTaskModal={() => setIsCreateTaskModalOpen(true)}
        onOpenNewProjectModal={() => setIsCreateProjectModalOpen(true)}
        showBuildPipeline={showBuildPipeline}
        onToggleBuildPipeline={() => setShowBuildPipeline(!showBuildPipeline)}
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

        {/* Parallel Build Progression & System Architecture Matrix */}
        {showBuildPipeline && (
          <div className="animate-fadeIn">
            <BuildPipelinePanel />
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && !boardState && (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Connecting to Kanban API Server...</p>
          </div>
        )}

        {/* Active Project & Interactive Kanban Section */}
        {boardState && (
          <div className="space-y-6">
            {/* Project Banner & Live Column Counters */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {boardState.project.name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {boardState.project.description || 'Workspace actively monitored by the Workload Balancing Engine'}
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

            {/* Team Workload Balancing Monitor (Server-Calculated Metrics) */}
            <WorkloadBar workloads={boardState.userWorkloads} />

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

      {/* Task Creation Modal */}
      {selectedProjectId && (
        <CreateTaskModal
          isOpen={isCreateTaskModalOpen}
          projectId={selectedProjectId}
          onClose={() => setIsCreateTaskModalOpen(false)}
          onTaskCreated={handleTaskCreated}
          onError={(msg) => setError(msg)}
        />
      )}

      {/* Project Creation Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onProjectCreated={handleProjectCreated}
        onError={(msg) => setError(msg)}
      />
    </div>
  );
}

export default App;
