/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import {
    Button, Grid, IconButton, makeStyles, Tooltip, Typography,
} from '@material-ui/core';
import { AddCircle } from '@material-ui/icons';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import InlineMessage from 'AppComponents/Shared/InlineMessage';
import { Link } from 'react-router-dom';
import { isRestricted } from 'AppData/AuthManager';
import Icon from '@material-ui/core/Icon';
import MUIDataTable from 'mui-datatables';

const useStyles = makeStyles((theme: any) => ({
    root: {
        paddingTop: 0,
        paddingLeft: 0,
    },
    buttonProgress: {
        position: 'relative',
        margin: theme.spacing(1),
    },
    headline: { paddingTop: theme.spacing(1.25), paddingLeft: theme.spacing(2.5) },
    heading: {
        flexGrow: 1,
        marginTop: 10,
        '& table td:nth-child(2)': {
            'word-break': 'break-word',
        },
        '& table td button span, & table th': {
            'white-space': 'nowrap',
        },
    },
    titleWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
    },
    mainTitle: {
        paddingLeft: 0,
    },
    buttonIcon: {
        marginRight: theme.spacing(1),
    },
    content: {
        margin: `${theme.spacing(2)}px 0 ${theme.spacing(2)}px 0`,
    },
    head: {
        fontWeight: 200,
    },
    addPolicyBtn: {
        marginLeft: theme.spacing(1),
    },
}));

interface IStatePolicy {
    policy: {
        name: string;
        description: string,
        flows: string[];
    }[]
}

interface IProps {
    api: any;
}

/**
 * Renders the policy management page.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Policy management page to render.
 */
const Policies: React.FC<IProps> = ({ api }) => {
    const classes = useStyles();
    const createUrl = `/apis/${api.id}/policies/create`;
    const viewUrl = `/apis/${api.id}/policies/view`;
    // const { policies } = api;
    const [policies, setPolicies] = useState <IStatePolicy['policy']>([
        {
            name: 'LeBron James',
            description: 'Desc',
            flows: ['in'],
        },
        {
            name: 'Kobe Bryant',
            description: 'Desc',
            flows: ['in'],
        },
    ]);

    // const columns = [
    //     { name: 'Policy Name', options: { filterOptions: { fullWidth: true } } },
    //     'Description',
    //     'Flows',
    // ];

    const columns = [
        'Policy Name',
        'Description',
        'Flows',
        'Actions',
        // {
        //     options: {
        //         customBodyRender: (value: any, tableMeta: any) => {
        //             if (tableMeta.rowData) {
        //                 const policyName = tableMeta.rowData[0];
        //                 return (
        //                     <table>
        //                         <tr>
        //                             <td>
        //                                 <Button
        //                                     aria-label={'View' + policyName}
        //                                     component={Link}
        //                                     to={viewUrl}
        //                                 >
        //                                     <Icon>View</Icon>
        //                                     <FormattedMessage
        //                                         id='Apis.Details.Policies.Policies.policy.view'
        //                                         defaultMessage='View'
        //                                     />
        //                                 </Button>
        //                             </td>
        //                             {/* <td>
        //                                 <Delete scopeName={scopeName} api={api} isAPIProduct />
        //                             </td> */}
        //                         </tr>
        //                     </table>
        //                 );
        //             }
        //             return false;
        //         },
        //         filter: false,
        //         sort: false,
        //         label: (
        //             <FormattedMessage
        //                 id='Apis.Details.Policies.Policies.table.header.actions'
        //                 defaultMessage='Actions'
        //             />
        //         ),
        //     },
        // },
    ];

    const policiesList = policies.map((policyTemplate) => {
        const policy = [];
        policy.push(policyTemplate.name);
        policy.push(policyTemplate.description);
        policy.push(policyTemplate.flows);
        return policy;
    });

    const options = {
        // filterType: 'multiselect',
        // selectableRows: false,
        title: false,
        filter: false,
        sort: false,
        print: false,
        download: false,
        viewColumns: false,
        // customToolbar: false,
    };

    if (policies.length === 0) {
        return (
            <>
                <div className={classes.root}>
                    <div className={classes.titleWrapper}>
                        <Typography
                            id='itest-api-details-scopes-onboarding-head'
                            variant='h4'
                            component='h2'
                            align='left'
                            className={classes.mainTitle}
                        >
                            <FormattedMessage
                                id='Apis.Details.Policies.Policies.heading'
                                defaultMessage='Policies'
                            />
                        </Typography>
                        <Tooltip
                            title={(
                                <FormattedMessage
                                    id='Apis.Details.Policies.Policies.heading.tooltip'
                                    defaultMessage={'Navigate to the Resources tab to attach these '
                                    + 'policies at the resource level'}
                                />
                            )}
                            placement='top-start'
                        >
                            <IconButton size='small' aria-label='Policies help text'>
                                <HelpOutlineIcon fontSize='small' />
                            </IconButton>
                        </Tooltip>
                    </div>
                    <InlineMessage type='info' height={140}>
                        <div>
                            <Typography variant='h5' component='h3' className={classes.head}>
                                <FormattedMessage
                                    id='Apis.Details.Policies.Policies.create.policies.title'
                                    defaultMessage='Create Policies'
                                />
                            </Typography>
                            <Typography component='p' className={classes.content}>
                                <FormattedMessage
                                    id='Apis.Details.Policies.Policies.info.tooltip'
                                    defaultMessage={'Policies provide the capability to alter the behavior '
                                    + 'of API resources'}
                                />
                            </Typography>
                            <div>
                                <Button
                                    variant='contained'
                                    color='primary'
                                    disabled={isRestricted(['apim:api_create'], api) || api.isRevision}
                                    component={Link}
                                    to={createUrl}
                                >
                                    <FormattedMessage
                                        id='Apis.Details.Policies.Policies.create.policy.button'
                                        defaultMessage='Create Policy'
                                    />
                                </Button>
                            </div>
                        </div>
                    </InlineMessage>
                </div>
            </>
        );
    }

    return (
        <>
            <div className={classes.heading}>
                <div className={classes.titleWrapper}>
                    <Typography variant='h4' component='h2' align='left' className={classes.mainTitle}>
                        <FormattedMessage
                            id='Apis.Details.Policies.Policies.heading'
                            defaultMessage='Policies'
                        />
                    </Typography>
                    <Tooltip
                        title={(
                            <FormattedMessage
                                id='Apis.Details.Policies.Policies.heading.tooltip'
                                defaultMessage={'Navigate to the Resources tab to attach these '
                                + 'policies at the resource level'}
                            />
                        )}
                        placement='top-start'
                    >
                        <IconButton size='small' aria-label='Policies help text'>
                            <HelpOutlineIcon fontSize='small' />
                        </IconButton>
                    </Tooltip>
                    <Button
                        variant='outlined'
                        color='primary'
                        size='small'
                        className={classes.addPolicyBtn}
                        disabled={isRestricted(['apim:api_create'], api) || api.isRevision}
                        component={Link}
                        to={createUrl}
                    >
                        <AddCircle className={classes.buttonIcon} />
                        <FormattedMessage
                            id='Apis.Details.Policies.heading.addPolicy'
                            defaultMessage='Add New Policy'
                        />
                    </Button>
                    {isRestricted(['apim:api_create'], api) && (
                        <Grid item>
                            <Typography variant='body2' color='primary'>
                                <FormattedMessage
                                    id='Apis.Details.Policies.Policies.update.not.allowed'
                                    defaultMessage={
                                        '*You are not authorized to update policies of'
                                        + ' the API due to insufficient permissions'
                                    }
                                />
                            </Typography>
                        </Grid>
                    )}
                </div>

                <MUIDataTable
                    title={false}
                    data={policiesList}
                    columns={columns}
                    options={options}
                />
            </div>
        </>
    );
};

export default Policies;
