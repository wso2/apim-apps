import React from "react";
import { CardContent as MUICardContent } from "@mui/material";
import { styled } from "@mui/system";
import clsx from "clsx";

const StyledCardContent = styled(MUICardContent)(
  ({ theme, paddingSize, fullHeight }) => ({
    padding: paddingSize === "lg" ? theme.spacing(3) : theme.spacing(2),
    "&:last-child": {
      paddingBottom: paddingSize === "lg" ? theme.spacing(3) : theme.spacing(2),
    },
    ...(fullHeight && { height: "100%" }),
  })
);

function CardContent({ children, paddingSize = "lg", fullHeight, ...rest }) {
  return (
    <StyledCardContent
      paddingSize={paddingSize}
      fullHeight={fullHeight}
      {...rest}
    >
      {children}
    </StyledCardContent>
  );
}

export default CardContent;
