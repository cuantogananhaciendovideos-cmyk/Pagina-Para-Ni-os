import React from 'react';
import { AnimalAvatar } from '../types';

interface AnimalAvatarIconProps {
  animal: AnimalAvatar | string;
  className?: string;
  hasBow?: boolean;
}

export const AnimalAvatarIcon: React.FC<AnimalAvatarIconProps> = ({
  animal,
  className = 'w-12 h-12',
  hasBow = false,
}) => {
  switch (animal) {
    case 'fox':
      return (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          {/* Ears */}
          <polygon points="18,15 38,40 12,42" fill="#E26D38" />
          <polygon points="21,22 34,39 16,40" fill="#FFE5D9" />
          <polygon points="82,15 62,40 88,42" fill="#E26D38" />
          <polygon points="79,22 66,39 84,40" fill="#FFE5D9" />

          {/* Head */}
          <ellipse cx="50" cy="55" rx="38" ry="32" fill="#F48C42" />

          {/* White cheeks */}
          <path
            d="M 16,62 C 16,45 32,48 50,60 C 68,48 84,45 84,62 C 84,78 68,85 50,85 C 32,85 16,78 16,62 Z"
            fill="#FFF6ED"
          />

          {/* Eyes */}
          <circle cx="37" cy="56" r="4.5" fill="#2D2B2A" />
          <circle cx="35.5" cy="54.5" r="1.5" fill="#FFFFFF" />
          <circle cx="63" cy="56" r="4.5" fill="#2D2B2A" />
          <circle cx="61.5" cy="54.5" r="1.5" fill="#FFFFFF" />

          {/* Cheerful blush */}
          <ellipse cx="28" cy="64" rx="4" ry="2.5" fill="#FF9EAA" opacity="0.7" />
          <ellipse cx="72" cy="64" rx="4" ry="2.5" fill="#FF9EAA" opacity="0.7" />

          {/* Nose */}
          <polygon points="50,65 46,62 54,62" fill="#2D2B2A" />

          {/* Smile */}
          <path
            d="M 46,68 Q 50,73 54,68"
            stroke="#2D2B2A"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Optional Bow for Luna */}
          {hasBow && (
            <g transform="translate(50, 24)">
              <ellipse cx="-8" cy="0" rx="7" ry="5" fill="#FF70A6" transform="rotate(-15)" />
              <ellipse cx="8" cy="0" rx="7" ry="5" fill="#FF70A6" transform="rotate(15)" />
              <circle cx="0" cy="0" r="3.5" fill="#FF4D80" />
            </g>
          )}
        </svg>
      );

    case 'panda':
      return (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          {/* Ears */}
          <circle cx="22" cy="24" r="13" fill="#2B2D42" />
          <circle cx="78" cy="24" r="13" fill="#2B2D42" />

          {/* Head */}
          <ellipse cx="50" cy="54" rx="36" ry="32" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />

          {/* Eye patches */}
          <ellipse cx="34" cy="50" rx="9" ry="12" fill="#2B2D42" transform="rotate(-15 34 50)" />
          <ellipse cx="66" cy="50" rx="9" ry="12" fill="#2B2D42" transform="rotate(15 66 50)" />

          {/* Eyes */}
          <circle cx="34" cy="49" r="4" fill="#FFFFFF" />
          <circle cx="35" cy="49" r="2.5" fill="#2B2D42" />
          <circle cx="66" cy="49" r="4" fill="#FFFFFF" />
          <circle cx="65" cy="49" r="2.5" fill="#2B2D42" />

          {/* Cheeks */}
          <ellipse cx="24" cy="62" rx="4" ry="2.5" fill="#FFAFCC" opacity="0.6" />
          <ellipse cx="76" cy="62" rx="4" ry="2.5" fill="#FFAFCC" opacity="0.6" />

          {/* Nose & Mouth */}
          <ellipse cx="50" cy="62" rx="5" ry="3.5" fill="#2B2D42" />
          <path d="M 46,67 Q 50,71 54,67" stroke="#2B2D42" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'rabbit':
      return (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          {/* Long Ears */}
          <ellipse cx="32" cy="22" rx="8" ry="20" fill="#E0E7FF" transform="rotate(-10 32 22)" />
          <ellipse cx="32" cy="22" rx="5" ry="14" fill="#FFAFCC" transform="rotate(-10 32 22)" />
          <ellipse cx="68" cy="22" rx="8" ry="20" fill="#E0E7FF" transform="rotate(10 68 22)" />
          <ellipse cx="68" cy="22" rx="5" ry="14" fill="#FFAFCC" transform="rotate(10 68 22)" />

          {/* Head */}
          <ellipse cx="50" cy="58" rx="34" ry="30" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />

          {/* Eyes */}
          <circle cx="36" cy="55" r="4" fill="#1E293B" />
          <circle cx="34.5" cy="53.5" r="1.5" fill="#FFFFFF" />
          <circle cx="64" cy="55" r="4" fill="#1E293B" />
          <circle cx="62.5" cy="53.5" r="1.5" fill="#FFFFFF" />

          {/* Pink Nose */}
          <polygon points="50,64 47,60 53,60" fill="#FB7185" />
          <path d="M 46,67 Q 50,71 54,67" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" fill="none" />

          {/* Cheeks */}
          <ellipse cx="26" cy="64" rx="4.5" ry="2.5" fill="#FDA4AF" opacity="0.6" />
          <ellipse cx="74" cy="64" rx="4.5" ry="2.5" fill="#FDA4AF" opacity="0.6" />
        </svg>
      );

    case 'owl':
      return (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          {/* Body/Head */}
          <ellipse cx="50" cy="52" rx="36" ry="34" fill="#C28E58" />
          {/* Feather Tufts on Ears */}
          <polygon points="20,24 35,32 18,38" fill="#A0693B" />
          <polygon points="80,24 65,32 82,38" fill="#A0693B" />

          {/* Chest belly */}
          <ellipse cx="50" cy="64" rx="22" ry="18" fill="#FDEED9" />

          {/* Eye rings */}
          <circle cx="36" cy="46" r="13" fill="#FFFFFF" stroke="#A0693B" strokeWidth="2" />
          <circle cx="64" cy="46" r="13" fill="#FFFFFF" stroke="#A0693B" strokeWidth="2" />

          {/* Eyes */}
          <circle cx="36" cy="46" r="6" fill="#1F2937" />
          <circle cx="34" cy="44" r="2" fill="#FFFFFF" />
          <circle cx="64" cy="46" r="6" fill="#1F2937" />
          <circle cx="62" cy="44" r="2" fill="#FFFFFF" />

          {/* Beak */}
          <polygon points="50,58 45,51 55,51" fill="#F59E0B" />
        </svg>
      );

    case 'lion':
      return (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          {/* Mane */}
          <circle cx="50" cy="52" r="38" fill="#F97316" />
          {/* Head */}
          <circle cx="50" cy="52" r="28" fill="#FBBF24" />
          {/* Ears */}
          <circle cx="28" cy="30" r="9" fill="#F59E0B" />
          <circle cx="28" cy="30" r="5" fill="#FDE68A" />
          <circle cx="72" cy="30" r="9" fill="#F59E0B" />
          <circle cx="72" cy="30" r="5" fill="#FDE68A" />
          {/* Face */}
          <circle cx="41" cy="49" r="3.5" fill="#1E293B" />
          <circle cx="59" cy="49" r="3.5" fill="#1E293B" />
          <polygon points="50,58 46,54 54,54" fill="#78350F" />
          <path d="M 45,62 Q 50,66 55,62" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'cat':
      return (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          {/* Ears */}
          <polygon points="20,18 42,38 16,44" fill="#F472B6" />
          <polygon points="23,24 38,38 19,42" fill="#FCE7F3" />
          <polygon points="80,18 58,38 84,44" fill="#F472B6" />
          <polygon points="77,24 62,38 81,42" fill="#FCE7F3" />
          {/* Head */}
          <ellipse cx="50" cy="56" rx="35" ry="30" fill="#FDF2F8" stroke="#F472B6" strokeWidth="2" />
          {/* Eyes */}
          <ellipse cx="37" cy="52" rx="4" ry="5" fill="#0D9488" />
          <circle cx="36" cy="50" r="1.5" fill="#FFFFFF" />
          <ellipse cx="63" cy="52" rx="4" ry="5" fill="#0D9488" />
          <circle cx="62" cy="50" r="1.5" fill="#FFFFFF" />
          {/* Whiskers */}
          <line x1="20" y1="58" x2="32" y2="60" stroke="#DB2777" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="64" x2="32" y2="64" stroke="#DB2777" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="80" y1="58" x2="68" y2="60" stroke="#DB2777" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="80" y1="64" x2="68" y2="64" stroke="#DB2777" strokeWidth="1.5" strokeLinecap="round" />
          {/* Nose */}
          <polygon points="50,62 47,59 53,59" fill="#EC4899" />
          <path d="M 46,66 Q 50,70 54,66" stroke="#9D174D" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'dog':
      return (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          {/* Floppy Ears */}
          <ellipse cx="20" cy="46" rx="10" ry="20" fill="#92400E" transform="rotate(-15 20 46)" />
          <ellipse cx="80" cy="46" rx="10" ry="20" fill="#92400E" transform="rotate(15 80 46)" />
          {/* Head */}
          <ellipse cx="50" cy="54" rx="34" ry="30" fill="#D97706" />
          {/* Muzzle */}
          <ellipse cx="50" cy="65" rx="18" ry="14" fill="#FEF3C7" />
          {/* Eyes */}
          <circle cx="38" cy="49" r="4" fill="#1F2937" />
          <circle cx="37" cy="47" r="1.5" fill="#FFFFFF" />
          <circle cx="62" cy="49" r="4" fill="#1F2937" />
          <circle cx="61" cy="47" r="1.5" fill="#FFFFFF" />
          {/* Nose & Tongue */}
          <ellipse cx="50" cy="62" rx="6" ry="4.5" fill="#1F2937" />
          <path d="M 46,67 Q 50,71 54,67" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 48,70 Q 50,78 52,70" fill="#F43F5E" />
        </svg>
      );

    case 'koala':
      return (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          {/* Fluffy Big Ears */}
          <circle cx="20" cy="32" r="16" fill="#94A3B8" />
          <circle cx="20" cy="32" r="10" fill="#E2E8F0" />
          <circle cx="80" cy="32" r="16" fill="#94A3B8" />
          <circle cx="80" cy="32" r="10" fill="#E2E8F0" />
          {/* Head */}
          <circle cx="50" cy="54" r="30" fill="#64748B" />
          {/* Big Black Nose */}
          <ellipse cx="50" cy="56" rx="9" ry="14" fill="#1E293B" />
          {/* Eyes */}
          <circle cx="34" cy="48" r="3" fill="#0F172A" />
          <circle cx="66" cy="48" r="3" fill="#0F172A" />
        </svg>
      );

    case 'penguin':
    default:
      return (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          {/* Body */}
          <ellipse cx="50" cy="54" rx="34" ry="32" fill="#1E293B" />
          {/* White Belly */}
          <ellipse cx="50" cy="60" rx="22" ry="24" fill="#FFFFFF" />
          {/* Eyes */}
          <circle cx="40" cy="44" r="3.5" fill="#0F172A" />
          <circle cx="60" cy="44" r="3.5" fill="#0F172A" />
          {/* Orange Beak */}
          <polygon points="50,54 44,47 56,47" fill="#F59E0B" />
          {/* Cheeks */}
          <circle cx="32" cy="52" r="3" fill="#FDA4AF" opacity="0.6" />
          <circle cx="68" cy="52" r="3" fill="#FDA4AF" opacity="0.6" />
        </svg>
      );
  }
};
