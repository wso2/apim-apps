import React from "react";
import { Button as MUIButton } from "@mui/material";
import clsx from "clsx";
import useButtonStyles from "./Button.styles";

const Button = ({
  children,
  color = "primary",
  variant = "contained",
  pill = false,
  fullWidth = false,
  size = "medium",
  disabled = false,
  testId,
  ...rest
}) => {
  const classes = useButtonStyles();

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

  return (
    <MUIButton
      className={clsx({
        [classes.commons]: true,
        [classes.fullWidth]: fullWidth,
        [classes.disabled]: disabled,
        [classes.outlined]: isOutlined,
        [classes.contained]: isContained,
        [classes.text]: isText,
        [classes.subtle]: isSubtle,
        [classes.link]: isLink,

        [classes.pill]: pill,

        [classes.smallPill]: pill && isSmall,
        [classes.small]: isSmall,
        [classes.smallLink]: isSmall && isLink,

        [classes.tinyPill]: pill && isTiny,
        [classes.tiny]: isTiny,
        [classes.tinyLink]: isTiny && isLink,

        [classes.primaryContained]: isPrimary && isContained,
        [classes.primaryText]: isPrimary && isText,
        [classes.primaryOutlined]: isPrimary && isOutlined,
        [classes.primarySubtle]: isPrimary && isSubtle,
        [classes.primaryLink]: isPrimary && isLink,

        [classes.secondaryContained]: isSecondary && isContained,
        [classes.secondaryText]: isSecondary && isText,
        [classes.secondaryOutlined]: isSecondary && isOutlined,
        [classes.secondarySubtle]: isSecondary && isSubtle,
        [classes.secondaryLink]: isSecondary && isLink,

        [classes.successContained]: isSuccess && isContained,
        [classes.successText]: isSuccess && isText,
        [classes.successOutlined]: isSuccess && isOutlined,
        [classes.successSubtle]: isSuccess && isSubtle,
        [classes.successLink]: isSuccess && isLink,

        [classes.errorContained]: isError && isContained,
        [classes.errorText]: isError && isText,
        [classes.errorOutlined]: isError && isOutlined,
        [classes.errorSubtle]: isError && isSubtle,
        [classes.errorLink]: isError && isLink,

        [classes.warningContained]: isWarning && isContained,
        [classes.warningText]: isWarning && isText,
        [classes.warningOutlined]: isWarning && isOutlined,
        [classes.warningSubtle]: isWarning && isSubtle,
        [classes.warningLink]: isWarning && isLink,
      })}
      disableRipple
      disabled={disabled}
      data-testid={`${testId}-button`}
      {...rest}
    >
      {children}
    </MUIButton>
  );
};

export default Button;
