import { createStyles, makeStyles } from "@mui/styles";
import { Theme } from "@mui/material";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dropDown: {
      width: theme.spacing(8),
      marginLeft: theme.spacing(1),
    },
  })
);

export default useStyles;
