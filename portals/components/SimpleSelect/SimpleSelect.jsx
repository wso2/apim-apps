import React from "react";
import { Box, FormHelperText, Select } from "@mui/material";
import clsx from "clsx";
import CircularProgress from '@mui/material/CircularProgress';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { ExpandMore as ChevronDown } from "@mui/icons-material";
import useStyles from "./SimpleSelect.styles";

const SimpleSelect = (props) => {
  const {
    testId,
    children,
    value,
    size = "medium",
    error = false,
    helperText,
    resetStyles = false,
    anchorOrigin = {
      vertical: "bottom",
      horizontal: "left",
    },
    transformOrigin,
    renderValue,
    onChange,
    disabled,
    isLoading,
    isScrollable = false,
  } = props;
  const classes = useStyles();

  const CircularLoader = () => (
    <Box className={classes.loadingIcon}>
      <CircularProgress size={16} />
    </Box>
  );

  return (
    <Box
      className={clsx({
        [classes.simpleSelect]: true,
        [classes.resetSimpleSelectStyles]: resetStyles,
      })}
    >
      <Select
        disabled={disabled || isLoading}
        data-cyid={testId}
        data-testid={testId}
        value={value}
        onChange={onChange}
        IconComponent={isLoading ? CircularLoader : ChevronDown}
        variant="outlined"
        MenuProps={{
          PopoverClasses: {
            paper: `${classes.listPaper} ${
              isScrollable ? classes.scrollableList : ""
            }`,
          },
          anchorOrigin,
          transformOrigin,
        }}
        renderValue={renderValue}
        error={error}
        fullWidth
        classes={{
          root: clsx({
            [classes.root]: true,
            [classes.rootSmall]: size === "small",
            [classes.rootMedium]: size === "medium",
          }),
          select: classes.select,
          selectMenu: classes.selectMenu,
          disabled: classes.disabled,
          icon: clsx({
            [classes.icon]: true,
            [classes.iconSmall]: size === "small",
            [classes.iconMedium]: size === "medium",
          }),
          outlined: clsx({
            [classes.outlined]: true,
            [classes.outlinedSmall]: size === "small",
            [classes.outlinedMedium]: size === "medium",
          }),
        }}
      >
        {children}
      </Select>
      {helperText && (
        <FormHelperText error={error}>
          <Box display="flex" alignItems="center">
            {error && (
              <Box className={classes.selectInfoIcon}>
                <InfoOutlinedIcon fontSize="inherit" />
              </Box>
            )}
            <Box ml={1}>{helperText}</Box>
          </Box>
        </FormHelperText>
      )}
    </Box>
  );
};

export default SimpleSelect;
