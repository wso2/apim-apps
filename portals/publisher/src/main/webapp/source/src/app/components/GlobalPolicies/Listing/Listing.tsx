/*
* Copyright (c) 2023, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
* 
* WSO2 LLC. licenses this file to you under the Apache License,
* Version 2.0 (the "License"); you may not use this file except
* in compliance with the License.
* You may obtain a copy of the License at
* 
* http://www.apache.org/licenses/LICENSE-2.0
* 
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import React, { useState, useEffect } from 'react';
import {
    Button,
    Grid,
    IconButton,
    Tooltip,
    Typography,
    makeStyles,
    Chip,
    TableContainer,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    useTheme 
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import APIMAlert from 'AppComponents/Shared/Alert';
import Icon from '@material-ui/core/Icon';
import API from 'AppData/api';
import { Progress } from 'AppComponents/Shared';
import { FormattedMessage } from 'react-intl';
import AddCircle from '@material-ui/icons/AddCircle';
import MUIDataTable, { MUIDataTableOptions, MUIDataTableColumnDef } from 'mui-datatables';
import Box from '@material-ui/core/Box';
import OnboardingMenuCard from 'AppComponents/Shared/Onboarding/OnboardingMenuCard';
import Onboarding from 'AppComponents/Shared/Onboarding/Onboarding';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import ResourceNotFoundError from 'AppComponents/Base/Errors/ResourceNotFoundError';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    table: {
        marginLeft: 'auto',
        marginRight: 'auto',
        '& > td[class^=MUIDataTableBodyCell-cellHide-]': {
            display: 'none',
        },
        '& .MUIDataTableBodyCell-cellHide-793': {
            display: 'none',
        },
        '& td': {
            wordBreak: 'break-word',
        },
        '& th': {
            minWidth: '150px',
        },
    },
    heading: {
        flexGrow: 1,
        marginTop: 10,
    },
    titleWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    mainTitle: {
        paddingLeft: 0,
    },
    buttonIcon: {
        marginRight: theme.spacing(1),
    },
    button: {
        width: '112px',
    },
    icon: {
        marginRight: theme.spacing(0.5),
    },
    chip: {
        marginRight: '8px'
    },
    gatewayChip: {
        width: '200px', 
        justifyContent: 'center'
    },
    dialogBackdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.08)'
    },
    dialogPaper: {
        boxShadow: 'none'
    },
    tableContainer: {
        maxWidth: '400px'
    },
}));

interface Policy {
    id: string;
    description: string;
    displayName: string;
    appliedGatewayLabels: string[];
}

interface Deployment {
    gatewayLabel: string; 
    gatewayDeployment: boolean;
}

interface Environment {
    id: string;
    name: string;
    displayName: string;
    type: string;  
    serverUrl: string;
    provider: string;
    showInApiConsole: boolean;
    vhosts: any;
    endpointURIs: any;
    additionalProperties: any;
}

/**
 * Global policies Lisitng Page.
 * @returns {TSX} - Listing Page.
 */
const Listing: React.FC = () => {
    const classes = useStyles();
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [loading, setLoading] = useState(false);
    const [notFound, setnotFound] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPolicyName, setSelectedPolicyName] = useState('');
    const [selectedPolicyId, setSelectedPolicyId] = useState('');
    const theme : any = useTheme();
    const { globalPolicyAddIcon } = theme.custom.landingPage.icons;

    /**
     * Fetch the data from the backend to the compoenent.
     */
    const fetchGlobalPolicies = () => {
        setLoading(true);
        // Due to a bug in current backend, we pass 0, 10 as a workaround for now
        const promisedPolicies = API.getAllGatewayPolicies(0,  30);
        promisedPolicies
            .then((response: any) => {
                setPolicies(response.body.list);
                setLoading(false);
            })
            .catch((/* error */) => {
                // console.error(error);
                APIMAlert.error('Error while fetching policies');
                setnotFound(true);
                setLoading(false);
            })
    };

    /**
     * Fetch environements publisher settings from the backend to the compoenent.
     * This data has been used to get the full gateway environment list.
     */
    const fetchSettings = () => {
        setLoading(true);
        const promisedSettings = API.getSettings();
        promisedSettings
            .then((response: any) => {
                setEnvironments(response.environment);
            })
            .catch((/* error */) => {
                // console.error(error);
                APIMAlert.error('Error while fetching settings');
                setnotFound(true);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    /**
     * Check if the gateway is deployed for the Golbal Policy.
     * @param {string} gateway - Gateway.
     * @param {string[]} appliedGatewayLabels - Applied Gateway Labels.
     * @returns {boolean} - Return true if deployed.
     */
    const isDeployed = (gateway: string, appliedGatewayLabels: string[]) => {
        if (appliedGatewayLabels.includes(gateway)) {
            return true;
        }
        return false;
    }

    /**
    * Get the applied gateway labels as an array list for a specific policy by ID.
    * @param {string} id - Policy Identifier.
    * @returns {string[]} - Applied Gateway labels list.
    */
    const getAppliedGatewayLabelsById = (id: string) => {
        const policy = policies.find(item => item.id === id);
        return policy ? policy.appliedGatewayLabels : [];
    }

    /**
    * Get the deployment array for a specific policy by ID. Below is an example.
    * [{"gatewayLabel": "A","gatewayDeployment": false},{"B": "GateWay1","gatewayDeployment": false}].
    * @param {string} policyId - Policy Identifier.
    * @returns {Deployment[]} - Deployment array.
    */
    const getDeploymentArray = (policyId: string) => {
        const appliedGatewayList = getAppliedGatewayLabelsById(policyId);
        const allGatewayList = environments.map((env: any) => {
            return env.name;
        });
        return allGatewayList.map(gatewayLabel => ({
            gatewayLabel,
            gatewayDeployment: appliedGatewayList.includes(gatewayLabel),
        }));
    }

    /**
     * Toggle the deployment status of a specific gateway for a specific policy.
     * If false, it will become true (depolying) and vice versa (undeploying).
     * @param {Deployment[]} deploymentArray - Array which contains Labels and it's boolean value.
     * @param {string} environment - Gateway environment which is required to be toggled.
     * @returns {Deployment[]} - Output array.
     */
    const toggleGatewayDeployment = (deploymentArray: Deployment[], environment: string) => {
        const updatedArray = deploymentArray.map(item => {
            if (item.gatewayLabel === environment) {
                return { ...item, gatewayDeployment: !item.gatewayDeployment };
            }
            return item;
        });
        return updatedArray;
    };

    /**
     * Function to add a label to a specific policy in UI.
     * @param {string} policyId - Policy Identifier.
     * @param {string} newLabel - Newly added enviroment/gateway to applied Gateway Labels.
     */
    const addLabelToPolicy = (policyId: string, newLabel: string) => {
        const updatedPolicies = policies.map((policy) => {
            if (policy.id === policyId) {
                return {
                    ...policy,
                    appliedGatewayLabels: [...policy.appliedGatewayLabels, newLabel],
                };
            }
            return policy;
        });
        setPolicies(updatedPolicies);
    };

    /**
     * Function to remove a label from a specific policy in UI.
     * @param {string} policyId - Policy Identifier.
     * @param {string} labelToRemove - Removing enviroment/gateway from applied Gateway Labels.
     */
    const removeLabelFromPolicy = (policyId: string, labelToRemove: string) => {
        const updatedPolicies = policies.map((policy) => {
            if (policy.id === policyId) {
                return {
                    ...policy,
                    appliedGatewayLabels: policy.appliedGatewayLabels.filter((label) => label !== labelToRemove),
                };
            }
            return policy;
        });
        setPolicies(updatedPolicies);
    };

    /**
     * Function to undeploy a policy mapping to another enviroment/gateway.
     * @param {string} gatewayPolicyMappingId - Policy Identifier.
     * @param {string} environement - Deploying enviroment/gateway.
     * @param {boolean} deploying - Deploying or undeploying.
     */
    const deployOrUndeploy = (gatewayPolicyMappingId: string, environement: string, deploying: boolean) => {
        setLoading(true);
        const deploymentArray = getDeploymentArray(gatewayPolicyMappingId);
        const updatedDeploymentArray = toggleGatewayDeployment(deploymentArray, environement);
        /**
         * call the backend API and handle the response
         */
        const promise = API.engageGlobalPolicy(gatewayPolicyMappingId, updatedDeploymentArray);
        promise
            .then((response) => {
                if (response.status === 200 || response.status === 201) {
                    setLoading(false);
                    if (deploying) {
                        APIMAlert.success('Policy deployed successfully');    
                        /**
                         * If successful, add to the state rather than getting from backend.
                         */
                        addLabelToPolicy(gatewayPolicyMappingId, environement);                
                    } else {
                        APIMAlert.success('Policy undeployed successfully');    
                        /**
                         * If successful, remove from the state rather than getting from backend.
                         */
                        removeLabelFromPolicy(gatewayPolicyMappingId, environement);                
                    }           
                }
                else {
                    APIMAlert.error(response.body.message);
                }                
            })
            .catch((error) => {
                console.error(error);
                if (deploying) {
                    APIMAlert.error('Error occurred while deploying the policy');
                } else {
                    APIMAlert.error('Error occurred while undeploying the policy');
                }
            })         
        setLoading(false);
    }

    /**
     * Function to delete a policy mapping
     * @param {string} gatewayPolicyMappingId - Policy Identifier.
     */
    const deletePolicy = (gatewayPolicyMappingId: string) => {
        setIsDialogOpen(false);
        setLoading(true);
        /**
         * call the backend API and handle the response
         */
        const promise = API.deleteGatewayPolicyByPolicyId(gatewayPolicyMappingId);
        promise
            .then(() => {
                /**
                 * If successful, remove from the state rather than getting from backend.
                 */
                const updatedPolicies = policies.filter((policy) => policy.id !== gatewayPolicyMappingId);
                setPolicies(updatedPolicies);
                APIMAlert.success('Policy deleted successfully');
                setLoading(false);
            })
            .catch((/* error */) => {
                // console.error(error);
                APIMAlert.error('Error while deleting the policy');
                setLoading(false);
            });    
    }

    useEffect(() => {
        fetchGlobalPolicies();
        fetchSettings();
    }, []);

    /**
     * Get the Global Policy edit link.
     * @param {string} policyId - Policy Identifier.
     * @returns {string} - Url for the Global Policy edit.
     */
    const getEditUrl = (policyId: string) => {
        return `/global-policies/${policyId}/edit`;
    };

    /**
     * Sorts an array of Policy objects by their display names in ascending order.
     * @param {Policy[]} policies - An array of Policy objects to be sorted.
     * @returns {Policy[]} - The sorted array of Policy objects.
     */
    policies?.sort((a: Policy, b: Policy) => a.displayName.localeCompare(b.displayName));


    const policiesList = policies;

    /**
     * Make a short version for 20+ character strings.
     * @param {string} name - Any string (Ex: Gateway Label)
     * @returns {string} - First 20 characters and if exceeded, three dots for the rest.
     */
    const shortName = (name: string) => {
        if (name.length > 20) {
            return `${name.substring(0, 20)}...`;
        }
        return name;
    }

    /**
     * Columns for the MUI table.
     */
    const columns: MUIDataTableColumnDef[] = [
        {
            name: 'id',
            options: {
                display: 'excluded',
                filter: false,
            },
        },
        {
            name: 'displayName',
            label: 'Global Policy',
        },
        /**
         * Deployed Gateway Column.
         */
        {
            name: 'appliedGatewayLabels',
            label: 'Deployed Gateways',
            options: {
                customBodyRender: (value: string[] | undefined) => {
                    if (value && value.length > 0) {
                        return (
                            <div>
                                {value.map((gateway: string) => (
                                    <Chip 
                                        key={gateway} 
                                        label={gateway} 
                                        variant='outlined' 
                                        className={classes.chip}
                                    />
                                ))}
                            </div>
                        );
                    } else {
                        return "No deployed gateways";
                    }
                }
            }      
        },
        /**
         * Action Column.
         */
        {
            name: 'Actions',
            options: {
                customBodyRender: (value: any, tableMeta: any) => {
                    const policyId = tableMeta.rowData[0];
                    const policyName = tableMeta.rowData[1];

                    /**
                     * Handle deletion. If verifications are passed, it will open the dialog box for the confirmation.
                     */
                    const handleDeleteClick = () => {
                        // If there is active depoloyments, we need to block the deletion
                        const appliedGatewayList = getAppliedGatewayLabelsById(policyId);
                        if (appliedGatewayList.length > 0){
                            APIMAlert.error((appliedGatewayList.length === 1) ? 
                                'An active deployment is available' 
                                : 'Active deployments are available');
                        }
                        else {
                            setSelectedPolicyId(policyId);
                            setSelectedPolicyName(policyName);
                            setIsDialogOpen(true);
                        }
                    };

                    return (
                        <Box display='flex' flexDirection='row'>
                            <Button
                                aria-label='Edit'
                                component={Link}
                                to={getEditUrl(policyId)}
                            >
                                <Icon className={classes.icon}>
                                    edit
                                </Icon>
                                <FormattedMessage
                                    id='GlobalPolicies.Listing.table.header.actions.edit'
                                    defaultMessage='Edit'
                                />
                            </Button>
                            <>
                                <Button
                                    aria-label='Delete'
                                    onClick={handleDeleteClick}
                                >
                                    <Icon className={classes.icon}>
                                        delete
                                    </Icon>
                                    <FormattedMessage
                                        id='GlobalPolicies.Listing.table.header.actions.delete'
                                        defaultMessage='Delete'
                                    />
                                </Button>
                                {/**
                                 * Dialog box (Modal or Pop up) which as for the confirmation to delete.
                                 */}
                                <Dialog open={isDialogOpen} 
                                    BackdropProps={{ className: classes.dialogBackdrop }}
                                    PaperProps={{ className: classes.dialogPaper }}
                                >
                                    <DialogTitle>Confirm Delete</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            Are you sure you want to delete {selectedPolicyName}?
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={() => setIsDialogOpen(false)} color='primary'>
                                            Cancel
                                        </Button>
                                        <Button onClick={() => deletePolicy(selectedPolicyId)} color='primary'>
                                            Delete
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </>
                        </Box>
                    );                
                },
                filter: false,
                sort: false,
            },
        },
    ];

    /**
     * Options for the MUI table.
     */
    const options: MUIDataTableOptions = {
        filterType: 'multiselect',
        selectableRows: 'none',
        filter: false,
        sort: false,
        print: false,
        download: false,
        viewColumns: false,
        rowsPerPageOptions: [5, 10, 25, 50, 100],
        expandableRows: true,
        expandableRowsHeader: false,
        expandableRowsOnClick: false,
        renderExpandableRow: (rowData, rowMeta) => {
            /**
             * Expandable area where you can deploy and undeploy.
             */
            const gatewayList = environments.map((env: any) => {
                return env.name;
            });
            const rowIndex = rowMeta.dataIndex;

            /**
             * Expanded row's policy information.
             */
            const policy = policiesList[rowIndex];
            return ( 
                <TableRow>
                    <TableCell colSpan={4}>
                        <Paper>
                            <Alert severity='info'>{policy.description}</Alert>
                            
                            <TableContainer className={classes.tableContainer}>
                                <Table>
                                    <TableBody>
                                        {gatewayList.map((gateway: string) => (
                                            <TableRow key={gateway}>
                                                <TableCell>
                                                    <Tooltip title={gateway} placement='bottom-start'>
                                                        <Chip className={classes.gatewayChip}
                                                            label={shortName(gateway)} variant='outlined' 
                                                        />
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell>
                                                    {isDeployed(gateway, policy.appliedGatewayLabels) ? (
                                                        <Button className={classes.button}
                                                            variant='contained' 
                                                            color='default' 
                                                            onClick={() => deployOrUndeploy(policy.id, gateway, false)}
                                                        >
                                                            Undeploy
                                                        </Button>
                                                    ) : (
                                                        <Button className={classes.button}
                                                            variant='contained' 
                                                            color='primary'
                                                            onClick={() => deployOrUndeploy(policy.id, gateway, true)}
                                                        >
                                                            Deploy
                                                        </Button>
                                                    )}                                                    
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer> 
                        </Paper>
                    </TableCell>
                </TableRow>   
                
            );
        },
    };

    /**
     * If there are no policies, then show the onboarding page.
     */
    if (policies && policies.length === 0 && !loading) {
        return (
            <Onboarding
                title={
                    <FormattedMessage
                        id='GlobalPolicies.Listing.onboarding.create.new'
                        defaultMessage='Let’s get started!'
                    />
                }
                subTitle={
                    <FormattedMessage
                        id='GlobalPolicies.Listing.onboarding.policies.tooltip'
                        defaultMessage='Global Policies provide you the ability to deploy policy mappings to
                        whole gateways and not just one single API. Click below to create your first Global Policy'
                    />
                }
            >
                <OnboardingMenuCard
                    id='itest-id-create-global-policy'
                    to='global-policies/create'
                    name='Global Policies'
                    iconName={globalPolicyAddIcon}
                />
            </Onboarding>
        );
    }

    if (loading) {
        return <Progress per={90} message='Loading Global Policies ...' />;
    }

    if (notFound || !policies) {
        return <ResourceNotFoundError />;
    }

    /**
     * MUI Table for the policies.
     */
    return (
        <div className={classes.heading}>
            <Grid
                className={classes.titleWrapper}
                xs={12}
                sm={12}
                md={11}
                lg={11}
                item
            >
                <Typography
                    variant='h4'
                    align='left'
                    component='h1'
                    className={classes.mainTitle}
                >
                    <FormattedMessage
                        id='GlobalPolicies.Listing.policies.title.name'
                        defaultMessage='Global Policies'
                    />
                </Typography>
                <Tooltip
                    title={
                        <FormattedMessage
                            id='GlobalPolicies.Listing.policies.title.tooltip'
                            defaultMessage={
                                'This will add policies globaly to the gateways.' +
                                'Please navigate to the Policies tab under any desired API' +
                                'if you want to add API / operation level policies'
                            }
                        />
                    }
                    placement='bottom-start'
                >
                    <IconButton size='small' aria-label='Policy-helper-text'>
                        <HelpOutlineIcon fontSize='small' />
                    </IconButton>
                </Tooltip>
                <Box pl={1}>
                    <Button 
                        color='primary' 
                        variant='outlined' 
                        size='small' 
                        data-testid='add-new-global-policy'
                        component={Link}
                        to='/global-policies/create'
                    >
                        <AddCircle className={classes.buttonIcon} />
                        <FormattedMessage
                            id='GlobalPolicies.Listing.policies.title.add.new.policy'
                            defaultMessage='Add New Global Policy'
                        />
                    </Button>
                </Box>      
            </Grid>
            <Grid
                className={classes.table}
                xs={12}
                sm={12}
                md={11}
                lg={11}
                item
            >
                <MUIDataTable
                    title={false}
                    data={policiesList}
                    columns={columns}
                    options={options}
                />
            </Grid>
        </div>
    );
};

export default Listing;
