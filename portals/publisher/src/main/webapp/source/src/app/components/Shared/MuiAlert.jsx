/**
 * Note: This component was taken from MUI Lab until it's moved to core components and we migrate to 5.x
 * https://github.com/mui-org/material-ui/tree/master/packages/material-ui-lab/src/Alert
 * For component documentation see https://material-ui.com/components/alert
 * `outlinedWaiting` Style added separately
 */
import * as React from 'react';
import { styled, lighten, darken } from '@mui/material/styles';
import clsx from 'clsx';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import { capitalize } from '@mui/material/utils';
import SuccessOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CloseIcon from '@mui/icons-material/Close';

const PREFIX = 'MuiAlert';

const classes = {
    root: `${PREFIX}-root`,
    standardSuccess: `${PREFIX}-standardSuccess`,
    standardInfo: `${PREFIX}-standardInfo`,
    standardWarning: `${PREFIX}-standardWarning`,
    standardError: `${PREFIX}-standardError`,
    outlinedSuccess: `${PREFIX}-outlinedSuccess`,
    outlinedInfo: `${PREFIX}-outlinedInfo`,
    outlinedWarning: `${PREFIX}-outlinedWarning`,
    outlinedError: `${PREFIX}-outlinedError`,
    filledSuccess: `${PREFIX}-filledSuccess`,
    filledInfo: `${PREFIX}-filledInfo`,
    filledWarning: `${PREFIX}-filledWarning`,
    filledError: `${PREFIX}-filledError`,
    icon: `${PREFIX}-icon`,
    message: `${PREFIX}-message`,
    action: `${PREFIX}-action`,
    plainWaiting: `${PREFIX}-plainWaiting`,
    plainSuccess: `${PREFIX}-plainSuccess`,
    plainInfo: `${PREFIX}-plainInfo`,
    plainWarning: `${PREFIX}-plainWarning`,
    plainError: `${PREFIX}-plainError`
};

const StyledPaper = styled(Paper)(({ theme }) => {
    const getColor = theme.palette.mode === 'light' ? darken : lighten;
    const getBackgroundColor = theme.palette.mode === 'light' ? lighten : darken;

    return {
        /* Styles applied to the root element. */
        [`&.${classes.root}`]: {
            ...theme.typography.body2,
            borderRadius: theme.shape.borderRadius,
            backgroundColor: 'transparent',
            display: 'flex',
            padding: '6px 16px',
        },
        /* Styles applied to the root element if `variant="standard"` and `color="success"`. */
        [`&.${classes.standardSuccess}`]: {
            color: getColor(theme.palette.success.main, 0.6),
            backgroundColor: getBackgroundColor(theme.palette.success.main, 0.9),
            '& $icon': {
                color: theme.palette.success.main,
            },
        },
        /* Styles applied to the root element if `variant="standard"` and `color="info"`. */
        [`&.${classes.standardInfo}`]: {
            color: getColor(theme.palette.info.main, 0.6),
            backgroundColor: getBackgroundColor(theme.palette.info.main, 0.9),
            '& $icon': {
                color: theme.palette.info.main,
            },
        },
        /* Styles applied to the root element if `variant="standard"` and `color="warning"`. */
        [`&.${classes.standardWarning}`]: {
            color: getColor(theme.palette.warning.main, 0.6),
            backgroundColor: getBackgroundColor(theme.palette.warning.main, 0.9),
            '& $icon': {
                color: theme.palette.warning.main,
            },
        },
        /* Styles applied to the root element if `variant="standard"` and `color="error"`. */
        [`&.${classes.standardError}`]: {
            color: getColor(theme.palette.error.main, 0.6),
            backgroundColor: getBackgroundColor(theme.palette.error.main, 0.9),
            '& $icon': {
                color: theme.palette.error.main,
            },
        },
        /* Styles applied to the root element if `variant="outlined"` and `color="success"`. */
        [`&.${classes.outlinedSuccess}`]: {
            color: getColor(theme.palette.success.main, 0.6),
            border: `1px solid ${theme.palette.success.main}`,
            '& $icon': {
                color: theme.palette.success.main,
            },
        },
        /* Styles applied to the root element if `variant="outlined"` and `color="info"`. */
        [`&.${classes.outlinedInfo}`]: {
            color: getColor(theme.palette.info.main, 0.6),
            border: `1px solid ${theme.palette.info.main}`,
            '& $icon': {
                color: theme.palette.info.main,
            },
        },
        /* Styles applied to the root element if `variant="outlined"` and `color="warning"`. */
        [`&.${classes.outlinedWarning}`]: {
            color: getColor(theme.palette.warning.main, 0.6),
            border: `1px solid ${theme.palette.warning.main}`,
            '& $icon': {
                color: theme.palette.warning.main,
            },
        },
        /* Styles applied to the root element if `variant="outlined"` and `color="error"`. */
        [`&.${classes.outlinedError}`]: {
            color: getColor(theme.palette.error.main, 0.6),
            border: `1px solid ${theme.palette.error.main}`,
            '& $icon': {
                color: theme.palette.error.main,
            },
        },
        /* Styles applied to the root element if `variant="filled"` and `color="success"`. */
        [`&.${classes.filledSuccess}`]: {
            color: '#fff',
            fontWeight: theme.typography.fontWeightMedium,
            backgroundColor: theme.palette.success.main,
        },
        /* Styles applied to the root element if `variant="filled"` and `color="info"`. */
        [`&.${classes.filledInfo}`]: {
            color: '#fff',
            fontWeight: theme.typography.fontWeightMedium,
            backgroundColor: theme.palette.info.main,
        },
        /* Styles applied to the root element if `variant="filled"` and `color="warning"`. */
        [`&.${classes.filledWarning}`]: {
            color: '#fff',
            fontWeight: theme.typography.fontWeightMedium,
            backgroundColor: theme.palette.warning.main,
        },
        /* Styles applied to the root element if `variant="filled"` and `color="error"`. */
        [`&.${classes.filledError}`]: {
            color: '#fff',
            fontWeight: theme.typography.fontWeightMedium,
            backgroundColor: theme.palette.error.main,
        },
        /* Styles applied to the root element if `variant="plain"` and `color="info"`. */
        [`&.${classes.plainInfo}`]: {
            color: theme.palette.info.main,
            '& $icon': {
                color: theme.palette.info.main,
            },
        },
        /* Styles applied to the root element if `variant="plain"` and `color="warning"`. */
        [`&.${classes.plainWarning}`]: {
            color: theme.palette.warning.main,
            '& $icon': {
                color: theme.palette.warning.main,
            },
        },
        /* Styles applied to the root element if `variant="plain"` and `color="success"`. */
        [`&.${classes.plainSuccess}`]: {
            color: theme.palette.success.main,
            '& $icon': {
                color: theme.palette.success.main,
            },
        },
        /* Styles applied to the root element if `variant="plain"` and `color="error"`. */
        [`&.${classes.plainError}`]: {
            color: theme.palette.error.main,
            '& $icon': {
                color: theme.palette.error.main,
            },
        },
        /* Styles applied to the root element if `variant="plain"` and `color="waiting"`. */
        [`&.${classes.plainWaiting}`]: {
            color: theme.palette.text.secondary,
            '& $icon': {
                color: theme.palette.text.secondary,
            },
        },
        /* Styles applied to the icon wrapper element. */
        [`& .${classes.icon}`]: {
            marginRight: 12,
            padding: '7px 0',
            display: 'flex',
            fontSize: 22,
            opacity: 0.9,
        },
        /* Styles applied to the message wrapper element. */
        [`& .${classes.message}`]: {
            padding: '8px 0',
        },
        /* Styles applied to the action wrapper element if `action` is provided. */
        [`& .${classes.action}`]: {
            display: 'flex',
            alignItems: 'center',
            marginLeft: 'auto',
            paddingLeft: 16,
            marginRight: -8,
        },
    };
});

export {};

const defaultIconMapping = {
    success: <SuccessOutlinedIcon fontSize='inherit' />,
    warning: <ReportProblemOutlinedIcon fontSize='inherit' />,
    error: <ErrorOutlineIcon fontSize='inherit' />,
    info: <InfoOutlinedIcon fontSize='inherit' />,
    waiting: <MoreHorizIcon fontSize='inherit' />,
};

const Alert = React.forwardRef((props, ref) => {
    const {
        action,
        children,
        className,
        closeText = 'Close',
        color,
        icon,
        iconMapping = defaultIconMapping,
        onClose,
        role = 'alert',
        severity = 'success',
        variant = 'standard',
        ...other
    } = props;
    const clsName = `${PREFIX}-${variant}${capitalize(color || severity)}`;
    return (
        <StyledPaper
            role={role}
            square
            elevation={0}
            className={clsx(
                classes.root, 
                clsName,
                className,
            )}
            ref={ref}
            {...other}
        >
            {icon !== false ? (
                <div className={classes.icon}>
                    {icon || iconMapping[severity] || defaultIconMapping[severity]}
                </div>
            ) : null}
            <div className={classes.message}>{children}</div>
            {action != null ? <div className={classes.action}>{action}</div> : null}
            {action == null && onClose ? (
                <div className={classes.action}>
                    <IconButton
                        size='small'
                        aria-label={closeText}
                        title={closeText}
                        color='inherit'
                        onClick={onClose}
                    >
                        <CloseIcon fontSize='small' />
                    </IconButton>
                </div>
            ) : null}
        </StyledPaper>
    );
});
export default (Alert);
