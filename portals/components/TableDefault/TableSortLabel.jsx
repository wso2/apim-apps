import { styled } from "@mui/material/styles";
import { TableSortLabel as MUITableSortLabel } from "@mui/material";
import React from 'react';

const StyledTableSortLabel = styled(MUITableSortLabel)({});

function TableSortLabel(props) {
  const { children, ...rest } = props;
  return <StyledTableSortLabel {...rest}>{children}</StyledTableSortLabel>;
}

export default TableSortLabel;
