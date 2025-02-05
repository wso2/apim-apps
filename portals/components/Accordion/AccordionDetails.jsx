import {
  AccordionDetails as MUIAccordionDetails,
  AccordionDetailsProps as MUIAccordionDetailsProps,
  styled,
} from "@mui/material";
import React from 'react';

const StyledAccordionDetails = styled(MUIAccordionDetails)(() => ({
  padding: 0,
}));

const AccordionDetails = ({ testId, children, ...rest }) => {
  return (
    <StyledAccordionDetails data-cyid={testId} {...rest}>
      {children}
    </StyledAccordionDetails>
  );
};

export default AccordionDetails;
