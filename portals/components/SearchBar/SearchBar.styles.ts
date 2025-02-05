import { createStyles, makeStyles } from "@mui/styles";
import { Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    search: {
      position: "relative",
      width: "100%",
    },
    searchIcon: {
      padding: theme.spacing(0, 1.5),
      height: "100%",
      zIndex: 1,
      pointerEvents: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: theme.palette.secondary.dark,
    },
    textField: {
      flexGrow: 1,
    },
    inputRoot: {
      color: "inherit",
      borderRadius: theme.shape.borderRadius,
      transition: "all 0.3s",
      width: "100%",
      backgroundColor: theme.palette.secondary.light,
      height: theme.spacing(5),
      boxSizing: "border-box",
      border: `1px solid transparent`,
      "&.MuiInputBase-adornedEnd": {
        paddingLeft: theme.spacing(2),
      },
      "&$inputRootBordered": {
        borderColor: theme.palette.grey[100],
      },
      "&$inputRootFocused": {
        "& $searchIcon": {
          color: theme.palette.primary.main,
        },
      },
      "&:hover": {
        borderColor: theme.palette.primary.light,
      },
      "&$inputRootFilter": {
        "&.MuiInputBase-adornedEnd": {
          paddingLeft: 0,
        },
      },
    },
    rootSmall: {
      height: theme.spacing(4),
      "& .MuiSvgIcon-fontSizeSmall": {
        fontSize: theme.spacing(2),
      },
    },
    rootMedium: {
      height: theme.spacing(5),
    },
    inputRootBordered: {},
    inputRootFilter: {},
    inputRootFocused: {
      backgroundColor: theme.palette.common.white,
      borderColor: theme.palette.primary.light,
    },
    inputRootSecondary: {
      border: `1px solid ${theme.palette.grey[100]}`,
      boxShadow: `0 1px 2px -1px ${alpha(
        theme.palette.common.black,
        0.08
      )}, 0 -3px 9px 0 ${alpha(theme.palette.common.black, 0.04)} inset`,
      backgroundColor: theme.palette.common.white,
    },
    inputRootExpandable: {
      color: "inherit",
      width: "100%",
    },
    input: {
      padding: theme.spacing(1, 0),
      "&::placeholder": {
        color: theme.palette.secondary.main,
      },
    },
    inputExpandable: {
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(1, 1, 1, 1),
      transition: "all 0.3s",
      width: "100%",
      backgroundColor: theme.palette.common.white,
      height: theme.spacing(5),
      boxSizing: "border-box",
      "&::placeholder": {
        color: theme.palette.secondary.main,
      },
      "&:focus": {
        boxShadow: "none",
      },
    },
    inputSmall: {
      height: theme.spacing(3.75),
      "& .MuiSvgIcon-fontSizeSmall": {
        fontSize: theme.spacing(2),
      },
    },
    inputMedium: {
      height: theme.spacing(4.75),
    },
    expandableSearchCont: {
      display: "flex",
      alignItems: "center",
      border: "1px solid transparent",
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1.5),
      transition: "all 0.3s",
    },
    expandableSearchContRight: {
      justifyContent: "flex-end",
    },
    expandableSearchContOpen: {
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.common.white,
      border: `1px solid ${theme.palette.primary.light}`,
      boxShadow: `0 0 0 2px ${
        theme.custom.indigo[100]
      }, inset 0 2px 2px ${alpha(theme.palette.common.black, 0.07)}`,
      flex: 1,
    },
    expandableSearchWrap: {
      display: "flex",
      overflow: "hidden",
      maxWidth: 0,
      transition: "all 0.3s",
    },
    expandableSearchWrapShow: {
      maxWidth: "100%",
      flexGrow: 1,
    },
    filterWrap: {
      height: "100%",
      paddingLeft: theme.spacing(0.5),
      position: "relative",
      "&>div": {
        marginTop: theme.spacing(-0.125),
      },
      "&:before": {
        content: '""',
        position: "absolute",
        top: theme.spacing(1),
        bottom: theme.spacing(1),
        left: 0,
        width: 1,
        backgroundColor: theme.palette.grey[100],
      },
    },
  })
);

export default useStyles;
