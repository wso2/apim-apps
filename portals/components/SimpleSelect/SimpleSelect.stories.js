import React from "react";
import { Box, Typography } from "@mui/material";
import { StoryFn } from "@storybook/react";
import Card from "../Card/Card";
import CardContent from "../Card/CardContent";
import SimpleSelect from "./SimpleSelect";
import SelectMenuItem from "./SelectMenuItem";
import SelectMenuSubHeader from "./SelectMenuSubHeader";

export default {
  title: "Components/SimpleSelect",
  component: SimpleSelect,
};

const Template = () => {
  const [age, setAge] = React.useState("20");

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  return (
    <Card data-testid="simple-select">
      <CardContent>
        <Box>
          <Typography variant="h6" gutterBottom>
            Size - Medium
          </Typography>
          <Box mb={3}>
            <SimpleSelect
              testId="simple-select-story"
              value={age}
              onChange={handleChange}
            >
              <SelectMenuItem testId="story-medium-ten" value={10}>
                Ten thousand only
              </SelectMenuItem>
              <SelectMenuItem testId="story-medium-twenty" value={20}>
                Twenty five thousand only
              </SelectMenuItem>
              <SelectMenuItem testId="story-medium-thirty" value={30}>
                Thirty thousand only
              </SelectMenuItem>
            </SimpleSelect>
          </Box>
          <Typography variant="h6" gutterBottom>
            Size - Small
          </Typography>
          <Box mb={3}>
            <SimpleSelect
              testId="simple-select-story"
              value={age}
              onChange={handleChange}
              size="small"
            >
              <SelectMenuItem testId="story-medium-ten" value={10}>
                Ten thousand only
              </SelectMenuItem>
              <SelectMenuItem testId="story-medium-twenty" value={20}>
                Twenty five thousand only
              </SelectMenuItem>
              <SelectMenuItem testId="story-medium-thirty" value={30}>
                Thirty thousand only
              </SelectMenuItem>
            </SimpleSelect>
          </Box>
          <Typography variant="h6" gutterBottom>
            Grouping
          </Typography>
          <Box mb={3}>
            <SimpleSelect
              testId="simple-select-story"
              value={age}
              onChange={handleChange}
            >
              <SelectMenuItem testId="story-medium-ten" value={10}>
                Ten thousand only
              </SelectMenuItem>
              <SelectMenuSubHeader testId="story-sub-header">
                Category 1
              </SelectMenuSubHeader>
              <SelectMenuItem testId="story-medium-twenty" value={20}>
                Twenty five thousand only
              </SelectMenuItem>
              <SelectMenuItem testId="story-medium-thirty" value={30}>
                Thirty thousand only
              </SelectMenuItem>
            </SimpleSelect>
          </Box>
          <Box>
            <Typography variant="h6" gutterBottom>
              Others
            </Typography>
          </Box>
          <Box mb={3} maxWidth={230}>
            <SimpleSelect
              testId="simple-select-story"
              value={age}
              onChange={handleChange}
            >
              <SelectMenuItem
                testId="story-max-ten"
                value={10}
                description="This is the first item description"
              >
                Ten thousand only
              </SelectMenuItem>
              <SelectMenuItem testId="story-max-twenty" value={20}>
                Twenty five thousand only
              </SelectMenuItem>
              <SelectMenuItem testId="story-max-thirty" value={30}>
                Thirty thousand only
              </SelectMenuItem>
            </SimpleSelect>
          </Box>
          <Box mb={3}>
            <SimpleSelect
              testId="simple-select-story"
              value={age}
              error
              onChange={handleChange}
              helperText="This is an error"
            >
              <SelectMenuItem testId="story-medium-ten" value={10}>
                Ten thousand only
              </SelectMenuItem>
              <SelectMenuItem testId="story-medium-twenty" value={20}>
                Twenty five thousand only
              </SelectMenuItem>
              <SelectMenuItem testId="story-medium-thirty" value={30}>
                Thirty thousand only
              </SelectMenuItem>
            </SimpleSelect>
          </Box>
          <Typography variant="h6" gutterBottom>
            Loading State
          </Typography>
          <Box mb={3}>
            <SimpleSelect
              testId="simple-select-story"
              value={null}
              onChange={handleChange}
              isLoading
            >
              <SelectMenuItem testId="story-medium-ten" value={10}>
                Ten thousand only
              </SelectMenuItem>
            </SimpleSelect>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const Default = Template.bind({});
