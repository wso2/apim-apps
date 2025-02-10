import { Avatar as MUIAvatar } from "@mui/material";
import clsx from "clsx";
import useStyle from "./Avatar.style";
import React from 'react';

export const AvatarColor = {
  DEFAULT: "default",
  PRIMARY: "primary",
  SECONDARY: "secondary",
  ERROR: "error",
  SUCCESS: "success",
  WARNING: "warning",
  WHITE: "white",
};

export const AvatarBackgroundColor = {
  WHITE: "white",
  DEFAULT: "default",
  PRIMARY: "primary",
  SECONDARY: "secondary",
  SECONDARY_DARK: "secondaryDark",
};

export const AvatarSize = {
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
};

function Avatar(props) {
  const {
    testId,
    size = "medium",
    color = "primary",
    backgroundColor = "default",
    children,
    ...rest
  } = props;
  const classes = useStyle();
  return (
    <MUIAvatar
      {...rest}
      data-cyid={`${testId}-avatar`}
      className={clsx(
        classes.avatarRoot,
        classes[size],
        classes[color],
        classes[backgroundColor]
      )}
    >
      {children}
    </MUIAvatar>
  );
}

export default Avatar;
