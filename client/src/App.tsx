import { useState, useEffect, useMemo } from 'react';
import { api } from './services/api';
import { Project, ProjectBoardState, ProjectMember, Task, Priority } from './types';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { WorkloadBar } from './components/WorkloadBar';
import { BuildPipelinePanel } from './components/BuildPipelinePanel';
import { CreateTaskModal } from './components/CreateTaskModal';
import { CreateProjectModal } from './components/CreateProjectModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TeamMembersModal } from './components/TeamMembersModal';
import { BoardFilterToolbar } from './components/BoardFilterToolbar';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [boardState, setBoardState] = useState<ProjectBoardState | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Panels state
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState<boolean>(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState<boolean>(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showBuildPipeline, setShowBuildPipeline] = useState<boolean>(true);

  // Filter toolbar state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'ALL'>('ALL');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');

  // 1. Initial Load: Fetch Projects
  useEffect(() => {
    loadProjects();
  }, []);

  // 2. Fetch Board State & Project Members when Selected Project changes
  useEffect(() => {
    if (selectedProjectId) {
      loadBoard(selectedProjectId);
      loadMembers(selectedProjectId);
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

  async function loadMembers(projectId: string) {
    try {
      const data = await api.getProjectMembers(projectId);
      setMembers(data);
    } catch (err: any) {
      console.error('Failed to load project members', err);
    }
  }

  const handleRefreshAll = () => {
    if (selectedProjectId) {
      loadBoard(selectedProjectId);
      loadMembers(selectedProjectId);
    }
  };

  const handleProjectCreated = async (newProjectId: string) => {
    await loadProjects(newProjectId);
  };

  // Filter logic across columns
  const filteredColumns = useMemo(() => {
    if (!boardState) return { TODO: [], IN_PROGRESS: [], DONE: [] };

    const filterTask = (task: Task) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchDesc) return false;
      }
      if (selectedPriority !== 'ALL' && task.priority !== selectedPriority) {
        return false;
      }
      if (selectedAssignee) {
        if (selectedAssignee === 'unassigned') {
          if (task.assignedUserId) return false;
        } else if (task.assignedUserId !== selectedAssignee) {
          return false;
        }
      }
      return true;
    };

    return {
      TODO: boardState.columns.TODO.filter(filterTask),
      IN_PROGRESS: boardState.columns.IN_PROGRESS.filter(filterTask),
      DONE: boardState.columns.DONE.filter(filterTask),
    };
  }, [boardState, searchQuery, selectedPriority, selectedAssignee]);

  const totalTasksCount = boardState
    ? boardState.columns.TODO.length +
      boardState.columns.IN_PROGRESS.length +
      boardState.columns.DONE.length
    : 0;

  const filteredTasksCount =
    filteredColumns.TODO.length +
    filteredColumns.IN_PROGRESS.length +
    filteredColumns.DONE.length;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedPriority('ALL');
    setSelectedAssignee('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* App Header with Project Switcher, Team Manager & Build Pipeline Toggle */}
      <Header
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={(id) => setSelectedProjectId(id)}
        onOpenNewTaskModal={() => setIsCreateTaskModalOpen(true)}
        onOpenNewProjectModal={() => setIsCreateProjectModalOpen(true)}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
        memberCount={members.length}
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

            {/* Multi-Dimensional Board Filter & Search Toolbar */}
            <BoardFilterToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedPriority={selectedPriority}
              onPriorityChange={setSelectedPriority}
              selectedAssignee={selectedAssignee}
              onAssigneeChange={setSelectedAssignee}
              members={members}
              totalTasks={totalTasksCount}
              filteredTasks={filteredTasksCount}
              onResetFilters={resetFilters}
            />

            {/* Kanban Columns with Drag-and-Drop & Card Inspection */}
            <KanbanBoard
              initialColumns={filteredColumns}
              columnCounts={boardState.columnCounts}
              onRefreshBoard={handleRefreshAll}
              onError={(msg) => setError(msg)}
              onSelectTask={(task) => setSelectedTask(task)}
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
          onTaskCreated={handleRefreshAll}
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

      {/* Task Detail & Edit / Delete Modal */}
      {selectedTask && selectedProjectId && (
        <TaskDetailModal
          task={selectedTask}
          projectId={selectedProjectId}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={handleRefreshAll}
          onError={(msg) => setError(msg)}
        />
      )}

      {/* Team Members Management Modal */}
      {selectedProjectId && boardState && (
        <TeamMembersModal
          isOpen={isTeamModalOpen}
          projectId={selectedProjectId}
          projectName={boardState.project.name}
          onClose={() => setIsTeamModalOpen(false)}
          onMembersUpdated={handleRefreshAll}
          onError={(msg) => setError(msg)}
        />
      )}
    </div>
  );
}

export default App;
