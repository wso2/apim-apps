import { useMemo } from "react";
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes, createTheme } from '@mui/material/styles';
import systemTheme from "./systemTheme";

export default function useChoreoTheme(userPreference: null | boolean = null) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const isDarkMode = userPreference !== null ? userPreference : prefersDarkMode;

  // We need to remove the darkPalette property from the theme since the default MUI theme does not have that
  const themeWithType = systemTheme;
  if (isDarkMode && themeWithType.darkPalette) {
    themeWithType.palette = themeWithType.darkPalette;
  }
  if (themeWithType.darkPalette) {
    delete themeWithType.darkPalette;
  }
  const theme = useMemo(
    () => responsiveFontSizes(createTheme(themeWithType)),
    [prefersDarkMode]
  );

  return theme;
}
