/**
 * IMPORTANT: This file only contains theme JSS of the Admin portal app, Don't add other configuration parameters here.
 * This theme file is an extension of material-ui default theme https://material-ui.com/customization/default-theme/
 * Application related configurations are located in `<ADMIN_PORTAL_ROOT>site/public/theme/settings.js`
 */
const AppThemes = {
    light: {
        palette: {
            primary: {
                light: '#63ccff',
                main: '#1978D2',
                dark: '#006db3',
            },
            secondary: {
                light: '#0066ff',
                main: '#a2ecf5',
                // dark: will be calculated from palette.secondary.main,
                contrastText: '#ffcc00',
            },
            background: {
                default: '#f6f6f6',
                paper: '#ffffff',
                appBar: '#1d344f',
            },
        },
        typography: {
            fontFamily: '"Open Sans", "Helvetica", "Arial", sans-serif',
            fontSize: 12,
            subtitle2: {
                fontWeight: 600,
                fontSize: '0.875rem',
            },
            h4: {
                fontSize: '1.3rem',
            },
            h5: {
                fontWeight: 500,
                fontSize: 26,
                letterSpacing: 0.5,
            },
        },
        shape: {
            borderRadius: 8,
        },
        props: {
            MuiTab: {
                disableRipple: true,
            },
        },
        mixins: {
            toolbar: {
                minHeight: 48,
            },
        },
        custom: {
            drawerWidth: 256,
            logo: '/site/public/images/logo.svg',
            logoWidth: 180,
        },
        overrides: {
            MuiRadio: {
                colorSecondary: {
                    '&.Mui-checked': { color: '#009be5' },
                    '&.Mui-disabled': {
                        color: 'rgba(0, 0, 0, 0.26)',
                    },
                },
            },
            MuiButton: {
                root: {
                    textTransform: 'none',
                },
                contained: {
                    boxShadow: 'none',
                    '&:active': {
                        boxShadow: 'none',
                    },
                },
            },
            MuiTabs: {
                root: {
                    marginLeft: 8,
                },
                indicator: {
                    height: 3,
                    borderTopLeftRadius: 3,
                    borderTopRightRadius: 3,
                    backgroundColor: '#ffffff',
                },
            },
            MuiTab: {
                root: {
                    textTransform: 'none',
                    margin: '0 16px',
                    minWidth: 0,
                    padding: 0,
                },
            },
            MuiTableCell: {
                root: {
                    '&:first-of-type': {
                        paddingLeft: 16,
                        paddingRight: 4,
                        paddingTop: 4,
                        paddingBottom: 4,
                    },
                    borderBottom: '1px solid #e0e0e0',
                },
            },
            MuiIconButton: {
                root: {
                    padding: 8,
                },
            },
            MuiTooltip: {
                tooltip: {
                    borderRadius: 4,
                },
            },
            MuiDivider: {
                root: {
                    backgroundColor: '#404854',
                    borderColor: '#404854',
                },
            },
            MuiListItemText: {
                primary: {
                    fontWeight: 500,
                },
            },
            MuiListItemIcon: {
                root: {
                    color: 'inherit',
                    marginRight: 0,
                    '& svg': {
                        fontSize: 20,
                    },
                },
            },
            MuiAvatar: {
                root: {
                    width: 32,
                    height: 32,
                },
            },
            MuiDrawer: {
                paper: {
                    backgroundColor: '#18202c',
                },
            },
            MuiListItem: {
                root: {
                    '&.itemCategory': {
                        backgroundColor: '#232f3e',
                        boxShadow: '0 -1px 0 #404854 inset',
                        paddingTop: 8,
                        paddingBottom: 8,
                    },
                },
            },
            MuiInputLabel: {
                root: {
                    display: 'block',
                    transformOrigin: 'top left',
                },
                outlined: {
                    zIndex: 1,
                    transform: 'translate(14px, 12px) scale(1)',
                    pointerEvents: 'none',
                    '&.MuiInputLabel-shrink': {
                        transform: 'translate(14px, -6px) scale(0.75)',
                    },
                    '&.MuiInputLabel-marginDense': {
                        transform: 'translate(10px, 12px) scale(1)',
                    },
                },
            },
            MuiOutlinedInput: {
                root: {
                    position: 'relative',
                    borderRadius: '8px',
                },
                input: {
                    padding: '10.5px 14px',
                },
                multiline: {
                    padding: '10.5px 14px',
                },
                marginDense: {
                    padding: '10.5px 14px',
                },
            },
        },
    },
};
if (typeof module !== 'undefined') {
    module.exports = AppThemes; // Added for tests
}
