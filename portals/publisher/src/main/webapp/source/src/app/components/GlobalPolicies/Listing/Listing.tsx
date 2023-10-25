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
} from '@material-ui/core';
// import API from 'AppData/api';
import { Progress } from 'AppComponents/Shared';
import { FormattedMessage } from 'react-intl';
import AddCircle from '@material-ui/icons/AddCircle';
import MUIDataTable, { MUIDataTableOptions } from 'mui-datatables';
import { isRestricted } from 'AppData/AuthManager';
import Box from '@material-ui/core/Box';
import OnboardingMenuCard from 'AppComponents/Shared/Onboarding/OnboardingMenuCard';
import Onboarding from 'AppComponents/Shared/Onboarding/Onboarding';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import ResourceNotFoundError from 'AppComponents/Base/Errors/ResourceNotFoundError';
import CONSTS from 'AppData/Constants';
// import Delete from './DeletePolicy';
import CommonPolicyGatewaySelector from './CommonPolicyGatewaySelector';

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
    },
}));

interface Policy {
    id: string;
    description: string;
    displayName: string;
    appliedGatewayLabels: string[];
}

/**
 * Global Policies Lisitng Page.
 * @returns {JSX} Listing Page.
 */
const Listing: React.FC = () => {
    const classes = useStyles();
    // const { commonPolicyAddIcon } = theme.custom.landingPage.icons;
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(false);
    const [notFound, setnotFound] = useState(false);
    const [isAllowedToFilterCCPolicies, setIsAllowedToFilterCCPolicies] = useState(false);

    /**
     * 
     * @param {boolean} isCCEnabled : Indicates whether Choreo Connect is selected or not.
     */
    const handleGatewayTypeSelection = (isCCEnabled: boolean) => {
        setIsAllowedToFilterCCPolicies(isCCEnabled);
    } 

    const fetchCommonPolicies = () => {
        setLoading(true);
        // const promisedPolicies = API.getCommonOperationPolicies();
        // hardcoded response
        const promisedPolicies = Promise.resolve({
            count: 1,
            list: [
                {
                    id: "121223q41-24141-124124124-12414",
                    description: "Set header value to the request with item type and "
                    + "response header set with served server name",
                    displayName: "item_type_setter",
                    appliedGatewayLabels: ["Synapse"]
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

    // Provides the gateway specific policies list.
    const getPoliciesList = () => {
        let gatewayType = CONSTS.GATEWAY_TYPE.synapse;
        if (isAllowedToFilterCCPolicies) {
            gatewayType = CONSTS.GATEWAY_TYPE.choreoConnect;
        }
        if (policies) {
            return policies.filter((policy) => policy.appliedGatewayLabels.includes(gatewayType));
        }
        return [];
    }

    useEffect(() => {
        fetchCommonPolicies();
    }, []);

    // policies?.sort((a: string, b:string) => a.displayName.localeCompare(b.displayName));

    const policiesList = getPoliciesList();

    const columns = [
        {
            name: 'displayName',
            label: 'Display Name',
        },
        {
            name: 'appliedGatewayLabels',
            label: 'Applied Gateway Labels',
            options: {
                customBodyRender: (value: string[]) => value.join(', '),
            },
        },
        {
            name: 'actions',
            label: 'Actions',
            options: {
                customBodyRender: () => <Button>Edit</Button>,
            },
        },
    ];

    const options: MUIDataTableOptions = {
        filterType: 'multiselect',
        selectableRows: 'none',
        filter: false,
        sort: false,
        print: false,
        download: false,
        viewColumns: false,
        rowsPerPageOptions: [5, 10, 25, 50, 100],
    };

    // const options = {
    //     filterType: 'multiselect',
    //     selectableRows: 'none',
    //     title: false,
    //     filter: false,
    //     sort: false,
    //     print: false,
    //     download: false,
    //     viewColumns: false,
    //     customToolbar: false,
    //     rowsPerPageOptions: [5, 10, 25, 50, 100],
    // };

    if (policies && policies.length === 0) {
        return (
            <Onboarding
                title={
                    <FormattedMessage
                        id='CommonPolicies.Listing.onboarding.create.new'
                        defaultMessage='Let’s get started !'
                    />
                }
                subTitle={
                    <FormattedMessage
                        id='CommonPolicies.Listing.onboarding.policies.tooltip'
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
                    // iconName={commonPolicyAddIcon}
                    disabled={isRestricted([
                        'apim:api_create',
                        'apim:api_manage',
                        'apim:mediation_policy_create',
                        'apim:mediation_policy_manage',
                        'apim:api_mediation_policy_manage',
                    ])}
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
                        id='CommonPolicies.Listing.policies.title.name'
                        defaultMessage='Policies'
                    />
                </Typography>
                <Tooltip
                    title={
                        <FormattedMessage
                            id='CommonPolicies.Listing.policies.title.tooltip'
                            defaultMessage={
                                'You can utilize these policies at the operation level' +
                                ' by navigating to the Policies tab under any desired API'
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
                    <Button>
                        <AddCircle className={classes.buttonIcon} />
                        <FormattedMessage
                            id='CommonPolicies.Listing.policies.title.add.new.policy'
                            defaultMessage='Add New Policy'
                        />
                    </Button>
                </Box>
                {isRestricted([
                    'apim:api_create',
                    'apim:api_manage',
                    'apim:mediation_policy_create',
                    'apim:mediation_policy_manage',
                    'apim:api_mediation_policy_manage',
                ]) && (
                    <Grid item>
                        <Typography variant='body2' color='primary'>
                            <FormattedMessage
                                id='CommonPolicies.Listing.policies.title.update.not.allowed'
                                defaultMessage={
                                    '*You are not authorized to manage policies ' +
                                    'due to insufficient permissions'
                                }
                            />
                        </Typography>
                    </Grid>
                )}
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
                    <CommonPolicyGatewaySelector
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



