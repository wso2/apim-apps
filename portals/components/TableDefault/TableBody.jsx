import { styled } from "@mui/material/styles";
import { TableBody as MUITableBody } from "@mui/material";
import React from 'react';

const StyledTableBody = styled(MUITableBody)({});

function TableBody(props) {
  const { children, ...rest } = props;
  return <StyledTableBody {...rest}>{children}</StyledTableBody>;
}

export default TableBody;
