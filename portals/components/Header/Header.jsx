import React from "react";
import PropTypes from "prop-types";
import { AppBar, Toolbar, Typography, InputBase, Box } from "@mui/material";
import { styled } from "@mui/system";

const StyledAppBar = styled(AppBar)(({ theme, bgcolor }) => ({
  backgroundColor: bgcolor || theme.palette.primary.main,
}));

const SearchBar = styled(InputBase)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5, 2),
  marginLeft: theme.spacing(2),
  flex: 1,
}));

const Header = ({ image, bgcolor, searchPlaceholder, children }) => {
  return (
    <StyledAppBar position="static" bgcolor={bgcolor}>
      <Toolbar>
        {image && (
          <img
            src={image}
            alt="Header Logo"
            style={{ height: 40, marginRight: 16 }}
          />
        )}
        <Box display="flex" alignItems="center" flexGrow={1}>
          {children}
        </Box>
        <SearchBar
          placeholder={searchPlaceholder || "Search..."}
          inputProps={{ "aria-label": "search" }}
        />
      </Toolbar>
    </StyledAppBar>
  );
};

Header.propTypes = {
  image: PropTypes.string,
  bgcolor: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  children: PropTypes.node,
};

export default Header;
