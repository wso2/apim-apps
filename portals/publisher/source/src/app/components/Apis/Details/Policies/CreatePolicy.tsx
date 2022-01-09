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
    Button, Grid, Icon, Typography, makeStyles, Paper,
} from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage, injectIntl } from 'react-intl';

const useStyles = makeStyles((theme: any) => ({
    root: {
        flexGrow: 1,
        marginTop: 10,
        display: 'flex',
        flexDirection: 'column',
        padding: 20,
    },
    titleWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing(3),
    },
    titleLink: {
        color: theme.palette.primary.main,
        marginRight: theme.spacing(1),
    },
    contentWrapper: {
        maxWidth: theme.custom.contentAreaWidth,
    },
    mainTitle: {
        paddingLeft: 0,
    },
    FormControl: {
        padding: `0 0 0 ${theme.spacing(1)}px`,
        width: '100%',
        marginTop: 0,
    },
    FormControlOdd: {
        padding: `0 0 0 ${theme.spacing(1)}px`,
        backgroundColor: theme.palette.background.paper,
        width: '100%',
        marginTop: 0,
    },
    FormControlLabel: {
        marginBottom: theme.spacing(1),
        marginTop: theme.spacing(1),
        fontSize: theme.typography.caption.fontSize,
    },
    buttonSection: {
        paddingTop: theme.spacing(3),
    },
    saveButton: {
        marginRight: theme.spacing(1),
    },
    helpText: {
        color: theme.palette.text.hint,
        marginTop: theme.spacing(1),
    },
    extraPadding: {
        paddingLeft: theme.spacing(2),
    },
    addNewOther: {
        paddingTop: 40,
    },
    titleGrid: {
        ' & .MuiGrid-item': {
            padding: 0,
            margin: 0,
        },
    },
    descriptionForm: {
        marginTop: theme.spacing(1),
    },
    progress: {
        marginLeft: theme.spacing(1),
    },
}));

interface IProps {
    api: any;
}

/**
 * Renders the create policy view.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Create policy page.
 */
const CreatePolicy: React.FC<IProps> = ({ api }) => {
    const classes = useStyles();
    const url = `/apis/${api.id}/policies`;

    return (
        <Grid container spacing={3}>
            <Grid item sm={12} md={12} />
            <Grid item sm={2} md={2} />
            <Grid item sm={12} md={8}>
                <Grid container spacing={5} className={classes.titleGrid}>
                    <Grid item md={12}>
                        <div className={classes.titleWrapper}>
                            <Link to={url} className={classes.titleLink}>
                                <Typography variant='h4' component='h2'>
                                    <FormattedMessage
                                        id='Apis.Details.Policies.heading'
                                        defaultMessage='Policies'
                                    />
                                </Typography>
                            </Link>
                            <Icon>keyboard_arrow_right</Icon>
                            <Typography variant='h4' component='h3'>
                                <FormattedMessage
                                    id='Apis.Details.Policies.CreatePolicy.heading'
                                    defaultMessage='Create New Policy'
                                />
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item md={12}>
                        <Paper elevation={0} className={classes.root}>
                            {/* <FormControl margin='normal'>
                                <TextField
                                    id='name'
                                    label='Name'
                                    placeholder='Scope Name'
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
                                    label='Display Name'
                                    placeholder='Scope Display Name'
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
                                    label='Description'
                                    variant='outlined'
                                    placeholder='Short description about the scope'
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
                                    label='Roles'
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    variant='outlined'
                                    value={validRoles.concat(invalidRoles)}
                                    alwaysShowPlaceholder={false}
                                    placeholder='Enter roles and press Enter'
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
                                                margin: '8px 8px 8px 0',
                                                float: 'left',
                                            }}
                                        />
                                    )}
                                />
                            </FormControl> */}
                            <div className={classes.addNewOther}>
                                <Button
                                    variant='contained'
                                    color='primary'
                                    // onClick={this.addScope}
                                    // disabled={
                                    //     isRestricted(['apim:api_create'], api)
                                    //     || this.state.valid.name.invalid
                                    //     || invalidRoles.length !== 0
                                    //     || scopeAddDisabled
                                    //     || api.isRevision
                                    //     || this.state.valid.description.invalid
                                    // }
                                    className={classes.saveButton}
                                >
                                    <FormattedMessage
                                        id='Apis.Details.Policies.CreatePolicy.save'
                                        defaultMessage='Save'
                                    />
                                </Button>
                                <Button>
                                    <FormattedMessage
                                        id='Apis.Details.Policies.CreatePolicy.cancel'
                                        defaultMessage='Cancel'
                                    />
                                </Button>
                            </div>
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default CreatePolicy;
