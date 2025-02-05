import { ThemeOptions } from "@mui/material/styles";
import systemThemeJson from "./theme.json";

declare module "@mui/material/styles" {
  interface Theme {
    custom: any;
    darkPalette: any;
  }
  interface ThemeOptions {
    custom?: any;
    darkPalette?: any;
  }
}

const systemTheme: ThemeOptions = systemThemeJson as ThemeOptions;

export default systemTheme;
