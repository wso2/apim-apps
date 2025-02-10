import React from "react";
import clsx from "clsx";
import useStyle from "./style";

const TruncateText = ({ children, width = "100%", className }) => {
  const classes = useStyle({ width });

  return (
    <span className={clsx(classes.textTruncate, className)}>{children}</span>
  );
};

export default TruncateText;
