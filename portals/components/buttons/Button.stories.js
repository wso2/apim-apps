import React from "react";
import Button from "./Button";
import { Box, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import Card from "../Card/Card";
import CardContent from "../Card/CardContent";

export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    color: {
      control: "select",
      options: ["primary", "secondary", "error", "success", "warning"],
    },
    variant: {
      control: "select",
      options: ["contained", "outlined", "text", "subtle", "link"],
    },
    size: {
      control: "select",
      options: ["medium", "small", "tiny"],
    },
    pill: { control: "boolean" },
    fullWidth: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

const Template = (args) => <Button {...args}>{args.children}</Button>;

export const primary = (args) => (
  <Card testId="button">
    <CardContent>
      <Box display="flex" flexDirection="column">
        <Box mb={1}>
          <Typography variant="h4">Contained</Typography>
        </Box>
        <Box display="flex" gridColumnGap="1rem" alignItems="center" gap={2}>
          <Button {...args}>Button</Button>
          <Button {...args} startIcon={<AddIcon fontSize="small" />}>
            Button
          </Button>
          <Button {...args} endIcon={<AddIcon fontSize="small" />}>
            Button
          </Button>
          <Button {...args} component={RouterLink} to="/">
            Link
          </Button>
          <Button {...args} pill>
            Button
          </Button>
          <Button {...args} disabled>
            Button
          </Button>
          <Button {...args} size="small">
            Button
          </Button>
          <Button {...args} pill size="small">
            Button
          </Button>
          <Button {...args} disabled size="small">
            Button
          </Button>
          <Button {...args} size="tiny">
            Button
          </Button>
          <Button {...args} pill size="tiny">
            Button
          </Button>
          <Button {...args} disabled size="tiny">
            Button
          </Button>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Box mb={1}>
            <Typography variant="h4">Subtle</Typography>
          </Box>
          <Box display="flex" gridColumnGap="1rem" alignItems="center" gap={2}>
            <Button {...args} variant="subtle">
              Button
            </Button>
            <Button
              {...args}
              variant="subtle"
              startIcon={<AddIcon fontSize="small" />}
            >
              Button
            </Button>
            <Button
              {...args}
              endIcon={<AddIcon fontSize="small" />}
              variant="subtle"
            >
              Button
            </Button>
            <Button {...args} variant="subtle" component={RouterLink} to="/">
              Link
            </Button>
            <Button {...args} variant="subtle" pill>
              Button
            </Button>
            <Button {...args} variant="subtle" disabled>
              Button
            </Button>
            <Button {...args} variant="subtle" size="small">
              Button
            </Button>
            <Button {...args} variant="subtle" pill size="small">
              Button
            </Button>
            <Button {...args} variant="subtle" disabled size="small">
              Button
            </Button>
            <Button {...args} variant="subtle" size="tiny">
              Button
            </Button>
            <Button {...args} variant="subtle" pill size="tiny">
              Button
            </Button>
            <Button {...args} variant="subtle" disabled size="tiny">
              Button
            </Button>
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Box mb={1}>
            <Typography variant="h4">Outlined</Typography>
          </Box>
          <Box display="flex" gridColumnGap="1rem" alignItems="center" gap={2}>
            <Button {...args} variant="outlined">
              Button
            </Button>
            <Button
              {...args}
              variant="outlined"
              startIcon={<AddIcon fontSize="small" />}
            >
              Button
            </Button>
            <Button
              {...args}
              endIcon={<AddIcon fontSize="small" />}
              variant="outlined"
            >
              Button
            </Button>
            <Button {...args} variant="outlined" component={RouterLink} to="/">
              Link
            </Button>
            <Button {...args} variant="outlined" pill>
              Button
            </Button>
            <Button {...args} variant="outlined" disabled>
              Button
            </Button>
            <Button {...args} variant="outlined" size="small">
              Button
            </Button>
            <Button {...args} variant="outlined" pill size="small">
              Button
            </Button>
            <Button {...args} variant="outlined" disabled size="small">
              Button
            </Button>
            <Button {...args} variant="outlined" size="tiny">
              Button
            </Button>
            <Button {...args} variant="outlined" pill size="tiny">
              Button
            </Button>
            <Button {...args} variant="outlined" disabled size="tiny">
              Button
            </Button>
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <Box mb={1}>
            <Typography variant="h4">Text</Typography>
          </Box>
          <Box display="flex" gridColumnGap="1rem" alignItems="center" gap={2}>
            <Button {...args} variant="text">
              Button
            </Button>
            <Button
              {...args}
              variant="text"
              startIcon={<AddIcon fontSize="small" />}
            >
              Button
            </Button>
            <Button
              {...args}
              endIcon={<AddIcon fontSize="small" />}
              variant="text"
            >
              Button
            </Button>
            <Button {...args} variant="text" component={RouterLink} to="/">
              Link
            </Button>
            <Button {...args} variant="text" pill>
              Button
            </Button>
            <Button {...args} variant="text" disabled>
              Button
            </Button>
            <Button {...args} variant="text" size="small">
              Button
            </Button>
            <Button {...args} variant="text" pill size="small">
              Button
            </Button>
            <Button {...args} variant="text" disabled size="small">
              Button
            </Button>
            <Button {...args} variant="text" size="tiny">
              Button
            </Button>
            <Button {...args} variant="text" pill size="tiny">
              Button
            </Button>
            <Button {...args} variant="text" disabled size="tiny">
              Button
            </Button>
          </Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);
export const ButtonSizes = (args) => (
  <Card testId="button">
    <CardContent>
      <Box display="flex" flexDirection="column">
        <Box mb={1}>
          <Typography variant="h4">Button Sizes</Typography>
        </Box>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" flexDirection="column">
            <Typography variant="h6">Medium:</Typography>
            <Box display="flex" gap={2}>
              <Button {...args} size="medium">
                Button
              </Button>
              <Button
                {...args}
                size="medium"
                startIcon={<AddIcon fontSize="small" />}
              >
                Button
              </Button>
              <Button
                {...args}
                size="medium"
                endIcon={<AddIcon fontSize="small" />}
              >
                Button
              </Button>
              <Button {...args} size="medium" pill>
                Button
              </Button>
              <Button {...args} size="medium" disabled>
                Button
              </Button>
            </Box>
          </Box>
          <Box display="flex" flexDirection="column">
            <Typography variant="h6">Small:</Typography>
            <Box display="flex" gap={2}>
              <Button {...args} size="small">
                Button
              </Button>
              <Button
                {...args}
                size="small"
                startIcon={<AddIcon fontSize="small" />}
              >
                Button
              </Button>
              <Button
                {...args}
                size="small"
                endIcon={<AddIcon fontSize="small" />}
              >
                Button
              </Button>
              <Button {...args} size="small" pill>
                Button
              </Button>
              <Button {...args} size="small" disabled>
                Button
              </Button>
            </Box>
          </Box>
          <Box display="flex" flexDirection="column">
            <Typography variant="h6">Tiny:</Typography>
            <Box display="flex" gap={2}>
              <Button {...args} size="tiny">
                Button
              </Button>
              <Button
                {...args}
                size="tiny"
                startIcon={<AddIcon fontSize="small" />}
              >
                Button
              </Button>
              <Button
                {...args}
                size="tiny"
                endIcon={<AddIcon fontSize="small" />}
              >
                Button
              </Button>
              <Button {...args} size="tiny" pill>
                Button
              </Button>
              <Button {...args} size="tiny" disabled>
                Button
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const ButtonColors = (args) => (
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
              <Button {...args} color="primary">
                Button
              </Button>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h6">Secondary:</Typography>
              <Button {...args} color="secondary">
                Button
              </Button>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h6">Error:</Typography>
              <Button {...args} color="error">
                Button
              </Button>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h6">Success:</Typography>
              <Button {...args} color="success">
                Button
              </Button>
            </Box>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="h6">Warning:</Typography>
              <Button {...args} color="warning">
                Button
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

