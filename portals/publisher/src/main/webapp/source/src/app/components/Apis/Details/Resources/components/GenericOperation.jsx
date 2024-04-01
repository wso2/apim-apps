/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import { styled, useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
import {
    Button,
    Divider,
    Grid,
    Typography,
    Accordion, 
    AccordionSummary, 
    AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Utils from 'AppData/Utils';

const PREFIX = 'GenericOperation';

const classes = {
    customButton: `${PREFIX}-customButton`,
    paperStyles: `${PREFIX}-paperStyles`,
    customDivider: `${PREFIX}-customDivider`,
    highlightSelected: `${PREFIX}-highlightSelected`,
    contentNoMargin: `${PREFIX}-contentNoMargin`,
    targetText: `${PREFIX}-targetText`,
    title: `${PREFIX}-title`
};


const Root = styled('div')(({ theme }) => {
    return {
        [`& .${classes.customButton}`]: {
            width: theme.spacing(12),
        },
        [`& .${classes.paperStyles}`]: {
            borderBottom: '',
        },
        [`& .${classes.contentNoMargin}`]: {
            margin: theme.spacing(0),
        },
        [`& .${classes.targetText}`]: {
            maxWidth: 180,
            margin: '0px 20px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            display: 'inline-block',
        },
        [`& .${classes.title}`]: {
            display: 'inline',
            margin: `0 ${theme.spacing(5)}`,
        },
    };
});

/**
 *
 * Common resource component for mock impl endpoints
 * @export
 * @param {*} props input props
 * @returns {React.Component} @inheritdoc
 */
function GenericOperation(props) {
    const {
        target,
        verb,
        children,
    } = props;
    const [isExpanded, setIsExpanded] = useState(false);
    const theme = useTheme();
    const backgroundColor = theme.custom.resourceChipColors[verb];
    


    /**
     * Handle panel expansions when navigation happen between mockimpl options
     *
     * @param {*} event event
     * @param {*} expanded status of the expansion panel
     */
    function handleExpansion(event, expanded) {
        setIsExpanded(expanded);
    }

    return (
        <Root>
            <Accordion
                expanded={isExpanded}
                onChange={handleExpansion}
                className={classes.paperStyles}
                sx={{ border: `1px solid ${backgroundColor}` }}
            >
                <AccordionSummary
                    disableRipple
                    disableTouchRipple
                    expandIcon={<ExpandMoreIcon />}
                    id={verb + target}
                    classes={{ content: classes.contentNoMargin }}
                    sx={{ backgroundColor: Utils.hexToRGBA(backgroundColor, 0.1) }}
                >
                    <Grid container direction='row' justifyContent='space-between' alignItems='center' spacing={0}>
                        <Grid item md={4} style={{ display: 'flex', alignItems: 'center' }}>
                            <Button
                                disableFocusRipple
                                variant='contained'
                                aria-label={'HTTP verb ' + verb}
                                size='small'
                                className={classes.customButton}
                                sx={{ backgroundColor, color: theme.palette.getContrastText(backgroundColor) }}
                            >
                                {verb}
                            </Button>
                            <Typography
                                display='inline-block'
                                variant='h6'
                                component='div'
                                gutterBottom
                                className={classes.targetText}
                                title={target}
                            >
                                {target}
                            </Typography>
                        </Grid>
                    </Grid>
                </AccordionSummary>
                <Divider sx={{ backgroundColor }} />
                <AccordionDetails>
                    {children}
                </AccordionDetails>
            </Accordion>
        </Root>
    );
}

GenericOperation.propTypes = {
    target: PropTypes.string.isRequired,
    verb: PropTypes.string.isRequired,
    children: PropTypes.element.isRequired,
};

export default React.memo(GenericOperation);
