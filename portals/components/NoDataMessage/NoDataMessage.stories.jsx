import React from "react";
import { Box, Card, Grid } from "@mui/material";
import NoDataMessage from "./NoDataMessage";

export default {
  title: "Components/NoDataMessage",
  component: NoDataMessage,
};

const Template = (args) => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={4} lg={3} xl={2}>
      <Card>
        <NoDataMessage {...args} testId="story-1" />
      </Card>
    </Grid>
    <Grid item xs={12} md={8} lg={9} xl={10}>
      <Card>
        <Box my={5}>
          <NoDataMessage {...args} testId="story-2" />
        </Box>
      </Card>
    </Grid>
  </Grid>
);

export const Primary = Template.bind({});
