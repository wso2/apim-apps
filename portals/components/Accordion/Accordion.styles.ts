import { createStyles, makeStyles } from "@mui/styles";
import { Theme } from "@mui/material";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    accordion: {
      "&$accordionBordered": {
        border: `1px solid ${theme.palette.grey[100]}`,
        marginBottom: theme.spacing(1),
        borderRadius: 8,
        "&.Mui-expanded": {
          marginBottom: theme.spacing(1),
        },
        "&:last-child": {
          borderBottomColor: theme.palette.grey[100],
          marginBottom: 0,
        },
      },
    },
    accordionBordered: {},
    nestedAccordionContent: {
      width: "100%",
      padding: theme.spacing(1, 3),
    },
    expandIconWrapper: {
      padding: theme.spacing(1),
    },
    accordionSummaryRoot: {
      minHeight: "initial",
      padding: theme.spacing(0.5, 2),
      borderBottom: "1px solid transparent",
      "&.Mui-expanded": {
        minHeight: "initial",
        borderBottomColor: theme.palette.grey[100],
      },
      "& .MuiIconButton-label": {
        fontSize: theme.spacing(1.5),
        color: theme.palette.common.black,
      },
      "& .MuiAccordionSummary-content": {
        margin: 0,
        flexGrow: 1,
        overflow: "hidden",
        "&.Mui-expanded": {
          margin: 0,
        },
      },
      "&$accordionSummaryNoPaddingRoot": {
        padding: theme.spacing(0.5, 0),
      },
    },
    accordionSummaryNoPaddingRoot: {},
  })
);
export default useStyles;
