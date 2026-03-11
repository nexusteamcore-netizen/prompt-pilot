import React from 'react';

interface BrandIconProps {
    className?: string;
}

export const BrandIcon: React.FC<BrandIconProps> = ({ className = "w-5 h-5" }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        {/* The Pen Nib / Rocket Body */}
        <path d="M12 2C12 2 17 8 17 13C17 18 12 21 12 21C12 21 7 18 7 13C7 8 12 2 12 2Z" />
        {/* The Central Slit */}
        <path d="M12 8V13" />
        {/* Rocket Fins */}
        <path d="M7 16L3 20" />
        <path d="M17 16L21 20" />
    </svg>
);
