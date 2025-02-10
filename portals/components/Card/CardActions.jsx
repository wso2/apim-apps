import { CardActions as MUICardActions } from "@mui/material";
import { styled } from "@mui/system";

const StyledCardAction = styled(MUICardActions)(({ theme }) => ({
  padding: theme.spacing(1),
}));

function CardActions({ children, testId, ...rest }) {
  return (
    <StyledCardAction data-cyid={`${testId}-card-actions`} {...rest}>
      {children}
    </StyledCardAction>
  );
}

export default CardActions;
