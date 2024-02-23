import React from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
const PREFIX = 'VerticalDivider';

const classes = {
    divider: `${PREFIX}-divider`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.divider}`]: {
        borderRight: 'solid 1px #ccc',
    }
}));

/**
 * Gives a vertical line as a component
 *
 * @param {*} props
 * @returns
 */
function VerticalDivider(props) {
    const height = props.height ? props.height : 30;
    const marginLeft = props.marginLeft ? props.marginLeft : 10;
    const marginRight = props.marginRight ? props.marginRight : 10;

    return (
        <Root>
            <div className={classes.divider} style={{ height, marginLeft, marginRight }} />
        </Root>
    );
}

VerticalDivider.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default (VerticalDivider);
