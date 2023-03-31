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
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { makeStyles } from '@material-ui/core/styles';
import Utils from 'AppData/Utils';
import Badge from '@material-ui/core/Badge';
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined';
import { FormattedMessage } from 'react-intl';
import PoliciesExpansion from './PoliciesExpansion';
import type { Policy, PolicySpec } from './Types'

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
    const useStyles = makeStyles((theme: any) => {
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
                width: '100%',
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
                maxWidth: 300,
                margin: '0px 20px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                display: 'inline-block',
            },
            operationSummaryGrid: {
                display: 'flex',
                alignItems: 'center',
                flexBasis: '100%',
                maxWidth: '100%',
            }
        };
    });

    const classes = useStyles();

    const apiOperation = api.operations[target] && api.operations[target][verb.toUpperCase()];
    const isUsedInAPIProduct = apiOperation && Array.isArray(
        apiOperation.usedProductIds,
    ) && apiOperation.usedProductIds.length;

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
        <>
            <ExpansionPanel
                expanded={expandedResource === verb + target}
                onChange={handleExpansion(verb + target)}
                disabled={false}
                className={classes.paperStyles}
            >
                <ExpansionPanelSummary
                    className={highlight ? classes.highlightSelected : ''}
                    disableRipple
                    disableTouchRipple
                    expandIcon={<ExpandMoreIcon />}
                    id={verb + target}
                    classes={{ content: classes.contentNoMargin }}
                >
                    <Grid container direction='row' justify='space-between' alignItems='center' spacing={0}>
                        <Grid item md={4} className={classes.operationSummaryGrid}>
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
                </ExpansionPanelSummary>
                <Divider light className={classes.customDivider} />
                <PoliciesExpansion
                    target={target}
                    verb={verb}
                    allPolicies={allPolicies}
                    isChoreoConnectEnabled={isChoreoConnectEnabled}
                    policyList={policyList}
                    isAPILevelPolicy={false}
                />
            </ExpansionPanel>
        </>
    );
};

export default OperationPolicy;
