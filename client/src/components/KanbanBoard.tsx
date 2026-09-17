import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Task, TaskStatus, ColumnCounts } from '../types';
import { KanbanColumn } from './KanbanColumn';
import { api } from '../services/api';

interface KanbanBoardProps {
  initialColumns: {
    TODO: Task[];
    IN_PROGRESS: Task[];
    DONE: Task[];
  };
  columnCounts: ColumnCounts;
  onRefreshBoard: () => void;
  onError: (msg: string) => void;
  onSelectTask?: (task: Task) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  initialColumns,
  columnCounts,
  onRefreshBoard,
  onError,
  onSelectTask,
}) => {
  // Local state for optimistic UI updates
  const [columns, setColumns] = useState(initialColumns);

  // Sync with prop updates
  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // 1. Dropped outside or in the exact same position
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const sourceStatus = source.droppableId as TaskStatus;
    const destStatus = destination.droppableId as TaskStatus;

    // 2. Snapshot current state for rollback on network error
    const previousColumns = { ...columns };

    // 3. OPTIMISTIC UPDATE: Move task instantly in local state
    const sourceList = Array.from(columns[sourceStatus]);
    const destList =
      sourceStatus === destStatus
        ? sourceList
        : Array.from(columns[destStatus]);

    const [movedTask] = sourceList.splice(source.index, 1);
    const updatedTask = { ...movedTask, status: destStatus };

    destList.splice(destination.index, 0, updatedTask);

    setColumns({
      ...columns,
      [sourceStatus]: sourceList,
      [destStatus]: destList,
    });

    // 4. Send API request to persist in PostgreSQL
    try {
      await api.updateTaskStatus(draggableId, destStatus);
      // Synchronize column counts and workload with backend
      onRefreshBoard();
    } catch (err: any) {
      // 5. ROLLBACK on failure
      setColumns(previousColumns);
      onError(err.message || 'Failed to move task. Reverting changes.');
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KanbanColumn
          status="TODO"
          title="To-Do"
          count={columnCounts.TODO}
          tasks={columns.TODO}
          accentColor="bg-slate-400"
          onSelectTask={onSelectTask}
        />
        <KanbanColumn
          status="IN_PROGRESS"
          title="In Progress"
          count={columnCounts.IN_PROGRESS}
          tasks={columns.IN_PROGRESS}
          accentColor="bg-indigo-500 animate-pulse"
          onSelectTask={onSelectTask}
        />
        <KanbanColumn
          status="DONE"
          title="Done"
          count={columnCounts.DONE}
          tasks={columns.DONE}
          accentColor="bg-emerald-500"
          onSelectTask={onSelectTask}
        />
      </div>
    </DragDropContext>
  );
};
