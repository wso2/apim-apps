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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormattedMessage, injectIntl } from 'react-intl';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import ChipInput from 'AppComponents/Shared/ChipInput'; // DEPRECATED: Do not COPY and use this component.
import APIValidation from 'AppData/APIValidation';
import base64url from 'base64url';
import Error from '@mui/icons-material/Error';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import Icon from '@mui/material/Icon';
import Paper from '@mui/material/Paper';
import { red } from '@mui/material/colors/';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from 'AppComponents/Shared/Alert';
import Api from 'AppData/api';
import { isRestricted } from 'AppData/AuthManager';

const PREFIX = 'CreateScope';

const classes = {
    root: `${PREFIX}-root`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    titleLink: `${PREFIX}-titleLink`,
    contentWrapper: `${PREFIX}-contentWrapper`,
    mainTitle: `${PREFIX}-mainTitle`,
    FormControl: `${PREFIX}-FormControl`,
    FormControlOdd: `${PREFIX}-FormControlOdd`,
    FormControlLabel: `${PREFIX}-FormControlLabel`,
    buttonSection: `${PREFIX}-buttonSection`,
    saveButton: `${PREFIX}-saveButton`,
    helpText: `${PREFIX}-helpText`,
    extraPadding: `${PREFIX}-extraPadding`,
    addNewOther: `${PREFIX}-addNewOther`,
    titleGrid: `${PREFIX}-titleGrid`,
    descriptionForm: `${PREFIX}-descriptionForm`,
    progress: `${PREFIX}-progress`
};

const StyledGrid = styled(Grid)((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        flexGrow: 1,
        marginTop: 10,
        display: 'flex',
        flexDirection: 'column',
        padding: 20,
    },

    [`& .${classes.titleWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing(3),
    },

    [`& .${classes.titleLink}`]: {
        color: theme.palette.primary.main,
        marginRight: theme.spacing(1),
    },

    [`& .${classes.contentWrapper}`]: {
        maxWidth: theme.custom.contentAreaWidth,
    },

    [`& .${classes.mainTitle}`]: {
        paddingLeft: 0,
    },

    [`& .${classes.FormControl}`]: {
        padding: `0 0 0 ${theme.spacing(1)}`,
        width: '100%',
        marginTop: 0,
    },

    [`& .${classes.FormControlOdd}`]: {
        padding: `0 0 0 ${theme.spacing(1)}`,
        backgroundColor: theme.palette.background.paper,
        width: '100%',
        marginTop: 0,
    },

    [`& .${classes.FormControlLabel}`]: {
        marginBottom: theme.spacing(1),
        marginTop: theme.spacing(1),
        fontSize: theme.typography.caption.fontSize,
    },

    [`& .${classes.buttonSection}`]: {
        paddingTop: theme.spacing(3),
    },

    [`& .${classes.saveButton}`]: {
        marginRight: theme.spacing(1),
    },

    [`& .${classes.helpText}`]: {
        color: theme.palette.text.hint,
        marginTop: theme.spacing(1),
    },

    [`& .${classes.extraPadding}`]: {
        paddingLeft: theme.spacing(2),
    },

    [`& .${classes.addNewOther}`]: {
        paddingTop: 40,
    },

    [`& .${classes.titleGrid}`]: {
        ' & .MuiGrid-item': {
            padding: 0,
            margin: 0,
        },
    },

    [`& .${classes.descriptionForm}`]: {
        marginTop: theme.spacing(1),
    },

    [`& .${classes.progress}`]: {
        marginLeft: theme.spacing(1),
    }
}));

// eslint-disable-next-line valid-jsdoc
/**
 * Create new scopes for an API
 * @class CreateScope
 * @extends {Component}
 */
class CreateScope extends React.Component {
    /**
     * constructor
     * @param {JSON} props parent props.
     */
    constructor(props) {
        super(props);
        this.api = new Api();
        this.api_uuid = props.match.params.api_uuid;
        const valid = [];
        valid.name = {
            invalid: false,
            error: '',
        };
        valid.description = {
            invalid: false,
            error: '',
        };
        valid.displayName = {
            invalid: false,
            error: '',
        };
        this.state = {
            apiScopes: null,
            apiScope: {},
            validRoles: [],
            valid,
            roleValidity: true,
            invalidRoles: [],
            scopeAddDisabled: false,
        };
        this.addScope = this.addScope.bind(this);
        this.validateScopeName = this.validateScopeName.bind(this);
        this.handleScopeNameInput = this.handleScopeNameInput.bind(this);
        this.validateScopeDescription = this.validateScopeDescription.bind(this);
        this.validateScopeDisplayName = this.validateScopeDisplayName.bind(this);
        this.handleRoleAddition = this.handleRoleAddition.bind(this);
        this.handleRoleDeletion = this.handleRoleDeletion.bind(this);
    }

    handleRoleDeletion = (role) => {
        const { validRoles, invalidRoles } = this.state;
        if (invalidRoles.includes(role)) {
            const invalidRolesArray = invalidRoles.filter((existingRole) => existingRole !== role);
            this.setState({ invalidRoles: invalidRolesArray });
            if (invalidRolesArray.length === 0) {
                this.setState({ roleValidity: true });
            }
        } else {
            this.setState({ validRoles: validRoles.filter((existingRole) => existingRole !== role) });
        }
    };

    /**
     * Handle ScopeName Input.
     * @param {JSON} event click event.
     */
    handleScopeNameInput({ target: { id, value } }) {
        this.validateScopeName(id, value);
    }

    /**
     * Handle Role Addition.
     * @param {string} role The first number.
     */
    handleRoleAddition(role) {
        const { validRoles, invalidRoles } = this.state;
        const { intl } = this.props;
        const promise = APIValidation.role.validate(base64url.encode(role));
        promise
            .then(() => {
                const splitRole = role.split('/', 2);
                let validatedRole = '';
                if (splitRole.length > 1) {
                    const domain = splitRole.length > 0 ? splitRole[0] : '';
                    if (domain.toUpperCase() !== 'INTERNAL') {
                        const domainUpperCase = domain.toUpperCase().concat('/');
                        validatedRole = domainUpperCase.concat(splitRole[1]);
                    } else {
                        validatedRole = role;
                    }
                } else {
                    validatedRole = role;
                }
                if (!validRoles.includes(validatedRole)) {
                    this.setState({
                        roleValidity: true,
                        validRoles: [...validRoles, validatedRole],
                    });
                }
            })
            .catch((error) => {
                if (error.status === 404) {
                    this.setState({
                        roleValidity: false,
                        invalidRoles: [...invalidRoles, role],
                    });
                } else {
                    Alert.error(intl.formatMessage(
                        {
                            id: 'Apis.Details.Scopes.Create.Scope.validate.role.error',
                            defaultMessage: 'Error when validating role: {role}',
                        },
                        {
                            role,
                        },
                    ));
                    console.error('Error when validating role ' + error);
                }
            });
    }

    /**
     * validate Scope Description.
     * @param {JSON} event click event object.
     */
    validateScopeDescription({ target: { id, value } }) {
        const { valid, apiScope } = this.state;
        const { intl } = this.props;
        apiScope[id] = value;
        if (value && value.length !== '' && value.length >= 512) {
            valid[id].invalid = true;
            valid[id].error = intl.formatMessage({
                id: 'Scopes.Create.Scope.description.length.exceeded',
                defaultMessage: 'Exceeds maximum length limit of 512 characters',
            });
        } else {
            valid[id].invalid = false;
            valid[id].error = '';
        }
        this.setState({
            valid,
            apiScope,
        });
    }

    /**
     * validate Scope Display Name.
     * @param {JSON} event click event object.
     */
    validateScopeDisplayName({ target: { id, value } }) {
        const { valid, apiScope } = this.state;
        const { intl } = this.props;
        apiScope[id] = value;
        if (value && value.length !== '' && value.length >= 512) {
            valid[id].invalid = true;
            valid[id].error = intl.formatMessage({
                id: 'Scopes.Create.Scope.display.name.length.exceeded',
                defaultMessage: 'Exceeds maximum length limit of 512 characters',
            });
        } else {
            valid[id].invalid = false;
            valid[id].error = '';
        }
        this.setState({
            valid,
            apiScope,
        });
    }

    /**
     * validate Scope Name.
     * @param {string} id click event object.
     * @param {string} value click event object.
     * @returns {boolean} valid state
     */
    validateScopeName(id, value) {
        const { valid, apiScope } = this.state;
        const {
            api: { scopes },
        } = this.props;
        const { intl } = this.props;
        apiScope[id] = value;
        valid[id].invalid = false
        // length validation
        if (!(value && value.length > 0)) {
            valid[id].invalid = true;
            valid[id].error = intl.formatMessage({
                id: 'Scopes.Create.Scope.name.empty',
                defaultMessage: 'Scope name cannot be empty'
            });
        }
        if (!valid[id].invalid && !(value && value.length <= 60)) {
            valid[id].invalid = true;
            valid[id].error = intl.formatMessage({
                id: 'Scopes.Create.Scope.name.length.exceeded',
                defaultMessage: 'Exceeds maximum length limit of 60 characters',
            });
        }

        if (!valid[id].invalid && /\s/.test(value)) {
            valid[id].invalid = true;
            valid[id].error = intl.formatMessage({
                id: 'Scopes.Create.Scope.name.have.spaces',
                defaultMessage: 'Scope name cannot have spaces',
            });
        }

        const exist = scopes.find((scopeEntry) => {
            return scopeEntry.scope.name === value;
        });
        if (!valid[id].invalid && exist) {
            valid[id].invalid = true;
            valid[id].error = intl.formatMessage({
                id: 'Scopes.Create.Scope.name.already.exist',
                defaultMessage: 'Scope name already exist'
            });
        }
        if (!valid[id].invalid && /[!@#$%^&*(),?"{}[\]|<>\t\n]|(^apim:)/i.test(value)) {
            valid[id].invalid = true;
            valid[id].error = intl.formatMessage({
                id: 'Scopes.Create.Scope.name.has.special.characters',
                defaultMessage: 'Field contains special characters',
            });
        }
        if (!valid[id].invalid) {
            const promise = APIValidation.scope.validate(base64url.encode(value));
            promise
                .then(() => {
                    valid[id].invalid = true;
                    valid[id].error = intl.formatMessage({
                        id: 'Scopes.Create.Scope.name.already.used',
                        defaultMessage: 'Scope name is already used by another API',
                    });
                    this.setState({
                        valid,
                    });
                })
                .catch((error) => {
                    if (error.status === 404) {
                        valid[id].invalid = false;
                        valid[id].error = '';
                        this.setState({
                            valid,
                        });
                    } else {
                        Alert.error(intl.formatMessage(
                            {
                                id: 'Apis.Details.Scopes.Create.Scope.validate.scope.error',
                                defaultMessage: 'Error when validating scope: {value}',
                            },
                            {
                                scope: value,
                            },
                        ));
                        console.error('Error when validating scope ' + error);
                    }
                });
        }
        if (!valid[id].invalid) {
            valid[id].error = '';
        }
        this.setState({
            valid,
            apiScope,
        });
        return valid[id].invalid;
    }

    /**
     * Add new scope
     * @memberof Scopes
     */
    addScope() {
        const {
            intl, api, history, updateAPI,
        } = this.props;
        const urlPrefix = api.apiType === Api.CONSTS.APIProduct ? 'api-products' : 'apis';
        if (this.validateScopeName('name', this.state.apiScope.name)) {
            // return status of the validation
            return;
        }
        const scope = this.state.apiScope;
        scope.bindings = this.state.validRoles;
        const scopes = api.scopes.map((aScope) => {
            return aScope;
        });
        scopes.push({
            scope,
            shared: false,
        });
        const updateProperties = { scopes };
        const promisedApiUpdate = updateAPI(updateProperties);
        this.setState({ scopeAddDisabled: true });
        promisedApiUpdate
            .then(() => {
                Alert.info(intl.formatMessage({
                    id: 'Apis.Details.Scopes.CreateScope.scope.added.successfully',
                    defaultMessage: 'Scope added successfully',
                }));
                const { apiScopes } = this.state;
                const redirectURL = '/' + urlPrefix + '/' + api.id + '/scopes/';
                history.push(redirectURL);
                this.setState({
                    apiScopes,
                    apiScope: {},
                    validRoles: [],
                });
            })
            .catch((error) => {
                const { response } = error;
                if (response.body) {
                    const { description } = response.body;
                    Alert.error(description);
                }
            })
            .finally(() => {
                this.setState({ scopeAddDisabled: false });
            });
    }

    /**
     * Render.
     * @returns {JSX} rendered component.
     */
    render() {
        const {  api, intl } = this.props;
        const urlPrefix = api.apiType === Api.CONSTS.APIProduct ? 'api-products' : 'apis';
        const url = `/${urlPrefix}/${api.id}/scopes`;
        const {
            roleValidity, validRoles, invalidRoles, scopeAddDisabled,
        } = this.state;

        return (
            <StyledGrid container spacing={3}>
                <Grid item sm={12} md={12} />
                {/*
            Following two grids control the placement of whole create page
            For centering the content better use `container` props, but instead used an empty grid item for flexibility
             */}
                <Grid item sm={0} md={0} lg={2} />
                <Grid item sm={12} md={12} lg={8}>
                    <Grid container spacing={5} className={classes.titleGrid}>
                        <Grid item md={12}>
                            <div className={classes.titleWrapper}>
                                <Link to={url} className={classes.titleLink}>
                                    <Typography variant='h4' component='h2'>
                                        <FormattedMessage
                                            id='Apis.Details.Scopes.Scopes.heading.scope.heading'
                                            defaultMessage='Scopes'
                                        />
                                    </Typography>
                                </Link>
                                <Icon>keyboard_arrow_right</Icon>
                                <Typography variant='h4' component='h3'>
                                    <FormattedMessage
                                        id='Apis.Details.Scopes.CreateScope.create.new.scope'
                                        defaultMessage='Create New Scope'
                                    />
                                </Typography>
                            </div>
                        </Grid>
                        <Grid item md={12}>
                            <Paper elevation={0} className={classes.root}>
                                <FormControl margin='normal'>
                                    <TextField
                                        id='name'
                                        label={intl.formatMessage({
                                            id: 'Apis.Details.Scopes.Create.CreateScope.label.name',
                                            defaultMessage: 'Name',
                                        })}
                                        placeholder={intl.formatMessage({
                                            id: 'Apis.Details.Scopes.Create.CreateScope.placholder.name',
                                            defaultMessage: 'Scope Name',
                                        })}
                                        error={this.state.valid.name.invalid}
                                        helperText={
                                            this.state.valid.name.invalid ? (
                                                this.state.valid.name.error
                                            ) : (
                                                <FormattedMessage
                                                    id='Apis.Details.Scopes.CreateScope.short.description.name'
                                                    defaultMessage='Enter Scope Name ( E.g.,: creator )'
                                                />
                                            )
                                        }
                                        fullWidth
                                        margin='normal'
                                        variant='outlined'
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        value={this.state.apiScope.name || ''}
                                        onChange={this.handleScopeNameInput}
                                    />
                                </FormControl>
                                <FormControl margin='normal'>
                                    <TextField
                                        id='displayName'
                                        label={intl.formatMessage({
                                            id: 'Apis.Details.Scopes.Create.CreateScope.label.display.name',
                                            defaultMessage: 'Display Name',
                                        })}
                                        placeholder={intl.formatMessage({
                                            id: 'Apis.Details.Scopes.Create.CreateScope.placeholder.display.name',
                                            defaultMessage: 'Scope Display Name',
                                        })}
                                        error={this.state.valid.displayName.invalid}
                                        helperText={
                                            this.state.valid.displayName.invalid ? (
                                                this.state.valid.displayName.error
                                            ) : (
                                                <FormattedMessage
                                                    id='Apis.Details.Scopes.CreateScope.short.description.name'
                                                    defaultMessage='Enter Scope Name ( E.g.,: creator )'
                                                />
                                            )
                                        }
                                        fullWidth
                                        margin='normal'
                                        variant='outlined'
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        value={this.state.apiScope.displayName || ''}
                                        onChange={this.validateScopeDisplayName}
                                    />
                                </FormControl>
                                <FormControl margin='normal' classes={{ root: classes.descriptionForm }}>
                                    <TextField
                                        id='description'
                                        label={intl.formatMessage({
                                            id: 'Apis.Details.Scopes.CreateScope.description.about.the.scope.label',
                                            defaultMessage: 'Description',
                                        })}
                                        variant='outlined'
                                        placeholder={intl.formatMessage({
                                            id: 'Apis.Details.Scopes.CreateScope.description.about.the.scope.'
                                                + 'placeholder',
                                            defaultMessage: 'Short description about the scope',
                                        })}
                                        error={this.state.valid.description.invalid}
                                        helperText={
                                            this.state.valid.description.invalid ? (
                                                this.state.valid.description.error
                                            ) : (
                                                <FormattedMessage
                                                    id='Apis.Details.Scopes.CreateScope.description.about.the.scope'
                                                    defaultMessage='Short description about the scope'
                                                />
                                            )
                                        }
                                        margin='normal'
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        onChange={this.validateScopeDescription}
                                        value={this.state.apiScope.description || ''}
                                        multiline
                                    />
                                </FormControl>
                                <FormControl margin='normal'>
                                    <ChipInput
                                        label={intl.formatMessage({
                                            id: 'Apis.Details.Scopes.Create.CreateScope.roles.label',
                                            defaultMessage: 'Roles',
                                        })}
                                        fullWidth
                                        id='roles-input'
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        variant='outlined'
                                        value={validRoles.concat(invalidRoles)}
                                        alwaysShowPlaceholder={false}
                                        placeholder={intl.formatMessage({
                                            id: 'Apis.Details.Scopes.Create.CreateScope.roles.placeholder',
                                            defaultMessage: 'Enter roles and press Enter',
                                        })}
                                        blurBehavior='clear'
                                        InputProps={{
                                            endAdornment: !roleValidity && (
                                                <InputAdornment position='end'>
                                                    <Error color='error' />
                                                </InputAdornment>
                                            ),
                                        }}
                                        onAdd={this.handleRoleAddition}
                                        error={!roleValidity}
                                        helperText={
                                            !roleValidity ? (
                                                <FormattedMessage
                                                    id='Apis.Details.Scopes.Roles.Invalid'
                                                    defaultMessage='Role is invalid'
                                                />
                                            ) : (
                                                <FormattedMessage
                                                    id='Apis.Details.Scopes.CreateScope.roles.help'
                                                    defaultMessage='Enter a valid role and press `Enter`.'
                                                />
                                            )
                                        }
                                        chipRenderer={({ value }, key) => (
                                            <Chip
                                                key={key}
                                                label={value}
                                                onDelete={() => {
                                                    this.handleRoleDeletion(value);
                                                }}
                                                style={{
                                                    backgroundColor: invalidRoles.includes(value) ? red[300] : null,
                                                    marginRight: '8px',
                                                    float: 'left',
                                                }}
                                            />
                                        )}
                                    />
                                </FormControl>
                                <div className={classes.addNewOther}>
                                    <Button
                                        id='scope-save-btn'
                                        variant='contained'
                                        color='primary'
                                        onClick={this.addScope}
                                        disabled={
                                            isRestricted(['apim:api_create'], api)
                                            || this.state.valid.name.invalid
                                            || invalidRoles.length !== 0
                                            || scopeAddDisabled
                                            || api.isRevision
                                            || this.state.valid.description.invalid
                                        }
                                        className={classes.saveButton}
                                    >
                                        {scopeAddDisabled ? (
                                            <>
                                                <FormattedMessage
                                                    id='Apis.Details.Scopes.CreateScope.saving'
                                                    defaultMessage='Saving'
                                                />
                                                <CircularProgress size={16} classes={{ root: classes.progress }} />
                                            </>
                                        ) : (
                                            <FormattedMessage
                                                id='Apis.Details.Scopes.CreateScope.save'
                                                defaultMessage='Save'
                                            />
                                        )}
                                    </Button>
                                    <Button
                                        component={Link}
                                        to={url}
                                    >
                                        <FormattedMessage
                                            id='Apis.Details.Scopes.CreateScope.cancel'
                                            defaultMessage='Cancel'
                                        />
                                    </Button>
                                </div>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </StyledGrid>
        );
    }
}

CreateScope.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({}),
    }),
    api: PropTypes.shape({
        id: PropTypes.string,
    }).isRequired,
    history: PropTypes.shape({ push: PropTypes.func }).isRequired,
    classes: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({ formatMessage: PropTypes.func }).isRequired,
    updateAPI: PropTypes.func.isRequired,
};

CreateScope.defaultProps = {
    match: { params: {} },
};

export default injectIntl((CreateScope));
