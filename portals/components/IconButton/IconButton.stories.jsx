import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import IconButton from "./IconButton";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

export default {
  title: "Components/IconButton",
  component: IconButton,
};

const testId = "story";

const Template = (args) => (
  <Card data-testid="icon-button">
    <CardContent>
      <Box mb={3}>
        <Box mb={1}>
          <Typography>Contained</Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <IconButton {...args} testId={`${testId}-default`}>
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton {...args} rounded testId={`${testId}-rounded`}>
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton {...args} disabled testId={`${testId}-disabled`}>
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton {...args} size="small" testId={`${testId}-small`}>
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            rounded
            size="small"
            testId={`${testId}-rounded-small`}
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            size="small"
            disabled
            testId={`${testId}-small-disabled`}
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton {...args} size="tiny" testId={`${testId}-tiny`}>
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            rounded
            size="tiny"
            testId={`${testId}-rounded-tiny`}
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            size="tiny"
            disabled
            testId={`${testId}-tiny-disabled`}
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box mb={1} mt={2}>
          <Typography>Outlined</Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <IconButton {...args} testId={`${testId}-default`} variant="outlined">
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            rounded
            testId={`${testId}-rounded`}
            variant="outlined"
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            disabled
            testId={`${testId}-disabled`}
            variant="outlined"
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            size="small"
            testId={`${testId}-small`}
            variant="outlined"
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            rounded
            size="small"
            testId={`${testId}-rounded-small`}
            variant="outlined"
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            size="small"
            disabled
            testId={`${testId}-small-disabled`}
            variant="outlined"
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            size="tiny"
            testId={`${testId}-tiny`}
            variant="outlined"
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            rounded
            size="tiny"
            testId={`${testId}-rounded-tiny`}
            variant="outlined"
          >
            <AddOutlinedIcon fontSize="small" color="primary" />
          </IconButton>
          <IconButton
            {...args}
            size="tiny"
            disabled
            testId={`${testId}-tiny-disabled`}
            variant="outlined"
          >
            <AddOutlinedIcon fontSize="small" color="primary" />
          </IconButton>
        </Box>
        <Box mb={1} mt={2}>
          <Typography>Subtle</Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <IconButton {...args} testId={`${testId}-default`} variant="subtle">
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            rounded
            testId={`${testId}-rounded`}
            variant="subtle"
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            disabled
            testId={`${testId}-disabled`}
            variant="subtle"
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            size="small"
            testId={`${testId}-small`}
            variant="subtle"
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            rounded
            size="small"
            testId={`${testId}-rounded-small`}
            variant="subtle"
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            size="small"
            disabled
            testId={`${testId}-small-disabled`}
            variant="subtle"
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            size="tiny"
            testId={`${testId}-tiny`}
            variant="subtle"
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            rounded
            size="tiny"
            testId={`${testId}-rounded-tiny`}
            variant="subtle"
          >
            <AddOutlinedIcon fontSize="small" color="primary" />
          </IconButton>
          <IconButton
            {...args}
            size="tiny"
            disabled
            testId={`${testId}-tiny-disabled`}
            variant="Subtle"
          >
            <AddOutlinedIcon fontSize="small" color="primary" />
          </IconButton>
        </Box>
        <Box mb={1} mt={2}>
          <Typography>Text</Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <IconButton {...args} testId={`${testId}-default`} variant="text">
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            rounded
            testId={`${testId}-rounded`}
            variant="text"
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            disabled
            testId={`${testId}-disabled`}
            variant="text"
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            size="small"
            testId={`${testId}-small`}
            variant="text"
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            rounded
            size="small"
            testId={`${testId}-rounded-small`}
            variant="text"
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            size="small"
            disabled
            testId={`${testId}-small-disabled`}
            variant="text"
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            size="tiny"
            testId={`${testId}-tiny`}
            variant="text"
          >
            <AddOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            {...args}
            rounded
            size="tiny"
            testId={`${testId}-rounded-tiny`}
            variant="text"
          >
            <AddOutlinedIcon fontSize="small" color="primary" />
          </IconButton>
          <IconButton
            {...args}
            size="tiny"
            disabled
            testId={`${testId}-tiny-disabled`}
            variant="text"
          >
            <AddOutlinedIcon fontSize="small" color="primary" />
          </IconButton>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const Primary = Template.bind({});

export const ButtonSizes = (args) => {
  return (
    <Card testId="button">
      <CardContent>
        <Box display="flex" flexDirection="column">
          <Box mb={1}>
            <Typography variant="h4">Button Colors</Typography>
          </Box>
          <Box display="flex" flexDirection="column">
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h6">Primary:</Typography>
                <IconButton {...args} testId={`${testId}-default`} color="primary" >
                  <AddOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h6">Secondary:</Typography>
                <IconButton {...args} testId={`${testId}-default`} color="secondary" >
                  <AddOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h6">Error:</Typography>
                <IconButton {...args} testId={`${testId}-default`} color="error" >
                  <AddOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h6">Success:</Typography>
                <IconButton {...args} testId={`${testId}-default`} color="success" >
                  <AddOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h6">Warning:</Typography>
                <IconButton {...args} testId={`${testId}-default`} color="warning" >
                  <AddOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
