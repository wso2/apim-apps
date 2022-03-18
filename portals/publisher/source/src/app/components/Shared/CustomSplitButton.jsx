import React from 'react';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import CircularProgress from '@material-ui/core/CircularProgress';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

const options = ['Save and deploy', 'Save'];

/**
 *
 * @returns
 */
export default function CustomSplitButton(props) {
    const [open, setOpen] = React.useState(false);
    const {
        advertiseInfo, handleSave, handleSaveAndDeploy, isUpdating, api, id,
    } = props;
    const anchorRef = React.useRef(null);
    const [selectedIndex, setSelectedIndex] = React.useState(1);
    const securityScheme = [...api.securityScheme];
    const isMutualSslOnly = securityScheme.length === 2 && securityScheme.includes('mutualssl')
    && securityScheme.includes('mutualssl_mandatory');
    const isEndpointAvailable = api.endpointConfig !== null;
    const isTierAvailable = api.policies.length !== 0;

    const isDeployButtonDisabled = (((api.type !== 'WEBSUB' && !isEndpointAvailable))
    || (!isMutualSslOnly && !isTierAvailable)
    || api.workflowStatus === 'CREATED');

    const handleClick = (event, index) => {
        setSelectedIndex(index);
        setOpen(false);
        if (`${options[index]}` === 'Save') {
            handleSave();
        } else {
            handleSaveAndDeploy();
        }
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    return (
        <Grid container direction='column' alignItems='center'>
            {(advertiseInfo && advertiseInfo.advertised) ? (
                <Grid item xs={12}>
                    <Button
                        onClick={handleSave}
                        variant='contained'
                        color='primary'
                    >
                        {options[1]}
                    </Button>
                </Grid>
            ) : (
                <Grid item xs={12}>
                    <ButtonGroup
                        variant='contained'
                        color='primary'
                        ref={anchorRef}
                        aria-label='split button'
                        disabled={isUpdating}
                        style={{ width: '200px' }}
                    >
                        <Button
                            onClick={(event) => handleClick(event, selectedIndex)}
                            disabled={isUpdating}
                            style={{ width: '200px' }}
                            id={id}
                        >
                            {options[selectedIndex]}
                            {isUpdating && <CircularProgress size={24} />}
                        </Button>
                        <Button
                            color='primary'
                            size='small'
                            aria-controls={open ? 'split-button-menu' : undefined}
                            aria-expanded={open ? 'true' : undefined}
                            aria-label='select merge strategy'
                            aria-haspopup='menu'
                            onClick={handleToggle}
                        >
                            <ArrowDropDownIcon />
                        </Button>
                    </ButtonGroup>
                    <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                        {({ TransitionProps, placement }) => (
                            <Grow
                                {...TransitionProps}
                                style={{
                                    transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                                }}
                            >
                                <Paper>
                                    <ClickAwayListener onClickAway={handleClose}>
                                        <MenuList id='split-button-menu'>
                                            {options.map((option, index) => (
                                                <MenuItem
                                                    key={option}
                                                    selected={index === selectedIndex}
                                                    onClick={(event) => handleClick(event, index)}
                                                    disabled={(option === 'Save and deploy' && isDeployButtonDisabled)}
                                                >
                                                    {option}
                                                </MenuItem>
                                            ))}
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                            </Grow>
                        )}
                    </Popper>
                </Grid>
            )}
        </Grid>
    );
}

CustomSplitButton.propTypes = {
    api: PropTypes.shape({}).isRequired,
    handleSave: PropTypes.shape({}).isRequired,
    handleSaveAndDeploy: PropTypes.shape({}).isRequired,
    isUpdating: PropTypes.bool.isRequired,
};
