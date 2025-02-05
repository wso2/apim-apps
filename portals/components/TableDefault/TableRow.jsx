import { styled } from '@mui/material/styles';
import { TableRow as MUITableRow } from '@mui/material';
import React from 'react';

const StyledTableRow = styled(MUITableRow)(
  ({ theme, disabled, noBorderBottom }) => ({
    opacity: disabled ? 0.7 : 1,
    color: disabled ? theme.palette.text.disabled : theme.palette.text.primary,
    cursor: disabled ? 'not-allowed' : 'pointer',
    pointerEvents: disabled ? 'none' : 'auto',
    ...(noBorderBottom && {
      '& .MuiTableCell-root': {
        borderBottom: 'none',
      },
    }),
  })
);

function TableRow(props) {
  const {
    children,
    deletable, 
    noBorderBottom = false,
    disabled = false,
    onClick,
    ...rest
  } = props;
  
  return (
    <StyledTableRow
      onClick={onClick}
      disabled={disabled}
      noBorderBottom={noBorderBottom}
      {...rest}
    >
      {children}
    </StyledTableRow>
  );
}

export default TableRow;
