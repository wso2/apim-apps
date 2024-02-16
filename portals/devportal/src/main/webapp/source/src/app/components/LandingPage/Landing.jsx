import React from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material';
import Carousel from './Carousel';
import ApisWithTag from './ApisWithTag';
import ParallaxScroll from './ParallaxScroll';
import Contact from './Contact';

const PREFIX = 'Landing';

const classes = {
    root: `${PREFIX}-root`,
    fullWidthBack: `${PREFIX}-fullWidthBack`,
    superRoot: `${PREFIX}-superRoot`,
};

const Root = styled('div')(() => ({
    [`& .${classes.root}`]: {
        flexGrow: 1,
        margin: '0 100px',
        alignItem: 'center',
    },

    [`& .${classes.fullWidthBack}`]: {},

    [`&.${classes.superRoot}`]: {
        display: 'flex',
        flexDirection: 'column',
    },
}));

/**
 * Renders landing view..
 * @param {JSON} props Parent pros.
 * @returns {JSX} renders landing view.
 */
function Landing() {
    const theme = useTheme();
    const {
        custom: {
            landingPage:
            {
                carousel: { active: carouselActive },
                listByTag: { active: listByTagActive, content: listByTagContent },
                parallax: { active: parallaxActive },
                contact: { active: contactActive },
            },
        },
    } = theme;
    return (
        <Root className={classes.superRoot}>
            <div className={classes.root}>
                <Grid container spacing={3}>
                    {carouselActive && (
                        <Grid item xs={12}>
                            <Carousel />
                        </Grid>
                    )}
                    {listByTagActive && listByTagContent.length > 0 && (
                        <Grid item xs={12}>
                            <Typography variant='h2' gutterBottom>
                                {listByTagContent[0].title}
                            </Typography>
                            {listByTagContent[0].description && (
                                <Typography variant='body1' gutterBottom>
                                    {listByTagContent[0].description}
                                </Typography>
                            )}
                            <ApisWithTag tag={listByTagContent[0].tag} maxCount={listByTagContent[1].maxCount} />
                        </Grid>
                    )}
                </Grid>
            </div>
            {parallaxActive && (
                <div className={classes.fullWidthBack}>
                    <ParallaxScroll index={0} />
                </div>
            )}
            <div className={classes.root}>
                <Grid container spacing={3}>
                    {listByTagActive && listByTagContent.length > 1 && (
                        <Grid item xs={12}>
                            <Typography variant='h2' gutterBottom>
                                {listByTagContent[1].title}
                            </Typography>
                            {listByTagContent[1].description && (
                                <Typography variant='body1' gutterBottom>
                                    {listByTagContent[1].description}
                                </Typography>
                            )}
                            <ApisWithTag tag={listByTagContent[1].tag} maxCount={listByTagContent[1].maxCount} />
                        </Grid>
                    )}
                </Grid>
            </div>
            {parallaxActive && (
                <div className={classes.fullWidthBack}>
                    <ParallaxScroll index={1} />
                </div>
            )}
            {contactActive && (
                <div className={classes.root}>
                    <Typography variant='h2' gutterBottom>Contact Us</Typography>
                    <Contact />
                </div>
            )}

        </Root>
    );
}

Landing.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
};

export default (Landing);
