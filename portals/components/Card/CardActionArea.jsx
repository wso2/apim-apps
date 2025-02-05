import { CardActionArea as MUICardActionArea } from "@mui/material";
import clsx from "clsx";
import useStyles from "./Card.styles";
import React from "react";

function CardActionArea({
  children,
  variant = "elevation",
  className,
  fullHeight = false,
  testId,
  ...rest
}) {
  const classes = useStyles();

  return (
    <MUICardActionArea
      focusRipple
      disableRipple
      disableTouchRipple
      {...rest}
      className={clsx(className, {
        [classes.cardActionAreaRoot]: true,
        [classes.cardActionAreaOutlined]: variant === "outlined",
        [classes.cardActionAreaElevation]: variant === "elevation",
        [classes.cardActionAreaFullHeight]: fullHeight,
      })}
      data-cyid={`${testId}-card-action-area`}
    >
      {children}
    </MUICardActionArea>
  );
}

export default CardActionArea;
