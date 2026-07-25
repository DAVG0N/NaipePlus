'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Film,
  ThumbsUp,
  History,
  Play,
  Trash2,
  Heart,
  Sparkles,
  UserCheck,
  Settings,
  User,
  Mail,
  Video,
  CheckCircle2,
  Camera,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
} from 'lucide-react';
import MovieCard from '@/components/MovieCard';
import MovieGrid from '@/components/MovieGrid';
import SearchResults from '@/components/SearchResults';
import { useAppStore } from '@/lib/store';

const AVATAR_PRESETS = [
  { id: 'red-gradient', name: 'N+ Vermelho', class: 'from-netflix-red via-red-700 to-red-900', label: 'N+' },
  { id: 'blue-cyber', name: 'N+ CiberAzul', class: 'from-blue-600 via-indigo-700 to-slate-900', label: 'N+' },
  { id: 'gold-crown', name: 'N+ Dourado', class: 'from-amber-400 via-orange-600 to-stone-900', label: 'N+' },
  { id: 'emerald-shield', name: 'N+ Esmeralda', class: 'from-emerald-500 via-teal-700 to-zinc-900', label: 'N+' },
];

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'liked' | 'my-list' | 'history' | 'settings'>('liked');
  const {
    searchQuery,
    myList,
    likedList,
    watchHistory,
    clearWatchHistory,
    userName,
    userEmail,
    userAvatarUrl,
    trailersEnabled,
    trailersMutedByDefault,
    updateUserProfile,
  } = useAppStore();

  // Local form state for settings
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [nameInput, setNameInput] = useState(userName);
  const [emailInput, setEmailInput] = useState(userEmail);
  const [selectedAvatarClass, setSelectedAvatarClass] = useState(
    userAvatarUrl || AVATAR_PRESETS[0].class
  );
  const [urlInput, setUrlInput] = useState('');
  const [trailersToggle, setTrailersToggle] = useState(trailersEnabled);
  const [mutedToggle, setMutedToggle] = useState(trailersMutedByDefault);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem é demasiado grande. Por favor escolha uma imagem até 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedAvatarClass(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const isCustomAvatar = selectedAvatarClass && (
    selectedAvatarClass.startsWith('http') ||
    selectedAvatarClass.startsWith('data:') ||
    selectedAvatarClass.startsWith('blob:') ||
    selectedAvatarClass.startsWith('/')
  );

  const formatTimestamp = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      userName: nameInput.trim() || 'Utilizador NAIPE+',
      userEmail: emailInput.trim() || 'utilizador@naipe.pt',
      userAvatarUrl: selectedAvatarClass,
      trailersEnabled: trailersToggle,
      trailersMutedByDefault: mutedToggle,
    });
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  if (searchQuery.trim()) {
    return <SearchResults query={searchQuery} pageType="all" />;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Profile Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-netflix-dark via-gray-900 to-netflix-black border border-gray-800 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            {isCustomAvatar ? (
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden shadow-xl border-2 border-netflix-red/40 flex-shrink-0">
                <img src={selectedAvatarClass} alt={userName} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div
                className={`relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-tr ${selectedAvatarClass} flex items-center justify-center font-black text-white text-3xl shadow-xl border-2 border-netflix-red/40 flex-shrink-0`}
              >
                N+
              </div>
            )}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                  {userName}
                </h1>
                <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-red-600 px-3 py-0.5 text-xs font-bold text-white uppercase shadow-sm">
                  <Sparkles className="h-3 w-3" /> Membro Premium
                </span>
              </div>
              <p className="text-sm text-netflix-gray font-medium flex items-center justify-center sm:justify-start gap-2">
                <UserCheck className="h-4 w-4 text-green-400" /> {userEmail}
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-4 bg-black/40 border border-gray-800 rounded-xl p-3 sm:p-4">
            <div className="text-center px-3">
              <p className="text-xl sm:text-2xl font-black text-white">{myList.length}</p>
              <p className="text-[11px] font-semibold text-netflix-gray uppercase">Na Lista</p>
            </div>
            <div className="h-8 w-px bg-gray-800" />
            <div className="text-center px-3">
              <p className="text-xl sm:text-2xl font-black text-netflix-red">{likedList.length}</p>
              <p className="text-[11px] font-semibold text-netflix-gray uppercase">Gostados</p>
            </div>
            <div className="h-8 w-px bg-gray-800" />
            <div className="text-center px-3">
              <p className="text-xl sm:text-2xl font-black text-blue-400">{watchHistory.length}</p>
              <p className="text-[11px] font-semibold text-netflix-gray uppercase">Vistos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-gray-800 pb-2 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('liked')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'liked'
                ? 'bg-netflix-red text-white shadow-lg shadow-netflix-red/20'
                : 'text-netflix-gray hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>Gostados ({likedList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('my-list')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'my-list'
                ? 'bg-netflix-red text-white shadow-lg shadow-netflix-red/20'
                : 'text-netflix-gray hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Film className="h-4 w-4" />
            <span>A Minha Lista ({myList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-netflix-red text-white shadow-lg shadow-netflix-red/20'
                : 'text-netflix-gray hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Histórico ({watchHistory.length})</span>
          </button>
        </div>

        {/* Right Side Settings Tab */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'settings'
              ? 'bg-netflix-red text-white shadow-lg shadow-netflix-red/20'
              : 'text-netflix-gray hover:text-white hover:bg-gray-800/50 border border-gray-800'
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Definições</span>
        </button>
      </div>

      {/* Tab Content 1: Liked Titles */}
      {activeTab === 'liked' && (
        <div>
          {likedList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-xl bg-netflix-dark/40 border border-gray-800 p-8">
              <Heart className="h-16 w-16 text-netflix-red opacity-40 animate-pulse" />
              <h2 className="text-lg font-bold text-gray-200">Ainda não marcou nenhum filme ou série com &quot;Gostar&quot;</h2>
              <p className="text-sm text-netflix-gray max-w-md">
                Ao navegar pelos cartões ou modais de detalhes, clique no ícone do polegar para cima para guardar aqui os seus favoritos.
              </p>
              <Link
                href="/"
                className="mt-2 rounded bg-netflix-red px-6 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Explorar Catálogo
              </Link>
            </div>
          ) : (
            <MovieGrid items={likedList} cardsPerRow={4} />
          )}
        </div>
      )}

      {/* Tab Content 2: My List */}
      {activeTab === 'my-list' && (
        <div>
          {myList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-xl bg-netflix-dark/40 border border-gray-800 p-8">
              <Film className="h-16 w-16 text-netflix-gray opacity-40" />
              <h2 className="text-lg font-bold text-gray-200">A sua lista está vazia</h2>
              <p className="text-sm text-netflix-gray max-w-md">
                Adicione conteúdos à sua lista pessoal para poder assistir mais tarde facilmente em qualquer dispositivo.
              </p>
            </div>
          ) : (
            <MovieGrid items={myList} cardsPerRow={4} />
          )}
        </div>
      )}

      {/* Tab Content 3: Watch History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {watchHistory.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={clearWatchHistory}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-gray-800/80 text-xs font-semibold text-gray-300 hover:text-red-400 hover:bg-gray-800 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Limpar Histórico</span>
              </button>
            </div>
          )}

          {watchHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-xl bg-netflix-dark/40 border border-gray-800 p-8">
              <History className="h-16 w-16 text-netflix-gray opacity-40" />
              <h2 className="text-lg font-bold text-gray-200">Ainda não assistiu a nenhum conteúdo</h2>
              <p className="text-sm text-netflix-gray max-w-md">
                Assim que começar a reproduzir um filme ou episódio, o seu progresso ficará registado aqui automaticamente.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {watchHistory.map((h) => {
                const isTV = h.media.media_type === 'tv';
                const watchUrl = isTV
                  ? `/watch/tv/${h.media.id}?season=${h.season || 1}&episode=${h.episode || 1}`
                  : `/watch/movie/${h.media.id}`;

                return (
                  <div
                    key={h.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-netflix-dark/60 border border-gray-800 hover:border-gray-700 transition"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-md bg-black">
                        <Image
                          src={h.media.backdrop_path || h.media.poster_path}
                          alt={h.media.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-white">{h.media.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-netflix-gray">
                          {isTV && h.season && h.episode && (
                            <span className="rounded bg-netflix-red/20 px-2 py-0.5 text-netflix-red font-bold border border-netflix-red/30">
                              T{h.season} E{h.episode}
                            </span>
                          )}
                          <span>Visto em: {formatTimestamp(h.watchedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(watchUrl)}
                      className="flex items-center justify-center space-x-2 px-5 py-2 rounded-lg bg-white text-black font-bold text-xs hover:bg-white/80 active:scale-95 transition"
                    >
                      <Play className="h-4 w-4 fill-black" />
                      <span>Assistir Novamente</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 4: Settings (Definições) */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-8 max-w-4xl">
          {/* Floating Toast Notification in top-right corner */}
          <AnimatePresence>
            {showSavedToast && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="fixed top-20 right-4 sm:right-8 z-50 flex items-center space-x-3 rounded-2xl bg-netflix-dark/95 border border-green-500/50 p-4 shadow-2xl backdrop-blur-md text-white max-w-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20 text-green-400 flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-xs font-bold text-green-400 uppercase tracking-wider">Guardado</p>
                  <p className="text-xs font-medium text-gray-200 leading-snug">
                    Definições e preferências guardadas com sucesso!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSavedToast(false)}
                  className="p-1 text-netflix-gray hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Section 1: Avatar Selection & Custom Image Upload */}
          <div className="space-y-6 rounded-2xl bg-netflix-dark/60 border border-gray-800 p-6 sm:p-8">
            <div className="flex items-center space-x-3">
              <Camera className="h-5 w-5 text-netflix-red" />
              <h2 className="text-lg font-bold text-white">Foto de Perfil / Avatar</h2>
            </div>
            <p className="text-xs text-netflix-gray">
              Pode carregar uma foto de perfil em ficheiro (PNG, JPG, WEBP, GIF), colar um link de imagem ou escolher um dos avatares integrados.
            </p>

            {/* Custom File Upload & URL Input */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 rounded-xl bg-black/40 border border-gray-800">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-xl bg-netflix-red px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-netflix-red/20 transition hover:bg-red-700 active:scale-95 flex-shrink-0"
              >
                <Upload className="h-4 w-4" />
                <span>Carregar Ficheiro (PNG, JPG, WEBP)</span>
              </button>

              <div className="flex items-center gap-2 flex-1">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Ou cole o URL da imagem (https://...)"
                  className="w-full rounded-xl bg-black/60 border border-gray-700 px-3 py-2 text-xs text-white focus:border-netflix-red focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (urlInput.trim()) {
                      setSelectedAvatarClass(urlInput.trim());
                      setUrlInput('');
                    }
                  }}
                  className="rounded-xl bg-gray-800 hover:bg-gray-700 px-4 py-2 text-xs font-bold text-white transition active:scale-95 flex-shrink-0 border border-gray-700"
                >
                  Aplicar URL
                </button>
              </div>
            </div>


            <div className="pt-2">
              <label className="text-xs font-bold text-netflix-gray uppercase tracking-wider block mb-3">
                Ou escolha um Avatar NAIPE+:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = selectedAvatarClass === preset.class;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedAvatarClass(preset.class)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition border ${
                        isSelected
                          ? 'bg-netflix-red/10 border-netflix-red ring-2 ring-netflix-red/50'
                          : 'bg-black/40 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div
                        className={`h-16 w-16 rounded-2xl bg-gradient-to-tr ${preset.class} flex items-center justify-center font-black text-white text-xl shadow-md mb-2`}
                      >
                        {preset.label}
                      </div>
                      <span className="text-xs font-semibold text-white">{preset.name}</span>
                      {isSelected && (
                        <span className="mt-1 text-[10px] font-bold text-netflix-red uppercase">Selecionado</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Account Information Form */}
          <div className="space-y-6 rounded-2xl bg-netflix-dark/60 border border-gray-800 p-6 sm:p-8">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-netflix-red" />
              <h2 className="text-lg font-bold text-white">Dados da Conta</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-netflix-gray" /> Nome de Utilizador
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Nome de Utilizador"
                  className="w-full rounded-lg bg-black/60 border border-gray-700 px-4 py-2.5 text-sm text-white focus:border-netflix-red focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-netflix-gray" /> Endereço de E-mail
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="utilizador@naipe.pt"
                  className="w-full rounded-lg bg-black/60 border border-gray-700 px-4 py-2.5 text-sm text-white focus:border-netflix-red focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Trailer Playback Preferences */}
          <div className="space-y-6 rounded-2xl bg-netflix-dark/60 border border-gray-800 p-6 sm:p-8">
            <div className="flex items-center space-x-3">
              <Video className="h-5 w-5 text-netflix-red" />
              <h2 className="text-lg font-bold text-white">Preferências de Trailers</h2>
            </div>

            <div className="space-y-4 divide-y divide-gray-800/80">
              {/* Option 1: Enable/Disable Auto-play */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h3 className="text-sm font-bold text-white">Reprodução Automática de Trailers</h3>
                  <p className="text-xs text-netflix-gray pt-0.5">
                    Ativar ou desativar a reprodução automática de trailers nos cartões e painel de detalhes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setTrailersToggle(!trailersToggle)}
                  className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    trailersToggle ? 'bg-netflix-red' : 'bg-gray-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      trailersToggle ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Option 2: Muted by Default */}
              <div className="flex items-center justify-between pt-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Iniciar Trailers Sem Som (Muted) por Definição</h3>
                  <p className="text-xs text-netflix-gray pt-0.5">
                    Iniciar sempre a reprodução dos trailers sem áudio por defeito (pode ativar o som a qualquer momento com um clique).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setMutedToggle(!mutedToggle)}
                  className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    mutedToggle ? 'bg-netflix-red' : 'bg-gray-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      mutedToggle ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Form Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-xl bg-netflix-red px-8 py-3 text-sm font-bold text-white shadow-lg shadow-netflix-red/30 transition hover:bg-red-700 active:scale-95"
            >
              Guardar Alterações
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
