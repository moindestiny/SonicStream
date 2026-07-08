'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import {
  X, Copy, Check, Share2,
  MessageCircle, Instagram, Twitter, Link2, ExternalLink
} from 'lucide-react';
import { getHighQualityImage } from '@/lib/api';
import toast from 'react-hot-toast';

interface ShareItem {
  id: string;
  name: string;
  artist?: string;
  image: Array<{ quality: string; url: string }>;
  type: 'song' | 'playlist' | 'album';
  url?: string; // JioSaavn URL if available
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShareItem | null;
}

export default function ShareModal({ isOpen, onClose, item }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  // Build the share URL — use current page URL as canonical link
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = item.type === 'song'
    ? `🎵 ${item.name}${item.artist ? ` — ${item.artist}` : ''} | SonicStream`
    : `🎧 ${item.name} | SonicStream`;
  const shareText = item.type === 'song'
    ? `Yeh song sun! "${item.name}"${item.artist ? ` by ${item.artist}` : ''} 🎵`
    : `Yeh ${item.type} dekh! "${item.name}" on SonicStream 🎧`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled — no error needed
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  // Instagram doesn't support direct URL sharing — we copy and show instructions
  const handleInstagram = async () => {
    await handleCopy();
    toast('Open Instagram → Story → Paste link 📸', {
      icon: '📋',
      duration: 4000,
      style: {
        background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
        color: '#fff',
        fontWeight: 600,
      },
    });
  };

  const imageUrl = getHighQualityImage(item.image);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-[92vw] max-w-sm"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '28px',
              overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
            }}
          >
            {/* Album Art Header — Full width, prominent */}
            <div className="relative w-full aspect-square overflow-hidden">
              <Image
                src={imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Gradient overlay at bottom */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, var(--bg-secondary) 0%, transparent 60%)',
                }}
              />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-2 rounded-full transition-all hover:scale-110"
                style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', backdropFilter: 'blur(8px)' }}
              >
                <X size={16} />
              </button>

              {/* Type badge */}
              <div
                className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
                style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', backdropFilter: 'blur(8px)' }}
              >
                {item.type}
              </div>

              {/* Song info overlaid on gradient */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h2
                  className="text-xl font-extrabold truncate mb-0.5"
                  style={{ color: 'var(--text-primary)', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
                >
                  {item.name}
                </h2>
                {item.artist && (
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--text-secondary)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
                  >
                    {item.artist}
                  </p>
                )}
              </div>
            </div>

            {/* Share Options */}
            <div className="p-5 space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-center" style={{ color: 'var(--text-muted)' }}>
                Share via
              </p>

              {/* Primary Share Buttons */}
              <div className="grid grid-cols-4 gap-3">
                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'var(--bg-card)' }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#25D366' }}>
                    {/* WhatsApp icon */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>WhatsApp</span>
                </a>

                {/* Instagram */}
                <button
                  onClick={handleInstagram}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'var(--bg-card)' }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}
                  >
                    <Instagram size={18} color="white" />
                  </div>
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Instagram</span>
                </button>

                {/* Twitter/X */}
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'var(--bg-card)' }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#000' }}>
                    <Twitter size={18} color="white" />
                  </div>
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Twitter</span>
                </a>

                {/* Native Share (mobile) / Copy (desktop) */}
                {typeof navigator !== 'undefined' && typeof navigator.share === 'function' ? (
                  <button
                    onClick={handleNativeShare}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'var(--bg-card)' }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center aurora-bg">
                      <Share2 size={18} color="white" />
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>More</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCopy}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'var(--bg-card)' }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center aurora-bg">
                      {copied ? <Check size={18} color="white" /> : <Link2 size={18} color="white" />}
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      {copied ? 'Copied!' : 'Copy'}
                    </span>
                  </button>
                )}
              </div>

              {/* Copy Link row */}
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] group"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: copied ? 'var(--accent)' : 'var(--bg-card-hover)' }}
                >
                  {copied
                    ? <Check size={14} style={{ color: '#fff' }} />
                    : <Copy size={14} style={{ color: 'var(--text-muted)' }} />
                  }
                </div>
                <span className="text-sm font-semibold flex-1 text-left truncate" style={{ color: 'var(--text-secondary)' }}>
                  {shareUrl}
                </span>
                <span
                  className="text-xs font-bold flex-shrink-0"
                  style={{ color: copied ? 'var(--accent)' : 'var(--text-muted)' }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
