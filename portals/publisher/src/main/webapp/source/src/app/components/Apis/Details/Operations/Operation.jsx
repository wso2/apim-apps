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
import { styled, useTheme } from '@mui/material/styles';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import PropTypes from 'prop-types';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import ListSubheader from '@mui/material/ListSubheader';
import { injectIntl, FormattedMessage } from 'react-intl';
import TextField from '@mui/material/TextField';
import { Typography } from '@mui/material';
import Switch from '@mui/material/Switch';
import { isRestricted } from 'AppData/AuthManager';

const PREFIX = 'Operation';

const classes = {
    root: `${PREFIX}-root`,
    container: `${PREFIX}-container`,
    textField: `${PREFIX}-textField`,
    mainTitle: `${PREFIX}-mainTitle`,
    scopes: `${PREFIX}-scopes`,
    dropDown: `${PREFIX}-dropDown`,
    divider: `${PREFIX}-divider`,
    chip: `${PREFIX}-chip`,
    chipActive: `${PREFIX}-chipActive`,
    paper: `${PREFIX}-paper`,
    link: `${PREFIX}-link`,
    listItem: `${PREFIX}-listItem`,
    formControl: `${PREFIX}-formControl`,
    resourceRoot: `${PREFIX}-resourceRoot`,
    deleteButton: `${PREFIX}-deleteButton`,
    pathDisplay: `${PREFIX}-pathDisplay`,
    descriptionWrapper: `${PREFIX}-descriptionWrapper`,
    scopeSelect: `${PREFIX}-scopeSelect`,
    descriptionWrapperUp: `${PREFIX}-descriptionWrapperUp`,
    addParamRow: `${PREFIX}-addParamRow`,
    propsForm: `${PREFIX}-propsForm`,
    deleteLink: `${PREFIX}-deleteLink`,
    row: `${PREFIX}-row`
};

const StyledTableRow = styled(TableRow)((
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
        marginLeft: theme.spacing(),
        marginRight: theme.spacing(),
        width: 400,
    },

    [`& .${classes.mainTitle}`]: {
        paddingLeft: 20,
    },

    [`& .${classes.scopes}`]: {
        width: 400,
    },

    [`& .${classes.dropDown}`]: {
        width: theme.spacing(11.25),
    },

    [`& .${classes.divider}`]: {
        marginTop: 20,
        marginBottom: 20,
    },

    [`& .${classes.chip}`]: {
        margin: theme.spacing(),
        color: theme.palette.text.secondary,
        minWidth: 100,
    },

    [`& .${classes.chipActive}`]: {
        margin: theme.spacing(),
        color: theme.palette.text.secondary,
        background: theme.palette.background.active,
        minWidth: 100,
        borderRadius: theme.shape.borderRadius,
    },

    [`& .${classes.paper}`]: {
        padding: 20,
    },

    [`& .${classes.link}`]: {
        cursor: 'pointer',
    },

    [`& .${classes.listItem}`]: {
        paddingLeft: 0,
        display: 'flex',
        alignItems: 'center',
    },

    [`& .${classes.formControl}`]: {
        paddingRight: 0,
        marginRight: 0,
    },

    [`& .${classes.resourceRoot}`]: {
        background: theme.palette.grey['100'],
        paddingLeft: theme.spacing(),
        paddingRight: theme.spacing(),
        borderRadius: theme.shape.borderRadius,
        marginBottom: theme.spacing(),
    },

    [`& .${classes.deleteButton}`]: {
        marginLeft: 'auto',
    },

    [`& .${classes.pathDisplay}`]: {
        marginRight: theme.spacing(2),
        marginLeft: theme.spacing(2),
    },

    [`& .${classes.descriptionWrapper}`]: {
        paddingTop: theme.spacing(),
        paddingBottom: theme.spacing(),
    },

    [`& .${classes.scopeSelect}`]: {
        width: '100%',
    },

    [`& .${classes.descriptionWrapperUp}`]: {
        paddingBottom: '0 !important',
    },

    [`& .${classes.addParamRow}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },

    [`& .${classes.propsForm}`]: {
        display: 'flex',
        alignItems: 'center',
    },

    [`& .${classes.deleteLink}`]: {
        cursor: 'pointer',
    },

    [`& .${classes.row}`]: {
        '& td': {
            borderBottom: 'none',
            verticalAlign: 'bottom',
            width: '33%',
            paddingLeft: 0,
        },
    }
}));

/**
 *
 */
class Operation extends React.Component {
    /**
     *
     * @param {any} props @inheritdoc
     */
    constructor(props) {
        super(props);
        this.state = {
            isSecurity: false,
        };
        this.handleScopeChange = this.handleScopeChange.bind(this);
        this.handlePolicyChange = this.handlePolicyChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    /**
     *
     * @param {*} operationAction event triggered for handle  Scope Change
     */
    handleScopeChange(operationAction) {
        const { operation } = this.props;
        const { data } = operationAction;
        const { value } = data || {};
        const defValue = value[0];
        const newoperation = {
            ...operation,
            scopes: [...operation.scopes],
        };
        newoperation.scopes = defValue;
        this.props.handleUpdateList(newoperation);
    }

    /**
     *
     * @param {*} e event triggered for handle  policy Change
     */
    handlePolicyChange(e) {
        const { operation } = this.props;
        const newoperation = { ...operation };
        newoperation.throttlingPolicy = e.target.value;
        this.props.handleUpdateList(newoperation);
    }

    /**
     * @param {*} event event triggered for handle  policy Change
     */
    handleChange(event) {
        const { operation } = this.props;
        const newoperation = { ...operation };
        const { checked } = event.target;
        if (checked) {
            newoperation.authType = 'Any';
        } else {
            newoperation.authType = 'None';
        }
        this.setState({
            isSecurity: checked,
        });
        this.props.handleUpdateList(newoperation);
    }

    /**
     * @inheritdoc
     */
    render() {
        const {
            operation, theme, apiPolicies, scopes, isOperationRateLimiting, sharedScopes, intl,
        } = this.props;
        const dropdownScopes = [...scopes];
        const { isSecurity } = this.state;
        const filteredApiScopes = dropdownScopes.filter((sharedScope) => !sharedScope.shared);
        let chipColor = theme.custom.operationChipColor
            ? theme.custom.operationChipColor[operation.verb.toLowerCase()]
            : null;
        let chipTextColor = '#000000';
        if (!chipColor) {
            console.log('Check the theme settings. The resourceChipColors is not populated properlly');
            chipColor = '#cccccc';
        } else {
            chipTextColor = theme.palette.getContrastText(
                theme.custom.operationChipColor[operation.verb.toLowerCase()],
            );
        }
        return (
            <StyledTableRow style={{ borderStyle: 'hidden' }} data-testid={operation.target + '-tbl-row'}>
                <TableCell>
                    <Typography variant='body1'>
                        {operation.target}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Chip
                        label={operation.verb}
                        style={{
                            backgroundColor: chipColor, color: chipTextColor, height: 20, width: 40, fontSize: 9,
                        }}
                        className={classes.chipActive}
                    />
                </TableCell>
                <TableCell>
                    <Select
                        className={classes.dropDown}
                        value={isOperationRateLimiting ? operation.throttlingPolicy : ''}
                        disabled={(!isOperationRateLimiting || isRestricted(['apim:api_publish', 'apim:api_create']))}
                        onChange={this.handlePolicyChange}
                        fieldName='Throttling Policy'
                    >
                        {apiPolicies.map((policy) => (
                            <MenuItem
                                key={policy.name}
                                value={policy.name}
                            >
                                {policy.displayName}
                            </MenuItem>
                        ))}
                    </Select>
                </TableCell>
                <TableCell>
                    <TextField
                        id='operation_scope'
                        select
                        SelectProps={{
                            multiple: true,
                            renderValue: (selected) => (Array.isArray(selected) ? selected.join(', ') : selected),
                        }}
                        fullWidth
                        label={dropdownScopes.length !== 0 || sharedScopes ? intl.formatMessage({
                            id: 'Apis.Details.Operations.Operation.operation.scope.label.default',
                            defaultMessage: 'Operation scope',
                        }) : intl.formatMessage({
                            id: 'Apis.Details.Operations.Operation.operation.scope.label.notAvailable',
                            defaultMessage: 'No scope available',
                        })}
                        value={operation.scopes}
                        onChange={({ target: { value } }) => this.handleScopeChange({
                            data: { value: value ? [value] : [] },
                        })}
                        helperText={(
                            <FormattedMessage
                                id='Apis.Details.Operations.Operation.operation.scope.helperText'
                                defaultMessage='Select a scope to control permissions to this operation'
                            />
                        )}
                        margin='dense'
                        variant='outlined'
                        disabled={isRestricted(['apim:api_publish', 'apim:api_create'])}
                    >
                        <ListSubheader>
                            <FormattedMessage
                                id='Apis.Details.Operations.Operation.operation.scope.select.local'
                                defaultMessage='API Scopes'
                            />
                        </ListSubheader>
                        {filteredApiScopes.length !== 0 ? filteredApiScopes.map((apiScope) => (
                            <MenuItem
                                key={apiScope.scope.name}
                                value={apiScope.scope.name}
                                dense
                            >
                                <Checkbox checked={operation.scopes.includes(apiScope.scope.name)} color='primary' />
                                {apiScope.scope.name}
                            </MenuItem>
                        )) : (
                            <MenuItem
                                value=''
                                disabled
                            >
                                <em>
                                    <FormattedMessage
                                        id='Apis.Details.Operations.Operation.operation.no.api.scope.available'
                                        defaultMessage='No API scopes available'
                                    />
                                </em>
                            </MenuItem>
                        )}
                        <ListSubheader>
                            <FormattedMessage
                                id='Apis.Details.Operations.Operation.operation.scope.select.shared'
                                defaultMessage='Shared Scopes'
                            />
                        </ListSubheader>
                        {sharedScopes && sharedScopes.length !== 0 ? sharedScopes.map((sharedScope) => (
                            <MenuItem
                                key={sharedScope.scope.name}
                                value={sharedScope.scope.name}
                                dense
                            >
                                <Checkbox checked={operation.scopes.includes(sharedScope.scope.name)} color='primary' />
                                {sharedScope.scope.name}
                            </MenuItem>
                        )) : (
                            <MenuItem
                                value=''
                                disabled
                            >
                                <em>
                                    <FormattedMessage
                                        id='Apis.Details.Operations.Operation.operation.no.sharedpi.scope.available'
                                        defaultMessage='No shared scopes available'
                                    />
                                </em>
                            </MenuItem>
                        )}
                    </TextField>
                </TableCell>
                <TableCell>
                    <Switch
                        checked={(() => {
                            if (operation.authType === 'None') {
                                return false;
                            }
                            return true;
                        })()}
                        onChange={this.handleChange}
                        value={isSecurity}
                        color='primary'
                        disabled={isRestricted(['apim:api_publish', 'apim:api_create'])}
                        data-testid={operation.target + '-security-btn'}
                    />
                </TableCell>
            </StyledTableRow>
        );
    }
}

Operation.propTypes = {
    classes: PropTypes.shape({
    }).isRequired,
    operation: PropTypes.shape({
        target: PropTypes.string,
        verb: PropTypes.string,
        throttlingPolicy: PropTypes.string,
        auth: PropTypes.string,
    }).isRequired,
    apiPolicies: PropTypes.shape({
    }).isRequired,
    isOperationRateLimiting: PropTypes.shape({
    }).isRequired,
    scopes: PropTypes.shape({
    }).isRequired,
    handleUpdateList: PropTypes.shape({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
    sharedScopes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default injectIntl((props) => {
    const theme = useTheme();
    return <Operation {...props} theme={theme} />;
});
