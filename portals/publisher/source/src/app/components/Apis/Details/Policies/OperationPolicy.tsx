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

import React, { FC, useState } from 'react';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
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

import { DragDropContext, DropResult } from "react-beautiful-dnd";
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import PolicyList from "./PolicyList";

interface Policy {
    id: number;
    name: string;
    description: string;
    flows: string[];
}

interface OPProps {
  operation : any;
  operationsDispatcher : any;
  highlight : any;
  api: any;
  disableUpdate: any;
  spec: any;
  target: any;
  verb: any;
  expandedResource: any;
  setExpandedResource: any;
}

const OperationPolicy: FC<OPProps> = ({ operation, operationsDispatcher, highlight, api, disableUpdate,
    spec, target, verb, expandedResource, setExpandedResource }) => {

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
            dialogPaper: {
                width: '800px',
                maxHeight: '800px',
            },
            dialogContent: {
                overflow: 'auto',
                height: '90%',
            },
        };
    });
    const classes = useStyles();

    const apiOperation = api.operations[target] && api.operations[target][verb.toUpperCase()];
    const isUsedInAPIProduct = apiOperation && Array.isArray(
        apiOperation.usedProductIds,
    ) && apiOperation.usedProductIds.length;

    const handleExpansion = (panel: any) => (event:any, isExpanded:any) => {
        setExpandedResource(isExpanded ? panel : false);
    };

        
    const [addPolicy, setAddPolicy] = useState<Policy>({id:0, name: "", description: "", flows: []});
    const [selectedPolicy, setSelectedPolicy] = useState<Policy>({id:0, name: "", description: "", flows: []});
    const [configPolicyMsg, setConfigPolicyMsg] = useState<string>('');
    const [policies, setPolicies] = useState<Array<Policy>>([
        {
            id: 1,
            name: 'Add Header',
            description: 'With this policy, user can add a new header to the request',
            flows: ['Request', 'Response', 'Fault']
        },
        {
            id: 2,
            name: 'Rewrite HTTP Method',
            description: 'User should be able to change the HTTP method of a resource',
            flows: ['Request']
        }
    ]);
    const [RequestFlowPolicies, setRequestFlowPolicies] = useState<Array<Policy>>([]);
    const [ResponseFlowPolicies, setResponseFlowPolicies] = useState<Array<Policy>>([]);
    const [FaultFlowPolicies, setFaultFlowPolicies] = useState<Array<Policy>>([]);

    const [openAddPolicyPopup, setAddPolicyPopup] = useState<boolean>(false);

    const toggleAddPolicyPopup = () => {
        setAddPolicyPopup(!openAddPolicyPopup);
    };
      
    const handleCloseAddPolicyPopup = () => {
        setAddPolicyPopup(false);
    };
      
    const handleAdd = (e: Policy) => {
        setAddPolicy(e);
        if (addPolicy) {
            setPolicies([...policies, e]);
        }
    };

    const onDragEnd = (result: DropResult) => {
        const { destination, source } = result;
      
        console.log(result);
      
        if (!destination) {
            return;
        }
      
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }
      
        let add;
        const policyList = policies;
        const requestFlowPolicies = RequestFlowPolicies;
        const responseFlowPolicies = ResponseFlowPolicies;
        const faultFlowPolicies = FaultFlowPolicies;
        // Source Logic
        if (source.droppableId === "PoliciesList") {
            add = policyList[source.index];
            policyList.splice(source.index, 1);
        } else if (source.droppableId === "RequestFlowPolicies") {
            add = requestFlowPolicies[source.index];
            requestFlowPolicies.splice(source.index, 1);
        } else if (source.droppableId === "ResponseFlowPolicies") {
            add = responseFlowPolicies[source.index];
            responseFlowPolicies.splice(source.index, 1);
        } else {
            add = faultFlowPolicies[source.index];
            faultFlowPolicies.splice(source.index, 1);
        }
      
        // Destination Logic
        if (destination.droppableId === "PoliciesList") {
            policyList.splice(destination.index, 0, add);
        } else if (destination.droppableId === "RequestFlowPolicies") {
            requestFlowPolicies.splice(destination.index, 0, add);
        } else if (destination.droppableId === "ResponseFlowPolicies") {
            responseFlowPolicies.splice(destination.index, 0, add);
        } else {
            faultFlowPolicies.splice(destination.index, 0, add);
        }
      
        setRequestFlowPolicies(requestFlowPolicies);
        setResponseFlowPolicies(responseFlowPolicies);
        setFaultFlowPolicies(faultFlowPolicies);
        setPolicies(policyList);
        toggleAddPolicyPopup();
        setSelectedPolicy(add);
        const msg = "Configure " + add.name + " Policy";
        setConfigPolicyMsg(msg);
    };

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
                        <Grid item md={4} style={{ display: 'flex', alignItems: 'center' }}>
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
                                component='div'
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
                <Divider light className={classes.customDivider} />
                <ExpansionPanelDetails>
                    <Grid spacing={2} container direction='row' justify='flex-start' alignItems='flex-start'>
                        {/* <Grid item xs={12} md={12}>
                            <Typography variant='subtitle1'>
                                Operation
                                {' '}
                                Policy
                                <Divider variant='middle' />
                            </Typography>
                        </Grid> */}
                        <Grid item xs={12} md={12}>
                            <DragDropContext onDragEnd={onDragEnd}>
                                <PolicyList
                                    policies={policies}
                                    setPolicies={setPolicies}
                                    RequestFlowPolicies={RequestFlowPolicies}
                                    setRequestFlowPolicies={setRequestFlowPolicies}
                                    ResponseFlowPolicies={ResponseFlowPolicies}
                                    setResponseFlowPolicies={setResponseFlowPolicies}
                                    FaultFlowPolicies={FaultFlowPolicies}
                                    setFaultFlowPolicies={setFaultFlowPolicies}
                                    handleAdd={handleAdd}
                                />
                            </DragDropContext>
                            <Grid container>
                                <Dialog
                                    open={openAddPolicyPopup}
                                    onClose={handleCloseAddPolicyPopup}
                                    aria-labelledby='form-dialog-title'
                                    classes={{ paper: classes.dialogPaper }}
                                >
                                    <DialogTitle id='form-dialog-title'>
                                        <FormattedMessage
                                            id='Apis.Details.Policies.PoliciesList.edit.policy'
                                            defaultMessage={configPolicyMsg}
                                        />
                                    </DialogTitle>
                                </Dialog>
                            </Grid>
                        </Grid>
                    </Grid>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        </>
    );
};

export default OperationPolicy;