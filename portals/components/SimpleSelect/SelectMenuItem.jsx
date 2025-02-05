import { Box, MenuItem, Typography } from "@mui/material";
import clsx from "clsx";
import React from "react";
import useStyles from "./SimpleSelect.styles";

const SelectMenuItem = (props) => {
  const { children, disabled, className, testId, description, ...rest } = props;
  const classes = useStyles();

  return (
    <MenuItem
      data-cyid={`${testId}-select-item`}
      {...rest}
      className={clsx(className, {
        [classes.selectMenuItem]: true,
        [classes.selectMenuItemDisabled]: disabled,
      })}
    >
      <Box>
        {children}
        {description && (
          <Typography variant="body2" className={classes.description}>
            {description}
          </Typography>
        )}
      </Box>
    </MenuItem>
  );
};

export default SelectMenuItem;
