import React, { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Slide from '@mui/material/Slide';
import Icon from '@mui/material/Icon';
import classNames from 'classnames';
import HTMLRender from 'AppComponents/Shared/HTMLRender';
import { app } from 'Settings';

const PREFIX = 'Carousel';

const classes = {
    root: `${PREFIX}-root`,
    imageBox: `${PREFIX}-imageBox`,
    arrows: `${PREFIX}-arrows`,
    arrowLeft: `${PREFIX}-arrowLeft`,
    arrowRight: `${PREFIX}-arrowRight`,
    slideContainer: `${PREFIX}-slideContainer`,
    slideContentWrapper: `${PREFIX}-slideContentWrapper`,
    slideContentTitle: `${PREFIX}-slideContentTitle`,
    slideContentContent: `${PREFIX}-slideContentContent`,
};

const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`&.${classes.root}`]: {
        position: 'relative',
        display: 'flex',
    },

    [`& .${classes.imageBox}`]: {
        width: '100%',
        height: 'auto',
    },

    [`& .${classes.arrows}`]: {
        position: 'absolute',
        zIndex: 2,
        display: 'flex',
        flex: 1,
        height: '100%',
        background: '#00000044',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        '& span': {
            fontSize: 60,
            color: theme.palette.getContrastText('#000000'),
        },
    },

    [`& .${classes.arrowLeft}`]: {
        left: 0,
    },

    [`& .${classes.arrowRight}`]: {
        right: 0,
    },

    [`& .${classes.slideContainer}`]: {
        width: '100%',
        zIndex: 1,
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
    },

    [`& .${classes.slideContentWrapper}`]: {
        position: 'absolute',
        background: '#00000044',
        color: theme.palette.getContrastText('#000000'),
        bottom: 0,
        padding: theme.spacing(2),
    },

    [`& .${classes.slideContentTitle}`]: {
        fontWeight: theme.typography.fontWeightLight,
        fontSize: theme.typography.h3.fontSize,
    },

    [`& .${classes.slideContentContent}`]: {
        fontWeight: theme.typography.fontWeightLight,
        fontSize: theme.typography.body1.fontSize,
    },
}));

/**
 * Renders Carousel view..
 * @param {JSON} props Parent pros.
 * @returns {JSX} renders Carousel view.
 */
function Carousel() {
    const theme = useTheme();
    const [counter, setCounter] = useState(0);
    const [slideDirection, setSlideDirection] = useState('left');
    const content = theme.custom.landingPage.carousel.slides;
    const handleLeftArrow = () => {
        setSlideDirection('right');
        if (counter === 0) {
            setCounter(content.length - 1);
        } else {
            setCounter(counter - 1);
        }
    };
    const handleRightArrow = () => {
        setSlideDirection('left');
        if (counter === content.length - 1) {
            setCounter(0);
        } else {
            setCounter(counter + 1);
        }
    };

    return (
        <Root className={classes.root}>
            <div
                className={classNames(classes.arrowLeft, classes.arrows)}
                onKeyDown={handleLeftArrow}
                onClick={handleLeftArrow}
            >
                <Icon>chevron_left</Icon>
            </div>
            <div
                className={classNames(classes.arrowRight, classes.arrows)}
                onKeyDown={handleLeftArrow}
                onClick={handleRightArrow}
            >
                <Icon>chevron_right</Icon>
            </div>
            {content.map((slide, index) => (
                <Slide
                    direction={slideDirection}
                    in={counter === index}
                    timeout={{ enter: 500, exit: 0 }}
                    key={slide.src}
                    mountOnEnter
                    unmountOnExit
                >
                    <div className={classes.slideContainer}>
                        <div className={classNames(classes.slideContentWrapper, 'slideContentWrapper')}>
                            <div className={
                                classNames(classes.slideContentTitle,
                                    'slideContentTitle')
                            }
                            >
                                <HTMLRender html={slide.title} />
                            </div>
                            <div className={classes.slideContentContent}><HTMLRender html={slide.content} /></div>
                        </div>
                        <img
                            alt='slider'
                            className={classes.imageBox}
                            src={app.context + slide.src}
                        />
                    </div>
                </Slide>
            ))}
        </Root>
    );
}

export default Carousel;
