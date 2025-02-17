import {
  Accordion as MUIAccordion,
  AccordionProps as MUIAccordionProps,
  styled,
} from "@mui/material";
import clsx from "clsx";
import React from "react";
import useStyles from "./Accordion.styles";

const StyledAccordion = styled(MUIAccordion)(({ theme }) => ({
  boxShadow: "none",
  borderBottom: `1px solid ${theme.palette.grey[100]}`,
  "&.MuiAccordion-root": {
    "&:first-of-type": {
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    },
    "&:last-of-type": {
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
    },
  },
  "&.MuiPaper-outlined": {
    border: "none",
    borderTop: `1px solid ${theme.palette.grey[100]}`,
    backgroundColor: "transparent",
    "&:first-of-type": {
      borderTop: "none",
    },
    "& .MuiAccordionSummary-root": {
      padding: theme.spacing(1, 0),
    },
  },
  "&.Mui-expanded": {
    margin: 0,
  },
  "&:before": {
    backgroundColor: "transparent",
  },
  "&:last-of-type": {
    borderBottomColor: "transparent",
  },
}));

const Accordion = ({
  children,
  testId,
  contained = true,
  bordered,
  ...rest
}) => {
  const classes = useStyles();
  const variant = !contained ? "outlined" : undefined;

  return (
    <StyledAccordion
      data-cyid={testId}
      variant={variant}
      className={clsx({
        [classes.accordion]: true,
        [classes.accordionBordered]: bordered,
      })}
      {...rest}
    >
      {children}
    </StyledAccordion>
  );
};

export default Accordion;
