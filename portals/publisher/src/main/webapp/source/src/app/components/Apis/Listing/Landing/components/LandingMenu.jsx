import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Configurations from 'Config';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { blue } from '@mui/material/colors';

const PREFIX = 'LandingMenu';

const classes = {
    root: `${PREFIX}-root`,
    boxTransition: `${PREFIX}-boxTransition`,
    overlayBox: `${PREFIX}-overlayBox`,
    overlayCloseButton: `${PREFIX}-overlayCloseButton`
};

const StyledGrid = styled(Grid)(({ theme }) => ({
    [`& .${classes.root}`]: {
        minWidth: theme.spacing(32),
    },

    [`& .${classes.boxTransition}`]: {
        transition: 'box-shadow 0.9s cubic-bezier(.25,.8,.25,1)',
        cursor: 'pointer',
    },

    [`& .${classes.overlayBox}`]: {
        cursor: 'auto',
        outline: 'none',
        'border-color': '#f9f9f9', // TODO: take from theme ~tmkb
        'box-shadow': '0 0 6px 4px #f9f9f9',
        'border-radius': '5px',
    },

    [`& .${classes.overlayCloseButton}`]: {
        float: 'right',
    }
}));

const LandingMenu = (props) => {
    const {
        title, icon, children, id,
    } = props;
    const [isHover, setIsHover] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isFadeOut, setIsFadeOut] = useState(true);

    const onMouseOver = () => {
        setIsHover(true);
    };
    const onMouseOut = () => {
        setIsHover(false);
    };

    return (
        <StyledGrid
            className={classes.root}
            item
            xs={12}
            sm={6}
            md={3}
            lg={2}
        >
            <Box
                id={id}
                className={classes.boxTransition}
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
                bgcolor='background.paper'
                justifyContent='center'
                alignItems='center'
                borderRadius='8px'
                borderColor='grey.300'
                display='flex'
                border={1}
                boxShadow={isHover ? 4 : 1}
                minHeight={340}
                p={1}
                color={blue[900]}
                fontSize='h4.fontSize'
                fontFamily='fontFamily'
                flexDirection='row'
                onClick={(e) => { setIsCollapsed(true); setIsFadeOut(false); e.preventDefault(); e.stopPropagation(); }}
                position='relative'
            >
                <Grid
                    container
                    direction='row'
                    justifyContent='center'
                    alignItems='center'
                >
                    <Grid item xs={12}>
                        <Box
                            alignItems='center'
                            mt={2}
                            mb={4}
                            justifyContent='center'
                            display={{ xs: 'none', sm: 'flex' }}
                        >
                            <img
                                style={{
                                    maxWidth: '100%',
                                    height: 'auto',
                                    objectFit: 'contain',
                                    minWidth: '150px',
                                    minHeight: '150px',
                                }}
                                src={Configurations.app.context
                                    + icon}
                                alt={title}
                                aria-hidden='true'
                            />
                        </Box>
                    </Grid>
                    {title}
                </Grid>
                <Box
                    position='absolute'
                    top={5}
                    left={5}
                    height='97%'
                    bgcolor='#f8f8fb'
                    textAlign='center'
                    width='97%'
                    className={classes.overlayBox}
                    visibility={isFadeOut && 'hidden'}
                >
                    <Fade
                        onExited={() => setIsFadeOut(true)}
                        timeout={{ enter: 500, exit: 150 }}
                        in={isCollapsed}
                    >
                        <Box>
                            <IconButton
                                className={classes.overlayCloseButton}
                                onClick={(e) => {
                                    setIsCollapsed(false);
                                    e.preventDefault(); e.stopPropagation();
                                }}
                                size='large'>
                                <CloseIcon />
                            </IconButton>
                            <Grid
                                container
                                direction='row'
                                justifyContent='flex-start'
                                alignItems='center'
                                spacing={3}
                            >
                                {/* Menu links or buttons */}
                                {isCollapsed? children: null}
                            </Grid>
                        </Box>
                    </Fade>
                </Box>
            </Box>
        </StyledGrid>
    );
};

export default LandingMenu;
