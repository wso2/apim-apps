import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import HTMLRender from 'AppComponents/Shared/HTMLRender';

const PREFIX = 'Contact';

const classes = {
    root: `${PREFIX}-root`,
};

const Root = styled('div')(() => ({
    [`&.${classes.root}`]: {
        paddingTop: 20,
        paddingBottom: 20,
    },
}));

/**
 * Renders parallax scroll section.
 * @param {JSON} props Parent pros.
 * @returns {JSX} rendered parallax scroll view.
 */
function Contact() {
    const theme = useTheme();
    const { custom: { landingPage: { contact: { contactHTML } } } } = theme;
    return (
        <Root className={classes.root}>
            <HTMLRender html={contactHTML} />
        </Root>
    );
}

export default Contact;
