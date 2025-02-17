import { createStyles, makeStyles } from "@mui/styles";
import { Theme } from "@mui/material";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    noDataContainer: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    noDataContainerSm: {
      padding: theme.spacing(1.5, 2),
    },
    noDataContainerMd: {
      padding: theme.spacing(2),
    },
    noDataContainerLg: {
      padding: theme.spacing(4),
    },
    noDataIconWrap: {
      display: "flex",
      alignItems: "center",
      "& svg": {
        width: "100%",
        maxWidth: "100%",
        height: "auto",
      },
    },
    noDataIconWrapSm: {
      width: theme.spacing(4),
    },
    noDataIconWrapMd: {
      width: theme.spacing(5),
    },
    noDataIconWrapLg: {
      width: theme.spacing(6),
    },
    noDataMessageWrap: {},
    noDataMessageWrapSm: {},
    noDataMessageWrapMd: {},
    noDataMessageWrapLg: {},
    noDataMessage: {
      color: theme.palette.secondary.main,
      textAlign: "center",
    },
  })
);

export default useStyles;
