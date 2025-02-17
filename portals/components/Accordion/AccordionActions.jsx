import {
  AccordionActions as MUIAccordionActions,
  AccordionActionsProps as MUIAccordionActionsProps,
  styled,
} from "@mui/material";
import React from 'react';

const StyledAccordionActions = styled(MUIAccordionActions)(() => ({}));

const AccordionActions = ({ testId, children, ...rest }) => {
  return (
    <StyledAccordionActions data-cyid={testId} {...rest}>
      {children}
    </StyledAccordionActions>
  );
};

export default AccordionActions;
