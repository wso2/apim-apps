import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useStyles from "./Card.styles";

function CardHeading({ title, onClose, testId }) {
  const classes = useStyles();

  return (
    <Box
      className={classes.cardHeading}
      data-cyid={`${testId}-card-heading`}
      display="flex"
      alignItems="center"
    >
      <Box flexGrow={1}>
        <Typography variant="h6">{title}</Typography>
      </Box>
      <IconButton color="secondary" onClick={onClose} data-testid="btn-close">
        <CloseIcon />
      </IconButton>
    </Box>
  );
}

export default CardHeading;
