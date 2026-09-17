import React from 'react';
import { Priority, ProjectMember } from '../types';
import { Search, Filter, X, User } from 'lucide-react';

interface BoardFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedPriority: Priority | 'ALL';
  onPriorityChange: (p: Priority | 'ALL') => void;
  selectedAssignee: string;
  onAssigneeChange: (userId: string) => void;
  members: ProjectMember[];
  totalTasks: number;
  filteredTasks: number;
  onResetFilters: () => void;
}

export const BoardFilterToolbar: React.FC<BoardFilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  selectedAssignee,
  onAssigneeChange,
  members,
  totalTasks,
  filteredTasks,
  onResetFilters,
}) => {
  const isFiltered = searchQuery !== '' || selectedPriority !== 'ALL' || selectedAssignee !== '';

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 shadow-md backdrop-blur flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter tasks by title or description..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Selectors */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Priority Filter */}
        <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
          <Filter className="w-3 h-3 text-slate-400 mr-1.5" />
          <select
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value as Priority | 'ALL')}
            className="bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900">All Priorities</option>
            <option value="LOW" className="bg-slate-900">Low</option>
            <option value="MEDIUM" className="bg-slate-900">Medium</option>
            <option value="HIGH" className="bg-slate-900">High</option>
            <option value="URGENT" className="bg-slate-900">Urgent</option>
          </select>
        </div>

        {/* Assignee Filter */}
        <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
          <User className="w-3 h-3 text-slate-400 mr-1.5" />
          <select
            value={selectedAssignee}
            onChange={(e) => onAssigneeChange(e.target.value)}
            className="bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-slate-900">All Assignees</option>
            <option value="unassigned" className="bg-slate-900">Unassigned</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId} className="bg-slate-900">
                {m.user.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filters & Match count */}
        {isFiltered && (
          <button
            onClick={onResetFilters}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition flex items-center gap-1"
          >
            <X className="w-3 h-3 text-slate-400" />
            <span>Reset ({filteredTasks}/{totalTasks})</span>
          </button>
        )}
      </div>
    </div>
  );
};
