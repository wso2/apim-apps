import React from "react";
import AccordionSummary from "@mui/material/AccordionSummary";
import { ExpandMore as ChevronDown } from "@mui/icons-material";
import clsx from "clsx";
import useStyles from "./Accordion.styles";

const CustomAccordionSummary = ({
  children,
  testId,
  noPadding = false,
  expandIcon,
  ...rest
}) => {
  const classes = useStyles();

  return (
    <AccordionSummary
      expandIcon={
        <div className={classes.expandIconWrapper}>
          {expandIcon || <ChevronDown fontSize="small" />}
        </div>
      }
      data-cyid={testId}
      className={clsx({
        [classes.accordionSummaryRoot]: true,
        [classes.accordionSummaryNoPaddingRoot]: noPadding,
      })}
      {...rest}
    >
      {children}
    </AccordionSummary>
  );
};

export default CustomAccordionSummary;
