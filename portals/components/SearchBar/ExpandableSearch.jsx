import React, { useRef, useState } from "react";
import { Box, InputBase, IconButton } from "@mui/material";
import { Close as CloseIcon, Search as SearchIcon } from "@mui/icons-material";
import clsx from "clsx";
import useStyles from "./SearchBar.styles";

const AutofocusField = ({
  onChange,
  searchQuery,
  inputReference,
  onBlur,
  onClearClick,
  size = "medium",
  placeholder,
  testId,
}) => {
  const classes = useStyles();

  return (
    <Box data-cyid={`${testId}-auto-focus`} className={classes.search}>
      <InputBase
        inputRef={inputReference}
        value={searchQuery}
        endAdornment={
          <IconButton
            onMouseDown={(e) => {
              onClearClick();
              e.preventDefault();
            }}
            color="secondary"
            size="small"
            data-testid="search-icon"
            testId={testId}
            variant="contained"
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        placeholder={placeholder}
        className={clsx(classes.inputRootExpandable, {
          [classes.inputExpandable]: true,
          [classes.inputSmall]: size === "small",
          [classes.inputMedium]: size === "medium",
        })}
        inputProps={{ "aria-label": "search" }}
        onChange={onChange}
        onBlur={onBlur}
        aria-label="text-field"
        data-testid="search-field"
        data-cyid={`${testId}-search-field`}
      />
    </Box>
  );
};

const ExpandableSearch = ({
  searchString,
  setSearchString,
  direction = "left",
  placeholder,
  testId,
  size = "medium",
}) => {
  const classes = useStyles();
  const inputReference = useRef(null);
  const [isSearchShow, setSearchShow] = useState(false);

  const handleSearchFieldChange = (e) => {
    setSearchString(e.target.value);
  };

  const handleSearchFieldBlur = (e) => {
    if (e.target.value === "") {
      setSearchShow(false);
    }
  };

  const onClearClick = () => {
    if (searchString === "") {
      setSearchShow(false);
    } else {
      setSearchString("");
    }
    inputReference?.current?.focus();
  };

  const onSearchClick = () => {
    setSearchShow(true);
    inputReference?.current?.focus();
  };

  return (
    <Box
      data-cyid={`${testId}-expandable-search`}
      className={clsx(classes.expandableSearchCont, {
        [classes.expandableSearchContOpen]: isSearchShow,
        [classes.expandableSearchContRight]: direction === "right",
        [classes.rootSmall]: size === "small",
        [classes.rootMedium]: size === "medium",
      })}
    >
      <IconButton
        onClick={onSearchClick}
        size="small"
        data-testid="search-icon"
        testId="search-icon"
        color="secondary"
        variant="contained"
        disabled={isSearchShow}
      >
        <SearchIcon fontSize="inherit" />
      </IconButton>
      <Box
        className={clsx(classes.expandableSearchWrap, {
          [classes.expandableSearchWrapShow]: isSearchShow,
        })}
      >
        <AutofocusField
          inputReference={inputReference}
          size={size}
          onChange={handleSearchFieldChange}
          searchQuery={searchString}
          onBlur={handleSearchFieldBlur}
          onClearClick={onClearClick}
          placeholder={placeholder}
          testId={`${testId}-auto-forcused-search`}
        />
      </Box>
    </Box>
  );
};

export default ExpandableSearch;
