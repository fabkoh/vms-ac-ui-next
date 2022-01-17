// Colors

const neutral = {
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827'
};

const background = {
  default: '#F9FAFC',
  paper: '#FFFFFF'
};

const divider = '#E6E8F0';

const primary = {
<<<<<<< HEAD
  main: '#3E5879',
  light: '#7CA8EB',
  dark: '#1E2A39',
=======
  main: '#5048E5',
  light: '#828DF8',
  dark: '#3832A0',
>>>>>>> dd8547503fc1799293d50ec94a844f4fe45a96e8
  contrastText: '#FFFFFF'
};

const secondary = {
<<<<<<< HEAD
  main: '#A1C8B8',
  light: '#A9F0D2',
  dark: '#669983',
=======
  main: '#10B981',
  light: '#3FC79A',
  dark: '#0B815A',
>>>>>>> dd8547503fc1799293d50ec94a844f4fe45a96e8
  contrastText: '#FFFFFF'
};

const success = {
  main: '#14B8A6',
  light: '#43C6B7',
  dark: '#0E8074',
  contrastText: '#FFFFFF'
};

const info = {
  main: '#2196F3',
  light: '#64B6F7',
  dark: '#0B79D0',
  contrastText: '#FFFFFF'
};

const warning = {
  main: '#FFB020',
  light: '#FFBF4C',
  dark: '#B27B16',
  contrastText: '#FFFFFF'
};

const error = {
  main: '#D14343',
  light: '#DA6868',
  dark: '#922E2E',
  contrastText: '#FFFFFF'
};

const text = {
  primary: '#121828',
  secondary: '#65748B',
  disabled: 'rgba(55, 65, 81, 0.48)'
};

export const lightThemeOptions = {
  components: {
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: neutral[500],
          color: '#FFFFFF'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '&.MuiChip-filledDefault': {
            backgroundColor: neutral[200],
            '& .MuiChip-deleteIcon': {
              color: neutral[400]
            }
          },
          '&.MuiChip-outlinedDefault': {
            '& .MuiChip-deleteIcon': {
              color: neutral[300]
            }
          }
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          '&::placeholder': {
            opacity: 1,
            color: text.secondary
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: divider
        }
      }
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderColor: divider,
          borderStyle: 'solid',
          borderWidth: 1
        }
      }
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderColor: divider,
          borderStyle: 'solid',
          borderWidth: 1
        }
      }
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          color: neutral[500]
        },
        track: {
          backgroundColor: neutral[400],
          opacity: 1
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${divider}`
        }
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: neutral[100],
          '.MuiTableCell-root': {
            color: neutral[700]
          }
        }
      }
    }
  },
  palette: {
    action: {
      active: neutral[500],
      focus: 'rgba(55, 65, 81, 0.12)',
      hover: 'rgba(55, 65, 81, 0.04)',
      selected: 'rgba(55, 65, 81, 0.08)',
      disabledBackground: 'rgba(55, 65, 81, 0.12)',
      disabled: 'rgba(55, 65, 81, 0.26)'
    },
    background,
    divider,
    error,
    info,
    mode: 'light',
    neutral,
    primary,
    secondary,
    success,
    text,
    warning
  },
  shadows: [
    'none',
    '0px 1px 1px rgba(100, 116, 139, 0.06), 0px 1px 2px rgba(100, 116, 139, 0.1)',
    '0px 1px 2px rgba(100, 116, 139, 0.12)',
    '0px 1px 4px rgba(100, 116, 139, 0.12)',
    '0px 1px 5px rgba(100, 116, 139, 0.12)',
    '0px 1px 6px rgba(100, 116, 139, 0.12)',
    '0px 2px 6px rgba(100, 116, 139, 0.12)',
    '0px 3px 6px rgba(100, 116, 139, 0.12)',
    '0px 2px 4px rgba(31, 41, 55, 0.06), 0px 4px 6px rgba(100, 116, 139, 0.12)',
    '0px 5px 12px rgba(100, 116, 139, 0.12)',
    '0px 5px 14px rgba(100, 116, 139, 0.12)',
    '0px 5px 15px rgba(100, 116, 139, 0.12)',
    '0px 6px 15px rgba(100, 116, 139, 0.12)',
    '0px 7px 15px rgba(100, 116, 139, 0.12)',
    '0px 8px 15px rgba(100, 116, 139, 0.12)',
    '0px 9px 15px rgba(100, 116, 139, 0.12)',
    '0px 10px 15px rgba(100, 116, 139, 0.12)',
    '0px 12px 22px -8px rgba(100, 116, 139, 0.25)',
    '0px 13px 22px -8px rgba(100, 116, 139, 0.25)',
    '0px 14px 24px -8px rgba(100, 116, 139, 0.25)',
    '0px 10px 10px rgba(31, 41, 55, 0.04), 0px 20px 25px rgba(31, 41, 55, 0.1)',
    '0px 25px 50px rgba(100, 116, 139, 0.25)',
    '0px 25px 50px rgba(100, 116, 139, 0.25)',
    '0px 25px 50px rgba(100, 116, 139, 0.25)',
    '0px 25px 50px rgba(100, 116, 139, 0.25)'
  ]
};
