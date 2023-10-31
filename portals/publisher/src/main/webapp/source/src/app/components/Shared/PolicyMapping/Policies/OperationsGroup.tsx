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

import React, { FC } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Box } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    tagClass: {
        maxWidth: 1000,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        [theme.breakpoints.down('md')]: {
            maxWidth: 800,
        },
    },
}));

interface OperationGroupProps {
    openAPI: any;
    children: any;
    tag: string;
}

const OperationGroup: FC<OperationGroupProps> = ({
    openAPI, children, tag
}) => {
    const classes = useStyles();
    const currentTagInfo = openAPI.tags && openAPI.tags.find((tagInfo: any) => tagInfo.name === tag);
    let borderColor = "";

    return (
        <Box m={1} p={0.1} mt={1.5} sx={{ boxShadow: 0.5, bgcolor: borderColor, borderRadius: 1 }}>
            <ExpansionPanel defaultExpanded>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} id={tag}>
                    <Typography
                        variant='h4'
                        className={classes.tagClass}
                        title={tag}
                    >
                        {tag}
                    </Typography>
                    <Typography style={{ margin: '0px 10px' }} variant='caption'>
                        {' '}
                    </Typography>
                    {currentTagInfo && (
                        <Typography style={{ margin: '0px 30px' }} variant='caption'>
                            {currentTagInfo.description}
                        </Typography>
                    )}
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>{children}</ExpansionPanelDetails>
            </ExpansionPanel>
        </Box>
    );
};

export default OperationGroup;
