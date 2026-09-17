import React, { useState } from 'react';
import {
  CheckCircle,
  Database,
  Server,
  Layers,
  Layout,
  Sliders,
  ChevronDown,
  ChevronUp,
  Cpu,
} from 'lucide-react';

interface BuildMilestone {
  id: number;
  title: string;
  category: 'Database' | 'Backend API' | 'Business Logic' | 'Frontend Core' | 'Interactive UI';
  badgeColor: string;
  files: string[];
  endpoints?: string[];
  highlights: string[];
  status: 'Complete' | 'Active';
}

const BUILDS: BuildMilestone[] = [
  {
    id: 1,
    title: 'PostgreSQL 16 & Relational Prisma Schema',
    category: 'Database',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    files: ['server/prisma/schema.prisma', 'docker-compose.yml'],
    highlights: [
      'Relational schema: users, projects, project_members, tasks',
      'Enums: TaskStatus (TODO, IN_PROGRESS, DONE), Priority, ProjectRole',
      'Foreign keys with CASCADE and SET NULL on member removal',
      'Indexes on [projectId, status] and [assignedUserId, status]',
    ],
    status: 'Complete',
  },
  {
    id: 2,
    title: 'Express Server & Centralized Error Middleware',
    category: 'Backend API',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    files: ['server/src/app.ts', 'server/src/index.ts', 'server/src/middlewares/errorHandler.ts'],
    endpoints: ['GET /api/health'],
    highlights: [
      'Configured Express 5 with CORS and JSON parser',
      'Prisma client singleton with connection lifecycle handling',
      'Centralized AppError classes (BadRequest, NotFound, Conflict, Forbidden)',
      'Consistent JSON envelope: { success, message, data, error }',
    ],
    status: 'Complete',
  },
  {
    id: 3,
    title: 'User Management API & Zod Validation',
    category: 'Backend API',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    files: ['server/src/controllers/user.controller.ts', 'server/src/schemas/user.schema.ts'],
    endpoints: ['GET /api/users', 'POST /api/users', 'GET /api/users/:id'],
    highlights: [
      'User creation with email format and uniqueness validation',
      'List all users and fetch individual user profiles',
      'Graceful 409 Conflict handling on duplicate email registration',
    ],
    status: 'Complete',
  },
  {
    id: 4,
    title: 'Project & Team Membership API',
    category: 'Backend API',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    files: ['server/src/controllers/project.controller.ts', 'server/src/routes/project.routes.ts'],
    endpoints: ['GET /api/projects', 'POST /api/projects', 'POST /api/projects/:id/members'],
    highlights: [
      'Project CRUD with automated project owner role attribution',
      'Add members to projects with role validation (OWNER, MEMBER)',
      'Unique constraint on [projectId, userId] prevents duplicate membership',
    ],
    status: 'Complete',
  },
  {
    id: 5,
    title: 'Task CRUD & Strict Member Assignment Rules',
    category: 'Backend API',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    files: ['server/src/controllers/task.controller.ts', 'server/src/routes/task.routes.ts'],
    endpoints: ['GET /api/projects/:id/tasks', 'POST /api/projects/:id/tasks', 'PATCH /api/tasks/:id/status'],
    highlights: [
      'Enforces rule: Assignee MUST be an existing member of the target project',
      'Atomic status transition endpoint optimized for Kanban columns',
      'Priority levels (LOW, MEDIUM, HIGH, URGENT) and due date handling',
    ],
    status: 'Complete',
  },
  {
    id: 6,
    title: 'Server-Side Workload Balancing Engine',
    category: 'Business Logic',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    files: ['server/src/services/workload.service.ts', 'server/src/controllers/workload.controller.ts'],
    endpoints: ['GET /api/projects/:id/board', 'GET /api/projects/:id/workload'],
    highlights: [
      'Rule: A user is flagged isOverloaded = true IF AND ONLY IF inProgressCount > 5',
      'Boundary test: Exactly 5 tasks returns isOverloaded = false (at limit)',
      'Unified Board Aggregator returns project, column counts, workload metrics and tasks in 1 roundtrip',
    ],
    status: 'Complete',
  },
  {
    id: 7,
    title: 'React 18 + Vite 6 + Tailwind Frontend Base',
    category: 'Frontend Core',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    files: ['client/vite.config.ts', 'client/tailwind.config.js', 'client/src/index.css'],
    highlights: [
      'Vite dev server with /api proxy pointing to Express on :5000',
      'Tailwind CSS dark palette configuration (slate-900, slate-950, indigo)',
      'Custom Lucide icons and responsive typography',
    ],
    status: 'Complete',
  },
  {
    id: 8,
    title: 'Typed API Client & Dynamic Project Switcher',
    category: 'Frontend Core',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    files: ['client/src/services/api.ts', 'client/src/components/Header.tsx', 'client/src/App.tsx'],
    highlights: [
      'Fully typed TypeScript API client wrapping all REST endpoints',
      'Header component with project dropdown and modal trigger buttons',
      'Auto-selects active project and loads initial board state',
    ],
    status: 'Complete',
  },
  {
    id: 9,
    title: '3-Column Drag-and-Drop Board with Optimistic Updates',
    category: 'Interactive UI',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    files: ['client/src/components/KanbanBoard.tsx', 'client/src/components/KanbanColumn.tsx', 'client/src/components/TaskCard.tsx'],
    highlights: [
      '@hello-pangea/dnd interactive card dragging across To-Do, In Progress, Done',
      'Optimistic UI reordering for instant, zero-latency user feedback',
      'Automatic state rollback and error banner if network request fails',
      'Live column counters synchronized with database',
    ],
    status: 'Complete',
  },
  {
    id: 10,
    title: 'Task Creation Modal & Live Member Assignment',
    category: 'Interactive UI',
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    files: ['client/src/components/CreateTaskModal.tsx'],
    highlights: [
      'Interactive modal for instant task creation into current project',
      'Dynamic assignee selector populated with verified project members',
      'Priority badge selection (Low, Medium, High, Urgent) & date picker',
      'Instant board reload and workload recalculation on submit',
    ],
    status: 'Complete',
  },
  {
    id: 11,
    title: 'Project Creation Modal & Multi-Board Workspace',
    category: 'Interactive UI',
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    files: ['client/src/components/CreateProjectModal.tsx'],
    highlights: [
      'Create new projects dynamically from the UI',
      'Automatic project switcher update and board re-focus',
      'Full multi-tenancy support across isolated project spaces',
    ],
    status: 'Complete',
  },
  {
    id: 12,
    title: 'Real-Time Team Workload Balancer & Capacity Monitor',
    category: 'Business Logic',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    files: ['client/src/components/WorkloadBar.tsx'],
    highlights: [
      'Real-time capacity meters for all project team members',
      'Evaluates server-calculated isOverloaded status directly in UI',
      'Visual alert indicators: Green (Balanced), Amber (At 5 limit), Red Pulse (Overloaded > 5)',
      'Instantly recalculates when tasks are dragged into or out of "In Progress"',
    ],
    status: 'Complete',
  },
];

export const BuildPipelinePanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedBuildId, setExpandedBuildId] = useState<number | null>(null);

  const categories = ['ALL', 'Database', 'Backend API', 'Business Logic', 'Frontend Core', 'Interactive UI'];

  const filteredBuilds = selectedCategory === 'ALL'
    ? BUILDS
    : BUILDS.filter((b) => b.category === selectedCategory);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur">
      {/* Header Bar */}
      <div className="p-4 sm:px-6 bg-slate-900/95 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Full Build Pipeline & Architecture Matrix</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                12 / 12 Builds Live
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Parallel execution history from PostgreSQL database schema to interactive Kanban & Workload Balancer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Collapse Matrix</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Expand All Builds (1–12)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-6 space-y-5">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Database Layer</span>
              </div>
              <p className="text-sm font-bold text-white">PostgreSQL 16</p>
              <p className="text-[10px] text-slate-500">Prisma ORM • 4 Models</p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Server className="w-3.5 h-3.5 text-blue-400" />
                <span>Backend REST API</span>
              </div>
              <p className="text-sm font-bold text-white">Express 5 + Zod</p>
              <p className="text-[10px] text-slate-500">12 Endpoints • Port 5000</p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>Balancing Engine</span>
              </div>
              <p className="text-sm font-bold text-white">&gt; 5 Overload Rule</p>
              <p className="text-[10px] text-slate-500">Server-Side Verified</p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Layout className="w-3.5 h-3.5 text-indigo-400" />
                <span>Frontend SPA</span>
              </div>
              <p className="text-sm font-bold text-white">React 18 + Vite</p>
              <p className="text-[10px] text-slate-500">Drag-and-Drop Kanban</p>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap border-b border-slate-800/80 pb-3">
            <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
              <Sliders className="w-3 h-3" /> Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Builds Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredBuilds.map((build) => {
              const isDetailsOpen = expandedBuildId === build.id;

              return (
                <div
                  key={build.id}
                  className="bg-slate-950/60 border border-slate-800/90 hover:border-slate-700/90 rounded-xl p-4 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top row: Number and Category */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        BUILD #{build.id}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${build.badgeColor}`}>
                        {build.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition mb-2">
                      {build.title}
                    </h3>

                    {/* Highlights bullet list */}
                    <ul className="space-y-1.5 text-[11px] text-slate-400 mb-3">
                      {build.highlights.slice(0, 2).map((h, i) => (
                        <li key={i} className="flex items-start gap-1.5 leading-snug">
                          <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Expandable Details */}
                  {isDetailsOpen && (
                    <div className="pt-2.5 border-t border-slate-800/80 space-y-2 text-[11px] animate-fadeIn">
                      <div>
                        <span className="text-slate-500 font-medium block mb-1">Key Files:</span>
                        <div className="flex flex-wrap gap-1">
                          {build.files.map((f, i) => (
                            <span key={i} className="font-mono text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>

                      {build.endpoints && (
                        <div>
                          <span className="text-slate-500 font-medium block mb-1">Endpoints:</span>
                          <div className="flex flex-wrap gap-1">
                            {build.endpoints.map((ep, i) => (
                              <span key={i} className="font-mono text-[10px] bg-indigo-950/50 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-900/50">
                                {ep}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <span className="text-slate-500 font-medium block mb-1">All Capabilities:</span>
                        <ul className="space-y-1 text-slate-300">
                          {build.highlights.map((h, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-indigo-400 font-bold">•</span>
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Card Footer */}
                  <div className="pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live & Verified
                    </span>
                    <button
                      onClick={() => setExpandedBuildId(isDetailsOpen ? null : build.id)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
                    >
                      {isDetailsOpen ? 'Hide' : 'Details'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
