import React from "react";
import { Chip as MUIChip } from "@mui/material";
import clsx from "clsx";
import useStyles from "./Chip.style";

function Chip(props) {
  const {
    label,
    color = "default",
    variant = "contained",
    size = "medium",
    icon,
    testId,
    ...rest
  } = props;

  const classes = useStyles();

  return (
    <MUIChip
      className={clsx(
        classes.root,
        classes[size],
        classes[variant],
        classes[color]
      )}
      size={size}
      color={color}
      variant={variant === "contained" ? "filled" : "outlined"}
      icon={icon}
      label={label}
      data-cyid={`${testId}-chip`}
      {...rest}
    />
  );
}

export default Chip;
