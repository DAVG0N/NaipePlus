'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, User, LogOut, Sparkles, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  const notificationsContainerRef = React.useRef<HTMLDivElement>(null);
  const profileContainerRef = React.useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const {
    searchQuery,
    setSearchQuery,
    notifications,
    markAsRead,
    markAllAsRead,
    userName,
    userEmail,
    userAvatarUrl,
  } = useAppStore();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const avatarGradientClass = userAvatarUrl || 'from-netflix-red to-red-800';

  const toggleSearch = () => {
    setIsSearchOpen((prev) => {
      const nextState = !prev;
      if (nextState) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      return nextState;
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        if (!searchQuery.trim()) {
          setIsSearchOpen(false);
        }
      }
      if (notificationsContainerRef.current && !notificationsContainerRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
      if (profileContainerRef.current && !profileContainerRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isSearchOpen || searchQuery.trim()) {
          setSearchQuery('');
          setIsSearchOpen(false);
          searchInputRef.current?.blur();
        }
        if (isNotificationsOpen) {
          setIsNotificationsOpen(false);
        }
        if (isProfileOpen) {
          setIsProfileOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchQuery, isSearchOpen, isNotificationsOpen, isProfileOpen, setSearchQuery]);

  const navLinks = [
    { href: '/', label: 'Início' },
    { href: '/series', label: 'Séries' },
    { href: '/movies', label: 'Filmes' },
    { href: '/animes', label: 'Animes', isNew: true },
  ];

  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? 'bg-netflix-black/95 backdrop-blur-md shadow-lg' : 'glass-nav'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Brand Logo & Navigation */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-3 group">
            <Image
              src="/logo_naipe.svg"
              alt="NAIPE+"
              width={36}
              height={36}
              className="h-9 w-auto transition-transform group-hover:scale-105 drop-shadow-md"
              priority
            />
            <span className="text-2xl font-black tracking-wider text-white">
              NAIPE<span className="text-netflix-red">+</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-white flex items-center gap-1.5 ${
                    isActive ? 'font-bold text-white' : 'text-netflix-gray'
                  }`}
                >
                  {link.label}
                  {link.isNew && (
                    <span className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase shadow-sm">
                      <Sparkles className="h-2.5 w-2.5" /> Breve
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Search, Notifications & User Menu */}
        <div className="flex items-center space-x-4">
          {/* Animated Search Bar */}
          <div ref={searchContainerRef} className="relative flex items-center">
            <button
              onClick={toggleSearch}
              className="p-2 text-netflix-lightGray hover:text-white transition-colors"
              aria-label="Procurar"
            >
              <Search className="h-5 w-5" />
            </button>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Títulos, pessoas, géneros..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={`transition-all duration-300 text-sm bg-black/80 text-white border border-gray-700 rounded-full focus:outline-none focus:border-netflix-red ${
                isSearchOpen || searchQuery.trim() ? 'w-48 sm:w-64 px-4 py-1.5 opacity-100' : 'w-0 opacity-0 p-0 border-none'
              }`}
            />
          </div>

          {/* Notifications Dropdown Container */}
          <div ref={notificationsContainerRef} className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileOpen(false);
              }}
              className="p-2 text-netflix-lightGray hover:text-white transition-colors relative focus:outline-none"
              aria-label="Notificações"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-netflix-red animate-ping" />
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-netflix-red text-[9px] font-bold text-white">
                    {unreadCount}
                  </span>
                </>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-netflix-dark border border-gray-800 shadow-2xl z-50 overflow-hidden animate-fadeIn">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-black/40">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-netflix-red" />
                    <span className="text-sm font-bold text-white">Notificações</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-netflix-red/20 px-2 py-0.5 text-xs font-semibold text-netflix-red border border-netflix-red/30">
                        {unreadCount} novas
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-netflix-gray hover:text-white transition-colors"
                    >
                      Marcar lidas
                    </button>
                  )}
                </div>

                {/* Notifications Items List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-800/60 no-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-8 px-4 text-center text-xs text-netflix-gray space-y-2">
                      <p className="font-semibold text-gray-300">Sem novas notificações</p>
                      <p>Adicione séries à &quot;Minha Lista&quot; para receber alertas de novos episódios e atualizações.</p>
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => markAsRead(item.id)}
                        className={`flex items-start space-x-3 p-3 transition-colors cursor-pointer ${
                          item.read ? 'bg-netflix-dark/50 opacity-70 hover:opacity-100' : 'bg-netflix-card/60 hover:bg-netflix-card'
                        }`}
                      >
                        <div className="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded bg-black">
                          <Image
                            src={item.posterPath}
                            alt={item.seriesTitle}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-netflix-red truncate">
                              {item.title}
                            </span>
                            {!item.read && (
                              <span className="h-2 w-2 rounded-full bg-netflix-red flex-shrink-0 ml-1" />
                            )}
                          </div>
                          <p className="text-xs text-white leading-snug line-clamp-2">
                            {item.message}
                          </p>
                          <span className="text-[10px] text-netflix-gray block pt-0.5">
                            {item.date}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div ref={profileContainerRef} className="relative">
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center space-x-2 focus:outline-none"
            >
              {userAvatarUrl && (userAvatarUrl.startsWith('http') || userAvatarUrl.startsWith('data:') || userAvatarUrl.startsWith('blob:') || userAvatarUrl.startsWith('/')) ? (
                <div className="relative h-8 w-8 rounded overflow-hidden shadow border border-white/20">
                  <img src={userAvatarUrl} alt={userName} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className={`h-8 w-8 rounded bg-gradient-to-tr ${avatarGradientClass} flex items-center justify-center font-bold text-white text-sm shadow border border-white/20`}>
                  N+
                </div>
              )}
              <ChevronDown className={`h-4 w-4 text-white transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-md bg-netflix-dark border border-gray-800 shadow-2xl py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-gray-800 space-y-0.5">
                  <p className="text-xs font-bold text-white truncate">{userName}</p>
                  <p className="text-[11px] text-netflix-gray truncate">{userEmail}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center px-4 py-2 text-sm font-semibold text-white hover:bg-netflix-card"
                >
                  <User className="h-4 w-4 mr-2 text-netflix-red" /> O Meu Perfil
                </Link>
                <button
                  onClick={async () => {
                    setIsProfileOpen(false);
                    try {
                      const { createClient } = await import('@/lib/supabase/client');
                      const supabase = createClient();
                      await supabase.auth.signOut();
                    } catch {}
                    document.cookie = 'naipe_session=; path=/; max-age=0';
                    router.push('/login');
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-500 hover:bg-netflix-card hover:text-red-400 text-left"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Terminar Sessão
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
