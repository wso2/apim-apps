import React from "react";
import { Box, Card, CardContent } from "@mui/material";
import AvatarUserName from "./AvatarUserName";

export default {
  title: "Components/AvatarUserName",
  component: AvatarUserName,
};

const TemplateLetters = () => (
  <Card data-testid="avatar-story">
    <CardContent>
      <Box mb={3}>
        <AvatarUserName userName="John Doe" />
      </Box>
    </CardContent>
  </Card>
);

export const AvatarLetters = TemplateLetters.bind({});
