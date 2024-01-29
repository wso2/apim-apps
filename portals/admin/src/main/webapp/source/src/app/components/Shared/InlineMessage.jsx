import React from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Paper from '@mui/material/Paper';
import Icon from '@mui/material/Icon';
import { amber } from '@mui/material/colors';
import VerticalDivider from './VerticalDivider';

const StyledPaper = styled(Paper)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    border: 'solid 1px ' + theme.palette.secondary.main,
    '& span.material-icons.info': {
        fontSize: 80,
        color: theme.palette.primary.main,
    },
    '& span.material-icons.warning': {
        fontSize: 80,
        color: amber[700],
    },
}));

const StyledDiv = styled('div')({ pt: 1, pb: 1, pr: 1 });

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
        const {
            height, type, children,
        } = this.props;
        return (
            <StyledPaper {...this.props}>
                <Icon className={type}>{type}</Icon>
                <VerticalDivider height={height} />
                <StyledDiv>{children}</StyledDiv>
            </StyledPaper>
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
export default (InlineMessage);
