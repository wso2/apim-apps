import { Theme } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    avatarRoot: {
      color: theme.palette.common.white,
      '&$small': {
        '& svg': {
          fontSize: theme.spacing(1.25),
        },
      },
      '&$medium': {
        '& svg': {
          fontSize: theme.spacing(1.75),
        },
      },
      '&$large': {
        '& svg': {
          fontSize: theme.spacing(2.5),
        },
      },
      '&$default': {
        backgroundColor: theme.palette.common.white,
        color: theme.palette.common.black,
      },
      '&$primary': {
        backgroundColor: theme.palette.primary.main,
      },
      '&$secondary': {
        backgroundColor: theme.palette.secondary.light,
        color: theme.palette.primary.main,
        '&$white': {
          backgroundColor: theme.palette.common.white,
        },
      },
      '&$success': {
        backgroundColor: theme.palette.success.main,
      },
      '&$warning': {
        backgroundColor: theme.palette.warning.main,
      },
      '&$error': {
        backgroundColor: theme.palette.error.main,
      },
      '&$secondaryDark': {
        backgroundColor: theme.palette.secondary.dark,
      },
    },
    small: {
      width: theme.spacing(2.5),
      height: theme.spacing(2.5),
      fontSize: theme.typography.h6.fontSize,
      fontWeight: theme.typography.h6.fontWeight,
      lineHeight: 1,
    },
    medium: {
      width: theme.spacing(4),
      height: theme.spacing(4),
      fontSize: theme.typography.h5.fontSize,
      fontWeight: theme.typography.h5.fontWeight,
      lineHeight: 1,
    },
    large: {
      width: theme.spacing(5),
      height: theme.spacing(5),
      fontSize: theme.typography.h5.fontSize,
      fontWeight: theme.typography.h5.fontWeight,
      lineHeight: 1,
    },
    default: {},
    primary: {},
    secondary: {},
    success: {},
    warning: {},
    error: {},
    white: {},
    secondaryDark: {},
  })
);
export default useStyles;
