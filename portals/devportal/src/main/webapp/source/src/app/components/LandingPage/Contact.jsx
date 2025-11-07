import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import HTMLRender from 'AppComponents/Shared/HTMLRender';

const PREFIX = 'Contact';

const classes = {
    root: `${PREFIX}-root`,
};

const StyledRoot = styled('div')(({ theme }) => {
    const { custom: { landingPage: { contact: { style = {} } } } } = theme;
    return {
        [`&.${classes.root}`]: {
            paddingTop: style.paddingTop || 20,
            paddingBottom: style.paddingBottom || 20,
            ...style,
        },
    };
});

/**
 * Renders contact section.
 * @returns {JSX} rendered contact view.
 */
function Contact() {
    const theme = useTheme();
    const { custom: { landingPage: { contact: { contactHTML } } } } = theme;
    return (
        <StyledRoot className={classes.root}>
            <HTMLRender html={contactHTML} />
        </StyledRoot>
    );
}

export default Contact;
