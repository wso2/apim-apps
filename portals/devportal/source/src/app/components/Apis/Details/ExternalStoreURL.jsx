/* eslint-disable no-unreachable */
/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import { ApiContext } from './ApiContext';

const useStyles = makeStyles((theme) => ({
    visitLabel: {
        whiteSpace: 'nowrap',
    },
    root: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        border: `solid 1px ${theme.palette.grey[300]}`,
        '& .MuiInputBase-root:before,  .MuiInputBase-root:hover': {
            borderBottom: 'none !important',
            color: theme.palette.primary.main,
        },
        '& .MuiSelect-select': {
            color: theme.palette.primary.main,
            paddingLeft: theme.spacing(),
        },
        '& .MuiInputBase-input': {
            color: theme.palette.primary.main,
        },
        '& .material-icons': {
            fontSize: 16,
            color: `${theme.palette.grey[700]} !important`,
        },
        borderRadius: 10,
        marginRight: theme.spacing(),
    },
    input: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },
    avatar: {
        width: 30,
        height: 30,
        background: 'transparent',
        border: `solid 1px ${theme.palette.grey[300]}`,
    },
    iconStyle: {
        cursor: 'pointer',
        margin: '-10px 0',
        padding: '0 0 0 5px',
        '& .material-icons': {
            fontSize: 18,
            color: '#9c9c9c',
        },
    },
    sectionTitle: {
        color: '#424242',
        fontSize: '0.85rem',
        marginRight: 20,
        fontWeight: 400,
    },
}));

/**
 *  @inheritdoc
 */
function ExternalStoreURL() {
    const { api } = useContext(ApiContext);
    const classes = useStyles();

    const visitExternalStore = () => {
        window.open(api.advertiseInfo.originalDevPortalUrl, '_blank').focus();
    };

    /**
     *  @inheritdoc
     */
    return (
        <Box display='flex' flexDirection='column' width='100%'>
            <Box mr={5} display='flex' area-label='External Store URL details' alignItems='center' width='100%' flexDirection='row'>
                {api.advertiseInfo.originalDevPortalUrl && (
                    <>
                        <Typography
                            variant='subtitle2'
                            component='label'
                            for='external-store-url'
                            gutterBottom
                            align='left'
                            className={classes.sectionTitle}
                        >
                            <FormattedMessage
                                id='Apis.Details.ExternalStoreURL.label.url'
                                defaultMessage='External Store'
                            />
                        </Typography>
                        <Paper id='external-store-url' component='form' className={classes.root}>
                            <InputBase
                                className={classes.input}
                                inputProps={{ 'aria-label': 'external store url' }}
                                value={api.advertiseInfo.originalDevPortalUrl}
                            />
                        </Paper>
                    </>
                )}
                {!api.advertiseInfo.originalDevPortalUrl && (
                    <Typography variant='subtitle2' component='p' gutterBottom align='left' className={classes.sectionTitle}>
                        <FormattedMessage
                            id='Apis.Details.ExternalStoreURL.label.nostoreurl'
                            defaultMessage='No External Store URL provided.'
                        />
                    </Typography>
                )}
                <Button
                    variant='contained'
                    color='primary'
                    size='medium'
                    classes={{ label: classes.visitLabel }}
                    onClick={visitExternalStore}
                    aria-label='Got to the External Store URL'
                >
                    <FormattedMessage
                        id='Apis.Details.ExternalStoreURL.btn.visit'
                        defaultMessage='Visit'
                    />
                </Button>
            </Box>
        </Box>

    );
}
ExternalStoreURL.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({}).isRequired,
};

export default ExternalStoreURL;
