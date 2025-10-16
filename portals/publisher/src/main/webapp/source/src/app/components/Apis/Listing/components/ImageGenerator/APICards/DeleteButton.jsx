/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import API from 'AppData/api';
import MCPServer from 'AppData/MCPServer';
import { resourceMethod, resourcePath, ScopeValidation } from 'AppData/ScopeValidation';
import Alert from 'AppComponents/Shared/Alert';
import VerticalDivider from 'AppComponents/Shared/VerticalDivider';
import { FormattedMessage, injectIntl } from 'react-intl';
import { isRestricted } from 'AppData/AuthManager';

const PREFIX = 'DeleteButton';

const classes = {
    root: `${PREFIX}-root`,
    backLink: `${PREFIX}-backLink`,
    backIcon: `${PREFIX}-backIcon`,
    backText: `${PREFIX}-backText`,
    deleteWrapper: `${PREFIX}-deleteWrapper`,
    delete: `${PREFIX}-delete`,
    linkText: `${PREFIX}-linkText`,
    flexBox: `${PREFIX}-flexBox`,
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.root}`]: {
        height: 70,
        background: theme.palette.background.paper,
        borderBottom: 'solid 1px ' + theme.palette.grey.A200,
        display: 'flex',
        alignItems: 'center',
    },

    [`& .${classes.backLink}`]: {
        alignItems: 'center',
        textDecoration: 'none',
        display: 'flex',
    },

    [`& .${classes.backIcon}`]: {
        color: theme.palette.primary.main,
        fontSize: 56,
        cursor: 'pointer',
    },

    [`& .${classes.backText}`]: {
        color: theme.palette.primary.main,
        cursor: 'pointer',
        fontFamily: theme.typography.fontFamily,
    },

    [`& .${classes.deleteWrapper}`]: {
        flex: 0,
        display: 'flex',
        justifyContent: 'flex-end',
    },

    [`& .${classes.delete}`]: {
        color: theme.custom.apis.listing.deleteButtonColor,
        cursor: 'pointer',
        padding: theme.spacing(0.4),
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'center',
        justifyContent: 'center',
    },

    [`& .${classes.linkText}`]: {
        fontSize: theme.typography.fontSize,
    },

    [`& .${classes.flexBox}`]: {
        display: 'flex',
    },
}));

/**
 * Handle Delete an API from API Overview/Details page
 *
 * @class DeleteApiButton
 * @extends {React.Component}
 */
class DeleteApiButton extends React.Component {
    /**
     *Creates an instance of DeleteApiButton.
     * @param {*} props @inheritDoc
     * @memberof DeleteApiButton
     */
    constructor(props) {
        super(props);
        this.handleApiDelete = this.handleApiDelete.bind(this);
        this.handleRequestClose = this.handleRequestClose.bind(this);
        this.handleRequestOpen = this.handleRequestOpen.bind(this);
        this.state = { openMenu: false };
    }

    /**
     * Handle Delete button close event
     *
     * @memberof DeleteApiButton
     */
    handleRequestClose() {
        this.setState({ openMenu: false });
    }

    /**
     * Handle Delete button onClick event
     *
     * @memberof DeleteApiButton
     */
    handleRequestOpen() {
        this.setState({ openMenu: true });
    }

    /**
     *
     * Send API delete REST API request
     * @param {*} e
     * @memberof DeleteApiButton
     */
    handleApiDelete() {
        const {
            api: { id, name, type },
            setLoading,
            updateData,
            history,
            intl,
        } = this.props;

        let promisedDelete;
        let typeName;
        let redirectPath;

        if (type === API.CONSTS.APIProduct) {
            promisedDelete = API.deleteProduct(id);
            typeName = 'API Product';
            redirectPath = '/api-products';
        } else if (type === MCPServer.CONSTS.MCP) {
            promisedDelete = MCPServer.deleteMCPServer(id);
            typeName = 'MCP Server';
            redirectPath = '/mcp-servers';
        } else {
            promisedDelete = API.delete(id);
            typeName = 'API';
            redirectPath = '/apis';
        }

        promisedDelete
            .then((response) => {
                if (response.status !== 200) {
                    Alert.info(
                        intl.formatMessage(
                            {
                                id: 'Apis.Details.components.delete.error',
                                defaultMessage: 'Something went wrong while deleting the {typeName}!',
                            },
                            { typeName }
                        )
                    );
                    return;
                }
                Alert.info(
                    intl.formatMessage(
                        {
                            id: 'Apis.Details.components.delete.success',
                            defaultMessage: '{typeName} {name} deleted Successfully',
                        },
                        { typeName, name }
                    )
                );
                if (updateData) {
                    updateData(id);
                    setLoading(false);
                } else {
                    history.push(redirectPath);
                }
            })
            .catch((error) => {
                if (error.status === 409) {
                    Alert.error('[ ' + name + ' ] : ' + error.response.body.description);
                } else {
                    Alert.error(
                        intl.formatMessage(
                            {
                                id: 'Apis.Details.components.delete.error',
                                defaultMessage: 'Something went wrong while deleting the {typeName}!',
                            },
                            { typeName }
                        )
                    );
                }
                setLoading(false);
            });
    }

    /**
     * Determines if the current user has restricted access based on context
     * @returns {boolean} - True if access is restricted, false otherwise
     */
    isDeleteRestricted() {
        const { api } = this.props;
        if (api.type === MCPServer.CONSTS.MCP) {
            return isRestricted(
                ['apim:mcp_server_delete', 'apim:mcp_server_manage', 'apim:mcp_server_import_export'], api);
        } else {
            return isRestricted(['apim:api_delete'], api);
        }
    }

    /**
     *
     * @inheritDoc
     * @returns {React.Component} inherit docs
     * @memberof DeleteApiButton
     */
    render() {
        const { api, onClick, updateData } = this.props;
        const version = '-' + api.version;
        const deleteHandler = onClick || this.handleApiDelete;

        let type;
        if (api.apiType === API.CONSTS.APIProduct) {
            type = 'API Product';
        } else if (api.type === MCPServer.CONSTS.MCP) {
            type = 'MCP Server';
        } else {
            type = 'API';
        }

        let path = resourcePath.SINGLE_API;

        if (api.apiType === API.CONSTS.APIProduct) {
            path = resourcePath.SINGLE_API_PRODUCT;
        }

        return (
            <Root>
                {/* allowing delete based on scopes */}
                <ScopeValidation resourceMethod={resourceMethod.DELETE} resourcePath={path}>
                    <Box className={classes.flexBox}>
                        {!updateData && <VerticalDivider height={70} />}
                        <Box className={classes.delete}>
                            <IconButton
                                id='itest-id-deleteapi-icon-button'
                                onClick={this.handleRequestOpen}
                                className={classes.delete}
                                disabled={this.isDeleteRestricted()}
                                aria-label='delete'
                                disableFocusRipple
                                disableRipple
                                size='large'
                            >
                                <DeleteOutlineIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </ScopeValidation>
                <Dialog open={this.state.openMenu}>
                    <DialogTitle>
                        <FormattedMessage
                            id='Apis.Details.components.DeleteApiButton.title'
                            defaultMessage='Delete {type}'
                            values={{ type }}
                        />
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            <FormattedMessage
                                id='Apis.Details.components.DeleteApiButton.text.description'
                                defaultMessage='{type} <b> {name} {version} </b> will be deleted permanently.'
                                values={{
                                    b: (msg) => <b>{msg}</b>,
                                    type,
                                    name: api.displayName || api.name,
                                    version,
                                }}
                            />
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button dense onClick={this.handleRequestClose}>
                            <FormattedMessage
                                id='Apis.Details.components.DeleteApiButton.button.cancel'
                                defaultMessage='Cancel'
                            />
                        </Button>
                        <Button
                            id='itest-id-deleteconf'
                            onClick={() => {
                                deleteHandler();
                                this.handleRequestClose();
                            }}
                        >
                            <FormattedMessage
                                id='Apis.Details.components.DeleteApiButton.button.delete'
                                defaultMessage='Delete'
                            />
                        </Button>
                    </DialogActions>
                </Dialog>
            </Root>
        );
    }
}

DeleteApiButton.defaultProps = {
    setLoading: () => {},
};

DeleteApiButton.propTypes = {
    api: PropTypes.shape({
        delete: PropTypes.func,
    }).isRequired,
    history: PropTypes.shape({ push: PropTypes.func }).isRequired,
    setLoading: PropTypes.func,
};

export default withRouter(injectIntl(DeleteApiButton));
