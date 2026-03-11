'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Users, Heart, ListMusic, UserCheck, Package, Trash2, Shield, ShieldCheck, Search, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
  stats: { likedSongs: number; playlists: number; followedArtists: number; queueItems: number; };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('admin-session');
    if (!session) { router.push('/admin/login'); return; }
    const user = JSON.parse(session);
    if (user.role !== 'ADMIN') { router.push('/admin/login'); return; }
    setAdmin(user);
  }, [router]);

  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => { const res = await fetch('/api/admin/stats'); return res.json(); },
    enabled: !!admin,
  });

  const { data: usersData, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: async () => { const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`); return res.json(); },
    enabled: !!admin,
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      return res.json();
    },
    onSuccess: () => { toast.success('User deleted'); refetchUsers(); refetchStats(); },
    onError: () => toast.error('Failed to delete user'),
  });

  const toggleRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, data: { role } }),
      });
      return res.json();
    },
    onSuccess: () => { toast.success('Role updated'); refetchUsers(); },
    onError: () => toast.error('Failed to update role'),
  });

  const seedAdmin = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      return res.json();
    },
    onSuccess: (data) => toast.success(data.message),
    onError: () => toast.error('Failed to seed admin'),
  });

  const handleLogout = () => {
    localStorage.removeItem('admin-session');
    router.push('/admin/login');
  };

  if (!admin) return null;

  const stats = statsData || {};
  const users: AdminUser[] = usersData?.users || [];

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers || 0, icon: Users, color: 'var(--accent)' },
    { label: 'Liked Songs', value: stats.totalLikes || 0, icon: Heart, color: 'var(--accent-secondary)' },
    { label: 'Playlists', value: stats.totalPlaylists || 0, icon: ListMusic, color: 'var(--accent-tertiary)' },
    { label: 'Followed Artists', value: stats.totalFollows || 0, icon: UserCheck, color: 'var(--accent-ocean)' },
    { label: 'Queue Items', value: stats.totalQueued || 0, icon: Package, color: '#8b5cf6' },
  ];

  return (
    <div className="min-h-screen px-4 md:px-8 pb-10" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="flex items-center justify-between py-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 aurora-bg rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Admin Dashboard</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Logged in as {admin.name}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="glass-card px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 my-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="glass-card p-5 rounded-2xl">
            <stat.icon size={24} className="mb-3" style={{ color: stat.color }} />
            <p className="text-2xl font-extrabold mb-0.5" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Seed admin button */}
      <div className="mb-6">
        <button onClick={() => seedAdmin.mutate()} disabled={seedAdmin.isPending} className="glass-card px-4 py-2 rounded-xl text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
          {seedAdmin.isPending ? 'Seeding...' : '🌱 Seed Default Admin'}
        </button>
      </div>

      {/* Users */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Users ({users.length})</h2>
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm font-medium" style={{ color: 'var(--text-primary)', background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
          </div>
        </div>

        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {users.map((user) => (
            <div key={user.id}>
              <div className="flex items-center gap-4 p-4 cursor-pointer transition-all hover:bg-opacity-50" style={{ background: expandedUser === user.id ? 'var(--bg-card)' : 'transparent' }} onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm" style={{ background: user.role === 'ADMIN' ? 'var(--accent)' : 'var(--bg-card-hover)' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                    {user.role === 'ADMIN' && <span className="text-[8px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: 'var(--accent)' }}>ADMIN</span>}
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                </div>
                <div className="hidden md:flex items-center gap-6 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>❤️ {user.stats.likedSongs}</span>
                  <span>📋 {user.stats.playlists}</span>
                  <span>👤 {user.stats.followedArtists}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); toggleRole.mutate({ userId: user.id, role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' }); }} className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--text-muted)' }} title={user.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}>
                    {user.role === 'ADMIN' ? <ShieldCheck size={16} /> : <Shield size={16} />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); if (confirm(`Delete user ${user.name}?`)) deleteUser.mutate(user.id); }} className="p-1.5 rounded-lg transition-all" style={{ color: '#e74c3c' }} title="Delete User">
                    <Trash2 size={16} />
                  </button>
                  {expandedUser === user.id ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                </div>
              </div>

              {expandedUser === user.id && (
                <div className="px-6 pb-5 pt-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                    <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Liked Songs</p>
                    <p className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>{user.stats.likedSongs}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                    <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Playlists</p>
                    <p className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>{user.stats.playlists}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                    <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Followed Artists</p>
                    <p className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>{user.stats.followedArtists}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                    <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Queue Items</p>
                    <p className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>{user.stats.queueItems}</p>
                  </div>
                  <div className="col-span-2 md:col-span-4 p-3 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                    <p className="text-xs font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Member Since</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {users.length === 0 && (
            <div className="p-10 text-center">
              <Users size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
