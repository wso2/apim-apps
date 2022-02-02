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

import React, { useState } from 'react';
// import 'react-tagsinput/react-tagsinput.css';
import {
    Button, Grid, IconButton, Tooltip, Typography,
} from '@material-ui/core';
import PropTypes from 'prop-types';
// import API from 'AppData/api';
import { Progress } from 'AppComponents/Shared';
import { FormattedMessage, injectIntl } from 'react-intl';
import withStyles from '@material-ui/core/styles/withStyles';
import { Link } from 'react-router-dom';
import AddCircle from '@material-ui/icons/AddCircle';
import MUIDataTable from 'mui-datatables';
import Icon from '@material-ui/core/Icon';
import { isRestricted } from 'AppData/AuthManager';
import { withAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import Box from '@material-ui/core/Box';
import OnboardingMenuCard from 'AppComponents/Shared/Onboarding/OnboardingMenuCard';
import Onboarding from 'AppComponents/Shared/Onboarding/Onboarding';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import Chip from '@material-ui/core/Chip';
import ArrowForward from '@material-ui/icons/ArrowForward';
import ArrowBack from '@material-ui/icons/ArrowBack';
import TrendingDown from '@material-ui/icons/TrendingDown';
import Delete from './DeletePolicyTemplate';

const styles = (theme) => ({
    contentInside: {
        padding: theme.spacing(3),
        paddingTop: theme.spacing(2),
        '& > div[class^="MuiPaper-root-"]': {
            boxShadow: 'none',
            backgroundColor: 'transparent',
        },
    },
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
    root: {
        paddingTop: 0,
        paddingLeft: 0,
    },
    buttonProgress: {
        position: 'relative',
        margin: theme.spacing(1),
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
    disableLink: {
        pointerEvents: 'none',
    },
    icon: {
        marginRight: theme.spacing(0.5),
    },
});

/**
 * Renders the policy template management UI.
 * @param {JSON} props Input props from parent components.
 * @returns {JSX} Policy template management page to render.
 */
const Listing = (props) => {
    const { intl, classes, theme } = props;
    const { policyTemplateAddIcon } = theme.custom.landingPage.icons;
    const createUrl = '/policy-templates/create';
    const viewUrl = '/policy-templates/view';
    const [policies, setPolicies] = useState([
        {
            id: 1,
            name: 'Add Header',
            description: 'With this policy, user can add a new header to the request',
            flows: ['Request', 'Response', 'Fault'],
        },
        {
            id: 2,
            name: 'Rewrite HTTP Method',
            description: 'User should be able to change the HTTP method of a resource',
            flows: ['Request'],
        },
    ]);

    const policiesList = policies.map((policyTemplate) => {
        const policy = [];
        policy.push(policyTemplate.id);
        policy.push(policyTemplate.name);
        policy.push(policyTemplate.description);
        policy.push(policyTemplate.flows);
        return policy;
    });

    const columns = [
        {
            name: 'policyId',
            options: {
                display: 'excluded',
                filter: false,
            },
        },
        intl.formatMessage({
            id: 'Policies.Listing.Listing.table.header.name',
            defaultMessage: 'Policy Name',
        }),
        intl.formatMessage({
            id: 'Policies.Listing.Listing.table.header.description',
            defaultMessage: 'Description',
        }),
        {
            options: {
                customBodyRender: (value, tableMeta) => {
                    if (tableMeta.rowData) {
                        const flows = value || [];
                        return (
                            <div>
                                {flows.map((flow) => {
                                    let chipColor = theme.custom.policyFlowChipColor
                                        ? theme.custom.policyFlowChipColor[flow.toLowerCase()]
                                        : null;
                                    let chipTextColor = '#000000';
                                    if (!chipColor) {
                                        console.log('The policyFlowChipColor is not populated properly.');
                                        chipColor = '#cccccc';
                                    } else {
                                        chipTextColor = theme.palette.getContrastText(
                                            theme.custom.policyFlowChipColor[flow.toLowerCase()],
                                        );
                                    }
                                    let flowIcon = null;
                                    if (flow === 'Request') {
                                        flowIcon = <ArrowForward />;
                                    } else if (flow === 'Response') {
                                        flowIcon = <ArrowBack />;
                                    } else if (flow === 'Fault') {
                                        flowIcon = <TrendingDown />;
                                    }
                                    return (
                                        <Chip
                                            key={flow}
                                            label={flow.toUpperCase()}
                                            style={{
                                                backgroundColor: chipColor,
                                                color: chipTextColor,
                                                height: 20,
                                                fontSize: 9,
                                                margin: '0.3em',
                                            }}
                                            icon={flowIcon}
                                        />
                                    );
                                })}
                            </div>
                        );
                    }
                    return false;
                },
                filter: false,
                sort: false,
                label: (
                    <FormattedMessage
                        id='Policies.Listing.Listing.table.header.applicable.flows'
                        defaultMessage='Applicable Flows'
                    />
                ),
            },
        },
        {
            name: 'Actions',
            options: {
                customBodyRender: (value, tableMeta) => {
                    if (tableMeta.rowData) {
                        const policyId = tableMeta.rowData[0];
                        const policyName = tableMeta.rowData[1];
                        return (
                            <Box display='flex' flexDirection='row'>
                                <Button
                                    disabled={isRestricted(['apim:shared_scope_manage'])}
                                    aria-label={'View ' + policyName}
                                    component={Link}
                                    to={!isRestricted(['apim:shared_scope_manage'])
                                    && {
                                        pathname: viewUrl,
                                        state: {
                                            policyName,
                                            policyId,
                                        },
                                    }}
                                >
                                    <Icon className={classes.icon}>visibility</Icon>
                                    <FormattedMessage
                                        id='Policies.Listing.Listing.policies.template.view'
                                        defaultMessage='View'
                                    />
                                </Button>
                                <Delete
                                    policyId={policyId}
                                    policyName={policyName}
                                    policies={policies}
                                    setPolicies={setPolicies}
                                />
                            </Box>
                        );
                    }
                    return false;
                },
                filter: false,
                sort: false,
                label: (
                    <FormattedMessage
                        id='Policies.Listing.Listing.table.header.actions'
                        defaultMessage='Actions'
                    />
                ),
            },
        },
    ];
    const options = {
        filterType: 'multiselect',
        selectableRows: 'none',
        title: false,
        filter: false,
        sort: false,
        print: false,
        download: false,
        viewColumns: false,
        customToolbar: false,
        rowsPerPageOptions: [5, 10, 25, 50, 100],
    };

    if (!policies) {
        return <Progress />;
    }

    if (policies.length === 0) {
        return (
            <Onboarding
                title={(
                    <FormattedMessage
                        id='Policies.Listing.Listing.create.new'
                        defaultMessage='Let’s get started !'
                    />
                )}
                subTitle={(
                    <FormattedMessage
                        id='Policies.Listing.Listing.policies.tooltip'
                        defaultMessage={
                            'Policies provide the capability to alter the behavior '
                            + 'of API resources'
                        }
                    />
                )}
            >
                <OnboardingMenuCard
                    to='/policy-templates/create'
                    name='Policy Templates'
                    iconName={policyTemplateAddIcon}
                    disabled={isRestricted(['apim:shared_scope_manage'])}
                />
            </Onboarding>
        );
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
                <Typography variant='h4' align='left' component='h1' className={classes.mainTitle}>
                    <FormattedMessage
                        id='Policies.Listing.Listing.heading.policyTemplates.heading'
                        defaultMessage='Policy Templates'
                    />
                </Typography>
                <Tooltip
                    title={(
                        <FormattedMessage
                            id='Apis.Details.Policies.PolicyTemplates.heading.tooltip'
                            defaultMessage={'You can use these policy templates at the resource level of'
                            + ' a desired API by navigating to the Policies tab under that API'}
                        />
                    )}
                    placement='bottom-start'
                >
                    <IconButton size='small' aria-label='Policy-templates-helper-text'>
                        <HelpOutlineIcon fontSize='small' />
                    </IconButton>
                </Tooltip>
                <Box pl={1}>
                    <Button
                        color='primary'
                        variant='outlined'
                        size='small'
                        disabled={isRestricted(['apim:shared_scope_manage'])}
                        component={Link}
                        to={!isRestricted(['apim:shared_scope_manage']) && createUrl}
                    >
                        <AddCircle className={classes.buttonIcon} />
                        <FormattedMessage
                            id='Policies.Listing.Listing.heading.policyTemplate.new'
                            defaultMessage='Add Policy Template'
                        />
                    </Button>
                </Box>
                {isRestricted(['apim:shared_scope_manage']) && (
                    <Grid item>
                        <Typography variant='body2' color='primary'>
                            <FormattedMessage
                                id='Policies.Listing.Listing.update.not.allowed'
                                defaultMessage={
                                    '*You are not authorized to update policy templates of'
                                + ' due to insufficient permissions'
                                }
                            />
                        </Typography>
                    </Grid>
                )}
            </Grid>
            <Grid className={classes.table} xs={12} sm={12} md={11} lg={11} item>
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

Listing.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({}),
    }),
    classes: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({ formatMessage: PropTypes.func }).isRequired,
};

Listing.defaultProps = {
    match: { params: {} },
};

export default injectIntl(withAPI(withStyles(styles, { withTheme: true })(Listing)));
