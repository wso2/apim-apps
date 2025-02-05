import React from "react";
import { Box } from "@mui/material";
import useStyles from "./Accordion.styles";

const NestedAccordionContent = ({ children }) => {
  const classes = useStyles();

  return <Box className={classes.nestedAccordionContent}>{children}</Box>;
};

export default NestedAccordionContent;
