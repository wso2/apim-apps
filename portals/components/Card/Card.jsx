import { Card as MUICard } from "@mui/material";
import clsx from "clsx";
import useStyles from "./Card.styles";
import React from "react";

function Card({
  children,
  borderRadius = "sm",
  boxShadow = "light",
  disabled = false,
  className,
  variant = "elevation",
  testId,
  fullHeight = false,
  bgColor = "default",
  ...rest
}) {
  const classes = useStyles();

  return (
    <MUICard
      {...rest}
      data-cyid={`${testId}-card`}
      variant={variant}
      className={clsx(className, {
        [classes.cardRoot]: true,
        [classes.xsBorderRadius]: borderRadius === "xs",
        [classes.smBorderRadius]: borderRadius === "sm",
        [classes.mdBorderRadius]: borderRadius === "md",
        [classes.lgBorderRadius]: borderRadius === "lg",
        [classes.square]: borderRadius === "square",
        [classes.boxShadowNone]: boxShadow === "none",
        [classes.boxShadowLight]:
          boxShadow === "light" && variant !== "outlined",
        [classes.boxShadowDark]: boxShadow === "dark" && variant !== "outlined",
        [classes.disabled]: disabled,
        [classes.fullHeight]: fullHeight,
        [classes.colorDefault]: bgColor === "default",
        [classes.colorSecondary]: bgColor === "secondary",
      })}
    >
      {children}
    </MUICard>
  );
}

export default Card;
