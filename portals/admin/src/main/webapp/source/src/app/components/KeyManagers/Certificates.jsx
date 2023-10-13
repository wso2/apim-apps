import React, { useState } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import DropZoneLocal from 'AppComponents/Shared/DropZoneLocal';
import { FormattedMessage, useIntl } from 'react-intl';
import SecurityIcon from '@mui/icons-material/Security';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from 'AppComponents/Shared/Alert';

const cache = {};
/**
 * Renders the certificate add/edit page.
 * @param {JSON} props Input props form parent components.
 * @returns {JSX} Certificate upload/add UI.
 */
export default function Certificates(props) {
    const intl = useIntl();
    const { certificates: { type, value }, dispatch } = props;
    const [selectedTab, setSelectedTab] = useState(0);
    const [file, setFile] = useState(null);
    cache[type] = value;

    const onDrop = (acceptedFile) => {
        const reader = new FileReader();
        setFile(acceptedFile[0]);
        reader.readAsText(acceptedFile[0], 'UTF-8');
        reader.onload = (evt) => {
            dispatch({
                field: 'certificates',
                value: {
                    type,
                    value: btoa(evt.target.result),
                },
            });
        };
        reader.onerror = () => {
            Alert.success(intl.formatMessage({
                id: 'KeyManagers.Certificates.file.error',
                defaultMessage: 'Error reading file',
            }));
        };
    };

    const handleChange = (event) => {
        const { value: selected, name } = event.target;
        if (name === 'certificateType') {
            dispatch({
                field: 'certificates',
                value: {
                    type: selected,
                    value: cache[selected],
                },
            });
        } else {
            dispatch({
                field: 'certificates',
                value: {
                    type,
                    value: name === 'certificateValueUrl' ? selected : btoa(selected),
                },
            });
        }
    };
    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };
    return (
        <>
            <FormControl component='fieldset'>
                <RadioGroup
                    style={{ flexDirection: 'row' }}
                    aria-label='certificate'
                    name='certificateType'
                    value={type}
                    onChange={handleChange}
                >
                    <FormControlLabel id='pem-certificate' value='PEM' control={<Radio />} label='PEM' />
                    <FormControlLabel id='jwks-certificate' value='JWKS' control={<Radio />} label='JWKS' />
                </RadioGroup>
            </FormControl>
            {type === 'JWKS' && (
                <TextField
                    id='jwks-url'
                    label={intl.formatMessage(
                        {
                            id: 'KeyManagers.Certificates.jwks.url',
                            defaultMessage: 'URL',
                        },
                    )}
                    fullWidth
                    variant='outlined'
                    value={value}
                    name='certificateValueUrl'
                    onChange={handleChange}
                />
            )}
            {type === 'PEM' && (
                <>
                    <AppBar position='static' color='default'>
                        <Tabs value={selectedTab} onChange={handleTabChange}>
                            <Tab label='Paste' />
                            <Tab label='Upload' />
                        </Tabs>
                    </AppBar>
                    {selectedTab === 0
                        ? (
                            <TextField
                                id='KeyManagers.Certificates.paste.label.header'
                                label={intl.formatMessage(
                                    {
                                        id: 'KeyManagers.Certificates.paste.label',
                                        defaultMessage: 'Paste the content of the PEM file',
                                    },
                                )}
                                multiline
                                fullWidth
                                rows={6}
                                variant='outlined'
                                value={atob(value)}
                                name='certificateValue'
                                onChange={handleChange}
                            />
                        ) : (
                            <>
                                {(file && file.name) && (
                                    <Box m={1} display='flex' flexDirection='row' alignItems='center'>
                                        <SecurityIcon />
                                        <Box flex='1'>{file.name}</Box>
                                        <Typography
                                            variant='caption'
                                            id='KeyManagers.Certificates.override.message.body'
                                        >
                                            <FormattedMessage
                                                id='KeyManagers.Certificates.override.message'
                                                defaultMessage='Upload new file to override the current certificate'
                                            />
                                        </Typography>
                                    </Box>
                                )}
                                <DropZoneLocal
                                    onDrop={onDrop}
                                    files={value && value.name}
                                    accept='.pem'
                                    baseStyle={{ padding: '16px 20px' }}
                                >
                                    <FormattedMessage
                                        id='KeyManagers.Certificates.drag.and.drop.message'
                                        defaultMessage='Drag and Drop files here {break} or {break}'
                                        values={{ break: <br /> }}
                                    />
                                    <Button
                                        color='default'
                                        variant='contained'
                                    >
                                        <FormattedMessage
                                            id='KeyManagers.Certificates.browse.files.to.upload'
                                            defaultMessage='Browse File to Upload'
                                        />
                                    </Button>
                                </DropZoneLocal>
                            </>
                        )}
                </>
            )}

        </>
    );
}
Certificates.propTypes = {
    certificates: PropTypes.shape({}).isRequired,
    dispatch: PropTypes.func.isRequired,
};
