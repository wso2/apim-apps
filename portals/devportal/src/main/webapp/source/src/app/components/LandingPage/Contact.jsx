import React from 'react';
import { useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import HTMLRender from 'AppComponents/Shared/HTMLRender';

const useStyles = makeStyles(() => ({
    root: {
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
    const classes = useStyles();
    const theme = useTheme();
    const { custom: { landingPage: { contact: { contactHTML } } } } = theme;
    return (
        <div className={classes.root}>
            <HTMLRender html={contactHTML} />
        </div>
    );
}

export default Contact;
