/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
    normalText: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
        marginRight: 30,
        width: 120,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    listHeaderAPI: {
        fontWeight: '600',
        fontSize: theme.typography.pxToRem(19),
    },
    listHeaderResource: {
        fontWeight: '600',
        fontSize: theme.typography.pxToRem(17),
    },
    details: {
        alignItems: 'center',
    },
}));

/**
 *
 * @param {any} props Props for view usage in APIs function.
 * @returns {any} Returns the rendered UI for view scope usages.
 */
export default function CertificateUsageViewAPI(props) {
    const classes = useStyles();
    const { certUsage } = props;
    const apiList = certUsage;

    if (!apiList) {
        return <CircularProgress />;
    } else {
        return (
            <div className={classes.root}>
                <Typography className={classes.listHeaderAPI}>
                    <FormattedMessage
                        id='Scopes.Usage.UsageViewAPI.api.usage'
                        defaultMessage='List of APIs'
                    />
                </Typography>
                <br />
                {apiList.map((api) => (
                    <ExpansionPanel expanded={false} >
                        <ExpansionPanelSummary
                            aria-controls='panel1a-content'
                            id='panel1a-header'
                        >
                            <Typography component='div' className={classes.heading}>
                                <Box fontWeight='fontWeightBold' m={1}>
                                    <FormattedMessage
                                        id='Scopes.Usage.Usage.api.name'
                                        defaultMessage='API Name:'
                                    />
                                </Box>
                            </Typography>
                            <Typography component='div' className={classes.normalText}>
                                <Box fontWeight='fontWeightLight' m={1}>
                                    {api.name}
                                </Box>
                            </Typography>
                            <Typography component='div' className={classes.heading}>
                                <Box fontWeight='fontWeightBold' m={1}>
                                    <FormattedMessage
                                        id='Scopes.Usage.Usage.api.context'
                                        defaultMessage='Context: '
                                    />
                                </Box>
                            </Typography>
                            <Typography component='div' className={classes.normalText}>
                                <Box fontWeight='fontWeightLight' m={1}>
                                    {api.context}
                                </Box>
                            </Typography>
                            <Typography className={classes.heading}>
                                <Box fontWeight='fontWeightBold' m={1}>
                                    <FormattedMessage
                                        id='Scopes.Usage.Usage.api.version'
                                        defaultMessage='Version: '
                                    />
                                </Box>
                            </Typography>
                            <Typography component='div' className={classes.normalText}>
                                <Box fontWeight='fontWeightLight' m={1}>
                                    {api.version}
                                </Box>
                            </Typography>
                            <Typography className={classes.heading}>
                                <Box fontWeight='fontWeightBold' m={1}>
                                    <FormattedMessage
                                        id='Scopes.Usage.Usage.api.provider'
                                        defaultMessage='Provider: '
                                    />
                                </Box>
                            </Typography>
                            <Typography component='div' className={classes.normalText}>
                                <Box fontWeight='fontWeightLight' m={1}>
                                    {api.provider}
                                </Box>
                            </Typography>
                        </ExpansionPanelSummary>
                    </ExpansionPanel>
                ))}
            </div>
        );
    }
}

CertificateUsageViewAPI.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    certUsage: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({}).isRequired,
};
