import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter as Router } from "react-router-dom";
import useCreateAPIMTheme from "../theme/Theme";
import { IntlProvider } from "react-intl";
import React, { useRef } from "react";
import { Box } from "@mui/material";

export const parameters = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [
  (Story) => {
    const theme = useCreateAPIMTheme(false);
    return (
      <ThemeProvider theme={theme}>
        <IntlProvider locale="en" messages={{}}>
            <Router>
              <Story />
            </Router>
        </IntlProvider>
      </ThemeProvider>
    );
  },
];

const StorybookViewContainer = (props) => {
  const rightDrawerRef = useRef();
  const { children } = props;
  return (
    <div
      ref={rightDrawerRef}
      style={{ flexGrow: 1, overflow: "auto", padding: "16px" }}
    >
      <Box flexGrow={1} overflow="auto" p={1}>
        {children}
      </Box>
    </div>
  );
};
