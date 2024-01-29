import React from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';

const StyledDiv = styled('div')({ borderRight: 'solid 1px #ccc' });

/**
 *
 *
 * @param {*} props
 * @returns
 */
function VerticalDivider(props) {
    const {
        height = 30, marginLeft = 1, marginRight = 1,
    } = props;

    return (
        <>
            <StyledDiv sx={{ height, ml: marginLeft, mr: marginRight }} />
        </>
    );
}

VerticalDivider.propTypes = {
    height: PropTypes.shape({}).isRequired,
    marginLeft: PropTypes.shape({}).isRequired,
    marginRight: PropTypes.shape({}).isRequired,
};

export default (VerticalDivider);
