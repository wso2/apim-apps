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
import PropTypes from 'prop-types';
import {
    Button,
    Divider,
    Grid,
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
    Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { makeStyles } from '@mui/styles';
import Utils from 'AppData/Utils';

const useStyles = verb => makeStyles((theme) => {
    const backgroundColor = theme.custom.resourceChipColors[verb];
    return {
        customButton: {
            '&:hover': { backgroundColor },
            backgroundColor,
            width: theme.spacing(12),
            color: theme.palette.getContrastText(backgroundColor),
        },
        paperStyles: {
            border: `1px solid ${backgroundColor}`,
            borderBottom: '',
        },
        customDivider: {
            backgroundColor,
        },
        highlightSelected: {
            backgroundColor: Utils.hexToRGBA(backgroundColor, 0.1),
        },
        contentNoMargin: {
            margin: theme.spacing(0),
        },
        targetText: {
            maxWidth: 180,
            margin: '0px 20px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            display: 'inline-block',
        },
        title: {
            display: 'inline',
            margin: `0 ${theme.spacing(5)}px`,
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
    const classes = useStyles(verb)();

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
        <>
            <ExpansionPanel
                expanded={isExpanded}
                onChange={handleExpansion}
                className={classes.paperStyles}
            >
                <ExpansionPanelSummary
                    className={classes.highlightSelected}
                    disableRipple
                    disableTouchRipple
                    expandIcon={<ExpandMoreIcon />}
                    id={verb + target}
                    classes={{ content: classes.contentNoMargin }}
                >
                    <Grid container direction='row' justify='space-between' alignItems='center' spacing={0}>
                        <Grid item md={4} style={{ display: 'flex', alignItems: 'center' }}>
                            <Button
                                disableFocusRipple
                                variant='contained'
                                aria-label={'HTTP verb ' + verb}
                                size='small'
                                className={classes.customButton}
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
                </ExpansionPanelSummary>
                <Divider light className={classes.customDivider} />
                <ExpansionPanelDetails>
                    {children}
                </ExpansionPanelDetails>
            </ExpansionPanel>
        </>
    );
}

GenericOperation.propTypes = {
    target: PropTypes.string.isRequired,
    verb: PropTypes.string.isRequired,
    children: PropTypes.element.isRequired,
};

export default React.memo(GenericOperation);
