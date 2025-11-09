import React from 'react';

interface MoodIconProps {
  size?: number;
  className?: string;
}

export const HappyIcon: React.FC<MoodIconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" fill="#10B981" stroke="#059669" strokeWidth="2"/>
    <circle cx="8" cy="9" r="1.5" fill="white"/>
    <circle cx="16" cy="9" r="1.5" fill="white"/>
    <path d="M8 15s1.5 2 4 2 4-2 4-2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const NeutralIcon: React.FC<MoodIconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" fill="#6B7280" stroke="#4B5563" strokeWidth="2"/>
    <circle cx="8" cy="9" r="1.5" fill="white"/>
    <circle cx="16" cy="9" r="1.5" fill="white"/>
    <line x1="8" y1="15" x2="16" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const SadIcon: React.FC<MoodIconProps> = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" fill="#EF4444" stroke="#DC2626" strokeWidth="2"/>
    <circle cx="8" cy="9" r="1.5" fill="white"/>
    <circle cx="16" cy="9" r="1.5" fill="white"/>
    <path d="M8 17s1.5-2 4-2 4 2 4 2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);