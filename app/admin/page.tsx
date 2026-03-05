'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthContext';
import { UserPlus, Trash2, Key, Shield, ShieldOff, Loader2, Users } from 'lucide-react';

interface AdminUser {
  id: number;
  username: string;
  is_admin: boolean;
  created_at: string;
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [usersMessage, setUsersMessage] = useState('');

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createMessage, setCreateMessage] = useState('');

  const [resetPasswordUserId, setResetPasswordUserId] = useState<number | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) {
      router.replace('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.is_admin) {
      fetchUsers();
    }
  }, [user]);

  async function fetchUsers() {
    setFetchingUsers(true);
    setUsersError('');
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setUsersError(err.message || 'Failed to fetch users');
    } finally {
      setFetchingUsers(false);
    }
  }

  async function handleCreateUser(e: FormEvent) {
    e.preventDefault();
    setCreateError('');
    setCreateMessage('');
    setCreating(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Failed to create user' }));
        throw new Error(body.error || 'Failed to create user');
      }
      setCreateMessage(`User "${newUsername}" created successfully.`);
      setNewUsername('');
      setNewPassword('');
      fetchUsers();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  }

  async function handleResetPassword(userId: number) {
    if (!resetPasswordValue.trim()) return;
    setResettingPassword(true);
    setUsersError('');
    setUsersMessage('');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPasswordValue }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Failed to reset password' }));
        throw new Error(body.error || 'Failed to reset password');
      }
      setUsersMessage('Password reset successfully.');
      setResetPasswordUserId(null);
      setResetPasswordValue('');
    } catch (err: any) {
      setUsersError(err.message || 'Failed to reset password');
    } finally {
      setResettingPassword(false);
    }
  }

  async function handleToggleAdmin(targetUser: AdminUser) {
    setActionLoading(targetUser.id);
    setUsersError('');
    setUsersMessage('');
    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_admin: !targetUser.is_admin }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Failed to update user' }));
        throw new Error(body.error || 'Failed to update user');
      }
      setUsersMessage(`${targetUser.username} is ${targetUser.is_admin ? 'no longer' : 'now'} an admin.`);
      fetchUsers();
    } catch (err: any) {
      setUsersError(err.message || 'Failed to update user');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteUser(userId: number) {
    setActionLoading(userId);
    setUsersError('');
    setUsersMessage('');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Failed to delete user' }));
        throw new Error(body.error || 'Failed to delete user');
      }
      setUsersMessage('User deleted successfully.');
      setConfirmDeleteId(null);
      fetchUsers();
    } catch (err: any) {
      setUsersError(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  }

  if (loading || !user?.is_admin) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <h1 className="text-2xl font-display font-bold text-ink">Admin Dashboard</h1>

      {/* Create User */}
      <section className="rounded-lg border border-border bg-ivory p-6 shadow-sm">
        <h2 className="text-lg font-medium text-ink mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-saffron" />
          Create User
        </h2>

        {createError && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{createError}</div>
        )}
        {createMessage && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">{createMessage}</div>
        )}

        <form onSubmit={handleCreateUser} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label htmlFor="new-username" className="block text-sm font-medium text-ink-light mb-1">
              Username
            </label>
            <input
              id="new-username"
              type="text"
              required
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              disabled={creating}
              className="w-full rounded-md border border-border px-3 py-2 text-sm shadow-sm focus:border-saffron focus:ring-1 focus:ring-saffron outline-none disabled:opacity-50"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label htmlFor="new-password" className="block text-sm font-medium text-ink-light mb-1">
              Password
            </label>
            <input
              id="new-password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={creating}
              className="w-full rounded-md border border-border px-3 py-2 text-sm shadow-sm focus:border-saffron focus:ring-1 focus:ring-saffron outline-none disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-md bg-saffron px-4 py-2 text-sm font-medium text-white hover:bg-saffron-light transition-colors disabled:opacity-50"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Create
          </button>
        </form>
      </section>

      {/* User List */}
      <section className="rounded-lg border border-border bg-ivory p-6 shadow-sm">
        <h2 className="text-lg font-medium text-ink mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-saffron" />
          Users
        </h2>

        {usersError && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{usersError}</div>
        )}
        {usersMessage && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">{usersMessage}</div>
        )}

        {fetchingUsers ? (
          <div className="flex items-center justify-center py-8 text-ink-muted">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading users…
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-ink-muted py-4">No users found.</p>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="rounded-md border border-border-light bg-cream p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-ink">{u.username}</span>
                    {u.is_admin && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-temple-red/10 px-2 py-0.5 text-xs font-medium text-temple-red">
                        <Shield className="h-3 w-3" />
                        Admin
                      </span>
                    )}
                    <span className="text-xs text-ink-muted">
                      Joined {new Date(u.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {u.id !== user.id && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setResetPasswordUserId(resetPasswordUserId === u.id ? null : u.id);
                          setResetPasswordValue('');
                        }}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-light hover:text-ink hover:bg-ivory transition-colors border border-border-light"
                        title="Reset password"
                      >
                        <Key className="h-3.5 w-3.5" />
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleToggleAdmin(u)}
                        disabled={actionLoading === u.id}
                        className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-light hover:text-ink hover:bg-ivory transition-colors border border-border-light disabled:opacity-50"
                        title={u.is_admin ? 'Remove admin' : 'Make admin'}
                      >
                        {actionLoading === u.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : u.is_admin ? (
                          <ShieldOff className="h-3.5 w-3.5" />
                        ) : (
                          <Shield className="h-3.5 w-3.5" />
                        )}
                        {u.is_admin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                      {confirmDeleteId === u.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={actionLoading === u.id}
                            className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === u.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-muted hover:text-ink transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(u.id)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors border border-border-light"
                          title="Delete user"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {resetPasswordUserId === u.id && (
                  <div className="mt-3 flex items-end gap-2 pt-3 border-t border-border-light">
                    <div className="flex-1">
                      <label htmlFor={`reset-pw-${u.id}`} className="block text-xs font-medium text-ink-light mb-1">
                        New Password
                      </label>
                      <input
                        id={`reset-pw-${u.id}`}
                        type="password"
                        value={resetPasswordValue}
                        onChange={(e) => setResetPasswordValue(e.target.value)}
                        disabled={resettingPassword}
                        className="w-full rounded-md border border-border px-3 py-1.5 text-sm shadow-sm focus:border-saffron focus:ring-1 focus:ring-saffron outline-none disabled:opacity-50"
                      />
                    </div>
                    <button
                      onClick={() => handleResetPassword(u.id)}
                      disabled={resettingPassword || !resetPasswordValue.trim()}
                      className="inline-flex items-center gap-1.5 rounded-md bg-saffron px-3 py-1.5 text-sm font-medium text-white hover:bg-saffron-light transition-colors disabled:opacity-50"
                    >
                      {resettingPassword ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Key className="h-3.5 w-3.5" />}
                      Reset
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
