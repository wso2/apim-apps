import React from "react";
import { IconButton as MUIIconButton } from "@mui/material";
import clsx from "clsx";
import useStyles from "./IconButton.styles";

const IconButton = ({
  children,
  color = "primary",
  variant = "contained",
  rounded = false,
  fullWidth = false,
  size = "medium",
  disabled = false,
  testId,
  classes = {},
  active,
  ...rest
}) => {
  const iconButtonClasses = useStyles();
  const isPrimary = color === "primary";
  const isSecondary = color === "secondary";
  const isError = color === "error";
  const isSuccess = color === "success";
  const isWarning = color === "warning";

  const isText = variant === "text";
  const isOutlined = variant === "outlined";
  const isContained = variant === "contained";
  const isSubtle = variant === "subtle";
  const isLink = variant === "link";

  const isSmall = size === "small";
  const isTiny = size === "tiny";

  const isActive = active === "active";
  const isInactive = active === "inactive";

  return (
    <MUIIconButton
      className={clsx(iconButtonClasses.commons, {
        [iconButtonClasses.fullWidth]: fullWidth,
        [iconButtonClasses.disabled]: disabled,
        [iconButtonClasses.outlined]: isOutlined,
        [iconButtonClasses.contained]: isContained,
        [iconButtonClasses.text]: isText,
        [iconButtonClasses.subtle]: isSubtle,
        [iconButtonClasses.link]: isLink,

        [iconButtonClasses.rounded]: rounded,
        [iconButtonClasses.smallRounded]: rounded && isSmall,
        [iconButtonClasses.tinyRounded]: rounded && isTiny,

        [iconButtonClasses.small]: !rounded && isSmall,
        [iconButtonClasses.tiny]: !rounded && isTiny,

        [iconButtonClasses.primaryContained]: isPrimary && isContained,
        [iconButtonClasses.primaryText]: isPrimary && isText,
        [iconButtonClasses.primaryOutlined]: isPrimary && isOutlined,
        [iconButtonClasses.primarySubtle]: isPrimary && isSubtle,
        [iconButtonClasses.primaryLink]: isPrimary && isLink,

        [iconButtonClasses.secondaryContained]: isSecondary && isContained,
        [iconButtonClasses.secondaryText]: isSecondary && isText,
        [iconButtonClasses.secondaryOutlined]: isSecondary && isOutlined,
        [iconButtonClasses.secondarySubtle]: isSecondary && isSubtle,
        [iconButtonClasses.secondaryLink]: isSecondary && isLink,

        [iconButtonClasses.successContained]: isSuccess && isContained,
        [iconButtonClasses.successText]: isSuccess && isText,
        [iconButtonClasses.successOutlined]: isSuccess && isOutlined,
        [iconButtonClasses.successSubtle]: isSuccess && isSubtle,
        [iconButtonClasses.successLink]: isSuccess && isLink,

        [iconButtonClasses.errorContained]: isError && isContained,
        [iconButtonClasses.errorText]: isError && isText,
        [iconButtonClasses.errorOutlined]: isError && isOutlined,
        [iconButtonClasses.errorSubtle]: isError && isSubtle,
        [iconButtonClasses.errorLink]: isError && isLink,

        [iconButtonClasses.warningContained]: isWarning && isContained,
        [iconButtonClasses.warningText]: isWarning && isText,
        [iconButtonClasses.warningOutlined]: isWarning && isOutlined,
        [iconButtonClasses.warningSubtle]: isWarning && isSubtle,
        [iconButtonClasses.warningLink]: isWarning && isLink,

        [iconButtonClasses.active]: isActive,
        [iconButtonClasses.inactive]: isInactive,

        ...classes,
      })}
      disableRipple
      disableTouchRipple
      disableFocusRipple
      centerRipple={false}
      data-cyid={`${testId}-icon-button`}
      {...rest}
    >
      {children}
    </MUIIconButton>
  );
};

export default IconButton;
