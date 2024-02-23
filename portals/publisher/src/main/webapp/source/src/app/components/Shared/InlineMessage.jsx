import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Paper from '@mui/material/Paper';
import Icon from '@mui/material/Icon';
import { amber } from '@mui/material/colors';
import VerticalDivider from './VerticalDivider';

const PREFIX = 'InlineMessage';

const classes = {
    root: `${PREFIX}-root`,
    button: `${PREFIX}-button`,
    content: `${PREFIX}-content`,
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing(2),
        borderRadius: theme.shape.borderRadius,
        border: 'solid 1px ' + theme.palette.primary.main,
        position: 'relative',
        padding: theme.spacing(2),
        [`& span.material-icons.info`]: {
            fontSize: '80px',
            color: theme.palette.primary.dark,
        },
        [`& span.material-icons.warning`]: {
            fontSize: '80px',
            color: amber[700],
        },
    },
}));

/**
 *
 *
 * @class InlineMessage
 * @extends {React.Component}
 */
class InlineMessage extends React.Component {
    handleExpandClick = () => {
        this.setState((state) => ({ expanded: !state.expanded }));
    };

    /**
     *
     *
     * @returns
     * @memberof InlineMessage
     * @inheritdoc
     */
    render() {
        const { height, type, children } = this.props;
        return (
            <Root>
                <Paper className={classes.root}>
                    <Icon className={type}>{type}</Icon>
                    <VerticalDivider height={height} />
                    <div>{children}</div>
                </Paper>
            </Root>
        );
    }
}

InlineMessage.propTypes = {
    classes: PropTypes.shape({
        root: PropTypes.string,
        iconItem: PropTypes.string,
        content: PropTypes.string,
    }).isRequired,
    height: PropTypes.number,
    type: PropTypes.string,
    children: PropTypes.shape({}).isRequired,
};
InlineMessage.defaultProps = {
    height: 100,
    type: 'info',
};
export default ((props) => {
    const theme = useTheme();
    return (<InlineMessage theme={theme} {...props} />);
});
