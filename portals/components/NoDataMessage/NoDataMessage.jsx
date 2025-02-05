import React from "react";
import { Box, Typography } from "@mui/material";
import { FormattedMessage } from "react-intl";
import clsx from "clsx";
import NoDataIcon from "../Images/NoData/Nodata.svg";
import useStyles from "./NoDataMessage.styles";

export default function NoDataMessage({ message, testId, size = "md" }) {
  const classes = useStyles();

  return (
    <Box
      className={clsx({
        [classes.noDataContainer]: true,
        [classes.noDataContainerSm]: size === "sm",
        [classes.noDataContainerMd]: size === "md",
        [classes.noDataContainerLg]: size === "lg",
      })}
      data-cyid={`${testId}-no-data-message`}
    >
      <Box
        className={clsx({
          [classes.noDataIconWrap]: true,
          [classes.noDataIconWrapSm]: size === "sm",
          [classes.noDataIconWrapMd]: size === "md",
          [classes.noDataIconWrapLg]: size === "lg",
        })}
      >
        <Box>
          <img src={NoDataIcon} alt="No Data" />
        </Box>
      </Box>
      <Box
        className={clsx({
          [classes.noDataMessageWrap]: true,
          [classes.noDataMessageWrapSm]: size === "sm",
          [classes.noDataMessageWrapMd]: size === "md",
          [classes.noDataMessageWrapLg]: size === "lg",
        })}
      >
        <Typography className={classes.noDataMessage}>
          {message || (
            <FormattedMessage
              id="modules.cioDashboard.NoDataMessage.label"
              defaultMessage="No data available"
            />
          )}
        </Typography>
      </Box>
    </Box>
  );
}
