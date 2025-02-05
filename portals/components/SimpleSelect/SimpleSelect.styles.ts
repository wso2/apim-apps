import { alpha } from "@mui/material/styles";
import { Theme } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    simpleSelect: {
      "& .MuiInputBase-root": {
        backgroundColor: theme.palette.common.white,
      },
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.grey[100],
        borderWidth: 1,
      },

      "& .Mui-focused": {
        boxShadow: `0 -3px 9px 0 ${alpha(
          theme.palette.common.black,
          0.04
        )} inset, 0 0 0 2px ${theme.custom.indigo[100]}`,
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.primary.light,
        },
        "&.Mui-error .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.error.main,
        },
      },
      "&:hover": {
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.primary.light,
        },
        "& .Mui-error .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.error.main,
        },
        "& .Mui-focused": {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.light,
          },
        },
      },
      "& .MuiOutlinedInput-root.Mui-error": {
        backgroundColor: theme.palette.error.light,
        borderColor: theme.palette.error.main,
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.error.main,
        },
        "&.Mui-focused": {
          backgroundColor: theme.palette.error.light,
        },
      },
      "& $select": {
        "&:focus": {
          backgroundColor: theme.palette.common.white,
        },
      },
      "& .Mui-error": {
        "& $select": {
          "&:focus": {
            backgroundColor: theme.palette.error.light,
          },
        },
      },
      "& .Mui-disabled": {
        backgroundColor: theme.palette.secondary.light,
        "& .MuiAutocomplete-endAdornment": {
          opacity: 0.5,
        },
        "&:hover": {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.grey[100],
          },
          "&.Mui-error .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.error.main,
          },
          "&.Mui-focused": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.grey[100],
            },
          },
        },
      },
      "&$resetSimpleSelectStyles": {
        "& .MuiInputBase-root": {
          backgroundColor: "transparent",
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderWidth: 0,
        },
        "& .Mui-focused": {
          boxShadow: "none",
          "& .MuiOutlinedInput-notchedOutline": {
            borderWidth: 0,
          },
          "&.Mui-error .MuiOutlinedInput-notchedOutline": {
            borderWidth: 0,
          },
        },
        "&:hover": {
          "& .MuiOutlinedInput-notchedOutline": {
            borderWidth: 0,
          },
          "& .Mui-error .MuiOutlinedInput-notchedOutline": {
            borderWidth: 0,
          },
          "& .Mui-focused": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderWidth: 0,
            },
          },
        },
        "& .MuiOutlinedInput-root.Mui-error": {
          backgroundColor: "transparent",
          borderWidth: 0,
          "& .MuiOutlinedInput-notchedOutline": {
            borderWidth: 0,
          },
          "&.Mui-focused": {
            backgroundColor: "transparent",
          },
        },
        "& $select": {
          "&:focus": {
            backgroundColor: "transparent",
          },
        },
        "& .Mui-error": {
          "& $select": {
            "&:focus": {
              backgroundColor: "transparent",
            },
          },
        },
        "& .Mui-disabled": {
          backgroundColor: "transparent",
          "& .MuiAutocomplete-endAdornment": {
            opacity: 0.5,
          },
          "&:hover": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderWidth: 0,
            },
            "&.Mui-error .MuiOutlinedInput-notchedOutline": {
              borderWidth: 0,
            },
            "&.Mui-focused": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderWidth: 0,
              },
            },
          },
        },
      },
    },
    root: {
      "&$outlined": {
        paddingRight: theme.spacing(5),
      },
    },
    resetSimpleSelectStyles: {},
    rootSmall: {},
    rootMedium: {},
    select: {},
    selectMenu: {},
    disabled: {},
    outlined: {
      boxSizing: "border-box",
    },
    outlinedSmall: {
      padding: theme.spacing(1, 1.2, 1, 1.5),
      height: theme.spacing(4),
    },
    outlinedMedium: {
      padding: theme.spacing(1.5, 1.4, 1.5, 1.5),
      height: theme.spacing(5),
    },
    icon: {
      fontSize: theme.spacing(1.5),
      top: `calc(50% - ${theme.spacing(0.75)}px)`,
      right: theme.spacing(1.875),
    },
    iconSmall: {},
    iconMedium: {},
    selectInfoIcon: {
      display: "flex",
      alignItems: "center",
      fontSize: theme.spacing(1.75),
    },
    selectMenuItem: {
      whiteSpace: "normal",
      wordWrap: "break-word",
      display: "block",
    },
    selectMenuItemDisabled: {},
    selectMenuSubHeader: {
      pointerEvents: "none",
      lineHeight: `${theme.spacing(4)}px`,
      color: theme.palette.secondary.main,
      fontSize: theme.spacing(1.25),
      fontWeight: 700,
      textTransform: "uppercase",
    },
    description: {
      color: theme.palette.secondary.main,
      marginTop: theme.spacing(0.5),
      flexGrow: 1,
      wordWrap: "break-word",
      whiteSpace: "normal",
      lineHeight: 1.5,
      maxWidth: `calc(100% - ${theme.spacing(1.5)})`,
    },
    selectMenuSubHeaderInset: {},
    listPaper: {
      maxWidth: theme.spacing(50),
      border: `1px solid ${theme.palette.grey[100]}`,
      boxShadow: `0 5px 30px -5px  ${theme.palette.grey[100]}`,
      "& .MuiMenu-list": {
        paddingTop: 0,
        paddingBottom: 0,
        "& .MuiListItem-root": {
          "&:hover": {
            backgroundColor: theme.palette.secondary.light,
          },
          "&.Mui-selected": {
            backgroundColor: theme.palette.secondary.light,
          },
        },
      },
    },
    loadingIcon: {
      marginRight: theme.spacing(1.5),
    },
    scrollableList: {
      maxHeight: theme.spacing(20),
    },
  })
);

export default useStyles;
