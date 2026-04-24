import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 48 }: LogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Central Sun/Circle */}
      <circle cx="55" cy="35" r="18" fill="#D4E100" />
      
      {/* Left Leaf (Darker Green) */}
      <path 
        d="M40 90C40 90 10 75 10 40C10 30 25 25 40 45C40 60 40 90 40 90Z" 
        fill="#1A9933" 
      />
      
      {/* Right Leaf (Lighter Green) */}
      <path 
        d="M45 85C45 85 90 85 90 65C90 55 70 55 55 65C45 75 45 85 45 85Z" 
        fill="#82C91E" 
      />
    </svg>
  );
}
