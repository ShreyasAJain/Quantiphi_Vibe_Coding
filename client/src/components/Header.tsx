import React from 'react';
import { Project } from '../types';
import { Kanban, Plus, FolderPlus } from 'lucide-react';

interface HeaderProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  onOpenNewTaskModal: () => void;
  onOpenNewProjectModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onOpenNewTaskModal,
  onOpenNewProjectModal,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-30 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Kanban className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight flex items-center gap-2">
              Kanban & Workload Balancing
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Server-Side Rules
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              PostgreSQL Relational Task Management
            </p>
          </div>
        </div>

        {/* Project Selector & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Project Switcher Dropdown */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <span className="text-slate-400 mr-2 font-medium">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => onSelectProject(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenNewProjectModal}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
            title="Create New Project"
          >
            <FolderPlus className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">New Project</span>
          </button>

          <button
            onClick={onOpenNewTaskModal}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
