import React from "react";
import { Box } from "@mui/material";
import Chip from "./Chip";
import BusinessIcon from '@mui/icons-material/Business';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Components/Chip",
  component: Chip,
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const TemplateDefault = (args) => (
  <Box>
    <Chip {...args} label="Color Label" testId="default" />
  </Box>
);

export const Default = TemplateDefault.bind({});

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const TemplateIcon = (args) => (
  <Box>
    <Chip
      icon={<BusinessIcon color="inherit" fontSize="inherit" />}
      {...args}
      label="Color Label"
      testId="icon"
    />
  </Box>
);

export const ChipIcon = TemplateIcon.bind({});
