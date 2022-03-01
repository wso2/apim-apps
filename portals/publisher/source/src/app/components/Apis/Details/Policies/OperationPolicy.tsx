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

import React, { FC, useContext, useEffect, useState } from 'react';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { makeStyles } from '@material-ui/core/styles';
import Utils from 'AppData/Utils';
import Badge from '@material-ui/core/Badge';
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined';
import { FormattedMessage } from 'react-intl';
import PolicyDropzone from './PolicyDropzone';
import PoliciesExpansion from './PoliciesExpansion';
import type { AttachedPolicy, Policy, PolicySpec } from './Types'
import ApiOperationContext from './ApiOperationContext';
import FlowArrow from './components/FlowArrow';

interface OPProps {
    operation: any;
    highlight: any;
    api: any;
    disableUpdate: any;
    target: any;
    verb: any;
    expandedResource: any;
    setExpandedResource: any;
    policyList: Policy[];
    allPolicies: PolicySpec[] | null;
    isChoreoConnectEnabled: boolean;
    isGatewayChanged: boolean;
}

const OperationPolicy: FC<OPProps> = ({
    operation, highlight, api, target, verb, expandedResource, setExpandedResource, policyList, allPolicies, isChoreoConnectEnabled, isGatewayChanged
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
            linearProgress: {
                height: '2px',
            },
            highlightSelected: {
                backgroundColor: Utils.hexToRGBA(backgroundColor, 0.1),
            },
            contentNoMargin: {
                margin: theme.spacing(0),
            },
            overlayUnmarkDelete: {
                position: 'absolute',
                zIndex: theme.zIndex.operationDeleteUndo,
                right: '10%',
            },
            targetText: {
                maxWidth: 300,
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
            dialogPaper: {
                width: '800px',
                maxHeight: '800px',
            },
            dialogContent: {
                overflow: 'auto',
                height: '90%',
            },
            flowSpecificPolicyAttachGrid: {
                marginTop: theme.spacing(1),
                overflowX: 'scroll'
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
    const { apiOperations } = useContext<any>(ApiOperationContext);

    const apiOperation = api.operations[target] && api.operations[target][verb.toUpperCase()];
    const isUsedInAPIProduct = apiOperation && Array.isArray(
        apiOperation.usedProductIds,
    ) && apiOperation.usedProductIds.length;

    // Policies attached for each request, response and fault flow
    const [requestFlowPolicyList, setRequestFlowPolicyList] = useState<AttachedPolicy[]>([]);
    const [responseFlowPolicyList, setResponseFlowPolicyList] = useState<AttachedPolicy[]>([]);
    const [faultFlowPolicyList, setFaultFlowPolicyList] = useState<AttachedPolicy[]>([]);

    // Droppable policy identifier list for each request, response and fault flow
    const [requestFlowDroppablePolicyList, setRequestFlowDroppablePolicyList] = useState<string[]>([]);
    const [responseFlowDroppablePolicyList, setResponseFlowDroppablePolicyList] = useState<string[]>([]);
    const [faultFlowDroppablePolicyList, setFaultFlowDroppablePolicyList] = useState<string[]>([]);

    useEffect(() => {
        const requestList = [];
        const responseList = [];
        const faultList = [];
        for (const policy of policyList) {
            if (policy.applicableFlows.includes('request')) {
                requestList.push(`policyCard-${policy.id}`);
            }
            if (policy.applicableFlows.includes('response')) {
                responseList.push(`policyCard-${policy.id}`);
            }
            if (policy.applicableFlows.includes('fault')) {
                faultList.push(`policyCard-${policy.id}`);
            }
        }
        setRequestFlowDroppablePolicyList(requestList);
        setResponseFlowDroppablePolicyList(responseList);
        setFaultFlowDroppablePolicyList(faultList);
    }, [policyList])

    useEffect(() => {
        const operationInAction = apiOperations.find((op: any) =>
            op.target === target && op.verb.toLowerCase() === verb.toLowerCase());

        // Populate request flow attached policy list
        const requestFlowList: AttachedPolicy[] = [];
        const requestFlow = operationInAction.operationPolicies.request;
        requestFlow.map((requestFlowAttachedPolicy: any) => {
            const { policyId, policyName, uuid } = requestFlowAttachedPolicy;
            const policyObj = allPolicies?.find((policy: PolicySpec) => policy.id === policyId)
                || allPolicies?.find((policy1: PolicySpec) => policy1.name === policyName);
            if (policyObj) {
                requestFlowList.push({ ...policyObj, uniqueKey: uuid });
            }
        })
        setRequestFlowPolicyList(requestFlowList);

        // Populate response flow attached policy list
        const responseFlowList: AttachedPolicy[] = [];
        const responseFlow = operationInAction.operationPolicies.response;
        responseFlow.map((responseFlowAttachedPolicy: any) => {
            const { policyId, policyName, uuid } = responseFlowAttachedPolicy;
            const policyObj = allPolicies?.find((policy: PolicySpec) => policy.id === policyId)
                || allPolicies?.find((policy1: PolicySpec) => policy1.name === policyName);
            if (policyObj) {
                responseFlowList.push({ ...policyObj, uniqueKey: uuid });
            }
        })
        setResponseFlowPolicyList(responseFlowList);

        // Populate fault flow attached policy list
        const faultFlowList: AttachedPolicy[] = [];
        const faultFlow = operationInAction.operationPolicies.fault;
        faultFlow.map((faultFlowAttachedPolicy: any) => {
            const { policyId, policyName, uuid } = faultFlowAttachedPolicy;
            const policyObj = allPolicies?.find((policy: PolicySpec) => policy.id === policyId)
                || allPolicies?.find((policy1: PolicySpec) => policy1.name === policyName);
            if (policyObj) {
                faultFlowList.push({ ...policyObj, uniqueKey: uuid });
            }
        })
        setFaultFlowPolicyList(faultFlowList);

    }, [apiOperations])

    const handleExpansion = (panel: string) => (event: object, isExpanded: boolean) => {
        setExpandedResource(isExpanded ? panel : false);
    };

    return (
        <>
            <ExpansionPanel
                expanded={expandedResource === verb + target}
                onChange={handleExpansion(verb + target)}
                disabled={false}
                className={classes.paperStyles}
            >
                {isChoreoConnectEnabled ?
                    (
                        <>
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
                                {(isUsedInAPIProduct) ? (
                                    <Grid item md={3}>
                                        <Box display='flex' justifyContent='center'>
                                            <ReportProblemOutlinedIcon fontSize='small' />
                                            <Box display='flex' ml={1} mt={1 / 4} fontSize='caption.fontSize'>
                                                <FormattedMessage
                                                    id={'Apis.Details.Resources.components.Operation.this.operation.'
                                                        + 'used.in.products'}
                                                    defaultMessage={'This operation is used in {isUsedInAPIProduct} API '
                                                        + 'product(s)'}
                                                    values={{ isUsedInAPIProduct }}
                                                />
                                            </Box>
                                        </Box>
                                    </Grid>
                                ) : (
                                    <Grid item md={3} />
                                )}
                            </Grid>
                        </>
                    ) :
                    (
                        <>
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
                                    {(isUsedInAPIProduct) ? (
                                        <Grid item md={3}>
                                            <Box display='flex' justifyContent='center'>
                                                <ReportProblemOutlinedIcon fontSize='small' />
                                                <Box display='flex' ml={1} mt={1 / 4} fontSize='caption.fontSize'>
                                                    <FormattedMessage
                                                        id={'Apis.Details.Resources.components.Operation.this.operation.'
                                                            + 'used.in.products'}
                                                        defaultMessage={'This operation is used in {isUsedInAPIProduct} API '
                                                            + 'product(s)'}
                                                        values={{ isUsedInAPIProduct }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Grid>
                                    ) : (
                                        <Grid item md={3} />
                                    )}
                                </Grid>
                            </ExpansionPanelSummary>
                        </>
                    )
                }
                <Divider light className={classes.customDivider} />
                {!isChoreoConnectEnabled ? (
                    <PoliciesExpansion
                        target={target}
                        verb={verb}
                        allPolicies={allPolicies}
                        isChoreoConnectEnabled={isChoreoConnectEnabled}
                        policyList={policyList}
                        isGatewayChanged={isGatewayChanged}
                    />) : <></>}
            </ExpansionPanel>
        </>
    );
};

export default OperationPolicy;
