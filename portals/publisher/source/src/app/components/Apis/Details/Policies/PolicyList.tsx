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

import React, { useState} from "react";
import {
    Button,
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import { AddCircle } from '@material-ui/icons';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import SinglePolicy from "./SinglePolicy";
import { Droppable } from "react-beautiful-dnd";
import { FormattedMessage } from 'react-intl';
import "./styles.css";
import CreatePolicy from './CreatePolicy';

interface TabPanelProps {
    children?: React.ReactNode;
    index: any;
    value: any;
  }
  
  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box p={3}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }
  
  function a11yProps(index: any) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }
  
  const useStyles = makeStyles((theme: Theme) => ({
    root: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.paper,
    },
    buttonIcon: {
        marginRight: theme.spacing(1),
    },
    addPolicyBtn: {
        marginLeft: theme.spacing(1),
    },
    dialogPaper: {
        width: '1800px',
        maxHeight: '800px',
    },
    dialogContent: {
        overflow: 'auto',
        height: '90%',
        width: '90%',
    },
  }));

interface Policy {
    id: number;
    policy: string;
    description: string;
    flows: string[];
    isDone: boolean;
}

interface props {
  policies: Array<Policy>;
  setPolicies: React.Dispatch<React.SetStateAction<Array<Policy>>>;
  setRequestFlowPolicies: React.Dispatch<React.SetStateAction<Array<Policy>>>;
  RequestFlowPolicies: Array<Policy>;
  setResponseFlowPolicies: React.Dispatch<React.SetStateAction<Array<Policy>>>;
  ResponseFlowPolicies: Array<Policy>;
  setFaultFlowPolicies: React.Dispatch<React.SetStateAction<Array<Policy>>>;
  FaultFlowPolicies: Array<Policy>;
  handleAdd: any;
}

const PolicyList: React.FC<props> = ({
  policies,
  setPolicies,
  RequestFlowPolicies,
  setRequestFlowPolicies,
  ResponseFlowPolicies,
  setResponseFlowPolicies,
  FaultFlowPolicies,
  setFaultFlowPolicies,
  handleAdd,
}) => {
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const [openAddPolicyPopup, setAddPolicyPopup] = useState<boolean>(false);
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const toggleAddPolicyPopup = () => {
    setAddPolicyPopup(!openAddPolicyPopup);
};

const handleCloseAddPolicyPopup = () => {
    setAddPolicyPopup(false);
};
  return (
        <Container>
            <Grid spacing={1} container direction='column' justify='flex-start' alignItems='stretch'>
                <Grid item xs={12} md={12}>
                    <Grid spacing={1} container direction='row' justify='flex-start' alignItems='stretch'>
                        <Grid item xs={12} md={12}>
                            <Typography variant='subtitle2'>
                                Request
                                {' '}
                                Flow
                            </Typography>
                            <ArrowForwardIcon/>
                            <Droppable droppableId="RequestFlowPolicies" direction="horizontal">
                                {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`policies  ${
                                    snapshot.isDraggingOver ? "dragcomplete" : "remove"
                                    }`}
                                >
                                    {RequestFlowPolicies?.map((policy, index) => (
                                    <SinglePolicy
                                        index={index}
                                        policies={RequestFlowPolicies}
                                        policy={policy}
                                        key={policy.id}
                                        setPolicies={setRequestFlowPolicies}
                                    />
                                    ))}
                                    {provided.placeholder}
                                </div>
                                )}
                            </Droppable>
                        </Grid>
                        <Grid item xs={12} md={12}>
                            <Typography variant='subtitle2'>
                                Response
                                {' '}
                                Flow
                            </Typography>
                            <ArrowBackIcon/>
                            <Droppable droppableId="ResponseFlowPolicies" direction="horizontal">
                            {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`policies ${
                                snapshot.isDraggingOver ? "dragcomplete" : "remove"
                                }`}
                            >
                                {ResponseFlowPolicies?.map((policy, index) => (
                                <SinglePolicy
                                    index={index}
                                    policies={ResponseFlowPolicies}
                                    policy={policy}
                                    key={policy.id}
                                    setPolicies={setResponseFlowPolicies}
                                />
                                ))}
                                {provided.placeholder}
                            </div>
                            )}
                            </Droppable>
                        </Grid>
                        <Grid item xs={12} md={12}>
                            <Typography variant='subtitle2'>
                                Fault
                                {' '}
                                Flow
                            </Typography>
                            <ArrowBackIcon/>
                            <Droppable droppableId="FaultFlowPolicies" direction="horizontal">
                            {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`policies ${
                                snapshot.isDraggingOver ? "dragcomplete" : "remove"
                                }`}
                            >
                                {FaultFlowPolicies?.map((policy, index) => (
                                <SinglePolicy
                                    index={index}
                                    policies={FaultFlowPolicies}
                                    policy={policy}
                                    key={policy.id}
                                    setPolicies={setFaultFlowPolicies}
                                />
                                ))}
                                {provided.placeholder}
                            </div>
                            )}
                            </Droppable>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} md={12}>
                    <Card variant='outlined'>
                        <CardContent>
                            <Grid item xs={12} style={{ position: 'relative' }}>
                                <Typography variant='subtitle2'>
                                    Policies
                                    {' '}
                                    List
                                </Typography>
                                <AppBar position="static">
                                    <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
                                    <Tab label="Request Flow" {...a11yProps(0)} />
                                    <Tab label="Response Flow" {...a11yProps(1)} />
                                    <Tab label="Fault Flow" {...a11yProps(2)} />
                                    </Tabs>
                                </AppBar>
                                <TabPanel value={value} index={0}>
                                    <Droppable droppableId="PoliciesList" direction="vertical">
                                    {(provided, snapshot) => (
                                    <div
                                        className={`policiesColumn ${snapshot.isDraggingOver ? "dragactive" : ""}`}
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        {policies?.map((policy, index) => (
                                        <SinglePolicy
                                            index={index}
                                            policies={policies}
                                            policy={policy}
                                            key={policy.id}
                                            setPolicies={setPolicies}
                                        />
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                    )}
                                    </Droppable>
                                </TabPanel>
                                <TabPanel value={value} index={1}>
                                    <Droppable droppableId="PoliciesList" direction="vertical">
                                    {(provided, snapshot) => (
                                    <div
                                        className={`policiesColumn ${snapshot.isDraggingOver ? "dragactive" : ""}`}
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        {policies?.map((policy, index) => (
                                        <SinglePolicy
                                            index={index}
                                            policies={policies}
                                            policy={policy}
                                            key={policy.id}
                                            setPolicies={setPolicies}
                                        />
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                    )}
                                    </Droppable>
                                </TabPanel>
                                <TabPanel value={value} index={2}>
                                    <Droppable droppableId="PoliciesList" direction="vertical">
                                    {(provided, snapshot) => (
                                    <div
                                        className={`policiesColumn ${snapshot.isDraggingOver ? "dragactive" : ""}`}
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        {policies?.map((policy, index) => (
                                        <SinglePolicy
                                            index={index}
                                            policies={policies}
                                            policy={policy}
                                            key={policy.id}
                                            setPolicies={setPolicies}
                                        />
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                    )}
                                    </Droppable>
                                </TabPanel>
                                <Grid container>
                                    <Button
                                        onClick={toggleAddPolicyPopup}
                                        disabled={false}
                                        variant='outlined'
                                        color='primary'
                                        size='small'
                                        className={classes.addPolicyBtn}
                                    >
                                        <AddCircle className={classes.buttonIcon} />
                                        <FormattedMessage
                                            id='Apis.Details.Policies.PoliciesList.new.policy'
                                            defaultMessage='Add New Policy'
                                        />
                                    </Button>
                                </Grid>
                                <Grid container>
                                    <Dialog
                                        open={openAddPolicyPopup}
                                        onClose={handleCloseAddPolicyPopup}
                                        aria-labelledby='form-dialog-title'
                                        classes={{ paper: classes.dialogPaper }}
                                        fullWidth
                                        maxWidth="md"
                                    >
                                        <DialogTitle id='form-dialog-title'>
                                            <FormattedMessage
                                                id='Apis.Details.Policies.PoliciesList.new.policy'
                                                defaultMessage='Add New Policy'
                                            />
                                        </DialogTitle>
                                        <DialogContent className={classes.dialogContent}>
                                        <CreatePolicy 
                                            handleAdd={handleAdd}
                                            handleCloseAddPolicyPopup={handleCloseAddPolicyPopup}
                                        />
                                        </DialogContent>
                                    </Dialog>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
  );
};

export default PolicyList;