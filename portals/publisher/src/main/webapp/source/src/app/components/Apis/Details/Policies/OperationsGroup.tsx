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
import { styled } from '@mui/material/styles';
import { Accordion, AccordionSummary, AccordionDetails , Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const PREFIX = 'OperationGroup';

const classes = {
    tagClass: `${PREFIX}-tagClass`
};

const StyledBox = styled(Box)((
    {
        theme
    }
) => ({
    [`& .${classes.tagClass}`]: {
        maxWidth: 1000,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        [theme.breakpoints.down('lg')]: {
            maxWidth: 800,
        },
    }
}));

interface OperationGroupProps {
    openAPI: any;
    children: any;
    tag: string;
}

const OperationGroup: FC<OperationGroupProps> = ({
    openAPI, children, tag
}) => {

    const currentTagInfo = openAPI.tags && openAPI.tags.find((tagInfo: any) => tagInfo.name === tag);
    const borderColor = "";

    return (
        <StyledBox m={1} p={0.1} mt={1.5} sx={{ boxShadow: 0.5, bgcolor: borderColor, borderRadius: 1 }}>
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} id={tag}>
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
                </AccordionSummary>
                <AccordionDetails>{children}</AccordionDetails>
            </Accordion>
        </StyledBox>
    );
};

export default OperationGroup;
