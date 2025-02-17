import { createStyles, makeStyles } from "@mui/styles";
import { Theme } from "@mui/material";

const useStyles = makeStyles((theme: Theme) => ({
  avatarUserName: {
    display: "flex",
    alignItems: "center",
    gridGap: theme.spacing(1),
  },
}));

export default useStyles;
