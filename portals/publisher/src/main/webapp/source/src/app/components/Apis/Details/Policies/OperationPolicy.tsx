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
import { styled, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { Accordion, AccordionSummary } from '@mui/material';
import { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Utils from 'AppData/Utils';
import Badge from '@mui/material/Badge';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { FormattedMessage } from 'react-intl';
import PoliciesExpansion from './PoliciesExpansion';
import type { Policy, PolicySpec } from './Types'

const PREFIX = 'OperationPolicy';

const classes = {
    wrapper: `${PREFIX}-wrapper`,
    customButton: `${PREFIX}-customButton`,
    paperStyles: `${PREFIX}-paperStyles`,
    highlightSelected: `${PREFIX}-highlightSelected`,
    contentNoMargin: `${PREFIX}-contentNoMargin`,
    targetText: `${PREFIX}-targetText`,
    operationSummaryGrid: `${PREFIX}-operationSummaryGrid`
};


const Root = styled('div')(({ theme }: { theme: any }) => ({
    [`&.${classes.wrapper}`]: {
        width: '100%',
    },
    [`& .${classes.customButton}`]: {
        // '&:hover': { backgroundColor },
        width: theme.spacing(12),
    },
    [`& .${classes.paperStyles}`]: {
        borderBottom: '',
        width: '100%',
    },
    [`& .${classes.contentNoMargin}`]: {
        margin: theme.spacing(0),
    },
    [`& .${classes.targetText}`]: {
        maxWidth: 300,
        margin: '0px 20px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        display: 'inline-block',
    },
    [`& .${classes.operationSummaryGrid}`]: {
        display: 'flex',
        alignItems: 'center',
        flexBasis: '100%',
        maxWidth: '100%',
    }
}));

interface OperationPolicyProps {
    target: string;
    verb: string;
    operation: any;
    highlight: any;
    api: any;
    disableUpdate: any;
    expandedResource: string | null;
    setExpandedResource: React.Dispatch<React.SetStateAction<string | null>>;
    policyList: Policy[];
    allPolicies: PolicySpec[] | null;
    isChoreoConnectEnabled: boolean;
}

const OperationPolicy: FC<OperationPolicyProps> = ({
    operation, highlight, api, target, verb, expandedResource, setExpandedResource,
    policyList, allPolicies, isChoreoConnectEnabled
}) => {
    const apiOperation = api.operations[target] && api.operations[target][verb.toUpperCase()];
    const isUsedInAPIProduct = apiOperation && Array.isArray(
        apiOperation.usedProductIds,
    ) && apiOperation.usedProductIds.length;
    const theme: any = useTheme();
    const backgroundColor = theme.custom.resourceChipColors[verb];

    const handleExpansion = (panel: string) => (event: any, isExpanded: boolean) => {
        setExpandedResource(isExpanded ? panel : null);
    };

    const renderUsedInApiProducts = () => {
        return (isUsedInAPIProduct) ? (
            <Grid item md={3}>
                <Box display='flex' justifyContent='center'>
                    <ReportProblemOutlinedIcon fontSize='small' />
                    <Box display='flex' ml={1} mt={1 / 4} fontSize='caption.fontSize'>
                        <FormattedMessage
                            id='Apis.Details.Policies.OperationPolicy.operation.used.in.products'
                            defaultMessage='This operation is used in {isUsedInAPIProduct} API product(s)'
                            values={{ isUsedInAPIProduct }}
                        />
                    </Box>
                </Box>
            </Grid>
        ) : (
            <Grid item md={3} />
        );
    }

    return (
        (<Root className={classes.wrapper}>
            <Accordion
                expanded={expandedResource === verb + target}
                onChange={handleExpansion(verb + target)}
                disabled={false}
                className={classes.paperStyles}
                sx={{ border: `1px solid ${backgroundColor}` }}
            >
                <AccordionSummary
                    sx={highlight ? { backgroundColor: Utils.hexToRGBA(backgroundColor, 0.1) } : { }}
                    disableRipple
                    disableTouchRipple
                    expandIcon={<ExpandMoreIcon />}
                    id={verb + target}
                    classes={{ content: classes.contentNoMargin }}
                >
                    <Grid container direction='row' justifyContent='space-between' alignItems='center' spacing={0}>
                        <Grid item className={classes.operationSummaryGrid} sx={{ border: '1px solid green c'}}>
                            <Badge
                                invisible={!operation['x-wso2-new']}
                                color='error'
                                variant='dot'
                                style={{ display: 'inline-block' }}
                            >
                                <Button
                                    disableFocusRipple
                                    variant='contained'
                                    aria-label={'HTTP verb ' + verb}
                                    size='small'
                                    className={classes.customButton}
                                    sx={{ backgroundColor, color: theme.palette.getContrastText(backgroundColor)}}
                                >
                                    {verb}
                                </Button>
                            </Badge>
                            <Typography
                                display='inline'
                                variant='h6'
                                gutterBottom
                                className={classes.targetText}
                                title={target}
                            >
                                {target}
                                {(operation.summary && operation.summary !== '') && (
                                    <Typography
                                        display='inline'
                                        style={{ margin: '0px 30px' }}
                                        variant='caption'
                                        gutterBottom
                                    >
                                        {operation.summary}
                                    </Typography>
                                )}
                            </Typography>
                        </Grid>
                        {renderUsedInApiProducts}
                    </Grid>
                </AccordionSummary>
                <Divider sx={{ backgroundColor }} />
                <PoliciesExpansion
                    target={target}
                    verb={verb}
                    allPolicies={allPolicies}
                    isChoreoConnectEnabled={isChoreoConnectEnabled}
                    policyList={policyList}
                    isAPILevelPolicy={false}
                />
            </Accordion>
        </Root>)
    );
};

export default OperationPolicy;
