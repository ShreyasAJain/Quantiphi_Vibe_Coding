import React, { useState, useEffect } from 'react';
import { ProjectMember, User } from '../types';
import { api } from '../services/api';
import {
  X,
  Users,
  UserPlus,
  Shield,
  AlertCircle,
  Mail,
  UserCheck,
} from 'lucide-react';

interface TeamMembersModalProps {
  isOpen: boolean;
  projectId: string;
  projectName: string;
  onClose: () => void;
  onMembersUpdated: () => void;
  onError: (msg: string) => void;
}

export const TeamMembersModal: React.FC<TeamMembersModalProps> = ({
  isOpen,
  projectId,
  projectName,
  onClose,
  onMembersUpdated,
  onError,
}) => {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'MEMBER' | 'OWNER'>('MEMBER');

  // Quick user creation
  const [isCreatingNewUser, setIsCreatingNewUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && projectId) {
      loadData();
    }
  }, [isOpen, projectId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setFormError(null);
      const [membersData, usersData] = await Promise.all([
        api.getProjectMembers(projectId),
        api.getUsers(),
      ]);
      setMembers(membersData);
      setAllUsers(usersData);
    } catch (err: any) {
      setFormError(err.message || 'Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  };

  const existingMemberUserIds = new Set(members.map((m) => m.userId));
  const availableUsersToAdd = allUsers.filter((u) => !existingMemberUserIds.has(u.id));

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      setIsSubmitting(true);

      let targetUserId = selectedUserId;

      // If user wants to create a new user on the fly
      if (isCreatingNewUser) {
        if (!newUserName.trim() || !newUserEmail.trim()) {
          setFormError('Please enter both name and email');
          setIsSubmitting(false);
          return;
        }

        const newUser = await api.createUser(newUserName.trim(), newUserEmail.trim());
        targetUserId = newUser.id;
      }

      if (!targetUserId) {
        setFormError('Please select a user to add');
        setIsSubmitting(false);
        return;
      }

      await api.addProjectMember(projectId, targetUserId, selectedRole);

      // Reset form states
      setSelectedUserId('');
      setNewUserName('');
      setNewUserEmail('');
      setIsCreatingNewUser(false);

      await loadData();
      onMembersUpdated();
    } catch (err: any) {
      setFormError(err.message || 'Failed to add project member');
      onError(err.message || 'Failed to add project member');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Project Team Members</h3>
              <p className="text-xs text-slate-400">{projectName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {formError && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Current Members List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Team ({members.length})
              </h4>
            </div>

            {isLoading ? (
              <p className="text-xs text-slate-500 py-3 text-center">Loading team members...</p>
            ) : members.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No members found in this project.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-indigo-700/80 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {m.user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{m.user.name}</p>
                        <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                          <Mail className="w-2.5 h-2.5" />
                          {m.user.email}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 flex items-center gap-1 ${
                        m.role === 'OWNER'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      <Shield className="w-2.5 h-2.5" />
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Member Section */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
                Add Member to Project
              </h4>
              <button
                type="button"
                onClick={() => setIsCreatingNewUser(!isCreatingNewUser)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium"
              >
                {isCreatingNewUser ? '← Pick Existing User' : '+ Create New User'}
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3">
              {isCreatingNewUser ? (
                <div className="space-y-2.5 bg-slate-950/80 p-3.5 border border-slate-800 rounded-xl">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="e.g. alex@company.dev"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Select User
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Choose User --</option>
                    {availableUsersToAdd.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                  {availableUsersToAdd.length === 0 && (
                    <p className="text-[10px] text-slate-500 mt-1">
                      All system users are already members of this project. Use "Create New User" to register more team members!
                    </p>
                  )}
                </div>
              )}

              {/* Role Picker */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Project Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'MEMBER' | 'OWNER')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="MEMBER">Member</option>
                  <option value="OWNER">Owner</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || (!isCreatingNewUser && !selectedUserId)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span>Adding Member...</span>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{isCreatingNewUser ? 'Create & Add to Project' : 'Add to Project'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
