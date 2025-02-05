import { alpha } from "@mui/material/styles";
import { Theme } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cardHeading: {
      display: "flex",
      padding: theme.spacing(5, 5, 0, 5),
    },
    cardActionsCont: {
      padding: theme.spacing(0, 5, 5, 5),
    },
    cardActions: {
      display: "flex",
      gap: theme.spacing(1),
      paddingTop: theme.spacing(3),
      borderTop: `1px solid ${theme.palette.grey[100]}`,
    },
    xsBorderRadius: {
      borderRadius: 5,
    },
    smBorderRadius: {
      borderRadius: 8,
    },
    mdBorderRadius: {
      borderRadius: 12,
    },
    lgBorderRadius: {
      borderRadius: 16,
      "&$boxShadowLight": {
        boxShadow: `0 5px 50px ${alpha(theme.palette.grey[200], 0.5)}`,
      },
      "&$boxShadowDark": {
        boxShadow: `0 5px 50px ${alpha(theme.palette.grey[200], 0.5)}`,
      },
    },
    square: {
      borderRadius: 0,
    },
    boxShadowNone: {
      boxShadow: "none",
    },
    boxShadowLight: {
      boxShadow: `0 0 1px ${theme.palette.secondary.main}, 0 1px 2px ${theme.palette.grey[200]}`,
    },
    boxShadowDark: {
      boxShadow: `0 1px 1px ${theme.palette.grey[200]}`,
    },
    bgGrey: {
      backgroundColor: theme.palette.secondary.light,
    },
    cardRoot: {
      "&$disabled": {
        boxShadow: "none",
      },
      "&.MuiPaper-outlined": {
        border: `none`,
      },
    },
    cardActionAreaFullHeight: {
      height: "100%",
    },
    disabled: {
      pointerEvents: "none",
    },
    cardContentRoot: {
      padding: theme.spacing(3),
    },
    cardActionAreaRoot: {
      padding: 0,
      border: `1px solid ${theme.palette.common.white}`,
      borderRadius: "inherit",
      transition: "all 0.25s",
      "&:hover": {
        backgroundColor: "transparent",
        borderColor: theme.palette.primary.main,
        "& .MuiCardActionArea-focusHighlight": {
          opacity: 0,
          backgroundColor: theme.palette.common.white,
        },
      },
      "&.Mui-disabled": {
        borderColor: theme.palette.grey[100],
      },
    },
    cardActionAreaOutlined: {
      border: `1px solid ${theme.palette.grey[200]}`,
    },
    cardActionAreaElevation: {
      "&:hover": {
        boxShadow: `none`,
      },
    },
    fullHeight: {
      height: "100%",
    },
    colorDefault: {},
    colorSecondary: {
      backgroundColor: theme.palette.secondary.light,
      "& $cardActionAreaRoot": {
        borderColor: theme.palette.secondary.light,
        "&:hover": {
          borderColor: theme.palette.primary.main,
          "& .MuiCardActionArea-focusHighlight": {
            opacity: 0,
          },
        },
        "&.Mui-disabled": {
          borderColor: theme.palette.grey[100],
        },
      },
    },
  })
);
export default useStyles;
