import { styled } from "@mui/material/styles";
import { TableCell as MUITableCell } from "@mui/material";
import React from 'react';

const StyledTableCell = styled(MUITableCell)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
}));

function TableCell(props) {
  const { children, ...rest } = props;
  return <StyledTableCell {...rest}>{children}</StyledTableCell>;
}

export default TableCell;
