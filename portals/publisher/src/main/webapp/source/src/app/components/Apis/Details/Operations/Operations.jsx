/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Api from 'AppData/api';
import { Progress } from 'AppComponents/Shared';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { doRedirectToLogin } from 'AppComponents/Shared/RedirectToLogin';
import Grid from '@mui/material/Grid';
import { FormattedMessage, injectIntl } from 'react-intl';
import { withRouter } from 'react-router';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import CustomSplitButton from 'AppComponents/Shared/CustomSplitButton';
import { isRestricted } from 'AppData/AuthManager';
import { getBasePath } from 'AppComponents/Shared/Utils';
import APIRateLimiting from '../Resources/components/APIRateLimiting';
import Operation from './Operation';

const PREFIX = 'Operations';

const classes = {
    root: `${PREFIX}-root`,
    container: `${PREFIX}-container`,
    textField: `${PREFIX}-textField`,
    mainTitle: `${PREFIX}-mainTitle`,
    scopes: `${PREFIX}-scopes`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    button: `${PREFIX}-button`,
    buttonMain: `${PREFIX}-buttonMain`,
    addNewWrapper: `${PREFIX}-addNewWrapper`,
    contentWrapper: `${PREFIX}-contentWrapper`,
    addNewHeader: `${PREFIX}-addNewHeader`,
    addNewOther: `${PREFIX}-addNewOther`,
    radioGroup: `${PREFIX}-radioGroup`,
    addResource: `${PREFIX}-addResource`,
    buttonIcon: `${PREFIX}-buttonIcon`,
    expansionPanel: `${PREFIX}-expansionPanel`,
    expansionPanelDetails: `${PREFIX}-expansionPanelDetails`
};


const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        flexGrow: 1,
        marginTop: 10,
    },

    [`& .${classes.container}`]: {
        display: 'flex',
        flexWrap: 'wrap',
    },

    [`& .${classes.textField}`]: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 400,
    },

    [`& .${classes.mainTitle}`]: {
        paddingLeft: 0,
    },

    [`& .${classes.scopes}`]: {
        width: 400,
    },

    [`& .${classes.titleWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },

    [`& .${classes.button}`]: {
        marginLeft: theme.spacing(2),
        color: theme.palette.getContrastText(theme.palette.primary.main),
    },

    [`& .${classes.buttonMain}`]: {
        color: theme.palette.getContrastText(theme.palette.primary.main),
        marginRight: theme.spacing(1),
    },

    [`& .${classes.addNewWrapper}`]: {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.getContrastText(theme.palette.background.paper),
        border: 'solid 1px ' + theme.palette.grey['300'],
        borderRadius: theme.shape.borderRadius,
        marginTop: theme.spacing(2),
    },

    [`& .${classes.contentWrapper}`]: {
        maxWidth: theme.custom.contentAreaWidth,
    },

    [`& .${classes.addNewHeader}`]: {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.grey['300'],
        fontSize: theme.typography.h6.fontSize,
        color: theme.typography.h6.color,
        fontWeight: theme.typography.h6.fontWeight,
    },

    [`& .${classes.addNewOther}`]: {
        padding: theme.spacing(2),
    },

    [`& .${classes.radioGroup}`]: {
        display: 'flex',
        flexDirection: 'row',
        width: 300,
    },

    [`& .${classes.addResource}`]: {
        width: 600,
        marginTop: 0,
    },

    [`& .${classes.buttonIcon}`]: {
        marginRight: 10,
    },

    [`& .${classes.expansionPanel}`]: {
        marginBottom: theme.spacing(1),
    },

    [`& .${classes.expansionPanelDetails}`]: {
        flexDirection: 'column',
    }
}));

/**
 * This class defined for operation List
 */
class Operations extends React.Component {
    /**
     *
     * @param {*} props the props parameters
     */
    constructor(props) {
        super(props);
        const { api } = props;
        const { operations } = api;
        const operationCopy = [...operations];
        operationCopy.sort((a, b) => ((a.target + a.verb > b.target + b.verb) ? 1 : -1));
        this.state = {
            notFound: false,
            apiPolicies: [],
            enableReadOnly: false,
            operations: operationCopy,
            apiThrottlingPolicy: api.apiThrottlingPolicy,
            filterKeyWord: '',
            isSaving: false,
            sharedScopes: [],
            apiScopesByName: {},
            sharedScopesByName: {},
        };

        this.newApi = new Api();
        this.handleUpdateList = this.handleUpdateList.bind(this);
        this.handleApiThrottlePolicy = this.handleApiThrottlePolicy.bind(this);
        this.updateOperations = this.updateOperations.bind(this);
        this.handleSaveAndDeployOperations = this.handleSaveAndDeployOperations.bind(this);
    }

    /**
     *
     */
    componentDidMount() {
        const { api } = this.props;
        const apiScopesByNameList = {};
        const promisedResPolicies = Api.policies('api');
        promisedResPolicies
            .then((policies) => {
                this.setState({ apiPolicies: policies.obj.list });
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
                const { status } = error.status;
                if (status === 404) {
                    this.setState({ notFound: true });
                } else if (status === 401) {
                    doRedirectToLogin();
                }
            });

        for (const scopeObject of api.scopes) {
            const modifiedScope = {};
            modifiedScope.scope = scopeObject.scope;
            modifiedScope.shared = scopeObject.shared;
            apiScopesByNameList[scopeObject.scope.name] = modifiedScope;
        }
        this.setState({ apiScopesByName: apiScopesByNameList });
        this.getAllSharedScopes();
        api.getSettings().then((settings) => {
            this.setState({ enableReadOnly: settings.portalConfigurationOnlyModeEnabled });
        });
    }

    /**
     *
     * @param {*} event
     */
    setFilterByKeyWord(event) {
        this.setState({ filterKeyWord: event.target.value.toLowerCase() });
    }

    /**
     * @memberof Operations
     */
    getAllSharedScopes() {
        Api.getAllScopes()
            .then((response) => {
                if (response.body && response.body.list) {
                    const sharedScopesList = [];
                    const sharedScopesByNameList = {};
                    const shared = true;
                    for (const scope of response.body.list) {
                        const modifiedScope = {};
                        modifiedScope.scope = scope;
                        modifiedScope.shared = shared;
                        sharedScopesList.push(modifiedScope);
                        sharedScopesByNameList[scope.name] = modifiedScope;
                    }
                    this.setState({ sharedScopesByName: sharedScopesByNameList });
                    this.setState({ sharedScopes: sharedScopesList });
                }
            });
    }

    /**
     *
     *
     * @param {*} throttlePolicy
     * @memberof Operations
     */
    handleApiThrottlePolicy(apiThrottlingPolicy) {
        this.setState({ apiThrottlingPolicy });
    }

    /**
     *
     * @param {*} newOperation
     */
    handleUpdateList(newOperation) {
        const { operations, sharedScopesByName, apiScopesByName } = this.state;
        const updatedList = operations.map(
            (operation) => ((operation.target === newOperation.target && operation.verb === newOperation.verb)
                ? newOperation : operation),
        );

        for (const selectedScope of newOperation.scopes) {
            if (selectedScope
                && !apiScopesByName[selectedScope]
                && apiScopesByName[selectedScope] !== '') {
                if (selectedScope in sharedScopesByName) {
                    apiScopesByName[selectedScope] = sharedScopesByName[selectedScope];
                }
            }
        }
        this.setState({ apiScopesByName });
        this.setState({ operations: updatedList });
    }

    /**
     *
     */
    handleSaveAndDeployOperations() {
        const { operations, apiThrottlingPolicy, apiScopesByName } = this.state;
        const { api, history, updateAPI } = this.props;
        this.setState({ isSaving: true });
        this.updateApiScopes(operations);
        const scopes = Object.keys(apiScopesByName).map((key) => { return apiScopesByName[key]; });
        updateAPI({ operations, apiThrottlingPolicy, scopes }).finally(() => {
            history.push({
                pathname: api.isAPIProduct() ? `/api-products/${api.id}/deployments`
                    : `/apis/${api.id}/deployments`,
                state: 'deploy',
            });
            this.setState({ isSaving: false });
        })
    };

    /**
     *
     */
    updateOperations() {
        const { operations, apiThrottlingPolicy, apiScopesByName } = this.state;
        const { updateAPI } = this.props;
        this.setState({ isSaving: true });
        this.updateApiScopes(operations);
        const scopes = Object.keys(apiScopesByName).map((key) => { return apiScopesByName[key]; });
        updateAPI({ operations, apiThrottlingPolicy, scopes }).finally(() => this.setState({ isSaving: false }));
    }

    /**
     *
     * This method modifies the security definition scopes by removing the scopes which are not present
     * in operations and which are shared scopes
     * @param {Array} apiOperations Operations list
     */
    updateApiScopes(apiOperations) {
        const { apiScopesByName, sharedScopesByName } = this.state;
        Object.keys(apiScopesByName).forEach((key) => {
            let isScopeExistsInOperation = false;
            for (const operation of apiOperations) {
                // Checking if the scope resides in the operation
                if (operation.scopes.includes(key)) {
                    isScopeExistsInOperation = true;
                    break;
                }
            }
            // Checking if the scope exists in operation and is a shared scope
            if (!isScopeExistsInOperation && (key in sharedScopesByName)) {
                delete apiScopesByName[key];
            }
        });
        this.setState({ apiScopesByName });
    }

    /**
     * @inheritdoc
     */
    render() {
        const { api, resourceNotFoundMessage, intl, componentValidator} = this.props;
        const {
            operations, apiPolicies, apiThrottlingPolicy, isSaving,
            filterKeyWord, notFound, sharedScopes, enableReadOnly,
        } = this.state;
        if (notFound) {
            return <ResourceNotFound message={resourceNotFoundMessage} />;
        }
        if (!operations && apiPolicies.length === 0) {
            return <Progress />;
        }
        return (
            (<Root>
                <Box pb={3}>
                    <Typography variant='h5'>
                        <FormattedMessage
                            id='Apis.Details.Operations.Operations.title'
                            defaultMessage='Operations'
                        />
                    </Typography>
                </Box>
                <Grid item md={12}>
                    <APIRateLimiting
                        operationRateLimits={apiPolicies}
                        api={api}
                        value={apiThrottlingPolicy}
                        onChange={this.handleApiThrottlePolicy}
                    />
                </Grid>
                <Grid item>
                    <Box mt={4} pb={2}>
                        <div className={classes.searchWrapper}>
                            <TextField
                                id='outlined-full-width'
                                disabled={isRestricted(['apim:api_publish', 'apim:api_create'])}
                                label={(
                                    <FormattedMessage
                                        id='Apis.Details.Operations.filter.label'
                                        defaultMessage='Operation'
                                    />
                                )}
                                placeholder={intl.formatMessage({
                                    id: 'Apis.Details.Operations.filter.placeholder',
                                    defaultMessage: 'Filter Operations',
                                })}
                                onChange={(e) => this.setFilterByKeyWord(e, api.operations)}
                                fullWidth
                                variant='outlined'
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                sx={{ width:'initial' }}
                            />
                        </div>
                    </Box>
                </Grid>
                <Grid item>
                    <Paper>
                        <Grid container>
                            <Grid item md={12}>
                                <Table>
                                    <TableRow>
                                        <TableCell>
                                            <Typography variant='subtitle2'>
                                                <FormattedMessage
                                                    id='Apis.Details.Operations.operation.operationName'
                                                    defaultMessage='Operation'
                                                />
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant='subtitle2'>
                                                <FormattedMessage
                                                    id='Apis.Details.Operations.Operation.OperationType'
                                                    defaultMessage='Operation Type'
                                                />
                                            </Typography>
                                        </TableCell>
                                        {componentValidator.includes("operationLevelRateLimiting") &&
                                            <TableCell>
                                                <Typography variant='subtitle2'>
                                                    <FormattedMessage
                                                        id='Apis.Details.Operations.Operation
                                                            .throttling.policy'
                                                        defaultMessage='Rate Limiting'
                                                    />
                                                </Typography>
                                            </TableCell>
                                        }
                                        {componentValidator.includes("operationSecurity") &&
                                            <>
                                                <TableCell>
                                                    <Typography variant='subtitle2'>
                                                        <FormattedMessage
                                                            id='Apis.Details.Operations.Operation.scopes'
                                                            defaultMessage='Scope'
                                                        />
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant='subtitle2'>
                                                        <FormattedMessage
                                                            id='Apis.Details.Operations.Operation.authType'
                                                            defaultMessage='Security Enabled'
                                                        />
                                                    </Typography>
                                                </TableCell>
                                            </>
                                        }
                                    </TableRow>
                                    {operations.filter(
                                        (operation) => operation.target.toLowerCase().includes(filterKeyWord),
                                    ).map((item) => {
                                        return (
                                            <Operation
                                                operation={item}
                                                handleUpdateList={this.handleUpdateList}
                                                scopes={api.scopes}
                                                sharedScopes={sharedScopes}
                                                isOperationRateLimiting={apiThrottlingPolicy === null}
                                                apiPolicies={apiPolicies}
                                                componentValidator={componentValidator}
                                            />
                                        );
                                    })}
                                </Table>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
                <Grid container direction='row' spacing={1} style={{marginTop: 20}}>
                    <Grid item>
                        {api.isRevision || enableReadOnly || isRestricted(['apim:api_create'], api) ? (
                            <Button
                                disabled
                                type='submit'
                                variant='contained'
                                color='primary'
                            >
                                <FormattedMessage
                                    id='Apis.Details.Operations.Operation.save'
                                    defaultMessage='Save'
                                />
                            </Button>
                        ) : (
                            <CustomSplitButton
                                advertiseInfo={api.advertiseInfo}
                                api={api}
                                handleSave={this.updateOperations}
                                handleSaveAndDeploy={this.handleSaveAndDeployOperations}
                                isUpdating={isSaving}
                            />
                        )}
                    </Grid>
                    <Grid item>
                        <Link to={getBasePath(api.apiType) + api.id + '/overview'}>
                            <Button>
                                <FormattedMessage
                                    id='Apis.Details.Operations.Operation.cancel'
                                    defaultMessage='Cancel'
                                />
                            </Button>
                        </Link>
                    </Grid>
                </Grid>
            </Root>)
        );
    }
}

Operations.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    api: PropTypes.shape({
        operations: PropTypes.arrayOf(PropTypes.shape({})),
        scopes: PropTypes.arrayOf(PropTypes.string),
        updateOperations: PropTypes.func,
        policies: PropTypes.func,
        id: PropTypes.string,
    }).isRequired,
    history: PropTypes.shape({
        push: PropTypes.shape({}),
    }).isRequired,
    resourceNotFoundMessage: PropTypes.shape({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
    updateAPI: PropTypes.func.isRequired,
};

export default withRouter(injectIntl((Operations)));
