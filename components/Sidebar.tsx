'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, Search, Library, Heart, User, Sun, Moon, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';
import { motion, AnimatePresence } from 'motion/react';

const navItems = [
  { name: 'Home', icon: Home, href: '/' },
  { name: 'Search', icon: Search, href: '/search' },
  { name: 'Library', icon: Library, href: '/library' },
  { name: 'Liked', icon: Heart, href: '/favorites' },
  { name: 'Profile', icon: User, href: '/profile' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Desktop Floating Dock — top of screen */}
      <nav
        className="hidden md:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-6 py-2"
        style={{ background: 'var(--dock-bg)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl aurora-bg flex items-center justify-center shadow-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <span className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>SonicStream</span>
        </Link>

        {/* Center Pill Nav */}
        <div className="flex items-center gap-1 p-1 rounded-2xl" style={{ background: 'var(--bg-card)' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 relative",
                  isActive ? "" : "hover:opacity-80"
                )}
                style={isActive ? { background: 'var(--accent)', color: '#fff' } : { color: 'var(--text-secondary)' }}
              >
                <item.icon size={17} />
                <span className="hidden lg:inline">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right: Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl transition-all duration-300 hover:scale-105"
          style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </nav>

      {/* Mobile Bottom Dock */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-[60] flex items-center justify-around px-2 py-2 pb-safe"
        style={{ background: 'var(--dock-bg)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderTop: '1px solid var(--border)' }}
      >
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-300",
              )}
              style={isActive ? { color: 'var(--accent)' } : { color: 'var(--text-muted)' }}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-bold">{item.name}</span>
            </Link>
          );
        })}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all"
          style={{ color: 'var(--text-muted)' }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span className="text-[10px] font-bold">Theme</span>
        </button>
      </nav>
    </>
  );
}
