/* eslint-disable react/prop-types */
/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Icon from '@mui/material/Icon';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import View from 'AppComponents/Apis/Details/Documents/View';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const PREFIX = 'Details';

const classes = {
    fullView: `${PREFIX}-fullView`,
    paper: `${PREFIX}-paper`,
    popupHeader: `${PREFIX}-popupHeader`,
    viewWrapper: `${PREFIX}-viewWrapper`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`& .${classes.fullView}`]: {
        cursor: 'pointer',
        position: 'absolute',
        right: 5,
        top: 5,
    },

    [`& .${classes.paper}`]: {
        padding: theme.spacing(2),
        paddingLeft: theme.spacing(4),
        minHeight: 400,
        position: 'relative',
    },

    [`& .${classes.popupHeader}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'fixed',
        width: '100%',
        background: theme.palette.background.paper,
    },

    [`& .${classes.viewWrapper}`]: {
        padding: theme.spacing(2),
        marginTop: 50,
    },
}));

/**
 * Switch routes for documents.
 * @param {JSON} props The props passed down from parents.
 * @returns {JSX} Returning JSX to render.
 */
export default function Details(props) {
    const { apiId, selectedDoc } = props;

    const [open, setOpen] = useState(false);
    const toggleOpen = () => {
        setOpen(!open);
    };
    return (
        <Root>
            <Box className={classes.paper}>
                {(selectedDoc.sourceType === 'MARKDOWN' || selectedDoc.sourceType === 'INLINE') && (
                    <IconButton
                        onClick={toggleOpen}
                        aria-label={'View ' + selectedDoc.name + ' document in full screen'}
                        className={classes.fullView}
                        size='large'
                    >
                        <Icon>
                            launch
                        </Icon>
                    </IconButton>
                )}
                <View doc={selectedDoc} apiId={apiId} fullScreen={open} />
            </Box>
            <Dialog fullScreen open={open} onClose={toggleOpen}>
                <Box className={classes.popupHeader}>
                    <IconButton color='inherit' onClick={toggleOpen} aria-label='Close full screen view' size='large'>
                        <Typography variant='h4' inline>
                            <Icon>close</Icon>
                        </Typography>
                    </IconButton>
                    {selectedDoc.name}
                </Box>
                <Box sx={classes.viewWrapper} paddingLeft={(theme) => (theme.spacing(3))}>
                    <View doc={selectedDoc} apiId={apiId} fullScreen={open} />
                </Box>
            </Dialog>
        </Root>
    );
}
