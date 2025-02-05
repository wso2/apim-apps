import { styled } from '@mui/material/styles';
import { TableContainer as MUITableContainer } from '@mui/material';
import React from 'react';

const StyledTableContainer = styled(MUITableContainer)({});

function TableContainer(props) {
  const { children, ...rest } = props;
  return <StyledTableContainer {...rest}>{children}</StyledTableContainer>;
}

export default TableContainer;
