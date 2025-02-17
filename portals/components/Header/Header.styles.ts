import { styled } from "@mui/system";
import { AppBar, InputBase } from "@mui/material";

export const StyledAppBar = styled(AppBar)<{ bgcolor?: string }>(
  ({ theme, bgcolor }) => ({
    backgroundColor: bgcolor || theme.palette.primary.main,
  })
);

export const SearchBar = styled(InputBase)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5, 2),
  marginLeft: theme.spacing(2),
  flex: 1,
}));
