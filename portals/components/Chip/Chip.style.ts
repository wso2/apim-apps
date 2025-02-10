import { createStyles, makeStyles } from "@mui/styles";
import { Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      "& .MuiChip-icon": {
        color: "inherit",
      },
      "&$small": {
        fontSize: theme.spacing(1.25),
        borderRadius: theme.spacing(0.375),
        lineHeight: 1.2,
        height: theme.spacing(2),
        "& .MuiChip-label": {
          padding: theme.spacing(0, 0.5, 0.125, 0.5),
        },
        "& .MuiChip-icon": {
          marginLeft: theme.spacing(0.5),
          marginRight: 0,
        },
      },
      "&$medium": {
        fontSize: theme.spacing(1.625),
        borderRadius: theme.spacing(0.625),
        lineHeight: 1.23,
        height: theme.spacing(3),
        "& .MuiChip-label": {
          padding: theme.spacing(0.1, 1),
        },
        "& .MuiChip-icon": {
          marginLeft: theme.spacing(1),
          marginRight: 0,
        },
      },
      "&$large": {
        fontSize: theme.spacing(1.625),
        borderRadius: theme.spacing(0.625),
        lineHeight: 1.23,
        "& .MuiChip-label": {
          padding: theme.spacing(1, 1.5),
        },
        "& .MuiChip-icon": {
          marginLeft: theme.spacing(1.5),
          marginRight: 0,
        },
      },
    },
    small: {},
    medium: {},
    large: {},
    contained: {
      "&$info": {
        backgroundColor: theme.custom.blue[500],
        color: theme.palette.common.white,
      },
      "&$primary": {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
      },
      "&$secondary": {
        background: theme.palette.secondary.light,
      },
      "&$success": {
        backgroundColor: theme.palette.success.main,
        color: theme.palette.common.white,
      },
      "&$default": {
        backgroundColor: theme.palette.grey[200],
      },
      "&$warning": {
        backgroundColor: theme.palette.warning.dark,
        color: theme.palette.common.white,
      },
      "&$error": {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.common.white,
      },
    },
    outlined: {
      "&$info": {
        color: theme.custom.blue[500],
        border: `1px solid ${theme.custom.blue[500]}`,
        backgroundColor: alpha(theme.custom.blue[500], 0.1),
      },
      "&$primary": {
        border: `1px solid ${theme.palette.primary.main}`,
        color: theme.palette.primary.main,
        backgroundColor: theme.custom.indigo[100],
      },
      "&$secondary": {
        backgroundColor: theme.palette.common.white,
        border: `1px solid ${theme.palette.grey[200]}`,
      },
      "&$success": {
        border: `1px solid ${theme.palette.success.main}`,
        color: theme.palette.success.main,
        backgroundColor: theme.palette.success.light,
      },
      "&$default": {
        backgroundColor: theme.palette.grey[100],
        border: `1px solid ${theme.palette.grey[200]}`,
      },
      "&$warning": {
        border: `1px solid ${theme.palette.warning.dark}`,
        color: theme.palette.warning.dark,
        backgroundColor: theme.palette.warning.light,
      },
      "&$error": {
        border: `1px solid ${theme.palette.error.main}`,
        color: theme.palette.error.main,
        backgroundColor: theme.palette.error.light,
      },
    },
    info: {},
    primary: {},
    secondary: {},
    success: {},
    default: {},
    warning: {},
    error: {},
  })
);
export default useStyles;
