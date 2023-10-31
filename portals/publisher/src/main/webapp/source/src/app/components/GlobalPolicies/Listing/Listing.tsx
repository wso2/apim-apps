// Copyright (c) 2023, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.

// WSO2 Inc. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at

// http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

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
    TableRow
} from '@material-ui/core';
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
import CONSTS from 'AppData/Constants';
import { Link } from 'react-router-dom';
import GlobalPolicyGatewaySelector from './GlobalPolicyGatewaySelector';

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
    icon: {
        marginRight: theme.spacing(0.5),
    }
}));

interface Policy {
    id: string;
    description: string;
    displayName: string;
    appliedGatewayLabels: string[];
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
 * @returns {TSX} Listing Page.
 */
const Listing: React.FC = () => {
    const classes = useStyles();
    // const { commonPolicyAddIcon } = theme.custom.landingPage.icons;
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [loading, setLoading] = useState(false);
    const [notFound, setnotFound] = useState(false);
    const [isAllowedToFilterCCPolicies, setIsAllowedToFilterCCPolicies] = useState(false);

    /**
     * Getting the selected gateway type (Choreo Connect or Synapse).
     * 
     * @param {boolean} isCCEnabled : Indicates whether Choreo Connect is selected or not.
     */
    const handleGatewayTypeSelection = (isCCEnabled: boolean) => {
        setIsAllowedToFilterCCPolicies(isCCEnabled);
    } 

    /**
     * Fetch the data from the backend to the compoenent.
     */
    const fetchGlobalPolicies = () => {
        setLoading(true);
        // const promisedPolicies = API.getGatewayPolicies();
        console.log("fetching policies: 'GET' '/gateway-policies");

        // hardcoded response
        const promisedPolicies = Promise.resolve({
            count: 1,
            list: [
                {
                    id: "121223q41-24141-124124124-12414",
                    description: "Set header value to the request with item type and "
                    + "response header set with served server name",
                    displayName: "item_type_setter",
                    appliedGatewayLabels: ["Production Gateway", "Default"]
                },
                {
                    id: "121223q41-24141-124124124-12415",
                    description: "Set header value to the request with item type and "
                    + "response header set with served server name",
                    displayName: "item_type_setter2",
                    appliedGatewayLabels: ["Production Gateway", "Default"]
                },
                {
                    id: "121223q41-24141-124124124-12416",
                    description: "Set header value to the request with item type and "
                    + "response header set with served server name",
                    displayName: "item_type_setter3",
                    appliedGatewayLabels: ["Production Gateway", "Default"]
                },
                {
                    id: "121223q41-24141-124124124-12417",
                    description: "Set header value to the request with item type and "
                    + "response header set with served server name",
                    displayName: "item_type_setter4",
                    appliedGatewayLabels: ["Production Gateway", "Default"]
                },
                {
                    id: "121223q41-24141-124124124-12418",
                    description: "Set header value to the request with item type and "
                    + "response header set with served server name",
                    displayName: "item_type_setter5",
                    appliedGatewayLabels: []
                },
                {
                    id: "121223q41-24141-124124124-12419",
                    description: "Set header value to the request with item type and "
                    + "response header set with served server name",
                    displayName: "item_type_setter6",
                    appliedGatewayLabels: ["Production Gateway"]
                },
                {
                    id: "121223q41-24141-124124124-12420",
                    description: "Set header value to the request with item type and "
                    + "response header set with served server name",
                    displayName: "item_type_setter7",
                    appliedGatewayLabels: ["Production Gateway", "Default"]
                },
                {
                    id: "121223q41-24141-124124124-12421",
                    description: "Set header value to the request with item type and "
                    + "response header set with served server name",
                    displayName: "item_type_setter8",
                    appliedGatewayLabels: ["Production Gateway"]
                },
                {
                    id: "121223q41-24141-124124124-12422",
                    description: "Set header value to the request with item type and "
                    + "response header set with served server name",
                    displayName: "aitem_type_setter9",
                    appliedGatewayLabels: ["Production Gateway"]
                },
                {
                    id: "121223q41-24141-124124124-12423",
                    description: "Set header value to the request with item type and "
                    + "response header set with served server name",
                    displayName: "item_type_setter10",
                    appliedGatewayLabels: ["Production Gateway", "Default"]
                },
                {
                    id: "121223q41-24141-124124124-12424",
                    description: "Set header value to the request with item type and "
                    + "response header set with served server name",
                    displayName: "item_type_setter11",
                    appliedGatewayLabels: ["Production Gateway", "Default",]
                },
                {
                    id: "121223q41-24141-124124124-12425",
                    description: "Set header value to the request with item type and "
                    + "response header set with served server name",
                    displayName: "item_type_setter12",
                    appliedGatewayLabels: ["Production Gateway", "Default"]
                },
                {
                    id: "121223q41-24141-124124124-12426",
                    description: "Set header value to the request with item type and "
                    + "response header set with served server name",
                    displayName: "item_type_setter13",
                    appliedGatewayLabels: ["Production Gateway"]
                }
            ],
            pagination: {
                offset: 0,
                limit: 1,
                total: 10,
                next: "string",
                previous: "string"
            }
        });
        // hardcoded response ends

        promisedPolicies
            .then((response) => {
                setPolicies(response.list);
            })
            .catch((error) => {
                console.error(error);
                setnotFound(true);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    /**
     * Fetch environements publisher settings from the backend to the compoenent.
     */
    const fetchSettings = () => {
        setLoading(true);
        const promisedSettings = API.getSettings();
        promisedSettings
            .then((response: any) => {
                setEnvironments(response.environment);
            })
            .catch((error: any) => {
                console.error(error);
                setnotFound(true);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    /**
     * Provides the gateway specific policies list (In there, we can filter the list).
     * 
     * @returns {array} Return the policy list after filtering.
     */
    const getPoliciesList = () => {
        // let gatewayType = CONSTS.GATEWAY_TYPE.synapse;
        // if (isAllowedToFilterCCPolicies) {
        //     gatewayType = CONSTS.GATEWAY_TYPE.choreoConnect;
        // }
        // if (policies) {
        //     return policies.filter((policy) => policy.appliedGatewayLabels.includes(gatewayType));
        // }
        // return [];
        return policies;
    }

    /**
     * Check if the gateway is deployed for the Golbal Policy.
     * 
     * @param {string} gateway : Gateway.
     * @param {string[]} appliedGatewayLabels : Applied Gateway Labels.
     * @returns {boolean} Return true if deployed.
     */
    const isDeployed = (gateway: string, appliedGatewayLabels: string[]) => {
        // get global policy's appliedGatewayLabels
        if (appliedGatewayLabels.includes(gateway)) {
            return true;
        }
        return false;
    }

    /**
     * Function to add a label to a specific policy in UI
     * 
     * @param {string} policyId : Policy Identifier.
     * @param {string} newLabel : Newly added enviroment/gateway to applied Gateway Labels.
     */
    const addLabelToPolicy = (policyId: string, newLabel: string) => {
        // Create a copy of the policies array with the updated label
        const updatedPolicies = policies.map((policy) => {
            if (policy.id === policyId) {
                return {
                    ...policy,
                    appliedGatewayLabels: [...policy.appliedGatewayLabels, newLabel],
                };
            }
            return policy;
        });

        // Set the state with the updated policies
        setPolicies(updatedPolicies);
    };

    /**
     * Function to deploy a policy mapping to another enviroment/gateway
     * 
     * @param {string} gatewayPolicyMappingId : Policy Identifier.
     * @param {string} environement : Deploying enviroment/gateway.
     */
    const deploy = (gatewayPolicyMappingId: string, environement: string) => {
        setLoading(true);

        // call the backend API
        // const requestBody = [
        //     {
        //         "mappingUUID": {gatewayPolicyMappingId},
        //         "gatewayLabel": {environement},
        //         "gatewayDeployment": true
        //     }
        // ];
        // API.postDeployGatewayPolicies();
        console.log("deploying policy to specific gateway: 'POST' '/gateway-policies/{gatewayPolicyMappingId}/deploy");

        // If successful, update the policies list for the UI
        addLabelToPolicy(gatewayPolicyMappingId, environement);

        setLoading(false);
    }

    /**
     * Function to remove a label from a specific policy in UI
     * 
     * @param {string} policyId : Policy Identifier.
     * @param {string} labelToRemove : Removing enviroment/gateway from applied Gateway Labels.
     */
    const removeLabelFromPolicy = (policyId: string, labelToRemove: string) => {
        // Create a copy of the policies array with the label removed
        const updatedPolicies = policies.map((policy) => {
            if (policy.id === policyId) {
                return {
                    ...policy,
                    appliedGatewayLabels: policy.appliedGatewayLabels.filter((label) => label !== labelToRemove),
                };
            }
            return policy;
        });

        // Set the state with the updated policies
        setPolicies(updatedPolicies);
    };

    /**
     * Function to undeploy a policy mapping to another enviroment/gateway
     * 
     * @param {string} gatewayPolicyMappingId : Policy Identifier.
     * @param {string} environement : Deploying enviroment/gateway.
     */
    const undeploy = (gatewayPolicyMappingId: string, environement: string) => {
        setLoading(true);

        // call the backend API
        // const requestBody = [
        //     {
        //         "mappingUUID": {gatewayPolicyMappingId},
        //         "gatewayLabel": {environement},
        //         "gatewayDeployment": false
        //     }
        // ];
        // API.postDeployGatewayPolicies();
        console.log("undeploying policy to specifc gateway: 'POST' '/gateway-policies/{gatewayPolicyMappingId}/deploy");

        // If successful, update the policies list for the UI
        removeLabelFromPolicy(gatewayPolicyMappingId, environement);

        setLoading(false);
    }

    /**
     * Function to delete a policy mapping
     * 
     * @param {string} gatewayPolicyMappingId : Policy Identifier.
     */
    const deletePolicy = (gatewayPolicyMappingId: string) => {
        setLoading(true);
        // call the backend API
        // API.deleteGatewayPolicies();
        console.log("delete policy: 'DELETE' '/gateway-policies/{gatewayPolicyMappingId}");
        // If successful, remove it from the UI
        const updatedPolicies = policies.filter((policy) => policy.id !== gatewayPolicyMappingId);
        setPolicies(updatedPolicies);
        setLoading(false);
    }

    useEffect(() => {
        fetchGlobalPolicies();
        fetchSettings();
    }, []);

    const getEditUrl = (policyId: String) => {
        return `/global-policies/${policyId}/edit`;
    };

    /**
     * Sorts an array of Policy objects by their display names in ascending order.
     *
     * @param {Policy[]} policies - An array of Policy objects to be sorted.
     * @returns {Policy[]} The sorted array of Policy objects.
     */
    policies?.sort((a: Policy, b: Policy) => a.displayName.localeCompare(b.displayName));


    const policiesList = getPoliciesList();

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
                                        style={{ marginRight: '8px' }}
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
        {
            name: 'Actions',
            options: {
                customBodyRender: (value: any, tableMeta: any) => {
                    const policyId = tableMeta.rowData[0];
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
                            <Button
                                aria-label='Delete'
                                onClick={() => deletePolicy(policyId)}
                            >
                                <Icon className={classes.icon}>
                                    delete
                                </Icon>
                                <FormattedMessage
                                    id='GlobalPolicies.Listing.table.header.actions.delete'
                                    defaultMessage='Delete'
                                />
                            </Button>
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
            const gatewayList = environments.map((env: any) => {
                return env.name;
            });
            const rowIndex = rowMeta.dataIndex;
            const policy = policiesList[rowIndex];
            return ( 
                <TableRow>
                    <TableCell colSpan={4}>
                        <Box>
                            <Typography variant='body2' gutterBottom>
                                Descrpiton : {policy.description}
                            </Typography>
                            
                            <TableContainer>
                                <Table>
                                    <TableBody>
                                        {gatewayList.map((gateway: string) => (
                                            <TableRow 
                                                key={gateway}
                                            >
                                                <TableCell>
                                                    <Chip label={gateway} variant='outlined' />
                                                </TableCell>
                                                <TableCell align='right'>
                                                    {isDeployed(gateway, policy.appliedGatewayLabels) ? (
                                                        <Button 
                                                            variant='contained' 
                                                            color='default' 
                                                            onClick={() => undeploy(policy.id, gateway)}
                                                        >
                                                            Undeploy
                                                        </Button>
                                                    ) : (
                                                        <Button 
                                                            variant='contained' 
                                                            color='primary'
                                                            onClick={() => deploy(policy.id, gateway)}
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
                        </Box>
                    </TableCell>
                </TableRow>   
                
            );
        },
    };

    /**
     * If there are no policies, then show the onboarding page.
     */
    if (policies && policies.length === 0) {
        return (
            <Onboarding
                title={
                    <FormattedMessage
                        id='GlobalPolicies.Listing.onboarding.create.new'
                        defaultMessage='Let’s get started !'
                    />
                }
                subTitle={
                    <FormattedMessage
                        id='GlobalPolicies.Listing.onboarding.policies.tooltip'
                        defaultMessage={
                            'Policies provide the capability to alter the behavior ' +
                            'of API resources'
                        }
                    />
                }
            >
                <OnboardingMenuCard
                    to={CONSTS.PATH_TEMPLATES.COMMON_POLICY_CREATE}
                    name='Policies'
                    // iconName={globalPolicyAddIcon}
                />
            </Onboarding>
        );
    }

    if (loading) {
        return <Progress per={90} message='Loading Policies ...' />;
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
                <Box>
                    <GlobalPolicyGatewaySelector
                        handleGatewayTypeSelection={handleGatewayTypeSelection}
                        isAllowedToFilterCCPolicies={isAllowedToFilterCCPolicies}
                    />
                </Box>
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
