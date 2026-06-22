/**
 * Google Material 3 Design System - Comprehensive Design Tokens
 * Establishes an iron-clad foundation for absolute UI/UX consistency across:
 * - Colors (Color Palettes)
 * - Spacing (Margins, Padding, Gaps)
 * - Typography (Font Sizes, Weights, Line Heights)
 * - Border Radius (Rounded Corners)
 * - Shadows & Elevations (Card depths)
 */

export const COLORS = {
  // Brand colors
  primary: '#1a73e8',        // Google Blue
  primaryDark: '#1557b0',    // Hover Blue
  primaryLight: 'rgba(26,115,232,0.08)',
  
  // Status Colors
  success: '#1e8e3e',        // Google Green
  successLight: 'rgba(30,142,62,0.1)',
  
  error: '#d93025',          // Google Red
  errorLight: '#fce8e6',
  errorBorder: '#fad2cf',
  
  warning: '#e8711a',        // Google Orange
  warningLight: 'rgba(232,113,26,0.1)',

  // Typography Palette
  text: {
    primary: '#202124',      // Near black
    secondary: '#5f6368',    // Slate grey
    white: '#ffffff',
    activeBlue: '#1a73e8'
  },

  // Surface & Layout Palette
  background: {
    main: '#f8f9fa',         // Layout background
    card: '#ffffff',         // Card/Modal background
    border: '#dadce0',       // Boundary dividers
    hoverOverlay: 'rgba(60,64,67,0.04)',
    modalOverlay: 'rgba(32,33,36,0.6)'
  }
};

export const SPACING = {
  xxs: '4px',
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '40px',
  xxxl: '48px'
};

export const TYPOGRAPHY = {
  family: "'Google Sans', Roboto, sans-serif",
  sizes: {
    badge: '10px',
    caption: '12px',
    body: '13px',
    bodyLarge: '14px',
    subtitle: '16px',
    title: '18px',
    titleLarge: '24px',
    headline: '26px'
  },
  weights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700'
  }
};

export const BORDER_RADIUS = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  round: '50%'
};

export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(60,64,67,0.3)',
  md: '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
  lg: '0 4px 16px rgba(0,0,0,0.1)',
  modal: '0 8px 24px rgba(32,33,36,0.15)'
};
