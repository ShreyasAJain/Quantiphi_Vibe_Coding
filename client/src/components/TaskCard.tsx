import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task, Priority } from '../types';
import { Calendar, User as UserIcon } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  index: number;
}

const priorityConfig: Record<
  Priority,
  { label: string; bg: string; text: string; border: string }
> = {
  URGENT: {
    label: 'Urgent',
    bg: 'bg-red-950/80',
    text: 'text-red-400',
    border: 'border-red-800',
  },
  HIGH: {
    label: 'High',
    bg: 'bg-amber-950/80',
    text: 'text-amber-400',
    border: 'border-amber-800',
  },
  MEDIUM: {
    label: 'Medium',
    bg: 'bg-blue-950/80',
    text: 'text-blue-400',
    border: 'border-blue-800',
  },
  LOW: {
    label: 'Low',
    bg: 'bg-slate-800',
    text: 'text-slate-400',
    border: 'border-slate-700',
  },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, index }) => {
  const p = priorityConfig[task.priority] || priorityConfig.MEDIUM;

  const initials = task.assignedUser?.name
    ? task.assignedUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : null;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-slate-900 border rounded-xl p-3.5 shadow-md transition-all duration-150 select-none group ${
            snapshot.isDragging
              ? 'border-indigo-500 ring-2 ring-indigo-500/50 shadow-2xl scale-[1.02] bg-slate-850'
              : 'border-slate-800 hover:border-slate-700 hover:shadow-indigo-500/5'
          }`}
        >
          {/* Card Header: Title & Priority */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition line-clamp-2">
              {task.title}
            </h4>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex-shrink-0 ${p.bg} ${p.text} ${p.border}`}
            >
              {p.label}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Footer: Assignee & Due Date */}
          <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 text-xs">
            {/* Assignee Avatar & Name */}
            <div className="flex items-center gap-2 text-slate-300 min-w-0">
              {task.assignedUser ? (
                <div
                  className="w-6 h-6 rounded-full bg-indigo-700 border border-indigo-500/40 flex items-center justify-center text-[10px] font-bold text-white shadow-inner flex-shrink-0"
                  title={`Assigned to ${task.assignedUser.name}`}
                >
                  {initials}
                </div>
              ) : (
                <div
                  className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 flex-shrink-0"
                  title="Unassigned"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
              )}
              <span className="truncate max-w-[120px] text-[11px] text-slate-400">
                {task.assignedUser ? task.assignedUser.name : 'Unassigned'}
              </span>
            </div>

            {/* Due Date if present */}
            {task.dueDate && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};
