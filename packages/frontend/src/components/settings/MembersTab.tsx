import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import {
  Plus,
  Clock,
  AlertCircle,
  Users,
  Mail,
  Crown,
  UserCog,
  User,
  Eye,
  X,
} from 'lucide-react';
import {
  fetchWorkspaceDetails,
  inviteMember,
  removeMember,
  cancelInvite,
  updateMemberRole,
  type WorkspaceMember,
  type WorkspaceInvite,
} from '../../lib/api/settings';

export function MembersTab() {
  const { user, currentWorkspace } = useAuth();
  const queryClient = useQueryClient();

  // Members state
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [removeMemberConfirm, setRemoveMemberConfirm] = useState<WorkspaceMember | null>(null);
  const [cancelInviteConfirm, setCancelInviteConfirm] = useState<WorkspaceInvite | null>(null);

  const { data: workspaceDetails, isLoading: membersLoading, error: membersError } = useQuery({
    queryKey: ['workspace', currentWorkspace?.id],
    queryFn: () => fetchWorkspaceDetails(currentWorkspace!.id),
    enabled: !!currentWorkspace?.id,
  });

  const inviteMutation = useMutation({
    mutationFn: inviteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', currentWorkspace?.id] });
      setIsInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('member');
      setInviteError(null);
    },
    onError: (error: Error) => {
      setInviteError(error.message);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: removeMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', currentWorkspace?.id] });
      setRemoveMemberConfirm(null);
    },
  });

  const cancelInviteMutation = useMutation({
    mutationFn: cancelInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', currentWorkspace?.id] });
      setCancelInviteConfirm(null);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: updateMemberRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', currentWorkspace?.id] });
    },
  });

  const handleInvite = () => {
    if (!inviteEmail.trim() || !currentWorkspace?.id) return;
    setInviteError(null);
    inviteMutation.mutate({
      workspaceId: currentWorkspace.id,
      email: inviteEmail.trim(),
      role: inviteRole,
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-3.5 h-3.5" />;
      case 'admin':
        return <UserCog className="w-3.5 h-3.5" />;
      case 'viewer':
        return <Eye className="w-3.5 h-3.5" />;
      default:
        return <User className="w-3.5 h-3.5" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-amber-100 text-amber-700';
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'viewer':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const canManageMembers = workspaceDetails?.role === 'owner' || workspaceDetails?.role === 'admin';
  const isOwner = workspaceDetails?.role === 'owner';

  return (
    <>
      <div className="space-y-6">
        {/* Members Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                  <p className="text-sm text-gray-500">
                    {workspaceDetails?.members.length || 0} member{(workspaceDetails?.members.length || 0) !== 1 ? 's' : ''} in {currentWorkspace?.name}
                  </p>
                </div>
              </div>
              {canManageMembers && (
                <Button onClick={() => setIsInviteDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Invite Member
                </Button>
              )}
            </div>
          </div>

          {/* Members List */}
          <div className="divide-y divide-gray-100">
            {membersLoading && (
              <div className="px-6 py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent mx-auto" />
                <p className="mt-3 text-sm text-gray-500">Loading members...</p>
              </div>
            )}

            {membersError && (
              <div className="px-6 py-12 text-center">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                <p className="mt-3 text-sm text-red-600">Failed to load members</p>
              </div>
            )}

            {workspaceDetails?.members.map((member) => (
              <div key={member.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-10 h-10 rounded-full border border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{member.name}</span>
                      {member.id === user?.id && (
                        <span className="text-xs text-gray-400">(you)</span>
                      )}
                      <span className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(member.role)}`}>
                        {getRoleIcon(member.role)}
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500">
                      <Mail className="w-3.5 h-3.5" />
                      {member.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isOwner && member.role !== 'owner' && (
                    <select
                      value={member.role}
                      onChange={(e) => updateRoleMutation.mutate({
                        workspaceId: currentWorkspace!.id,
                        userId: member.id,
                        role: e.target.value,
                      })}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}
                  {canManageMembers && member.role !== 'owner' && member.id !== user?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRemoveMemberConfirm(member)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Invites Section */}
        {canManageMembers && workspaceDetails?.invites && workspaceDetails.invites.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Pending Invites</h2>
                  <p className="text-sm text-gray-500">
                    {workspaceDetails.invites.length} pending invitation{workspaceDetails.invites.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {workspaceDetails.invites.map((invite) => (
                <div key={invite.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{invite.email}</span>
                        <span className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(invite.role)}`}>
                          {getRoleIcon(invite.role)}
                          {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        Expires {formatDate(invite.expiresAt)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCancelInviteConfirm(invite)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Invite Member Dialog */}
      <Dialog
        open={isInviteDialogOpen}
        onClose={() => {
          setIsInviteDialogOpen(false);
          setInviteEmail('');
          setInviteRole('member');
          setInviteError(null);
        }}
        title="Invite Team Member"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Invite a team member to <strong>{currentWorkspace?.name}</strong>. If they already have an account, they'll be added immediately.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            >
              <option value="viewer">Viewer - Read-only access, cannot scan</option>
              <option value="member">Member - Can view and scan repositories</option>
              <option value="admin">Admin - Can manage members and settings</option>
            </select>
          </div>

          {inviteError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {inviteError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => {
              setIsInviteDialogOpen(false);
              setInviteEmail('');
              setInviteRole('member');
              setInviteError(null);
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!inviteEmail.trim() || inviteMutation.isPending}
            >
              {inviteMutation.isPending ? 'Inviting...' : 'Send Invite'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <ConfirmDialog
        open={!!removeMemberConfirm}
        onClose={() => setRemoveMemberConfirm(null)}
        title="Remove Member"
        message={
          <>
            Are you sure you want to remove <strong>{removeMemberConfirm?.name}</strong> from this workspace?
            They will lose access to all repositories.
          </>
        }
        confirmLabel="Remove Member"
        confirmingLabel="Removing..."
        onConfirm={() => removeMemberConfirm && removeMemberMutation.mutate({
          workspaceId: currentWorkspace!.id,
          userId: removeMemberConfirm.id,
        })}
        isLoading={removeMemberMutation.isPending}
        error={removeMemberMutation.isError}
        errorMessage="Failed to remove member. Please try again."
      />

      {/* Cancel Invite Confirmation Dialog */}
      <ConfirmDialog
        open={!!cancelInviteConfirm}
        onClose={() => setCancelInviteConfirm(null)}
        title="Cancel Invite"
        message={
          <>
            Are you sure you want to cancel the invite for <strong>{cancelInviteConfirm?.email}</strong>?
          </>
        }
        confirmLabel="Cancel Invite"
        confirmingLabel="Canceling..."
        cancelLabel="Keep Invite"
        onConfirm={() => cancelInviteConfirm && cancelInviteMutation.mutate({
          workspaceId: currentWorkspace!.id,
          inviteId: cancelInviteConfirm.id,
        })}
        isLoading={cancelInviteMutation.isPending}
        error={cancelInviteMutation.isError}
        errorMessage="Failed to cancel invite. Please try again."
      />
    </>
  );
}
