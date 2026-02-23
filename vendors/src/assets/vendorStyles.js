// Vendor portal styling constants

export const vendorStyles = {
  // Colors
  colors: {
    primary: '#f97316',      // Orange
    secondary: '#f59e0b',    // Amber
    dark: '#111827',         // Gray 900
    darker: '#030712',       // Gray 950
    light: '#f3f4f6',        // Gray 100
  },

  // Gradients
  gradients: {
    orange: 'from-orange-500 to-amber-600',
    orangeHover: 'from-orange-600 to-amber-700',
    orangeLight: 'from-orange-500/10 to-amber-500/10',
  },

  // Common classes
  button: {
    primary: 'px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-amber-700 transition disabled:opacity-50',
    secondary: 'px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition',
    danger: 'px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold rounded-lg transition',
    disabled: 'px-6 py-3 bg-gray-600 text-gray-400 font-semibold rounded-lg cursor-not-allowed opacity-50',
  },

  // Input styles
  input: 'w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition',

  // Card styles
  card: 'bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-orange-500 transition',
  cardDark: 'bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-2xl',

  // Text styles
  heading1: 'text-4xl font-extrabold text-white',
  heading2: 'text-2xl font-bold text-white',
  heading3: 'text-xl font-semibold text-white',
  text: 'text-gray-400',
  textLight: 'text-gray-300',

  // Badges
  badge: {
    available: 'bg-green-900/30 text-green-400 px-3 py-1 rounded text-xs font-semibold',
    booked: 'bg-red-900/30 text-red-400 px-3 py-1 rounded text-xs font-semibold',
    maintenance: 'bg-yellow-900/30 text-yellow-400 px-3 py-1 rounded text-xs font-semibold',
    rented: 'bg-blue-900/30 text-blue-400 px-3 py-1 rounded text-xs font-semibold',
  },

  // Modal
  modalOverlay: 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50',
  modalContent: 'bg-gray-900 rounded-2xl border border-gray-800 p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl',

  // Grid
  grid: {
    cols1: 'grid-cols-1',
    cols2: 'md:grid-cols-2',
    cols3: 'lg:grid-cols-3',
    gap: 'gap-6',
  },
};

export default vendorStyles;
