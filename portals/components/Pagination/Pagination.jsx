import React from "react";
import {
  Box,
  styled,
  Typography,
  IconButton,
  Select,
  MenuItem,
} from "@mui/material";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  FirstPage,
  LastPage,
} from "@mui/icons-material";
import useStyle from "./Pagination.styles";

const StyledDiv = styled("div")(({ theme }) => ({
  flexShrink: 0,
  marginLeft: theme.spacing(2.5),
  marginRight: theme.spacing(6),
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  flexGrow: 1,
  gap: theme.spacing(0.5),
}));

export default function Pagination({
  count,
  rowsPerPageOptions,
  rowsPerPage,
  page,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageLabel,
  testId,
}) {
  const from = page * rowsPerPage + 1;
  const to = count - from < rowsPerPage ? count : from + (rowsPerPage - 1);
  const displayedRowsLabel = `${from} - ${to} of ${count}`;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  const classes = useStyle();

  return (
    <Box data-cyid={`${testId}-pagination`} display="flex" alignItems="center">
      <StyledDiv>
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          <FirstPage />
        </IconButton>
        <IconButton
          onClick={handleBackButtonClick}
          disabled={page === 0}
          aria-label="previous page"
        >
          <KeyboardArrowLeft />
        </IconButton>
        <Typography>{displayedRowsLabel}</Typography>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="next page"
        >
          <KeyboardArrowRight />
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="last page"
        >
          <LastPage />
        </IconButton>
      </StyledDiv>
      <Typography>{rowsPerPageLabel || "Rows per page"}</Typography>
      <Box className={classes.dropDown}>
        <Select
          value={rowsPerPage.toString()}
          onChange={(event) => onRowsPerPageChange(event.target.value)}
          displayEmpty
          size="small"
        >
          {rowsPerPageOptions.map((num) => (
            <MenuItem key={num} value={num.toString()}>
              {num}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Box>
  );
}
