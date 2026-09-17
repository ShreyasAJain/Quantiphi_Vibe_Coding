import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  count: number;
  tasks: Task[];
  accentColor: string;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  count,
  tasks,
  accentColor,
}) => {
  return (
    <div className="flex flex-col bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur min-h-[500px]">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className={`w-3 h-3 rounded-full ${accentColor}`} />
          <h3 className="font-semibold text-sm text-slate-200 tracking-tight">
            {title}
          </h3>
        </div>

        {/* Server-Provided Column Task Count Badge */}
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-850 text-slate-300 border border-slate-700 shadow-inner">
          {count}
        </span>
      </div>

      {/* Droppable Container */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-3 rounded-xl p-1.5 transition-colors duration-150 min-h-[350px] ${
              snapshot.isDraggingOver
                ? 'bg-indigo-950/20 ring-2 ring-indigo-500/40 border border-dashed border-indigo-500/50'
                : 'bg-transparent'
            }`}
          >
            {tasks.length === 0 ? (
              <div className="h-36 flex flex-col items-center justify-center border-2 border-dashed border-slate-800/80 rounded-xl text-slate-500 text-xs gap-1">
                <span>No tasks in {title}</span>
                <span className="text-[10px] text-slate-600">Drag tasks here</span>
              </div>
            ) : (
              tasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
