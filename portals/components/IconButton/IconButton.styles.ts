import { createStyles, makeStyles } from "@mui/styles";
import { alpha } from "@mui/material/styles";
import { Theme } from "@mui/material";

const useIconButtonStyles = makeStyles((theme: Theme) =>
  createStyles({
    commons: {
      border: `1px solid ${alpha(theme.palette.common.black, 0.15)}`,
      boxShadow: `0 1px 2px  ${alpha(theme.palette.common.black, 0.15)}`,
      borderRadius: 5,
      color: theme.palette.common.white,
      padding: theme.spacing(1.375),
      "& svg": {
        fontSize: theme.spacing(2),
      },
    },
    primaryContained: {
      backgroundColor: theme.palette.primary.main,
      "&:hover": {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    primaryText: {
      color: theme.palette.primary.main,
    },
    primaryOutlined: {
      color: theme.palette.primary.main,
      border: `1px solid ${theme.palette.primary.main}`,
      "&:hover": {
        borderColor: theme.palette.primary.dark,
      },
    },
    primarySubtle: {
      color: theme.palette.primary.main,
    },
    primaryLink: {
      color: theme.palette.primary.main,
      borderColor: "transparent",
      boxShadow: "none",
      "&$disabled": {
        color: theme.palette.primary.main,
        borderColor: "transparent",
        boxShadow: "none",
      },
    },
    secondaryContained: {
      backgroundColor: theme.palette.secondary.light,
      color: theme.palette.common.black,
      border: `1px solid ${theme.palette.grey[100]}`,
      boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`,
    },
    secondaryText: {
      color: theme.palette.common.black,
    },
    secondaryOutlined: {
      color: theme.palette.secondary.main,
      border: `1px solid ${theme.palette.secondary.main}`,
      "&:hover": {
        borderColor: theme.palette.secondary.dark,
      },
    },
    secondarySubtle: {
      color: theme.palette.common.black,
    },
    secondaryLink: {
      color: theme.palette.common.black,
      borderColor: "transparent",
      boxShadow: "none",
      "&$disabled": {
        color: theme.palette.common.black,
        borderColor: "transparent",
        boxShadow: "none",
      },
    },
    errorContained: {
      backgroundColor: theme.palette.error.main,
      border: `1px solid ${theme.palette.error.main}`,
      "&:hover": {
        backgroundColor: theme.palette.error.dark,
        border: `1px solid ${theme.palette.error.dark}`,
      },
    },
    errorText: {
      color: theme.palette.error.main,
    },
    errorOutlined: {
      color: theme.palette.error.main,
      border: `1px solid ${theme.palette.error.main}`,
      "&:hover": {
        borderColor: theme.palette.error.dark,
      },
    },
    errorSubtle: {
      color: theme.palette.error.main,
    },
    errorLink: {
      color: theme.palette.error.main,
      borderColor: "transparent",
      boxShadow: "none",
      "&$disabled": {
        color: theme.palette.error.main,
        borderColor: "transparent",
        boxShadow: "none",
      },
    },
    successContained: {
      backgroundColor: theme.palette.success.main,
      border: `1px solid ${theme.palette.success.main}`,
      "&:hover": {
        backgroundColor: theme.palette.success.dark,
        border: `1px solid ${theme.palette.success.dark}`,
      },
    },
    successText: {
      color: theme.palette.success.main,
    },
    successOutlined: {
      color: theme.palette.success.main,
      border: `1px solid ${theme.palette.success.main}`,
      "&:hover": {
        borderColor: theme.palette.success.dark,
      },
    },
    successSubtle: {
      color: theme.palette.success.main,
    },
    successLink: {
      color: theme.palette.success.main,
      borderColor: "transparent",
      boxShadow: "none",
      "&$disabled": {
        color: theme.palette.success.main,
        borderColor: "transparent",
        boxShadow: "none",
      },
    },
    warningContained: {
      backgroundColor: theme.palette.warning.main,
      border: `1px solid ${theme.palette.warning.main}`,
      "&:hover": {
        backgroundColor: theme.palette.warning.dark,
        border: `1px solid ${theme.palette.warning.dark}`,
      },
    },
    warningText: {
      color: theme.palette.warning.main,
    },
    warningOutlined: {
      color: theme.palette.warning.main,
      border: `1px solid ${theme.palette.warning.main}`,
      "&:hover": {
        borderColor: theme.palette.warning.dark,
      },
    },
    warningSubtle: {
      color: theme.palette.warning.main,
    },
    warningLink: {
      color: theme.palette.warning.main,
      borderColor: "transparent",
      boxShadow: "none",
      "&$disabled": {
        color: theme.palette.warning.main,
        borderColor: "transparent",
        boxShadow: "none",
      },
    },
    small: {
      padding: theme.spacing(0.875),
      "& svg": {
        fontSize: theme.spacing(2),
      },
    },
    smallLink: {
      padding: theme.spacing(0.375, 0),
    },
    smallRounded: {
      padding: theme.spacing(0.875),
      "& svg": {
        fontSize: theme.spacing(2),
      },
    },
    tiny: {
      padding: theme.spacing(0.625),
      "& svg": {
        fontSize: theme.spacing(1.375),
      },
    },
    tinyLink: {
      padding: theme.spacing(0),
    },
    tinyRounded: {
      padding: theme.spacing(0.625),
      "& svg": {
        fontSize: theme.spacing(1.375),
      },
    },
    rounded: {
      borderRadius: "50%",
    },
    disabled: {
      opacity: 0.5,
      cursor: "default",
      pointerEvents: "none",
      "&:hover": {
        textDecoration: "none",
      },
    },
    contained: {
      "&:hover": {
        boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.18)}`,
      },
      "&:focus": {
        boxShadow: `0 1px 6px 2px ${alpha(theme.palette.common.black, 0.1)}`,
      },
    },
    outlined: {
      backgroundColor: "transparent",
      boxShadow: `0 1px 2px ${alpha(theme.palette.common.black, 0.05)}`,
      "&:hover, &:focus": {
        backgroundColor: "transparent",
        boxShadow: `0 1px 6px 2px ${alpha(theme.palette.common.black, 0.1)}`,
      },
    },
    fullWidth: { width: "100%" },
    text: {
      backgroundColor: "transparent",
      border: "none",
      boxShadow: "none",
    },
    subtle: {
      border: `1px solid ${theme.palette.grey[100]}`,
      boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`,
      backgroundColor: theme.palette.secondary.light,
      "&:hover": {
        backgroundColor: theme.palette.secondary.light,
        boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`,
      },
      "&:focus": {
        backgroundColor: theme.palette.secondary.light,
        boxShadow: "none",
      },
    },
    link: {
      borderColor: "transparent",
      boxShadow: "none",
      paddingLeft: 0,
      paddingRight: 0,
      minWidth: "initial",
      backgroundColor: "transparent",
      "&:hover": {
        opacity: 0.6,
      },
      "&:hover, &:focus": {
        backgroundColor: "transparent",
        boxShadow: "none",
      },
    },
    active: {
      color: theme.palette.primary.main,
      border: `1px solid ${theme.palette.primary.main}`,
      backgroundColor:
        theme.custom?.indigo[100] || alpha(theme.palette.primary.main, 0.1),
      cursor: "default",
      "&:hover, &:focus": {
        border: `1px solid ${theme.palette.primary.main}`,
        backgroundColor:
          theme.custom?.indigo[100] || alpha(theme.palette.primary.main, 0.1),
        boxShadow: "none",
      },
    },
    inactive: {
      color: theme.palette.secondary.main,
      border: `1px solid ${theme.palette.secondary.main}`,
      "&:hover": {
        borderColor: theme.palette.secondary.dark,
      },
    },
  })
);

export default useIconButtonStyles;
