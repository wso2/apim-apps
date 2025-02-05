import { styled } from '@mui/material/styles';
import { TableHead as MUITableHead } from '@mui/material';
import React from 'react';

const StyledTableHead = styled(MUITableHead)({});

function TableHead(props) {
  const { children, ...rest } = props;
  return <StyledTableHead {...rest}>{children}</StyledTableHead>;
}

export default TableHead;
