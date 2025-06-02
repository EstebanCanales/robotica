/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Nueva paleta moderna
const primaryColor = '#2563EB';  // Azul moderno
const secondaryColor = '#10B981';  // Verde esmeralda
const accentColor = '#8B5CF6';   // Púrpura
const backgroundColor = '#F9FAFB';  // Blanco con tono azulado suave
const errorColor = '#EF4444';  // Rojo más vibrante

// Paleta de grises moderna
const gray50 = '#F9FAFB';
const gray100 = '#F3F4F6';
const gray200 = '#E5E7EB';
const gray300 = '#D1D5DB';
const gray400 = '#9CA3AF';
const gray500 = '#6B7280';
const gray600 = '#4B5563';
const gray700 = '#374151';
const gray800 = '#1F2937';
const gray900 = '#111827';

export const Colors = {
  light: {
    text: gray800,
    background: backgroundColor,
    tint: primaryColor,
    icon: gray500,
    tabIconDefault: gray400,
    tabIconSelected: primaryColor,
    accent: accentColor,
    secondary: secondaryColor,
    error: errorColor,
    border: gray200,
    card: '#FFFFFF',
    notification: errorColor,
    // Nuevos colores específicos
    buttonBackground: primaryColor,
    buttonText: '#FFFFFF',
    cardBorder: gray200,
    placeholder: gray400,
    link: primaryColor,
  },
  dark: {
    text: '#ECEDEE',
    background: '#0F172A', // Fondo más suave para dark mode
    tint: primaryColor,
    icon: gray300,
    tabIconDefault: gray400,
    tabIconSelected: primaryColor,
    accent: accentColor,
    secondary: secondaryColor,
    error: '#F87171', // Error más claro para dark mode
    border: gray700,
    card: gray800,
    notification: '#F87171',
    // Nuevos colores específicos
    buttonBackground: primaryColor,
    buttonText: '#FFFFFF',
    cardBorder: gray700,
    placeholder: gray500,
    link: '#60A5FA',
  },
};
