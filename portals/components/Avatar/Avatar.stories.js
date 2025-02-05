import { Box, Typography } from '@mui/material';
import React from 'react';
import Avatar from './Avatar';
import Card from '../Card/Card';
import CardContent from '../Card/CardContent';
import VolumeDownOutlinedIcon from '@mui/icons-material/VolumeDownOutlined';

export default {
  title: 'Components/Avatar',
  component: Avatar,
};

const TemplateLetters = () => (
  <Card testId="avatar-story">
    <CardContent>
      <Box mb={3}>
        <Typography variant="h6">Small</Typography>
        <Avatar size="small" testId="small">H</Avatar>
      </Box>
      <Box mb={3}>
        <Typography variant="h6">Medium</Typography>
        <Avatar size="medium" testId="medium">H</Avatar>
      </Box>
    </CardContent>
  </Card>
);

export const AvatarLetters = TemplateLetters;

const TemplateImages = () => (
  <Card testId="avatar-story">
    <CardContent>
      <Box mb={3}>
        <Typography variant="h6">Small</Typography>
        <Avatar
          size="small"
          testId="small"
          alt="Remy Sharp"
          src="./images/storybook-assets/user-avatar.jpg"
          color="default"
        />
      </Box>
      <Box mb={3}>
        <Typography variant="h6">Medium</Typography>
        <Avatar
          size="medium"
          testId="medium"
          alt="Remy Sharp"
          src="./images/storybook-assets/user-avatar.jpg"
          color="default"
        />
      </Box>
    </CardContent>
  </Card>
);

export const AvatarImages = TemplateImages;

const TemplateIcons = () => (
  <Card testId="avatar-story">
    <CardContent>
      <Box mb={3}>
        <Typography variant="h6">Small</Typography>
        <Avatar size="small" testId="small" color="secondary">
          <VolumeDownOutlinedIcon />
        </Avatar>
      </Box>
      <Box mb={3}>
        <Typography variant="h6">Medium</Typography>
        <Avatar size="medium" testId="medium" color="secondary">
          <VolumeDownOutlinedIcon />
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

export const AvatarIcons = TemplateIcons;

const TemplateColorVariant = () => (
  <Card testId="avatar-story">
    <CardContent>
      <Box display="flex" gap={4}>
        <Box>
          {['primary', 'secondary', 'default', 'success', 'warning', 'error'].map((color) => (
            <Box mb={3} key={color}>
              <Typography variant="h6">{color.charAt(0).toUpperCase() + color.slice(1)}</Typography>
              <Avatar size="medium" testId="medium" color={color}>
                <VolumeDownOutlinedIcon />
              </Avatar>
            </Box>
          ))}
        </Box>
        <Box>
          {['primary', 'secondary', 'default', 'success', 'warning', 'error'].map((color) => (
            <Box mb={3} key={color}>
              <Typography variant="h6">{color.charAt(0).toUpperCase() + color.slice(1)}</Typography>
              <Avatar size="medium" testId="medium" color={color}>C</Avatar>
            </Box>
          ))}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const AvatarColorVariant = TemplateColorVariant;
