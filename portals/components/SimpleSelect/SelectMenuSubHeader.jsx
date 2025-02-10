import { ListSubheader } from "@mui/material";
import clsx from "clsx";
import React from "react";
import useStyles from "./SimpleSelect.styles";

const SelectMenuSubHeader = (props) => {
  const { children, className, inset, testId, ...rest } = props;
  const classes = useStyles();
  return (
    <ListSubheader
      data-cyid={`${testId}-select-subheader`}
      inset={inset}
      {...rest}
      className={clsx(className, {
        [classes.selectMenuSubHeader]: true,
        [classes.selectMenuSubHeaderInset]: inset,
      })}
    >
      {children}
    </ListSubheader>
  );
};

export default SelectMenuSubHeader;
