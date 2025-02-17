import { Box, Toolbar, Tooltip, Typography } from "@mui/material";
import React from 'react';
import clsx from "clsx";
import useTableStyles from "./Table.styles";
import IconButton from "../IconButton/IconButton";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";

const TableToolbar = (props) => {
  const classes = useTableStyles();
  const { numSelected } = props;

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography color="inherit" variant="h5" component="h5">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography className={classes.title} variant="h5" component="h5">
          Nutrition
        </Typography>
      )}
      <Box ml={2}>
        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton
              color="secondary"
              variant="link"
              aria-label="delete"
              testId="delete"
            >
              <DeleteOutlineOutlinedIcon fontSize="small"/>
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Filter list">
            <IconButton
              color="secondary"
              variant="link"
              aria-label="filter list"
              testId="filters"
            >
              <FilterAltOutlinedIcon fontSize="small"/>
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Toolbar>
  );
};

export default TableToolbar;
