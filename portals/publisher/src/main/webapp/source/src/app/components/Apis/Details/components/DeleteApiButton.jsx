import React from 'react';

import { styled } from '@mui/material/styles';

import {
    Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
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
import classNames from 'classnames';
import { isRestricted } from 'AppData/AuthManager';
import { getTypeToDisplay } from 'AppComponents/Shared/Utils';

const PREFIX = 'DeleteApiButton';

const classes = {
    root: `${PREFIX}-root`,
    backLink: `${PREFIX}-backLink`,
    backIcon: `${PREFIX}-backIcon`,
    backText: `${PREFIX}-backText`,
    deleteWrapper: `${PREFIX}-deleteWrapper`,
    delete: `${PREFIX}-delete`,
    linkText: `${PREFIX}-linkText`,
    inlineBlock: `${PREFIX}-inlineBlock`,
    flexBox: `${PREFIX}-flexBox`
};


const Root = styled('div')((
    {
        theme
    }
) => ({
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
        paddingRight: theme.spacing(2),
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

    [`& .${classes.inlineBlock}`]: {
        display: 'inline-block',
        paddingRight: 10,
    },

    [`& .${classes.flexBox}`]: {
        display: 'flex',
        paddingRight: 10,
    }
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
            api: { id, name, type }, setLoading, updateData, isAPIProduct, history, intl,
        } = this.props;
        const isMCPServer = type === MCPServer.CONSTS.MCP;
        if (isAPIProduct) {
            const promisedDelete = API.deleteProduct(id);
            promisedDelete
                .then((response) => {
                    if (response.status !== 200) {
                        Alert.info(intl.formatMessage({
                            id: 'Apis.Details.components.api.product.delete.error',
                            defaultMessage: 'Something went wrong while deleting the API Product!',
                        }));
                        return;
                    }
                    Alert.info(intl.formatMessage({
                        id: 'Apis.Details.components.api.product.delete.success',
                        defaultMessage: 'API Product {name} deleted Successfully',
                    },
                    {
                        name,
                    }));
                    if (updateData) {
                        updateData(id);
                        setLoading(false);
                    } else {
                        history.push('/api-products');
                    }
                })
                .catch((error) => {
                    if (error.status === 409) {
                        Alert.error('[ ' + name + ' ] : ' + error.response.body.description);
                    } else {
                        Alert.error(intl.formatMessage({
                            id: 'Apis.Details.components.api.product.delete.error',
                            defaultMessage: 'Something went wrong while deleting the API Product!',
                        }));
                    }
                    setLoading(false);
                });
        } else if (isMCPServer) {
            const promisedDelete = MCPServer.deleteMCPServer(id);
            promisedDelete
                .then((response) => {
                    if (response.status !== 200) {
                        Alert.info(intl.formatMessage({
                            id: 'Apis.Details.components.api.mcp.delete.error',
                            defaultMessage: 'Something went wrong while deleting the MCP Server!',
                        }));
                        return;
                    }
                    Alert.info(intl.formatMessage({
                        id: 'Apis.Details.components.api.mcp.delete.success',
                        defaultMessage: 'MCP Server {name} deleted Successfully',
                    },
                    {
                        name,
                    }));
                    if (updateData) {
                        updateData(id);
                        setLoading(false);
                    } else {
                        history.push('/mcp-servers');
                    }
                })
                .catch((error) => {
                    if (error.status === 409) {
                        Alert.error('[ ' + name + ' ] : ' + error.response.body.description);
                    } else {
                        Alert.error(intl.formatMessage({
                            id: 'Apis.Details.components.api.mcp.delete.error',
                            defaultMessage: 'Something went wrong while deleting the MCP Server!',
                        }));
                    }
                    setLoading(false);
                });
        } else {
            const promisedDelete = API.delete(id);
            promisedDelete
                .then((response) => {
                    if (response.status !== 200) {
                        Alert.info(intl.formatMessage({
                            id: 'Apis.Details.components.api.delete.error',
                            defaultMessage: 'Something went wrong while deleting the API!',
                        }));
                        return;
                    }
                    Alert.info(intl.formatMessage({
                        id: 'Apis.Details.components.api.delete.success',
                        defaultMessage: 'API {name} deleted Successfully',
                    },
                    {
                        name,
                    }));
                    if (updateData) {
                        updateData(id);
                        setLoading(false);
                    } else {
                        history.push('/apis');
                    }
                })
                .catch((error) => {
                    if (error.status === 409) {
                        Alert.error('[ ' + name + ' ] : ' + error.response.body.description);
                    } else {
                        Alert.error(intl.formatMessage({
                            id: 'Apis.Details.components.api.delete.error',
                            defaultMessage: 'Something went wrong while deleting the API!',
                        }));
                    }
                    setLoading(false);
                });
        }
    }

    /**
     * Determines if the current user has restricted access based on context
     * @returns {boolean} - True if access is restricted, false otherwise
     */
    isDeleteRestricted() {
        const { api } = this.props;
        if (api.apiType.toUpperCase() === MCPServer.CONSTS.MCP) {
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
        const type = getTypeToDisplay(api.apiType);
        let path = resourcePath.SINGLE_API;

        if (api.apiType === API.CONSTS.APIProduct) {
            path = resourcePath.SINGLE_API_PRODUCT;
        }

        return (
            <Root>
                {/* allowing delete based on scopes */}
                <ScopeValidation resourceMethod={resourceMethod.DELETE} resourcePath={path}>
                    <Box
                        className={classNames({ [classes.inlineBlock]: updateData, [classes.flexBox]: !updateData })}
                    >
                        {!updateData && (<VerticalDivider height={70} />)}
                        <Box className={classes.delete}>
                            <IconButton
                                id='itest-id-deleteapi-icon-button'
                                onClick={this.handleRequestOpen}
                                className={classes.delete}
                                disabled={this.isDeleteRestricted()}
                                aria-label='delete'
                                disableFocusRipple
                                disableRipple
                                size='large'>
                                <DeleteIcon />
                            </IconButton>
                            <Box
                                fontFamily='fontFamily'
                                fontSize='caption.fontSize'
                                onClick={this.handleRequestOpen}
                            >

                                <FormattedMessage
                                    id='Apis.Details.components.DeleteApiButton.delete'
                                    defaultMessage='Delete'
                                />
                            </Box>
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
