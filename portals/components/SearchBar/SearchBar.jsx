import React from "react";
import { Box, InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import useStyles from "./SearchBar.styles";
import SimpleSelect from "../SimpleSelect/SimpleSelect";
import SelectMenuItem from "../SimpleSelect/SelectMenuItem";
import clsx from "clsx";

const SearchBar = ({
  onChange,
  placeholder = "Search…",
  iconPlacement = "left",
  inputValue,
  keyDown,
  bordered = false,
  testId,
  size = "medium",
  color,
  filterValue,
  filterItems = [],
  onFilterChange = () => {},
}) => {
  const classes = useStyles({
    bordered,
    isFilter: filterItems.length > 0,
    size,
    color,
  });

  const handleOnChange = (e) => {
    onChange(e.target.value);
  };

  const getEndAdornment = () => {
    if (filterItems.length > 0) {
      return (
        <Box className={classes.filterWrap}>
          <SimpleSelect
            testId={`${testId}-filter`}
            value={filterValue}
            onChange={(event) => onFilterChange(event.target.value)}
            resetStyles
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {filterItems.map((item) => (
              <SelectMenuItem
                key={item.value}
                testId={`search-bar-filter-${item.value}`}
                value={item.value}
              >
                {item.label}
              </SelectMenuItem>
            ))}
          </SimpleSelect>
        </Box>
      );
    }
    if (iconPlacement === "right") {
      return (
        <Box className={classes.searchIcon}>
          <SearchIcon fontSize="small" />
        </Box>
      );
    }
    return null;
  };

  return (
    <Box data-cyid={`${testId}-search-bar`} className={classes.search}>
      <InputBase
        startAdornment={
          iconPlacement === "left" && (
            <Box className={classes.searchIcon}>
              <SearchIcon fontSize="small" />
            </Box>
          )
        }
        endAdornment={getEndAdornment()}
        placeholder={placeholder}
        className={clsx(classes.inputRoot, {
          [classes.rootSmall]: size === "small",
          [classes.rootMedium]: size === "medium",
          [classes.inputRootSecondary]: color === "secondary",
          [classes.inputRootBordered]: bordered,
          [classes.inputRootFilter]: filterItems.length > 0,
        })}
        onChange={handleOnChange}
        onKeyDown={keyDown}
        value={inputValue}
        data-cyid={`${testId}-search-bar-input`}
      />
    </Box>
  );
};

export default SearchBar;
