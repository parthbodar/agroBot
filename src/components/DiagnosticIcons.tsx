/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export const WebbingIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M4 4l16 16M20 4L4 20M12 4v16M4 12h16" />
  </svg>
);

export const StipplingIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="6" cy="6" r="1.2" />
    <circle cx="12" cy="8" r="1.2" />
    <circle cx="18" cy="5" r="1.2" />
    <circle cx="15" cy="14" r="1.2" />
    <circle cx="5" cy="16" r="1.2" />
    <circle cx="10" cy="18" r="1.2" />
    <circle cx="19" cy="17" r="1.2" />
  </svg>
);

export const ColorShiftIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="12" r="6" stroke="currentColor" strokeOpacity="0.5" />
    <circle cx="15" cy="12" r="6" fill="currentColor" fillOpacity="0.3" />
  </svg>
);

export const getMarkerIcon = (text: string, defaultIcon?: React.ReactNode) => {
  const lower = text.toLowerCase();
  if (lower.includes('webbing')) return <WebbingIcon />;
  if (lower.includes('stippling')) return <StipplingIcon />;
  if (lower.includes('color shift') || lower.includes('color-shift') || lower.includes('chlorosis')) return <ColorShiftIcon />;
  return defaultIcon || <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-black/10 mt-1.5" />;
};
