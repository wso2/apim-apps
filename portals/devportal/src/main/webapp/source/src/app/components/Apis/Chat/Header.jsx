/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import React from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Typography } from '@mui/material';
// import { makeStyles } from '@mui/styles';
import 'react-resizable/css/styles.css';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';
import Tooltip from '@mui/material/Tooltip';
import RestartAltTwoToneIcon from '@mui/icons-material/RestartAltTwoTone';

// const useStyles = makeStyles(() => ({
//     button: {
//         '&:hover': {
//             backgroundColor: '#096183',
//         },
//     },
// }));

function Header(props) {
    const {
        toggleChatbot, toggleFullScreen, isClicked, handleReset,
    } = props;
    // const classes = useStyles();
    return (
        <Box
            display='flex'
            flexDirection='row'
            justifyContent='space-between'
            borderBottom={1}
            borderColor='#808e96'
        >
            <Box>
                <IconButton
                    onClick={toggleFullScreen}
                    style={{ alignSelf: 'flex-end', padding: '12px' }}
                >
                    {isClicked ? (
                        <FullscreenExitIcon fontSize='large' />
                    ) : (
                        <FullscreenIcon fontSize='large' />
                    )}
                </IconButton>
                <Tooltip title='Reset Chat' placement='right'>
                    <IconButton
                        onClick={handleReset}
                        style={{ alignSelf: 'flex-end', padding: '12px' }}
                    >
                        <RestartAltTwoToneIcon fontSize='large' />
                    </IconButton>
                </Tooltip>
            </Box>
            <Box display='flex'>
                <Typography variant='body1' fontWeight='500' color='#000' padding='5px 8px 3px 8px' margin='12px 0 12px 0'>AI Assistant</Typography>
                <Typography variant='body1' fontWeight='bold' color='#fff' padding='5px 8px 3px 8px' margin='12px 0 12px 0' backgroundColor='#297d9e' borderRadius='10px'>Beta</Typography>
                <IconButton
                    onClick={toggleChatbot}
                    style={{ alignSelf: 'flex-end', padding: '12px', marginRight: '6px' }}
                >
                    <ExpandMoreTwoToneIcon fontSize='large' />
                </IconButton>
            </Box>
        </Box>
    );
}
Header.propTypes = {
    toggleChatbot: PropTypes.func.isRequired,
    toggleFullScreen: PropTypes.func.isRequired,
    isClicked: PropTypes.bool.isRequired,
    handleReset: PropTypes.func.isRequired,
};
export default Header;
