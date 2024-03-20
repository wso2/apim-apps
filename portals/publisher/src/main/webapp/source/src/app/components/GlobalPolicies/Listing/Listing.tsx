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

/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
    Button,
    Grid,
    IconButton,
    Tooltip,
    Typography,
    Chip,
    TableCell,
    TableRow,
    Dialog,
    TextField,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    useTheme,
    Theme,
} from '@mui/material';
import Autocomplete from '@mui/lab/Autocomplete';
import APIMAlert from 'AppComponents/Shared/Alert';
import Icon from '@mui/material/Icon';
import CloudOffRoundedIcon from '@mui/icons-material/CloudOffRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { isRestricted } from 'AppData/AuthManager';
import API from 'AppData/api';
import { Progress } from 'AppComponents/Shared';
import { useIntl, FormattedMessage } from 'react-intl';
import AddCircle from '@mui/icons-material/AddCircle';
import MUIDataTable, { MUIDataTableOptions, MUIDataTableColumnDef } from 'mui-datatables';
import Box from '@mui/material/Box';
import OnboardingMenuCard from 'AppComponents/Shared/Onboarding/OnboardingMenuCard';
import Onboarding from 'AppComponents/Shared/Onboarding/Onboarding';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ResourceNotFoundError from 'AppComponents/Base/Errors/ResourceNotFoundError';
import { Link } from 'react-router-dom';

const PREFIX = 'Listing';

const classes = {
    table: `${PREFIX}-table`,
    heading: `${PREFIX}-heading`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    mainTitle: `${PREFIX}-mainTitle`,
    buttonIcon: `${PREFIX}-buttonIcon`,
    button: `${PREFIX}-button`,
    icon: `${PREFIX}-icon`,
    chip: `${PREFIX}-chip`,
    dialogBackdrop: `${PREFIX}-dialogBackdrop`,
    dialogPaper: `${PREFIX}-dialogPaper`,
    noDeployedGateways: `${PREFIX}-noDeployedGateways`,
    iconSmall: `${PREFIX}-iconSmall`
};

const Root = styled('div')(({ theme }: { theme: Theme }) => ({
    '&': {
        padding: `${theme.spacing(1)} ${theme.spacing(3)}`,
    },
    [`& .${classes.table}`]: {
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

    [`& .${classes.heading}`]: {
        flexGrow: 1,
        marginTop: 10,
    },

    [`& .${classes.titleWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
        marginLeft: 'auto',
        marginRight: 'auto',
    },

    [`& .${classes.mainTitle}`]: {
        paddingLeft: 0,
    },

    [`& .${classes.buttonIcon}`]: {
        marginRight: theme.spacing(1),
    },

    [`& .${classes.button}`]: {
        width: '112px',
        height: '37px',
    },

    [`& .${classes.icon}`]: {
        marginRight: theme.spacing(0.5),
    },

    [`& .${classes.chip}`]: {
        marginRight: '8px',
        marginBottom: '4px',
        marginTop: '4px',
    },

    [`& .${classes.dialogBackdrop}`]: {
        backgroundColor: 'rgba(0, 0, 0, 0.08)'
    },

    [`& .${classes.dialogPaper}`]: {
        boxShadow: 'none'
    },

    [`& .${classes.noDeployedGateways}`]: {
        color: 'grey', 
        fontStyle: 'italic'
    },

    [`& .${classes.iconSmall}`]: {
        fontSize: '16px'
    }
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
    gatewayType: string;
    showInApiConsole: boolean;
    vhosts: any;
    endpointURIs: any;
    additionalProperties: any;
}

interface SelectedGateway {
    id: string;
    gatewayLabels: string[];
}

/**
 * Global policies Lisitng Page.
 * @returns {TSX} - Listing Page.
 */
const Listing: React.FC = () => {

    const [policies, setPolicies] = useState<Policy[]>([]);
    const [selectedGateways, setSelectedGateways] = useState<SelectedGateway[]>([]);
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [loading, setLoading] = useState(false);
    const [notFound, setnotFound] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false);
    const [isUndeployDialogOpen, setIsUndeployDialogOpen] = useState(false);
    const [selectedPolicyName, setSelectedPolicyName] = useState('');
    const [selectedPolicyId, setSelectedPolicyId] = useState('');
    const [deployingGateway, setDeployingGateway] = useState('');
    const theme : any = useTheme();
    const { globalPolicyAddIcon } = theme.custom.landingPage.icons;
    const intl = useIntl();

    /**
     * Empty array to store the policies
     * @param {Policy[]} inputPolicies - Policies.
     * @returns {Policy[]} - Initial object array to hold selected gateways from the dropdown.
     */
    const getInitialSelectedGateways = (inputPolicies: Policy[]): SelectedGateway[] => {
        const selectedGatewaysList: SelectedGateway[] = [];
    
        inputPolicies.forEach((policy) => {
            const { id } = policy;
            const selectedGatewayValue: SelectedGateway = {
                id,
                gatewayLabels: [],
            };
            selectedGatewaysList.push(selectedGatewayValue);
        });

        return selectedGatewaysList;
    };

    /**
     * After deploying or undeploying, we need to clean the selected gateways list.
     * @param {string} policyId - Policy ID.
     * @returns {SelectedGateway[]} - Deployed policies' selected gateways should be empty. 
     */
    const cleanSeletectedGateways = (policyId: string): SelectedGateway[] => {
        const updatedSelectedGateways: SelectedGateway[] = selectedGateways.map((data) => {
            if (data.id === policyId) {
                return {
                    ...data,
                    gatewayLabels: [],
                };
            }
            return data;
        });
        
        return updatedSelectedGateways;
    };

    /**
     * Fetch the data from the backend to the compoenent.
     */
    const fetchGlobalPolicies = () => {
        setLoading(true);
        const promisedPolicies = API.getAllGatewayPolicies();
        promisedPolicies
            .then((response: any) => {
                setPolicies(response.body.list);
                setSelectedGateways(getInitialSelectedGateways(response.body.list));
                setLoading(false);
            })
            .catch(() => {
                APIMAlert.error(intl.formatMessage({
                    id: 'Fetching.Policies.Error',
                    defaultMessage: 'Error while fetching policies',
                }));
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
            .catch(() => {
                APIMAlert.error(intl.formatMessage({
                    id: 'Fetching.Policies.Settings',
                    defaultMessage: 'Error while fetching settings',
                }));
                setnotFound(true);
            })
            .finally(() => {
                setLoading(false);
            });
    };

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
    * Get the applied gateway labels as an array list for a specific policy by ID.
    * @param {string} id - Policy Identifier.
    * @returns {string[]} - Applied Gateway labels list.
    */
    const getSelectedGatewayLabelsById = (id: string) => {
        const policy = selectedGateways.find(item => item.id === id);
        return policy ? policy.gatewayLabels : [];
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
     * @param {string[]} newLabels - Newly added enviroment/gateway to applied Gateway Labels.
     */
    const addLabelsToPolicy = (policyId: string, newLabels: string[]) => {
        const updatedPolicies: Policy[] = policies.map((policy) => {
            if (policy.id === policyId) {
                return {
                    ...policy,
                    appliedGatewayLabels: [...policy.appliedGatewayLabels, ...newLabels],
                };
            }
            return policy;
        });
        setPolicies(updatedPolicies);
        setSelectedGateways(cleanSeletectedGateways(policyId));
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
        setSelectedGateways(cleanSeletectedGateways(policyId));
    };

    /**
     * Function to undeploy a policy mapping to another enviroment/gateway.
     * @param {string} gatewayPolicyMappingId - Policy Identifier.
     * @param {string} environement - Deploying enviroment/gateway.
     * @param {boolean} deploying - Deploying or undeploying.
     */
    const undeploy = (gatewayPolicyMappingId: string, environement: string) => {
        setIsUndeployDialogOpen(false);
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
                    APIMAlert.success(intl.formatMessage({
                        id: 'Policy.Undeploy.Successful',
                        defaultMessage: 'Policy undeployed successfully',
                    }));    
                    /**
                     * If successful, remove from the state rather than getting from backend.
                     */
                    removeLabelFromPolicy(gatewayPolicyMappingId, environement);                                
                }
                else {
                    APIMAlert.error(intl.formatMessage({
                        id: 'Error.Deploy.Policy',
                        defaultMessage: 'Error occurred while deploying the policy',
                    }));
                }                
            })
            .catch(() => {
                APIMAlert.error(intl.formatMessage({
                    id: 'Error.Undeploy.Policy',
                    defaultMessage: 'Error occurred while undeploying the policy',
                }));
            })         
        setLoading(false);
    }

    /**
     * Function to undeploy a policy mapping to another enviroment/gateway.
     * @param {string} gatewayPolicyMappingId - Policy Identifier.
     * @param {string[]} deployingGateways - Deploying enviroment/gateway.
     * @param {boolean} deploying - Deploying or undeploying.
     */
    const deploy = (gatewayPolicyMappingId: string, deployingGateways: string[]) => {
        setIsDeployDialogOpen(false);
        setLoading(true);
        const deploymentArray = getDeploymentArray(gatewayPolicyMappingId);

        /**
         * Iterate through the selected gateways and update the deployment array.
         */
        const updatedDeploymentArray = deploymentArray.map(({ gatewayLabel, gatewayDeployment }) => {
            if (deployingGateways.includes(gatewayLabel) && gatewayDeployment === false) {
                return { gatewayLabel, gatewayDeployment: true };
            }
            return { gatewayLabel, gatewayDeployment };
        });
        
        /**
         * call the backend API and handle the response
         */
        const promise = API.engageGlobalPolicy(gatewayPolicyMappingId, updatedDeploymentArray);
        promise
            .then((response) => {
                if (response.status === 200 || response.status === 201) {
                    setLoading(false);              
                    APIMAlert.success(intl.formatMessage({
                        id: 'Policy.Deploy.Successful',
                        defaultMessage: 'Policy deployed successfully',
                    }));    
                    /**
                     * If successful, add to the state rather than getting from backend.
                     */
                    addLabelsToPolicy(
                        gatewayPolicyMappingId, 
                        deployingGateways
                    );                                         
                }
                else {
                    APIMAlert.error(intl.formatMessage({
                        id: 'Error.Deploy.Policy',
                        defaultMessage: 'Error occurred while deploying the policy',
                    }));
                }                
            })
            .catch(() => {
                APIMAlert.error(intl.formatMessage({
                    id: 'Error.Deploy.Policy',
                    defaultMessage: 'Error occurred while deploying the policy',
                }));             
            })         
        setLoading(false);
    }

    const getAllDepoloyedGateways = () => {
        const allGateways = policies.map((policy) => 
            getAppliedGatewayLabelsById(policy.id)).reduce((acc, val) => acc.concat(val), []);
        return allGateways;
    }

    /**
     * Function to delete a policy mapping
     * @param {string} gatewayPolicyMappingId - Policy Identifier.
     */
    const deletePolicy = (gatewayPolicyMappingId: string) => {
        setIsDeleteDialogOpen(false);
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
                // Remove from the selected gateways list as well
                setSelectedGateways(selectedGateways.filter((gateway) => gateway.id !== gatewayPolicyMappingId));
                APIMAlert.success(intl.formatMessage({
                    id: 'Policy.Delete.Successful',
                    defaultMessage: 'Policy deleted successfully',
                }));
                setLoading(false);
            })
            .catch(() => {
                APIMAlert.error(intl.formatMessage({
                    id: 'Policy.Delete.Error',
                    defaultMessage: 'Error while deleting the policy',
                }));
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
     * Get the Global Policy view link.
     * @param {string} policyId - Policy Identifier.
     * @returns {string} - Url for the Global Policy view.
     */
    const getViewUrl = (policyId: string) => {
        return `/global-policies/${policyId}/view`;
    };

    /**
     * Sorts an array of Policy objects by their display names in ascending order.
     * @param {Policy[]} policies - An array of Policy objects to be sorted.
     * @returns {Policy[]} - The sorted array of Policy objects.
     */
    policies?.sort((a: Policy, b: Policy) => a.displayName.localeCompare(b.displayName));


    const policiesList = policies;

    /**
     * Dialog box (Modal or Pop up) which as for the confirmation to delete.
     * @returns {JSX.Element} - Delete Dialog.
     */
    const deleteDialog = () => {
        return (
            <Dialog open={isDeleteDialogOpen} 
                BackdropProps={{ className: classes.dialogBackdrop }}
                PaperProps={{ className: classes.dialogPaper }}
            >
                <DialogTitle>
                    <FormattedMessage
                        id='Confirm.Delete'
                        defaultMessage='Confirm Deletion'
                    />
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <FormattedMessage
                            id='Confirm.Delete.Verify'
                            defaultMessage='Are you sure you want to delete the policy?'
                        />
                        {selectedPolicyName}?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDeleteDialogOpen(false)} color='primary'>
                        <FormattedMessage
                            id='Cancel'
                            defaultMessage='Cancel'
                        />
                    </Button>
                    <Button
                        onClick={() => deletePolicy(selectedPolicyId)}
                        color='primary'
                        data-testid='policy-mapping-delete-confirmation-button'
                    >
                        <FormattedMessage
                            id='Delete'
                            defaultMessage='Delete'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    /**
     * Dialog box (Modal or Pop up) which as for the confirmation to deploy.
     * @param {string} policyID - Policy ID.
     * @param {string[]} deployingGatewayList - Deploying Gateway List.
     * @returns {JSX.Element} - Delete Dialog.
     */
    const deployDialog = (policyID: string, deployingGatewayList: string[]) => {
        return (
            <Dialog open={isDeployDialogOpen} 
                BackdropProps={{ className: classes.dialogBackdrop }}
                PaperProps={{ className: classes.dialogPaper }}
            >
                <DialogTitle>
                    <FormattedMessage
                        id='Confirm.Deploy'
                        defaultMessage='Confirm Deployment'
                    />
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <FormattedMessage
                            id='Confirm.Deploy.Verify'
                            defaultMessage='Are you sure you want to depoly the policy in the selected gateways?'
                        />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDeployDialogOpen(false)} color='primary'>
                        <FormattedMessage
                            id='Cancel'
                            defaultMessage='Cancel'
                        />
                    </Button>
                    <Button
                        onClick={() => deploy(policyID, deployingGatewayList)}
                        color='primary'
                        data-testid='deploy-to-gateway-button'
                    >
                        <FormattedMessage
                            id='Deploy'
                            defaultMessage='Deploy'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    /**
     * Dialog box (Modal or Pop up) which as for the confirmation to deploy.
     * @param {string} policyID - Policy ID.
     * @param {string} gateway - Undeploying Gateway.
     * @returns {JSX.Element} - Delete Dialog.
     */
    const undeployDialog = (policyID: string, gateway: string) => {
        return (
            <Dialog open={isUndeployDialogOpen} 
                BackdropProps={{ className: classes.dialogBackdrop }}
                PaperProps={{ className: classes.dialogPaper }}
            >
                <DialogTitle>
                    <FormattedMessage
                        id='Confirm.UnDeploy'
                        defaultMessage='Confirm Undeployment'
                    />
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <FormattedMessage
                            id='Confirm.Undeploy.Verify'
                            defaultMessage='Are you sure you want to undepoly the policy?'
                        />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsUndeployDialogOpen(false)} color='primary'>
                        <FormattedMessage
                            id='Cancel'
                            defaultMessage='Cancel'
                        />
                    </Button>
                    <Button
                        onClick={() => undeploy(policyID, gateway)}
                        color='primary'
                        data-testid='undeploy-from-gateway-button'
                    >
                        <FormattedMessage
                            id='Undeploy'
                            defaultMessage='Undeploy'
                        />
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    /**
     * Columns for the MUI table.
     */
    const columns: MUIDataTableColumnDef[] = [
        {
            name: 'id',
            options: { 
                filter: false,
                display: false, 
                viewColumns: false,
            }
        },
        {
            name: 'displayName',
            label: intl.formatMessage({
                id: 'Global.Policy.Listing.Table.Header.Name',
                defaultMessage: 'Global Policy',
            }),
            options: {
                customBodyRender: (value: string, tableMeta: any) => {        
                    const policyDescription = tableMeta.rowData[3];          
                    return (
                        <Grid container alignItems='center'>
                            <Grid item>
                                {value}
                            </Grid>
                            <Grid item>
                                <Tooltip title={policyDescription}>       
                                    <IconButton size='small' aria-label='description-text'>
                                        <InfoOutlinedIcon/>
                                    </IconButton>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    );
                }
            }      
        },
        /**
         * Deployed Gateway Column.
         */
        {
            name: 'appliedGatewayLabels',
            label: intl.formatMessage({
                id: 'Deployed.Gateway.Listing.Table.Header.Name',
                defaultMessage: 'Deployed Gateways',
            }),
            options: {
                customBodyRender: (value: string[] | undefined, tableMeta: any) => {
                    const policyId = tableMeta.rowData[0];

                    const handleUndeployClick = (gateway: string) => {
                        setDeployingGateway(gateway);
                        setIsUndeployDialogOpen(true);   
                    }

                    if (value && value.length > 0) {
                        return (
                            <div>
                                {value.slice().sort((a, b) => 
                                    a.localeCompare(b, undefined, { sensitivity: 'base' })).map((gateway: string) => 
                                    (
                                        <>
                                            <Chip 
                                                key={gateway} 
                                                label={gateway} 
                                                variant='outlined' 
                                                className={classes.chip}
                                                onDelete={() => handleUndeployClick(gateway)}
                                                deleteIcon={
                                                    !isRestricted(['apim:gateway_policy_manage']) 
                                                        ? <CloudOffRoundedIcon/> : <></>}
                                                id={`gateway-chip-${gateway}`}
                                            />
                                        </>))}
                                {undeployDialog(policyId, deployingGateway)}
                            </div>
                        );
                    } else {
                        return (
                            <p className={classes.noDeployedGateways}>
                                <FormattedMessage
                                    id='Deployed.Gateway.Listing.Table.Not.Available'
                                    defaultMessage='No deployed gateways'
                                />
                            </p>
                        );
                    }
                }
            }      
        },
        /**
         * Description Column.
         */
        {
            name: 'description',
            label: intl.formatMessage({
                id: 'Deployed.Gateway.Listing.Table.Header.Description',
                defaultMessage: 'Description',
            }),
            options: {
                display: false,
            }      
        },
        /**
         * Action Column.
         */
        {
            name: intl.formatMessage({
                id: 'Actions',
                defaultMessage: 'Actions',
            }),
            options: {
                customBodyRender: (value: any, tableMeta: any) => {
                    const policyId = tableMeta.rowData[0];
                    const policyName = tableMeta.rowData[1];

                    /**
                     * Handle deletion. If verifications are passed, it will open the dialog box for the confirmation.
                     */
                    const handleDeleteClick = () => {
                        /**
                         * If there is active depoloyments, we need to block the deletion.
                         */
                        const appliedGatewayList = getAppliedGatewayLabelsById(policyId);
                        if (appliedGatewayList.length > 0){      
                            APIMAlert.error((appliedGatewayList.length === 1) ? 
                                intl.formatMessage({
                                    id: 'Active.Deployment.Available',
                                    defaultMessage: 'An active deployment is available',
                                }) 
                                : intl.formatMessage({
                                    id: 'Active.Deployments.Available',
                                    defaultMessage: 'Active deployments are available',
                                }));
                        }
                        else {
                            setSelectedPolicyId(policyId);
                            setSelectedPolicyName(policyName);
                            setIsDeleteDialogOpen(true);
                        }
                    };
                    if (!isRestricted(['apim:gateway_policy_manage'])){
                        return (
                            <Box display='flex' flexDirection='row'>
                                <Button
                                    aria-label='Edit'
                                    component={Link}
                                    data-testid = 'policy-mapping-edit-button'
                                    to={getEditUrl(policyId)}
                                >
                                    <Icon className={classes.icon}>
                                        edit
                                    </Icon>
                                    <FormattedMessage
                                        id='GlobalPolicies.Listing.Table.Header.Actions.Edit'
                                        defaultMessage='Edit'
                                    />
                                </Button>
                                <>
                                    <Button
                                        aria-label='Delete'
                                        onClick={handleDeleteClick}
                                        data-testid = 'policy-mapping-delete-button'
                                    >
                                        <Icon className={classes.icon}>
                                            delete_forever
                                        </Icon>
                                        <FormattedMessage
                                            id='GlobalPolicies.Listing.table.header.actions.delete'
                                            defaultMessage='Delete'
                                        />
                                    </Button>
                                    {/**
                                     * Dialog box (Modal or Pop up) which as for the confirmation to delete.
                                     */}
                                    {deleteDialog()}
                                </>
                            </Box>
                        );  
                    }
                    else {
                        return (
                            <Box display='flex' flexDirection='row'>
                                <Button
                                    aria-label='View'
                                    component={Link}
                                    to={getViewUrl(policyId)}
                                >
                                    <Icon className={classes.icon}>
                                        visibility
                                    </Icon>
                                    <FormattedMessage
                                        id='GlobalPolicies.Listing.Table.Header.Actions.View'
                                        defaultMessage='View'
                                    />
                                </Button>
                            </Box>
                        );  
                    }                 
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
        expandableRows: !isRestricted(['apim:gateway_policy_manage']),
        expandableRowsHeader: false,
        expandableRowsOnClick: false,
        renderExpandableRow: (rowData, rowMeta) => {
            /**
             * Expandable area where you can deploy and undeploy.
             */
            const regularGatewayEnvironments = environments && environments.filter((env) => {
                return env.gatewayType === 'Regular';
            });
            const gatewayList = regularGatewayEnvironments.map((env: any) => {
                return env.name;
            });
            const rowIndex = rowMeta.dataIndex;

            /**
             * Expanded row's policy information.
             */
            const policy = policiesList[rowIndex];
            /**
             * Gateways which are deployed by any policy. These cannot be deployed again.
             */
            const allDepoloyedGateways = getAllDepoloyedGateways();
            /**
             * Gateways except the ones which are already deployed.
             */
            const gatewaysWithoutAppliedLabels = 
                gatewayList.filter((item) => !policy.appliedGatewayLabels.includes(item));
            const deployableGateways = 
                gatewaysWithoutAppliedLabels.filter((item) => !allDepoloyedGateways.includes(item));

            const handleSelectChange = (id: string) => (
                event: React.ChangeEvent<{}>,
                value: string[],
            ) => {
                const newSelectedGateways = selectedGateways.map((data) => {
                    if (data.id === id) {
                        return {
                            ...data,
                            gatewayLabels: value,
                        };
                    }
                    return data;
                });
                setSelectedGateways(newSelectedGateways);
            };

            return ( 
                <TableRow>
                    <TableCell colSpan={1}/> 
                    <TableCell colSpan={3}>      
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4}>
                                <Grid container spacing={2} alignItems='center'>
                                    <Grid item xs={11}>
                                        <Autocomplete
                                            multiple
                                            id='multi-select'
                                            options={
                                                deployableGateways.slice().sort((a, b) => 
                                                    a.localeCompare(b, undefined, { sensitivity: 'base' }))}
                                            value={getSelectedGatewayLabelsById(policy.id)}
                                            onChange={handleSelectChange(policy.id)}
                                            renderInput={(params) => (
                                                <TextField
                                                    // Prop spreading is forbidden in eslint, However, it is used here
                                                    // as MUI AutoComplete component requires Prop spreading
                                                    {...params}
                                                    size='small'
                                                    variant='outlined'
                                                    label={intl.formatMessage({
                                                        id: 'Select.Gateways.Label',
                                                        defaultMessage: 'Select gateways to deploy',
                                                    })}
                                                    placeholder={intl.formatMessage({
                                                        id: 'Select.Gateways.Placeholder',
                                                        defaultMessage: 'Select gateways to deploy',
                                                    })}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={1}>
                                        <Tooltip title={intl.formatMessage({
                                            id: 'Deploy.Helper',
                                            defaultMessage: 'If another global policy is already deployed ' +
                                            'to a gateway, that gateway will not be available for deployment of ' +
                                            'this policy. Please undeploy the previously deployed global policy first.',
                                        })}>
                                            <IconButton size='small' aria-label='deploy-helper-text'>
                                                <HelpOutlineIcon fontSize='small' />
                                            </IconButton>
                                        </Tooltip>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <Button
                                    className={classes.button}
                                    variant='contained'
                                    color='primary'
                                    fullWidth
                                    data-testid= 'policy-mapping-deploy-button'
                                    disabled={getSelectedGatewayLabelsById(policy.id).length < 1}
                                    onClick={() => setIsDeployDialogOpen(true)}
                                >
                                    <FormattedMessage
                                        id='Deploy'
                                        defaultMessage='Deploy'
                                    />
                                </Button>
                                {deployDialog(policy.id, getSelectedGatewayLabelsById(policy.id))}
                            </Grid>
                        </Grid>
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
            <>
                {!isRestricted(['apim:gateway_policy_manage']) ? 
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
                                defaultMessage='Global policies provide you the ability to deploy policy mappings to 
                                all the APIs deployed in a specific gateway and not just one single 
                                API. Click below to create your first global policy.'
                            />
                        }
                    >
                        <OnboardingMenuCard 
                            id='itest-id-create-global-policy'
                            to='global-policies/create'
                            name={(
                                <FormattedMessage
                                    id='Global.Policies'
                                    defaultMessage='Global Policies'
                                />
                            )} 
                            iconName={globalPolicyAddIcon}
                        />
                    </Onboarding>
                    : <Onboarding 
                        title={
                            <FormattedMessage
                                id='GlobalPolicies.Listing.onboarding.create.new'
                                defaultMessage='Let’s get started!'
                            />
                        }
                        subTitle={
                            <FormattedMessage
                                id='GlobalPolicies.Listing.onboarding.policies.tooltip.not.allowed'
                                defaultMessage='Global policies provide you the ability to deploy policy mappings to 
                                all the APIs deployed in a specific gateway and not just one single 
                                API. Please contact a privileged user to create a global policy.'
                            />
                        }
                    />
                }
            </>    
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
        <Root>
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
                                    'This will add policies globally to the gateways. ' +
                                    'Please navigate to the Policies tab under any desired API ' +
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
                    {!isRestricted(['apim:gateway_policy_manage']) 
                        ? <Box pl={1}>
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
                                    defaultMessage='Add new global policy'
                                />
                            </Button>
                        </Box>  
                        :null}
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
        </Root>
    );
};

export default Listing;
