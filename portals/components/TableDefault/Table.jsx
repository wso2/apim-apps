import { styled, alpha } from "@mui/material/styles";
import { Table as MUITable } from "@mui/material";
import React from 'react';

const StyledTable = styled(MUITable)(({ theme, variant }) => ({
  ...(variant === "dark" && {
    borderCollapse: "separate",
    borderSpacing: theme.spacing(0, 1),
    "& tbody": {
      "& tr": {
        boxShadow: `0px 2px 2px ${alpha(theme.palette.secondary.main, 0.2)}`,
        borderRadius: theme.spacing(1),
      },
    },
    "& td": {
      backgroundColor: theme.palette.secondary.light,
      borderBottom: "none",
      padding: theme.spacing(1, 2),
      "&:first-child": {
        borderLeft: "1px solid transparent",
        borderTopLeftRadius: theme.spacing(1),
        borderBottomLeftRadius: theme.spacing(1),
      },
      "&:last-child": {
        borderRight: "1px solid transparent",
        borderTopRightRadius: theme.spacing(1),
        borderBottomRightRadius: theme.spacing(1),
      },
    },
  }),
}));

function Table({ children, variant = "default", testId, ...rest }) {
  return (
    <StyledTable variant={variant} {...rest} data-cyid={testId}>
      {children}
    </StyledTable>
  );
}

export default Table;
