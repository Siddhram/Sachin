import { DefaultTheme } from 'react-native-paper';

export const colors = {
  // Primary colors
  primary: '#4A90E2',
  primaryDark: '#357ABD',
  primaryLight: '#7BB3F0',
  
  // Secondary colors
  secondary: '#F39C12',
  secondaryDark: '#E67E22',
  secondaryLight: '#F7DC6F',
  
  // Category colors
  romantic: '#E91E63',
  serene: '#4CAF50',
  creative: '#9C27B0',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray: '#9B9B9B',
  lightGray: '#F5F5F5',
  darkGray: '#4A4A4A',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Background colors
  background: '#FAFAFA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text colors
  text: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  
  // Border colors
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Rating colors
  rating: '#FFD700',
  ratingEmpty: '#E0E0E0',
  
  // Map colors
  mapPrimary: '#4A90E2',
  mapSecondary: '#F39C12',
  mapBackground: '#F8F9FA',
  
  // Gradient colors
  gradientStart: '#4A90E2',
  gradientEnd: '#357ABD',
  gradientSecondaryStart: '#F39C12',
  gradientSecondaryEnd: '#E67E22',
};

export const typography = {
  // Font families
  fontFamily: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semiBold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
  },
  
  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    title: 28,
    largeTitle: 32,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
  
  // Font weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

export const spacing = {
  // Base spacing unit
  base: 8,
  
  // Spacing scale
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  
  // Specific spacing
  screenPadding: 16,
  cardPadding: 16,
  buttonPadding: 12,
  inputPadding: 12,
  iconPadding: 8,
  
  // Margins
  margin: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  // Padding
  padding: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 50,
  full: 9999,
};

export const shadows = {
  small: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  large: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};

export const layout = {
  // Screen dimensions
  screen: {
    width: '100%',
    height: '100%',
  },
  
  // Header height
  headerHeight: 56,
  
  // Tab bar height
  tabBarHeight: 60,
  
  // Button heights
  buttonHeight: {
    small: 36,
    medium: 48,
    large: 56,
  },
  
  // Input heights
  inputHeight: {
    small: 40,
    medium: 48,
    large: 56,
  },
  
  // Card dimensions
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.cardPadding,
  },
  
  // Map dimensions
  map: {
    height: 300,
    borderRadius: borderRadius.md,
  },
};

export const animation = {
  // Duration
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  
  // Easing
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// React Native Paper theme
export const paperTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    placeholder: colors.textSecondary,
    disabled: colors.textDisabled,
    error: colors.error,
  },
  fonts: {
    regular: {
      fontFamily: typography.fontFamily.regular,
      fontWeight: typography.fontWeight.regular,
    },
    medium: {
      fontFamily: typography.fontFamily.medium,
      fontWeight: typography.fontWeight.medium,
    },
    light: {
      fontFamily: typography.fontFamily.regular,
      fontWeight: typography.fontWeight.light,
    },
    thin: {
      fontFamily: typography.fontFamily.regular,
      fontWeight: typography.fontWeight.light,
    },
  },
  roundness: borderRadius.md,
};

// Main theme object
export const theme = {
  light: {
    colors: {
      // Primary colors
      primary: '#4A90E2',
      secondary: '#7B68EE',
      accent: '#FF6B6B',
      
      // Background colors
      background: '#FFFFFF',
      surface: '#F8F9FA',
      card: '#FFFFFF',
      
      // Text colors
      text: '#1A1A1A',
      textSecondary: '#6C757D',
      textTertiary: '#ADB5BD',
      
      // Status colors
      success: '#28A745',
      warning: '#FFC107',
      error: '#DC3545',
      info: '#17A2B8',
      
      // Category colors
      romantic: '#FF6B9D',
      serene: '#4ECDC4',
      creative: '#45B7D1',
      
      // UI colors
      white: '#FFFFFF',
      black: '#000000',
      gray: '#6C757D',
      lightGray: '#F8F9FA',
      border: '#E9ECEF',
      shadow: '#000000',
      
      // Map colors
      mapBackground: '#F8F9FA',
      mapWater: '#E3F2FD',
      mapLand: '#F1F8E9',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    typography: {
      h1: {
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 40,
      },
      h2: {
        fontSize: 28,
        fontWeight: 'bold',
        lineHeight: 36,
      },
      h3: {
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 32,
      },
      h4: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
      },
      h5: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 24,
      },
      h6: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
      },
      body1: {
        fontSize: 16,
        fontWeight: 'normal',
        lineHeight: 24,
      },
      body2: {
        fontSize: 14,
        fontWeight: 'normal',
        lineHeight: 20,
      },
      caption: {
        fontSize: 12,
        fontWeight: 'normal',
        lineHeight: 16,
      },
      button: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
      },
    },
  },
  dark: {
    colors: {
      // Primary colors
      primary: '#64B5F6',
      secondary: '#9575CD',
      accent: '#FF8A80',
      
      // Background colors
      background: '#121212',
      surface: '#1E1E1E',
      card: '#2D2D2D',
      
      // Text colors
      text: '#FFFFFF',
      textSecondary: '#B0B0B0',
      textTertiary: '#808080',
      
      // Status colors
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',
      
      // Category colors
      romantic: '#FF80AB',
      serene: '#80CBC4',
      creative: '#81C784',
      
      // UI colors
      white: '#FFFFFF',
      black: '#000000',
      gray: '#9E9E9E',
      lightGray: '#424242',
      border: '#424242',
      shadow: '#000000',
      
      // Map colors
      mapBackground: '#1E1E1E',
      mapWater: '#1A237E',
      mapLand: '#2E7D32',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    typography: {
      h1: {
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 40,
      },
      h2: {
        fontSize: 28,
        fontWeight: 'bold',
        lineHeight: 36,
      },
      h3: {
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 32,
      },
      h4: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 28,
      },
      h5: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 24,
      },
      h6: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
      },
      body1: {
        fontSize: 16,
        fontWeight: 'normal',
        lineHeight: 24,
      },
      body2: {
        fontSize: 14,
        fontWeight: 'normal',
        lineHeight: 20,
      },
      caption: {
        fontSize: 12,
        fontWeight: 'normal',
        lineHeight: 16,
      },
      button: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
      },
    },
  },
};

// Default export for backward compatibility
export default theme.light; 