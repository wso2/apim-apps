import React from 'react';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl'
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';


/**
 *
 * @returns
 */
export default function CustomSplitButton(props) {
    const [open, setOpen] = React.useState(false);
    const {
        advertiseInfo, handleSave, handleSaveAndDeploy, isUpdating, api, id, isValidSequenceBackend,
        isCustomBackendSelected
    } = props;
    const intl = useIntl();
    const options = [
        {
            key: 'Save and deploy',
            label: intl.formatMessage({
                id: 'Custom.Split.Button.Save.And.Deploy',
                defaultMessage: 'Save and deploy',
            }),
        },
        {
            key: 'Save',
            label: intl.formatMessage({
                id: 'Custom.Split.Button.Save',
                defaultMessage: 'Save',
            }),
        }];
    const anchorRef = React.useRef(null);
    const [selectedIndex, setSelectedIndex] = React.useState(1);
    const securityScheme = [...api.securityScheme];
    const isMutualSslOnly = securityScheme.length === 2 && securityScheme.includes('mutualssl')
    && securityScheme.includes('mutualssl_mandatory');
    const isEndpointAvailable = api.endpointConfig !== null;
    const isTierAvailable = api.policies.length !== 0;

    const isDeployButtonDisabled = (((api.type !== 'WEBSUB' && (!isCustomBackendSelected && !isEndpointAvailable)))
    || (!isMutualSslOnly && !isTierAvailable)
    || api.workflowStatus === 'CREATED');

    const handleClick = (event, index) => {
        setSelectedIndex(index);
        setOpen(false);
        if (`${options[index].key}` === 'Save') {
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
                        {options[1].label}
                    </Button>
                </Grid>
            ) : (
                <Grid item xs={12}>
                    <ButtonGroup
                        variant='contained'
                        color='primary'
                        ref={anchorRef}
                        aria-label='split button'
                        disabled={isUpdating || (!isValidSequenceBackend && isCustomBackendSelected)}
                        style={{ width: '200px' }}
                    >
                        <Button
                            onClick={(event) => handleClick(event, selectedIndex)}
                            disabled={isUpdating || (!isValidSequenceBackend && isCustomBackendSelected)}
                            data-testid = 'custom-select-save-button'
                            style={{ width: '200px' }}
                            id={id}
                        >
                            {options[selectedIndex].label}
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
                                                    key={option.key}
                                                    selected={index === selectedIndex}
                                                    onClick={(event) => handleClick(event, index)}
                                                    disabled={(option.key === 'Save and deploy'
                                                        && isDeployButtonDisabled)}
                                                >
                                                    {option.label}
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

CustomSplitButton.defaultProps = {
    isCustomBackendSelected: false,
    isValidSequenceBackend: true,
};
CustomSplitButton.propTypes = {
    api: PropTypes.shape({}).isRequired,
    handleSave: PropTypes.shape({}).isRequired,
    handleSaveAndDeploy: PropTypes.shape({}).isRequired,
    isUpdating: PropTypes.bool.isRequired,
    isValidSequenceBackend: PropTypes.bool,
    isCustomBackendSelected: PropTypes.bool,
};
