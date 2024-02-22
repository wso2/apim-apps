import React from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';

const PREFIX = 'VerticalDivider';

const classes = {
    divider: `${PREFIX}-divider`
};


const Root = styled('div')({
    [`& .${classes.divider}`]: {
        borderRight: '1px solid #ccc',
    },
});

/**
 *
 *
 * @param {*} props
 * @returns
 */
function VerticalDivider(props) {
    const {
        height = 30, marginLeft = 10, marginRight = 10,
    } = props;

    return (
        (<Root>
            <div className={classes.divider} style={{ height, marginLeft, marginRight }} />
        </Root>)
    );
}

VerticalDivider.propTypes = {
    height: PropTypes.number.isRequired,
};

export default (VerticalDivider);
