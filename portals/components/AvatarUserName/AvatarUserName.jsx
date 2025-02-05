import React from "react";
import { Box, Typography } from "@mui/material";
import TruncateText from "../TruncateText/TruncateText";
import useStyle from "./style";
import Avatar from "../Avatar/Avatar";

const AvatarUserName = ({
  userName,
  size = "large",
  color = "secondary",
  backgroundColor = "default",
  hideName = false,
}) => {
  const classes = useStyle();

  return (
    <Box className={classes.avatarUserName}>
      <Avatar
        color={color}
        backgroundColor={backgroundColor}
        size={size}
        testId="user-name"
      >
        {userName.toUpperCase().slice(0, 1)}
      </Avatar>
      {!hideName && (
        <TruncateText>
          <Typography variant="body1">{userName}</Typography>
        </TruncateText>
      )}
    </Box>
  );
};

export default AvatarUserName;
