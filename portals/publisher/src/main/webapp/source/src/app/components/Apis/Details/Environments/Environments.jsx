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

import React, { useContext, useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import { APIContext } from 'AppComponents/Apis/Details/components/ApiContext';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import MuiAlert from 'AppComponents/Shared/MuiAlert';
import 'react-tagsinput/react-tagsinput.css';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { isRestricted } from 'AppData/AuthManager';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import moment from 'moment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import Progress from 'AppComponents/Shared/Progress';

import clsx from 'clsx';
import TableRow from '@mui/material/TableRow';
import Alert from 'AppComponents/Shared/Alert';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Configurations from 'Config';
import Card from '@mui/material/Card';
import AddIcon from '@mui/icons-material/Add';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import APIProduct from 'AppData/APIProduct';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import InfoIcon from '@mui/icons-material/Info';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import API from 'AppData/api';
import { ConfirmDialog } from 'AppComponents/Shared/index';
import { useRevisionContext } from 'AppComponents/Shared/RevisionContext';
import Utils from 'AppData/Utils';
import { parse } from '@asyncapi/parser';
import { upperCaseString } from 'AppData/stringFormatter';
import DisplayDevportal from './DisplayDevportal';
import DeploymentOnbording from './DeploymentOnbording';

const PREFIX = 'Environments';

const classes = {
    root: `${PREFIX}-root`,
    infoIcon: `${PREFIX}-infoIcon`,
    saveButton: `${PREFIX}-saveButton`,
    shapeRec: `${PREFIX}-shapeRec`,
    shapeCircaleBack: `${PREFIX}-shapeCircaleBack`,
    shapeInnerComplete: `${PREFIX}-shapeInnerComplete`,
    shapeInnerInactive: `${PREFIX}-shapeInnerInactive`,
    shapeDottedEnd: `${PREFIX}-shapeDottedEnd`,
    shapeDottedStart: `${PREFIX}-shapeDottedStart`,
    plusIconStyle: `${PREFIX}-plusIconStyle`,
    shapeDottedStart1: `${PREFIX}-shapeDottedStart1`,
    textShape: `${PREFIX}-textShape`,
    textShape2: `${PREFIX}-textShape2`,
    textPadding: `${PREFIX}-textPadding`,
    textDelete: `${PREFIX}-textDelete`,
    textShape3: `${PREFIX}-textShape3`,
    textShape7: `${PREFIX}-textShape7`,
    primaryEndpoint: `${PREFIX}-primaryEndpoint`,
    secondaryEndpoint: `${PREFIX}-secondaryEndpoint`,
    textShape4: `${PREFIX}-textShape4`,
    textShape8: `${PREFIX}-textShape8`,
    textShape5: `${PREFIX}-textShape5`,
    textShape6: `${PREFIX}-textShape6`,
    button1: `${PREFIX}-button1`,
    button2: `${PREFIX}-button2`,
    shapeRecBack: `${PREFIX}-shapeRecBack`,
    shapeCircle: `${PREFIX}-shapeCircle`,
    shapeCircleBlack: `${PREFIX}-shapeCircleBlack`,
    changeCard: `${PREFIX}-changeCard`,
    noChangeCard: `${PREFIX}-noChangeCard`,
    cardHeight: `${PREFIX}-cardHeight`,
    cardContentHeight: `${PREFIX}-cardContentHeight`,
    cardActionHeight: `${PREFIX}-cardActionHeight`,
    dialogContent: `${PREFIX}-dialogContent`,
    textOverlay: `${PREFIX}-textOverlay`,
    gridOverflow: `${PREFIX}-gridOverflow`,
    formControl: `${PREFIX}-formControl`,
    dialogPaper: `${PREFIX}-dialogPaper`,
    createRevisionDialogStyle: `${PREFIX}-createRevisionDialogStyle`,
    sectionTitle: `${PREFIX}-sectionTitle`,
    deployNewRevButtonStyle: `${PREFIX}-deployNewRevButtonStyle`,
    popover: `${PREFIX}-popover`,
    paper: `${PREFIX}-paper`,
    timePaddingStyle: `${PREFIX}-timePaddingStyle`,
    labelSpace: `${PREFIX}-labelSpace`,
    labelSpacingDown: `${PREFIX}-labelSpacingDown`,
    warningText: `${PREFIX}-warningText`,
    tableCellVhostSelect: `${PREFIX}-tableCellVhostSelect`,
    vhostSelect: `${PREFIX}-vhostSelect`,
    textCount: `${PREFIX}-textCount`,
    containerInline: `${PREFIX}-containerInline`,
    containerOverflow: `${PREFIX}-containerOverflow`,
    infoAlert: `${PREFIX}-infoAlert`
};


const Root = styled('div')(({ theme }) => ({
    [`& .${classes.root}`]: {
        display: 'flex',
        flexWrap: 'wrap',
    },

    [`& .${classes.infoIcon}`]: {
        fontSize: 'medium',
        marginLeft: theme.spacing(1),
        verticalAlign: 'middle',
    },

    [`& .${classes.saveButton}`]: {
        marginTop: theme.spacing(3),
    },

    [`& .${classes.shapeRec}`]: {
        backgroundColor: 'black',
        alignSelf: 'center',
        width: 121,
        height: 3,
    },

    [`& .${classes.shapeCircaleBack}`]: {
        backgroundColor: '#E2E2E2',
        width: 63,
        height: 63,
    },

    [`& .${classes.shapeInnerComplete}`]: {
        backgroundColor: '#095677',
        width: 50,
        height: 50,
        marginTop: 6,
        marginLeft: 6.5,
        placeSelf: 'middle',
    },

    [`& .${classes.shapeInnerInactive}`]: {
        backgroundColor: '#BFBFBF',
        width: 50,
        height: 50,
        marginTop: 6,
        marginLeft: 6,
        placeSelf: 'middle',
    },

    [`& .${classes.shapeDottedEnd}`]: {
        backgroundColor: '#BFBFBF',
        border: '1px dashed #707070',
        width: 47,
        height: 47,
        marginTop: 7,
        marginLeft: 7,
        placeSelf: 'middle',
    },

    [`& .${classes.shapeDottedStart}`]: {
        backgroundColor: '#1CB1BF',
        border: '2px solid #ffffff',
        width: 47,
        height: 47,
        marginTop: 8,
        marginLeft: 8,
        placeSelf: 'middle',
    },

    [`& .${classes.plusIconStyle}`]: {
        marginTop: 8,
        marginLeft: 8,
        fontSize: 30,  
    },

    [`& .${classes.shapeDottedStart1}`]: {
        backgroundColor: '#1CB1BF',
        width: 50,
        height: 50,
        marginTop: 6,
        marginLeft: 6.5,
        placeSelf: 'middle',
    },

    [`& .${classes.textShape}`]: {
        marginTop: 5.5,
        marginLeft: 6.5,
    },

    [`& .${classes.textShape2}`]: {
        display: 'flex',
        alignItems: 'center',
        marginTop: 12,
        marginLeft: 115,
        height: '18px',
        fontFamily: 'sans-serif',
    },

    [`& .${classes.textPadding}`]: {
        height: '25px',
        paddingBottom: '2px',
    },

    [`& .${classes.textDelete}`]: {
        marginTop: 8,
        marginLeft: 120,
        fontFamily: 'sans-serif',
        fontSize: 'small',
    },

    [`& .${classes.textShape3}`]: {
        color: '#38536c',
        marginLeft: 70,
    },

    [`& .${classes.textShape7}`]: {
        color: '#38536c',
    },

    [`& .${classes.primaryEndpoint}`]: {
        color: '#006E9C',
    },

    [`& .${classes.secondaryEndpoint}`]: {
        color: '#415A85',
    },

    [`& .${classes.textShape4}`]: {             
        marginTop: 55,
    },

    [`& .${classes.textShape8}`]: {
        marginTop: 80,
    },

    [`& .${classes.textShape5}`]: {
        marginTop: 10,
        marginLeft: 85,
        marginBottom: 10,
    },

    [`& .${classes.textShape6}`]: {
        color: '#1B3A57',
    },

    [`& .${classes.button1}`]: {
        color: '#1B3A57',
        marginLeft: 7,
    },

    [`& .${classes.button2}`]: {
        color: '#1B3A57',
        marginLeft: 7,
        marginTop: 10,
    },

    [`& .${classes.shapeRecBack}`]: {
        backgroundColor: 'black',
        alignSelf: 'center',
        width: 40,
        height: 3,
    },

    [`& .${classes.shapeCircle}`]: {
        borderRadius: '50%',
    },

    [`& .${classes.shapeCircleBlack}`]: {
        backgroundColor: '#000000',
        alignSelf: 'center',
        paddingLeft: '15px',
        width: 15,
        height: 15,
        marginBottom: '2px'
    },

    [`& .${classes.changeCard}`]: {
        boxShadow: 15,
        borderRadius: '10px',
        backgroundColor: theme.palette.secondary.highlight,
    },

    [`& .${classes.noChangeCard}`]: {
        boxShadow: 15,
        borderRadius: '10px',
    },

    [`& .${classes.cardHeight}`]: {
        boxShadow: 1,
        height: '100%',
    },

    [`& .${classes.cardContentHeight}`]: {
        boxShadow: 1,
        height: '50%',
    },

    [`& .${classes.cardActionHeight}`]: {
        boxShadow: 1,
        height: '25%',
    },

    [`& .${classes.dialogContent}`]: {
        overflow: 'auto',
        height: '90%',
    },

    [`& .${classes.textOverlay}`]: {
        overflow: 'hidden',
        maxHeight: '100%',
        maxWidth: '100%',
        cursor: 'pointer',
        '&:hover': { overflow: 'visible' },
    },

    [`& .${classes.gridOverflow}`]: {
        overflow: 'scroll',
        width: '100%',
    },

    [`& .${classes.formControl}`]: {
        margin: theme.spacing(1),
        minWidth: 130,
    },

    [`& .${classes.dialogPaper}`]: {
        width: '800px',
    },

    [`& .${classes.createRevisionDialogStyle}`]: {
        width: '800px',
    },

    [`& .${classes.sectionTitle}`]: {
        marginBottom: theme.spacing(2),
    },

    [`& .${classes.deployNewRevButtonStyle}`]: {
        marginRight: theme.spacing(3),
        marginBottom: theme.spacing(3),
        marginTop: theme.spacing(3),
    },

    [`& .${classes.popover}`]: {
        pointerEvents: 'none',
    },

    [`& .${classes.paper}`]: {
        padding: theme.spacing(1),
        maxWidth: '300px',
    },

    [`& .${classes.timePaddingStyle}`]: {
        marginTop: theme.spacing(1),
    },

    [`& .${classes.labelSpace}`]: {
        paddingLeft: theme.spacing(1),
    },

    [`& .${classes.labelSpacingDown}`]: {
        marginBottom: theme.spacing(2),
    },

    [`& .${classes.warningText}`]: {
        color: '#ff0000',
    },

    [`& .${classes.tableCellVhostSelect}`]: {
        paddingTop: theme.spacing(0),
        paddingBottom: theme.spacing(0),
    },

    [`& .${classes.vhostSelect}`]: {
        marginTop: theme.spacing(3),
    },

    [`& .${classes.textCount}`]: {
        marginTop: theme.spacing(-2.5),
    },

    [`& .${classes.containerInline}`]: {
        display: 'inline-flex',
    },

    [`& .${classes.containerOverflow}`]: {
        display: 'grid',
        gridGap: '16px',
        paddingLeft: '48px',
        gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))',
        gridAutoFlow: 'column',
        gridAutoColumns: 'minmax(160px,1fr)',
        overflowX: 'auto',
    },

    [`& .${classes.infoAlert}`]: {
        clear: 'both',
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(2),
    }
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
    [`& .${classes.changeCard}`]: {
        boxShadow: 15,
        borderRadius: '10px',
        backgroundColor: theme.palette.secondary.highlight,
    },

    [`& .${classes.dialogPaper}`]: {
        width: '800px',
        maxHeight: '800px',
    },

    [`& .${classes.cardHeight}`]: {
        boxShadow: 1,
        height: '100%',
    },

    [`& .${classes.cardContentHeight}`]: {
        boxShadow: 1,
        height: '50%',
    },

    [`& .${classes.createRevisionDialogStyle}`]: {
        width: '800px',
    },

    [`& .${classes.dialogContent}`]: {
        overflow: 'auto',
        height: '90%',
    },

    [`& .${classes.warningText}`]: {
        color: '#ff0000',
    },

    [`& .${classes.textCount}`]: {
        marginTop: theme.spacing(-2.5),
    },

    [`& .${classes.sectionTitle}`]: {
        marginBottom: theme.spacing(2),
    },

    [`& .${classes.textCount}`]: {
        marginTop: theme.spacing(-2.5),
    },
}))

/**
 * Renders an Environments list
 * @class Environments
 * @extends {React.Component}
 */
export default function Environments() {
    const maxCommentLength = '255';
    const intl = useIntl();
    const { api, updateAPI } = useContext(APIContext);
    const securityScheme = [...api.securityScheme];
    const isMutualSslOnly = securityScheme.length === 2 && securityScheme.includes('mutualssl')
    && securityScheme.includes('mutualssl_mandatory');
    const isEndpointAvailable = api.endpointConfig !== null;
    const isTierAvailable = api.policies.length !== 0;

    const isDeployButtonDisabled = (((api.type !== 'WEBSUB' && !isEndpointAvailable))
    || (!isMutualSslOnly && !isTierAvailable)
    || api.workflowStatus === 'CREATED');
    const history = useHistory();
    const { data: settings, isLoading } = usePublisherSettings();
    const {
        allRevisions, getRevision, allEnvRevision, getDeployedEnv,
    } = useRevisionContext();
    let revisionCount;
    if (Configurations.app.revisionCount) {
        revisionCount = Configurations.app.revisionCount;
    } else {
        revisionCount = 5;
    }
    const restApi = new API();
    const restProductApi = new APIProduct();
    const [selectedRevision, setRevision] = useState([]);
    const assignGateway = (api.gatewayType === "wso2/synapse" || api.apiType === "APIPRODUCT") ? "Regular" : "APK";
    const externalGateways = settings && settings.environment.filter((p) => !p.provider.toLowerCase().includes('wso2'));
    const internalGatewaysFiltered = settings && settings.environment.filter((p) =>
        p.provider.toLowerCase().includes('wso2'));
    const internalGateways = internalGatewaysFiltered && internalGatewaysFiltered.filter((p) => 
        p.gatewayType.toLowerCase() === assignGateway.toLowerCase()
    );
    const [selectedVhosts, setVhosts] = useState(null);
    const [selectedVhostDeploy, setVhostsDeploy] = useState([]);
    useEffect(() => {
        if (settings) {
            const defaultVhosts = internalGateways.map((e) => {
                if (e.vhosts && e.vhosts.length > 0) {
                    const env = e.name;
                    const vhost = api.isWebSocket() ? e.vhosts[0].wsHost : e.vhosts[0].host;
                    return { env, vhost };
                } else {
                    return undefined;
                }
            });
            setVhosts(defaultVhosts);
            setVhostsDeploy(defaultVhosts);
        }
    }, [settings]);
    const [extraRevisionToDelete, setExtraRevisionToDelete] = useState(null);
    const [description, setDescription] = useState('');
    const [SelectedEnvironment, setSelectedEnvironment] = useState([]);
    const [open, setOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [revisionToDelete, setRevisionToDelete] = useState([]);
    const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);
    const [revisionToRestore, setRevisionToRestore] = useState([]);
    const [currentLength, setCurrentLength] = useState(0);
    const [openDeployPopup, setOpenDeployPopup] = useState(history.location.state === 'deploy');
    const [externalEnvEndpoints, setExternalEnvEndpoints] = useState(null);

    const allExternalGatewaysMap = [];
    const allExternalGateways = [];
    if (externalGateways) {
        externalGateways.forEach((env) => {
            const revision = allEnvRevision && allEnvRevision.find(
                (r) => r.deploymentInfo.some((e) => e.name === env.name),
            );
            const envDetails = revision && revision.deploymentInfo.find((e) => e.name === env.name);
            const disPlayDevportal = envDetails && envDetails.displayOnDevportal;
            allExternalGatewaysMap[env.name] = { revision, disPlayDevportal };
            allExternalGateways.push(env);
        });
    }


    const externalEnvWithEndpoints = [];
    useEffect(() => {
        const promise = restApi.getAsyncAPIDefinition(api.id);
        promise.then(async (response) => {
            if (response.data && (typeof response.data === "string" || typeof response.data === "object")) {
                let doc;
                try {
                    doc = await parse(response.data);
                } catch (err) {
                    console.warn("Async API does not found");
                    return;
                }
                const protocolBindings = [];
                // eslint-disable-next-line array-callback-return
                doc.channelNames().map((channelName) => {
                    if (doc.channel(channelName).hasPublish()) {
                        // eslint-disable-next-line array-callback-return
                        doc.channel(channelName).publish().bindingProtocols().map((protocol) => {
                            if (!protocolBindings.includes(protocol)) {
                                protocolBindings.push(protocol);
                            }
                        });
                    }
                    if (doc.channel(channelName).hasSubscribe()) {
                        // eslint-disable-next-line array-callback-return
                        doc.channel(channelName).subscribe().bindingProtocols().map((protocol) => {
                            if (!protocolBindings.includes(protocol)) {
                                protocolBindings.push(protocol);
                            }
                        });
                    }
                });
                // eslint-disable-next-line array-callback-return
                allExternalGateways.map((env) => {
                    const endpoints = [];
                    // eslint-disable-next-line array-callback-return
                    env.endpointURIs.map((endpoint) => {
                        // eslint-disable-next-line array-callback-return
                        protocolBindings.map((protocol) => {
                            if (protocol === endpoint.protocol) {
                                const uri = endpoint.endpointURI;
                                endpoints.push({ protocol, uri });
                            }
                        });
                    });
                    externalEnvWithEndpoints[env.name] = endpoints;
                });
                setExternalEnvEndpoints(externalEnvWithEndpoints);
            }
        })
    }, [api.id]);

    const toggleOpenConfirmDelete = (revisionName, revisionId) => {
        setRevisionToDelete([revisionName, revisionId]);
        setConfirmDeleteOpen(!confirmDeleteOpen);
    };

    const toggleOpenConfirmRestore = (revisionName, revisionId) => {
        setRevisionToRestore([revisionName, revisionId]);
        setConfirmRestoreOpen(!confirmRestoreOpen);
    };

    const toggleDeployRevisionPopup = () => {
        setOpenDeployPopup(!openDeployPopup);
    };

    const handleCloseDeployPopup = () => {
        history.replace();
        setOpenDeployPopup(false);
        setExtraRevisionToDelete(null);
    };

    const handleClickOpen = () => {
        if (!isRestricted(['apim:api_create', 'apim:api_publish'], api)) {
            setOpen(true);
        }
    };

    const handleDeleteSelect = (event) => {
        setExtraRevisionToDelete([event.target.value, event.target.name]);
    };

    const handleSelect = (event) => {
        const revisions = selectedRevision.filter((r) => r.env !== event.target.name);
        const oldRevision = selectedRevision.find((r) => r.env === event.target.name);
        let displayOnDevPortal = true;
        if (oldRevision) {
            displayOnDevPortal = oldRevision.displayOnDevPortal;
        }
        revisions.push({ env: event.target.name, revision: event.target.value, displayOnDevPortal });
        setRevision(revisions);
    };

    const handleSelectForBrokers = (event) => {
        const revisions = selectedRevision.filter((r) => r.env !== event.target.name);
        const oldRevision = selectedRevision.find((r) => r.env === event.target.name);
        let displayOnDevPortal = true;
        if (oldRevision) {
            displayOnDevPortal = oldRevision.displayOnDevPortal;
        }
        revisions.push({ env: event.target.name, revision: event.target.value, displayOnDevPortal });
        setRevision(revisions);
    };

    /* const isDisplayOnDevPortalCheckedForThirdPartyEnv = (env) => {
        if (allExternalGatewaysMap[env].revision) {
            return allExternalGatewaysMap[env].revision.deploymentInfo.find(
                (r) => r.name === env,
            ).displayOnDevportal;
        }
        const oldRevision = selectedRevision.find((r) => r.env === env);
        let displayOnDevPortal = true;
        if (oldRevision) {
            displayOnDevPortal = oldRevision.displayOnDevPortal;
        }
        return displayOnDevPortal;
    }; */

    const handleVhostSelect = (event) => {
        const vhosts = selectedVhosts.filter((v) => v.env !== event.target.name);
        vhosts.push({ env: event.target.name, vhost: event.target.value });
        setVhosts(vhosts);
    };

    const handleVhostDeploySelect = (event) => {
        const vhosts = selectedVhostDeploy.filter((v) => v.env !== event.target.name);
        vhosts.push({ env: event.target.name, vhost: event.target.value });
        setVhostsDeploy(vhosts);
    };

    const handleClose = () => {
        setOpen(false);
        setExtraRevisionToDelete(null);
    };

    const handleChange = (event) => {
        if (event.target.checked) {
            setSelectedEnvironment([...SelectedEnvironment, event.target.value]);
        } else {
            setSelectedEnvironment(
                SelectedEnvironment.filter((env) => env !== event.target.value),
            );
        }
        if (event.target.name === 'description') {
            setDescription(event.target.value);
            setCurrentLength(event.target.value.length);
        }
    };

    /**
     * Handles deleting a revision
     * @param {Object} revisionId the revision Id
     * @returns {Object} promised delete
     */
    function deleteRevision(revisionId) {
        let promiseDelete;
        if (api.apiType === API.CONSTS.APIProduct) {
            promiseDelete = restProductApi.deleteProductRevision(api.id, revisionId)
                .then(() => {
                    Alert.info(intl.formatMessage({
                        defaultMessage: 'Revision Deleted Successfully',
                        id: 'Apis.Details.Environments.Environments.revision.delete.success',
                    }));
                })
                .catch((error) => {
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    } else {
                        Alert.error(intl.formatMessage({
                            defaultMessage: 'Something went wrong while deleting the revision',
                            id: 'Apis.Details.Environments.Environments.revision.delete.error',
                        }));
                    }
                }).finally(() => {
                    history.replace();
                    getRevision();
                });
        } else {
            promiseDelete = restApi.deleteRevision(api.id, revisionId)
                .then(() => {
                    Alert.info(intl.formatMessage({
                        defaultMessage: 'Revision Deleted Successfully',
                        id: 'Apis.Details.Environments.Environments.revision.delete.success',
                    }));
                })
                .catch((error) => {
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    } else {
                        Alert.error(intl.formatMessage({
                            defaultMessage: 'Something went wrong while deleting the revision',
                            id: 'Apis.Details.Environments.Environments.revision.delete.error',
                        }));
                    }
                }).finally(() => {
                    history.replace();
                    getRevision();
                });
        }
        return promiseDelete;
    }

    /**
     * Handles creating a new revision
     * @param {Object} body the request body
     * @returns {Object} promised create
     */
    function createRevision(body) {
        if (api.apiType === API.CONSTS.APIProduct) {
            restProductApi.createProductRevision(api.id, body)
                .then(() => {
                    Alert.info('Revision Created Successfully');
                })
                .catch((error) => {
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    } else {
                        Alert.error('Something went wrong while creating the revision');
                    }
                    console.error(error);
                }).finally(() => {
                    getRevision();
                });
        } else {
            api.createRevision(api.id, body)
                .then(() => {
                    Alert.info('Revision Created Successfully');
                })
                .catch((error) => {
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    } else {
                        Alert.error('Something went wrong while creating the revision');
                    }
                    console.error(error);
                }).finally(() => {
                    getRevision();
                });
        }
    }

    /**
      * Handles adding a new revision
      * @memberof Revisions
      */
    function handleClickAddRevision() {
        const body = {
            description,
        };
        if (extraRevisionToDelete) {
            deleteRevision(extraRevisionToDelete[0])
                .then(() => {
                    createRevision(body);
                }).finally(() => setExtraRevisionToDelete(null));
        } else {
            createRevision(body);
        }
        setOpen(false);
        setDescription('');
        setExtraRevisionToDelete(null);
    }

    const runActionDelete = (confirm, revisionId) => {
        if (confirm) {
            deleteRevision(revisionId);
        }
        setConfirmDeleteOpen(!confirmDeleteOpen);
        setRevisionToDelete([]);
    };

    /**
      * Handles restore revision
      * @memberof Revisions
      */
    function restoreRevision(revisionId) {
        if (api.apiType !== API.CONSTS.APIProduct) {
            restApi.restoreRevision(api.id, revisionId)
                .then(() => {
                    Alert.info('Revision Restored Successfully');
                })
                .catch((error) => {
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    } else {
                        Alert.error('Something went wrong while restoring the revision');
                    }
                    console.error(error);
                }).finally(() => {
                    getRevision();
                    getDeployedEnv();
                    updateAPI();
                });
        } else {
            restProductApi.restoreProductRevision(api.id, revisionId)
                .then(() => {
                    Alert.info('Revision Restored Successfully');
                })
                .catch((error) => {
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    } else {
                        Alert.error('Something went wrong while restoring the revision');
                    }
                    console.error(error);
                }).finally(() => {
                    getRevision();
                    getDeployedEnv();
                });
        }
    }

    const runActionRestore = (confirm, revisionId) => {
        if (confirm) {
            restoreRevision(revisionId);
        }
        setConfirmRestoreOpen(!confirmRestoreOpen);
        setRevisionToRestore([]);
    };

    /**
      * Handles undeploy a revision
      * @memberof Revisions
      */
    function undeployRevision(revisionId, envName) {
        const body = [{
            name: envName,
            displayOnDevportal: false,
        }];
        if (api.apiType !== API.CONSTS.APIProduct) {
            restApi.undeployRevision(api.id, revisionId, body)
                .then(() => {
                    Alert.info('Revision Undeployed Successfully');
                })
                .catch((error) => {
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    } else {
                        Alert.error('Something went wrong while undeploying the revision');
                    }
                    console.error(error);
                }).finally(() => {
                    getRevision();
                    getDeployedEnv();
                });
        } else {
            restProductApi.undeployProductRevision(api.id, revisionId, body)
                .then(() => {
                    Alert.info('Revision Undeployed Successfully');
                })
                .catch((error) => {
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    } else {
                        Alert.error('Something went wrong while undeploying the revision');
                    }
                    console.error(error);
                }).finally(() => {
                    getRevision();
                    getDeployedEnv();
                });
        }
    }

    /**
     * Handles canceling a revision deployment workflow
     * @memberof Revisions
     */
    function cancelRevisionDeploymentWorkflow(revisionId, envName) {
        if (api.apiType !== API.CONSTS.APIProduct) {
            restApi.cancelRevisionDeploymentWorkflow(api.id, revisionId, envName)
                .then(() => {
                    Alert.info('Revision deployment request cancelled successfully');
                })
                .catch((error) => {
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    } else {
                        Alert.error('Something went wrong while cancelling the revision deployment request');
                    }
                    console.error(error);
                }).finally(() => {
                    getRevision();
                    getDeployedEnv();
                });
        }
    }

    /**
      * Handles deploy a revision
      * @memberof Revisions
      */
    function deployRevision(revisionId, envName, vhost, displayOnDevportal) {
        const body = [{
            name: envName,
            displayOnDevportal,
            vhost,
        }];
        if (api.apiType !== API.CONSTS.APIProduct) {
            restApi.deployRevision(api.id, revisionId, body).then((response) => {
                if (response && response.obj && response.obj.length > 0) {
                    if (response.obj[0]?.status === null || response.obj[0]?.status === 'APPROVED') {
                        Alert.info('Deploy revision successfully');
                    } else if (response.obj[0]?.status === 'CREATED') {
                        Alert.info('Deploy revision request sent successfully');
                    }
                }
            }).catch((error) => {
                if (error.response) {
                    Alert.error(error.response.body.description);
                } else {
                    Alert.error('Something went wrong while deploying the revision');
                }
                console.error(error);
            }).finally(() => {
                getRevision();
                getDeployedEnv();
            });
        } else {
            restProductApi.deployProductRevision(api.id, revisionId, body)
                .then(() => {
                    Alert.info('Deploy revision Successfully');
                })
                .catch((error) => {
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    } else {
                        Alert.error('Something went wrong while deploy the revision');
                    }
                    console.error(error);
                }).finally(() => {
                    getRevision();
                    getDeployedEnv();
                });
        }
    }

    /**
      * Handles adding a new revision and deploy
      * @memberof Revisions
      */
    function createDeployRevision(envList, vhostList) {
        const body = {
            description,
        };
        if (api.apiType !== API.CONSTS.APIProduct) {
            restApi.createRevision(api.id, body)
                .then((response) => {
                    Alert.info('Revision Created Successfully');
                    const body1 = [];
                    for (const env of envList) {
                        body1.push({
                            name: env,
                            vhost: api.gatewayVendor === 'wso2' ? vhostList.find((v) => v.env === env).vhost : ' ',
                            displayOnDevportal: true,
                        });
                    }
                    restApi.deployRevision(api.id, response.body.id, body1)
                        .then(() => {
                            Alert.info('Revision Deployed Successfully');
                        })
                        .catch((error) => {
                            if (error.response) {
                                Alert.error(error.response.body.description);
                            } else {
                                Alert.error('Something went wrong while deploying the revision');
                            }
                            console.error(error);
                        }).finally(() => {
                            history.replace();
                            getRevision();
                            getDeployedEnv();
                        });
                })
                .catch((error) => {
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    } else {
                        Alert.error('Something went wrong while creating the revision');
                    }
                    console.error(error);
                });
            setOpenDeployPopup(false);
        } else {
            restProductApi.createProductRevision(api.id, body)
                .then((response) => {
                    Alert.info('Revision Created Successfully');
                    const body1 = [];
                    for (let i = 0; i < envList.length; i++) {
                        body1.push({
                            name: envList[i],
                            vhost: api.gatewayVendor === 'wso2' ? vhostList.find((v) => v.env === envList[i]).vhost
                                : ' ',
                            displayOnDevportal: true,
                        });
                    }
                    restProductApi.deployProductRevision(api.id, response.body.id, body1)
                        .then(() => {
                            Alert.info('Revision Deployed Successfully');
                        })
                        .catch((error) => {
                            if (error.response) {
                                Alert.error(error.response.body.description);
                            } else {
                                Alert.error('Something went wrong while deploying the revision');
                            }
                            console.error(error);
                        }).finally(() => {
                            history.replace();
                            getRevision();
                            getDeployedEnv();
                        });
                })
                .catch((error) => {
                    if (error.response) {
                        Alert.error(error.response.body.description);
                    } else {
                        Alert.error('Something went wrong while creating the revision');
                    }
                    console.error(error);
                });
            setOpenDeployPopup(false);
        }
    }

    /**
     * Handles creating and deploying a new revision
     * @param {Object} envList the environment list
     * @param {Array} vhostList the vhost list
     * @param {Object} length the length of the list
     */
    function handleCreateAndDeployRevision(envList, vhostList) {
        if (extraRevisionToDelete) {
            deleteRevision(extraRevisionToDelete[0])
                .then(() => {
                    createDeployRevision(envList, vhostList);
                }).finally(() => {
                    setExtraRevisionToDelete(null);
                });
        } else {
            createDeployRevision(envList, vhostList);
        }
    }

    const confirmDeleteDialog = (
        <ConfirmDialog
            key='key-dialog'
            labelCancel={(
                <FormattedMessage
                    id='Apis.Details.Environments.Environments.revision.delete.cancel'
                    defaultMessage='Cancel'
                />
            )}
            title={(
                <FormattedMessage
                    id='Apis.Details.Environments.Environments.revision.delete.confirm.title'
                    defaultMessage='Confirm Delete'
                />
            )}
            message={(
                <FormattedMessage
                    id='Apis.Details.Environments.Environments.revision.delete.confirm.message'
                    defaultMessage='Are you sure you want to delete {revision} ?'
                    values={{ revision: revisionToDelete[0] }}
                />
            )}
            labelOk={(
                <FormattedMessage
                    id='Apis.Details.Environments.Environments.revision.delete.confirm.ok'
                    defaultMessage='Yes'
                />
            )}
            callback={(e) => runActionDelete(e, revisionToDelete[1])}
            open={confirmDeleteOpen}
        />
    );

    /**
     * Get Organization value of external gateways
     * @param {Object} additionalProperties the additionalProperties list
     * @return String organization name
     */
    function getOrganizationFromAdditionalProperties(additionalProperties) {
        let organization;
        additionalProperties.forEach((property) => {
            if (property.key === 'Organization') {
                organization = property.value;
            }
        });
        return organization;
    }

    const confirmRestoreDialog = (
        <ConfirmDialog
            key='key-dialog-restore'
            labelCancel={(
                <FormattedMessage
                    id='Apis.Details.Environments.Environments.revision.restore.cancel'
                    defaultMessage='Cancel'
                />
            )}
            title={(
                <FormattedMessage
                    id='Apis.Details.Environments.Environments.revision.restore.confirm.title'
                    defaultMessage='Confirm Restore'
                />
            )}
            message={(
                <FormattedMessage
                    id='Apis.Details.Environments.Environments.revision.restore.confirm.message'
                    defaultMessage='Are you sure you want to restore {revision} (To Current API)?'
                    values={{ revision: revisionToRestore[0] }}
                />
            )}
            labelOk={(
                <FormattedMessage
                    id='Apis.Details.Environments.Environments.revision.restore.confirm.ok'
                    defaultMessage='Yes'
                />
            )}
            callback={(e) => runActionRestore(e, revisionToRestore[1])}
            open={confirmRestoreOpen}
        />
    );

    let item1;
    /**
     * Returns modified item1
     * @param {*} revDescription The description of the revision
     * @returns {Object} Returns the item1
     */
    function ReturnItem1({ revDescription, revName, revCreatedTime }) {
        const [anchorEl, setAnchorEl] = useState(null);

        const handlePopoverOpen = (event) => {
            setAnchorEl(event.currentTarget);
        };

        const handlePopoverClose = () => {
            setAnchorEl(null);
        };

        const openPopover = Boolean(anchorEl);
        item1 = (
            <Grid
                className={classes.containerInline}
            >
                <Grid item className={classes.shapeRec} />
                <Grid item className={clsx(classes.shapeCircaleBack, classes.shapeCircle)}>
                    <Grid
                        className={clsx(classes.shapeInnerComplete, classes.shapeCircle)}
                        onMouseEnter={handlePopoverOpen}
                        onMouseLeave={handlePopoverClose}
                    />
                    <Popover
                        id='mouse-over-popover'
                        sx={{ pointerEvents: 'none' }}
                        open={openPopover}
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        onClose={handlePopoverClose}
                        disableRestoreFocus
                    >
                        <div style={{ padding: '8px' }}>
                            <Typography variant='body1' sx={{ mb: 0.5 }}>
                                <b>{revName}</b>
                            </Typography>
                            <Typography variant='body2' sx={{ mb: 1}}>
                                {revDescription}
                            </Typography>
                            <Typography variant='caption'>
                                <span>{moment(revCreatedTime).fromNow()}</span>
                            </Typography>
                        </div>
                    </Popover>
                </Grid>
                <Grid item className={classes.shapeRecBack} />
            </Grid>
        );
        return item1;
    }
    const item2 = (
        <Grid
            className={classes.containerInline}
        >
            <Grid item className={classes.shapeRec}/>
            <Grid item className={clsx(classes.shapeCircaleBack, classes.shapeCircle)}>
                <Grid className={clsx(classes.shapeInnerInactive, classes.shapeCircle)} />
            </Grid>
            <Grid item className={classes.shapeRecBack} />
        </Grid>
    );
    const item3 = (
        <Grid
            className={classes.containerInline}
        >
            <Grid item className={classes.shapeRec} />
            <Grid item className={clsx(classes.shapeCircaleBack, classes.shapeCircle)}>
                <Grid className={clsx(classes.shapeDottedEnd, classes.shapeCircle)} />
            </Grid>
        </Grid>
    );
    const item4 = (
        <Grid
            className={classes.containerInline}
        >
            <Grid item className={classes.shapeRec} />
            <Grid item className={clsx(classes.shapeCircaleBack, classes.shapeCircle)}>
                {api.advertiseInfo && api.advertiseInfo.advertised ? (
                    <Grid
                        className={clsx(classes.shapeDottedStart, classes.shapeCircle)}
                        style={{ cursor: 'pointer' }}
                    >
                        <AddIcon color='disabled' className={classes.plusIconStyle} />
                    </Grid>
                ) : (
                    <Grid
                        onClick={handleClickOpen}
                        className={clsx(classes.shapeDottedStart, classes.shapeCircle)}
                        style={{ cursor: 'pointer' }}
                    >
                        <AddIcon className={classes.plusIconStyle} data-testid='new-revision-icon-btn'/>
                    </Grid>
                )}

            </Grid>
            <Grid item className={classes.shapeRecBack} />
        </Grid>
    );
    const item5 = (
        <Grid
            className={classes.containerInline}
        >
            <Grid item className={classes.shapeRec} />
            <Grid item className={clsx(classes.shapeCircaleBack, classes.shapeCircle)}>
                {api.advertiseInfo && api.advertiseInfo.advertised ? (
                    <Grid
                        className={clsx(classes.shapeDottedStart, classes.shapeCircle)}
                        style={{ cursor: 'pointer' }}
                    >
                        <AddIcon color='disabled' className={classes.plusIconStyle} />
                    </Grid>
                ) : (
                    <Grid
                        onClick={handleClickOpen}
                        className={clsx(classes.shapeDottedStart, classes.shapeCircle)}
                        style={{ cursor: 'pointer' }}
                    >
                        <AddIcon className={classes.plusIconStyle} />
                    </Grid>
                )}
            </Grid>
        </Grid>
    );
    let item6;
    /**
     * Returns modified item6
     * @param {*} revDescription The description of the revision
     * @returns {Object} Returns the item6
     */
    function ReturnItem6({ revDescription, revName, revCreatedTime }) {
        const [anchorEl1, setAnchorEl1] = useState(null);

        const handlePopoverOpen = (event) => {
            setAnchorEl1(event.currentTarget);
        };

        const handlePopoverClose = () => {
            setAnchorEl1(null);
        };

        const openPopover = Boolean(anchorEl1);
        item6 = (
            <Grid
                className={classes.containerInline}
            >
                <Grid item className={classes.shapeRec} />
                <Grid item className={clsx(classes.shapeCircaleBack, classes.shapeCircle)}>
                    <Grid
                        className={clsx(classes.shapeDottedStart1, classes.shapeCircle)}
                        onMouseEnter={handlePopoverOpen}
                        onMouseLeave={handlePopoverClose}
                    />
                    <Popover
                        id='mouse-over-popover'
                        sx={{ pointerEvents: 'none' }}
                        open={openPopover}
                        anchorEl={anchorEl1}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        onClose={handlePopoverClose}
                        disableRestoreFocus
                    >
                        <div style={{ padding: '8px' }}>
                            <Typography variant='body1' sx={{ mb: 0.5 }}>
                                <b>{revName}</b>
                            </Typography>
                            <Typography variant='body2' sx={{ mb: 1}}>
                                {revDescription}
                            </Typography>
                            <Typography variant='caption'>
                                <span>{moment(revCreatedTime).fromNow()}</span>
                            </Typography>
                        </div>
                    </Popover>
                </Grid>
                <Grid item className={classes.shapeRecBack} />
            </Grid>
        );
        return item6;
    }
    let infoIconItem;
    /**
       * Returns modified infoIconItem
       * @param {*} revDescription The description of the revision
       * @returns {Object} Returns the infoIconItem
     */
    function ReturnInfoIconItem({ revDescription}) {
        const [anchorEl, setAnchorEl] = useState(null);

        const handlePopoverOpen = (event) => {
            setAnchorEl(event.currentTarget);
        };

        const handlePopoverClose = () => {
            setAnchorEl(null);
        };

        const openPopover = Boolean(anchorEl);
        infoIconItem = (
            <>
                <InfoIcon className={classes.infoIcon} color='primary'
                    onMouseEnter={handlePopoverOpen}
                    onMouseLeave={handlePopoverClose}
                />
                <Popover
                    id='mouse-over-popover'
                    sx={{ pointerEvents: 'none' }}
                    open={openPopover}
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    onClose={handlePopoverClose}
                    disableRestoreFocus
                >
                    <Typography sx={{ p: 1 }}>{revDescription}</Typography>
                </Popover>
            </>

        );
        return infoIconItem;
    }

    const items = [];
    if (!api.isRevision && (settings && !settings.portalConfigurationOnlyModeEnabled)) {
        if (allRevisions && allRevisions.length !== 0) {
            items.push(
                <Grid item className={clsx(classes.shapeCircleBlack, classes.shapeCircle)} />,
            );
            for (let revision = 0; revision < (allRevisions.length); revision++) {
                if (revision % 2 === 0) {
                    items.push(
                        <Grid item>
                            <Grid className={classes.textShape4} />
                            <ReturnItem1
                                revDescription={allRevisions[revision].description}
                                revName={allRevisions[revision].displayName}
                                revCreatedTime={allRevisions[revision].createdTime}
                            />
                            {item1}
                            <Grid className={classes.textShape2}>
                                {allRevisions[revision].displayName}
                                {allRevisions[revision].description && (
                                    <>
                                        <ReturnInfoIconItem revDescription={allRevisions[revision].description} />
                                        {infoIconItem}
                                    </>
                                )}
                            </Grid>
                            <Grid style={{display:'flex', flexDirection:'row'}}>
                                <Button
                                    className={classes.textShape3}
                                    onClick={() => toggleOpenConfirmRestore(
                                        allRevisions[revision].displayName, allRevisions[revision].id,
                                    )}
                                    size='small'
                                    type='submit'
                                    disabled={isRestricted(['apim:api_create', 'apim:api_publish'], api)}
                                    startIcon={<RestoreIcon />}
                                >
                                    <FormattedMessage
                                        id='Apis.Details.Environments.Environments.revision.restore'
                                        defaultMessage='Restore'
                                    />
                                </Button>
                                <Button
                                    className={classes.textShape7}
                                    onClick={() => toggleOpenConfirmDelete(
                                        allRevisions[revision].displayName, allRevisions[revision].id,
                                    )}
                                    disabled={(allEnvRevision && allEnvRevision.filter(
                                        (o1) => o1.id === allRevisions[revision].id,
                                    ).length !== 0) || isRestricted(['apim:api_create', 'apim:api_publish'], api)}
                                    size='small'
                                    sx={{ color: '#38536c' }}
                                    startIcon={<DeleteForeverIcon />}
                                >
                                    <FormattedMessage
                                        id='Apis.Details.Environments.Environments.revision.delete'
                                        defaultMessage='Delete'
                                    />
                                </Button>
                            </Grid>
                        </Grid>,
                    );
                } else {
                    items.push(
                        <Grid item>
                            <Grid className={classes.textShape5} />
                            <Grid className={classes.textShape2}>
                                {allRevisions[revision].displayName}
                                {allRevisions[revision].description && <>
                                    <ReturnInfoIconItem
                                        revDescription={allRevisions[revision].description}
                                    />
                                    {infoIconItem}
                                </>
                                }
                            </Grid>
                            <Grid className={classes.textPadding} style={{display:'flex',flexDirection:'row'}}>
                                <Button
                                    className={classes.textShape3}
                                    onClick={() => toggleOpenConfirmRestore(
                                        allRevisions[revision].displayName, allRevisions[revision].id,
                                    )}
                                    size='small'
                                    disabled={isRestricted(['apim:api_create', 'apim:api_publish'], api)}
                                    type='submit'
                                    startIcon={<RestoreIcon />}
                                >
                                    <FormattedMessage
                                        id='Apis.Details.Environments.Environments.revision.restore'
                                        defaultMessage='Restore'
                                    />
                                </Button>
                                <Button
                                    className={classes.textShape7}
                                    onClick={() => toggleOpenConfirmDelete(
                                        allRevisions[revision].displayName, allRevisions[revision].id,
                                    )}
                                    disabled={(allEnvRevision && allEnvRevision.filter(
                                        (o1) => o1.id === allRevisions[revision].id,
                                    ).length !== 0) || isRestricted(['apim:api_create', 'apim:api_publish'], api)}
                                    size='small'
                                    sx={{ color: '#38536c' }}
                                    startIcon={<DeleteForeverIcon />}
                                >
                                    <FormattedMessage
                                        id='Apis.Details.Environments.Environments.revision.delete'
                                        defaultMessage='Delete'
                                    />
                                </Button>
                            </Grid>
                            <ReturnItem6
                                revDescription={allRevisions[revision].description}
                                revName={allRevisions[revision].displayName}
                                revCreatedTime={allRevisions[revision].createdTime}
                            />
                            {item6}
                        </Grid>,
                    );
                }
            }
            if (allRevisions.length !== revisionCount) {
                items.push(
                    <Grid item>
                        <Grid className={classes.textShape4}>
                            {item4}
                        </Grid>
                    </Grid>,
                );
            }
            if (allRevisions.length === revisionCount) {
                items.push(
                    <Grid item>
                        <Grid className={classes.textShape4}>
                            {item5}
                        </Grid>
                    </Grid>,
                );
            }
            for (let unassignRevision = 0; unassignRevision
                < (revisionCount - (allRevisions.length + 1)); unassignRevision++) {
                items.push(
                    <Grid item>
                        <Grid className={classes.textShape4} />
                        {item2}
                    </Grid>,
                );
            }
            if (revisionCount !== allRevisions.length) {
                items.push(
                    <Grid item>
                        <Grid className={classes.textShape4} />
                        {item3}
                    </Grid>,
                );
            }
        }

        if (allRevisions && allRevisions.length === 0) {
            items.push(
                <div>
                    <Grid className={classes.textShape8} />
                    <Grid item className={clsx(classes.shapeCircleBlack, classes.shapeCircle)} />
                </div>,
            );
            items.push(
                <Grid item>
                    <Grid className={classes.textShape4}>
                        {item4}
                    </Grid>
                </Grid>,
            );
            for (let revision = 0; revision < (revisionCount - (allRevisions.length + 1)); revision++) {
                items.push(
                    <Grid item>
                        <Grid className={classes.textShape4} />
                        {item2}
                    </Grid>,
                );
            }
            items.push(
                <Grid item>
                    <Grid className={classes.textShape4} />
                    {item3}
                </Grid>,
            );
        }
    }

    /**
     * Get gateway access URL from vhost
     * @param vhost VHost object
     * @param type URL type WS or HTTP
     * @returns {{secondary: string, primary: string}}
     */
    function getGatewayAccessUrl(vhost, type) {
        const endpoints = { primary: '', secondary: '', combined: '' };
        if (!vhost) {
            return endpoints;
        }

        if (type === 'WS') {
            endpoints.primary = 'ws://' + vhost.wsHost + ':' + vhost.wsPort;
            endpoints.secondary = 'wss://' + vhost.wssHost + ':' + vhost.wssPort;
            endpoints.combined = endpoints.secondary + ' ' + endpoints.primary;
            return endpoints;
        }

        const httpContext = vhost.httpContext ? '/' + vhost.httpContext.replace(/^\//g, '') : '';
        if (vhost.httpPort !== -1) {
            endpoints.primary = 'http://' + vhost.host 
                + (vhost.httpPort === 80 ? '' : ':' + vhost.httpPort) + httpContext;
        }
        if (vhost.httpsPort !== -1) {
            endpoints.secondary = 'https://' + vhost.host 
                + (vhost.httpsPort === 443 ? '' : ':' + vhost.httpsPort) + httpContext;
        }
        endpoints.combined = endpoints.secondary + ' ' + endpoints.primary;
        return endpoints;
    }

    /**
     * Get the deployment status component based on the environment and revision status.
     * @param {*} row Row
     * @param {*} allEnvRevisionMapping All environment revision mapping
     * @returns {JSX.Element} The JSX element representing the deployment component
     */
    function getDeployedRevisionStatusComponent(row, allEnvRevisionMapping) {

        const deployingGateway = allEnvRevisionMapping.find(gateway => {
            return gateway.name === row.name
        });
        const gatewayRevisions = deployingGateway?.revisions;

        if (!gatewayRevisions.length) {
            // Content to display when there is no revision
            return (
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <TextField
                        id='revision-selector'
                        select
                        label={(
                            <FormattedMessage
                                id='Apis.Details.Environments.Environments.select.table'
                                defaultMessage='Select Revision'
                            />
                        )}
                        SelectProps={{
                            MenuProps: {
                                getContentAnchorEl: null,
                            },
                        }}
                        name={row.name}
                        onChange={handleSelect}
                        margin='dense'
                        variant='outlined'
                        style={{width: '50%'}}
                        disabled={api.isRevision ||
                            (settings && settings.portalConfigurationOnlyModeEnabled) ||
                            !allRevisions || allRevisions.length === 0}
                    >
                        {allRevisions && allRevisions.length !== 0 && allRevisions.map((number) => (
                            <MenuItem value={number.id}>{number.displayName}</MenuItem>
                        ))}
                    </TextField>
                    <Button
                        className={classes.button2}
                        disabled={
                            api.isRevision || (settings && settings.portalConfigurationOnlyModeEnabled) ||
                            !selectedRevision.some((r) => r.env === row.name && r.revision) ||
                            !selectedVhosts.some((v) => v.env === row.name && v.vhost) ||
                            (api.advertiseInfo && api.advertiseInfo.advertised) ||
                            isDeployButtonDisabled
                        }
                        variant='outlined'
                        onClick={() =>
                            deployRevision(
                                selectedRevision.find((r) => r.env === row.name).revision,
                                row.name,
                                selectedVhosts.find((v) => v.env === row.name).vhost,
                                selectedRevision.find((r) => r.env === row.name).displayOnDevPortal
                            )
                        }
                    >
                        <FormattedMessage
                            id='Apis.Details.Environments.Environments.deploy.button'
                            defaultMessage='Deploy'
                        />
                    </Button>
                </div>
            );
        }
        const pendingDeployment = gatewayRevisions.find(revision => {
            return revision.deploymentInfo.some(info => info.status === "CREATED" && info.name === row.name);
        });

        const approvedDeployment = gatewayRevisions.find(revision => {
            return revision.deploymentInfo.some(info => (info.status === null || info.status === "APPROVED") &&
                info.name === row.name);
        });

        const filteredRevisions = allRevisions.filter(item => {
            if (pendingDeployment && pendingDeployment.displayName === item.displayName) {
                return false;
            }
            if (approvedDeployment && approvedDeployment.displayName === item.displayName) {
                return false;
            }
            return true;
        });

        if (pendingDeployment) {
            // Content to display when revision status is created
            return (
                <div>
                    <Chip
                        label={
                            <div style={{whiteSpace: 'normal', fontSize: 'smaller'}}>
                                <FormattedMessage
                                    id='Apis.Details.Environments.Environments.pending.chip'
                                    defaultMessage='Pending'
                                />
                                <br/>
                                {pendingDeployment.displayName}
                            </div>
                        }
                        style={{backgroundColor: '#FFBF00', width: '100px'}}
                    />
                    <Button
                        className={classes.button1}
                        variant='outlined'
                        disabled={api.isRevision ||
                            (settings && settings.portalConfigurationOnlyModeEnabled) ||
                            isRestricted(['apim:api_create', 'apim:api_publish'], api)}
                        onClick={() => cancelRevisionDeploymentWorkflow(pendingDeployment.id, row.name)}
                        size='small'
                        id='cancel-btn'
                    >
                        <FormattedMessage
                            id='Apis.Details.Environments.Environments.cancel.btn'
                            defaultMessage='Cancel'
                        />
                    </Button>
                </div>
            );
        }
        return (
            <div style={{display: 'flex', alignItems: 'center'}}>
                <TextField
                    id='revision-selector'
                    select
                    label={(
                        <FormattedMessage
                            id='Apis.Details.Environments.Environments.select.table'
                            defaultMessage='Select Revision'
                        />
                    )}
                    SelectProps={{
                        MenuProps: {
                            getContentAnchorEl: null,
                        },
                    }}
                    name={row.name}
                    onChange={handleSelect}
                    margin='dense'
                    variant='outlined'
                    style={{width: '50%'}}
                    disabled={api.isRevision ||
                        (settings && settings.portalConfigurationOnlyModeEnabled) ||
                        !filteredRevisions || filteredRevisions.length === 0}
                >
                    {filteredRevisions && filteredRevisions.length !== 0 && filteredRevisions.map((number) => (
                        <MenuItem value={number.id}>{number.displayName}</MenuItem>
                    ))}
                </TextField>
                <Button
                    className={classes.button2}
                    disabled={
                        api.isRevision || (settings && settings.portalConfigurationOnlyModeEnabled) ||
                        !selectedRevision.some((r) => r.env === row.name && r.revision) ||
                        !selectedVhosts.some((v) => v.env === row.name && v.vhost) ||
                        (api.advertiseInfo && api.advertiseInfo.advertised) ||
                        isDeployButtonDisabled
                    }
                    variant='outlined'
                    onClick={() =>
                        deployRevision(
                            selectedRevision.find((r) => r.env === row.name).revision,
                            row.name,
                            selectedVhosts.find((v) => v.env === row.name).vhost,
                            selectedRevision.find((r) => r.env === row.name).displayOnDevPortal
                        )
                    }
                >
                    <FormattedMessage
                        id='Apis.Details.Environments.Environments.deploy.button'
                        defaultMessage='Deploy'
                    />
                </Button>
            </div>
        );
    }

    /**
     * Get the deployment component based on the environment and revision status.
     * @param {*} row Row
     * @param {*} allEnvRevisionMapping All environment revision mapping
     * @returns {JSX.Element} The JSX element representing the deployment component
     */
    function getDeployedRevisionComponent(row, allEnvRevisionMapping) {
        const deployingGateway = allEnvRevisionMapping.find(gateway => {
            return gateway.name === row.name
        });
        const gatewayRevisions = deployingGateway?.revisions;

        if (!gatewayRevisions.length) {
            // Content to display when there is no revision
            return (
                <FormattedMessage
                    id='Apis.Details.Environments.Environments.status.not.deployed'
                    defaultMessage='No Revision Deployed'
                />
            );

        }

        const approvedDeployment = gatewayRevisions.find(revision => {
            return revision.deploymentInfo.some(info => (info.status === null || info.status === "APPROVED") &&
                info.name === row.name);
        });


        if (approvedDeployment) {
            return (
                <div>
                    <Chip
                        label={approvedDeployment.displayName}
                        style={{backgroundColor: '#15B8CF', width: '100px'}}
                    />
                    <Button
                        className={classes.button1}
                        variant='outlined'
                        disabled={api.isRevision ||
                            (settings && settings.portalConfigurationOnlyModeEnabled) ||
                            isRestricted(['apim:api_create', 'apim:api_publish'], api)}
                        onClick={() => undeployRevision(approvedDeployment.id, row.name)}
                        size='small'
                        id='undeploy-btn'
                    >
                        <FormattedMessage
                            id='Apis.Details.Environments.Environments.undeploy.btn'
                            defaultMessage='Undeploy'
                        />
                    </Button>
                </div>
            );

        }
        return (
            <FormattedMessage
                id='Apis.Details.Environments.Environments.status.not.deployed'
                defaultMessage='No Revision Deployed'
            />
        );
    }

    /**
     * Get helper text for selected vhost.
     * @param {*} env   Environment
     * @param {*} selectionList Selected vhosts
     * @param {*} shorten  Shorten the text
     * @param {*} maxTextLen Maximum text length
     * @returns {string} Helper text
     */
    function getVhostHelperText(env, selectionList, shorten, maxTextLen) {
        const selected = selectionList && selectionList.find((v) => v.env === env);
        if (selected) {
            let vhost;
            if (api.isWebSocket() ) {
                vhost = internalGateways.find((e) => e.name === env).vhosts.find(
                    (v) => v.wsHost === selected.vhost,
                );
            } else {
                vhost = internalGateways.find((e) => e.name === env).vhosts.find(
                    (v) => v.host === selected.vhost,
                );
            }

            const maxtLen = maxTextLen || 30;
            if (api.isGraphql() && !shorten) {
                const gatewayHttpUrl = getGatewayAccessUrl(vhost, 'HTTP');
                const gatewayWsUrl = getGatewayAccessUrl(vhost, 'WS');
                return gatewayHttpUrl.combined + ' ' + gatewayWsUrl.combined;
            }
            const gatewayUrls = getGatewayAccessUrl(vhost, api.isWebSocket() ? 'WS' : 'HTTP');
            if (shorten) {
                const helperText = getGatewayAccessUrl(vhost, api.isWebSocket() ? 'WS' : 'HTTP').secondary;
                return helperText.length > maxtLen ? helperText.substring(0, maxtLen) + '...' : helperText;
            }
            return gatewayUrls.combined;
        }
        return '';
    }

    if (isLoading || selectedVhosts === null) {
        return <Progress per={80} message='Loading app settings ...' />;
    }
    // allEnvDeployments represents all deployments of the API with mapping
    // environment -> {revision deployed to env, vhost deployed to env with revision}
    const allEnvDeployments = allEnvRevision ?
        Utils.getAllEnvironmentDeployments(settings.environment, allEnvRevision) : null;
    const allEnvRevisionMapping = allEnvRevision ?
        Utils.getAllEnvironmentRevisions(settings.environment, allEnvRevision) : null;


    return (
        <Root>
            {api.advertiseInfo && api.advertiseInfo.advertised && (
                <MuiAlert severity='info' className={classes.infoAlert}>
                    <Typography variant='body' align='left' data-testid='third-party-api-deployment-dialog'>
                        <FormattedMessage
                            id='Apis.Details.Environments.Environments.advertise.only.warning'
                            defaultMessage={'This API is marked as a third party API. The requests are not proxied'
                            + ' through the gateway. Hence, deployments are not required.'}
                        />
                    </Typography>
                </MuiAlert>
            )}
            {allRevisions && allRevisions.length === 0 && (
                <DeploymentOnbording
                    classes={classes}
                    getVhostHelperText={getVhostHelperText}
                    createDeployRevision={createDeployRevision}
                    description
                    setDescription={setDescription}
                    gatewayVendor={api.gatewayVendor}
                    advertiseInfo={api.advertiseInfo}
                />
            )}
            {allRevisions && allRevisions.length !== 0 && (
                <Grid md={12}>
                    <Typography id='itest-api-details-deployments-head' variant='h5' gutterBottom>
                        <FormattedMessage
                            id='Apis.Details.Environments.Environments.deployments.heading'
                            defaultMessage='Deployments'
                        />
                    </Typography>
                    <Typography variant='caption'>
                        <FormattedMessage
                            id='Apis.Details.Environments.Environments.deployments.sub.heading'
                            defaultMessage='Create revisions and deploy in Gateway Environments'
                        />
                    </Typography>
                </Grid>
            )}
            {!api.isRevision && (settings && !settings.portalConfigurationOnlyModeEnabled) &&
                allRevisions && allRevisions.length !== 0
            && (
                <Grid container>
                    <Tooltip
                        title={(
                            <>
                                <Typography color='inherit'>
                                    {api.lifeCycleStatus === 'RETIRED' ? intl.formatMessage({
                                        id: 'Apis.Details.Environments.Environments.RetiredApi.ToolTip',
                                        defaultMessage: 'Can not deploy new revisions for retired API',
                                    }): 'Deploy new revision'}
                                </Typography>
                            </>
                        )}
                        placement='bottom'
                    >
                        <span>
                            <Button
                                onClick={toggleDeployRevisionPopup}
                                disabled={isRestricted(['apim:api_create', 'apim:api_publish'], api)
                                            || (api.advertiseInfo && api.advertiseInfo.advertised) 
                                            || isDeployButtonDisabled
                                            || api.lifeCycleStatus === 'RETIRED'}
                                variant='contained'
                                color='primary'
                                size='large'
                                className={classes.deployNewRevButtonStyle}
                            >
                                <FormattedMessage
                                    id='Apis.Details.Environments.Environments.deploy.new.revision'
                                    defaultMessage='Deploy New Revision'
                                />
                            </Button>
                        </span>

                    </Tooltip>
                </Grid>
            )}
            <Grid container>
                <StyledDialog
                    open={openDeployPopup}
                    onClose={handleCloseDeployPopup}
                    aria-labelledby='form-dialog-title'
                    classes={{ paper: classes.dialogPaper }}
                >
                    <DialogTitle id='form-dialog-title' variant='h5'>
                        <FormattedMessage
                            id='Apis.Details.Environments.Environments.deploy.new.revision.heading'
                            defaultMessage='Deploy New Revision'
                        />
                    </DialogTitle>
                    <DialogContent className={classes.dialogContent}>
                        { allRevisions && allRevisions.length === revisionCount && (
                            <Typography align='left' className={classes.warningText}>
                                <FormattedMessage
                                    id='Apis.Details.Environments.Environments.select.rev.warning'
                                    defaultMessage={'Please delete a revision as '
                                    + 'the number of revisions have reached a maximum of {count}'}
                                    values={{ count: revisionCount }}
                                />
                            </Typography>
                        )}
                        { allRevisions && allRevisions.length === revisionCount && (
                            <Box mb={3}>
                                <TextField
                                    fullWidth
                                    id='revision-to-delete-selector'
                                    required
                                    select
                                    label={(
                                        <FormattedMessage
                                            id='Apis.Details.Environments.Environments.select.rev.delete'
                                            defaultMessage='Revision to delete'
                                        />
                                    )}
                                    name='extraRevisionToDelete'
                                    onChange={handleDeleteSelect}
                                    helperText={allRevisions && allRevisions.filter(
                                        (o1) => o1.deploymentInfo.length === 0,
                                    ).length === 0
                                        ? (
                                            <FormattedMessage
                                                id='Apis.Details.Environments.Environments.select.rev.helper1'
                                                defaultMessage={'Please undeploy and delete a revision as '
                                                + 'the number of revisions have reached a maximum of {count}'}
                                                values={{ count: revisionCount }}
                                            />
                                        ) : (
                                            <FormattedMessage
                                                id='Apis.Details.Environments.Environments.select.rev.helper'
                                                defaultMessage={'Please select a revision to delete as '
                                                + 'the number of revisions have reached a maximum of {count}'}
                                                values={{ count: revisionCount }}
                                            />
                                        )}
                                    margin='normal'
                                    variant='outlined'
                                    disabled={api.isRevision ||
                                        (settings && settings.portalConfigurationOnlyModeEnabled) ||
                                            allRevisions.filter(
                                                (o1) => o1.deploymentInfo.length === 0,
                                            ).length === 0}
                                >
                                    {allRevisions && allRevisions.length !== 0 && allRevisions.filter(
                                        (o1) => o1.deploymentInfo.length === 0,
                                    ).map(
                                        (revision) => (
                                            <MenuItem value={revision.id} name={revision.displayName}>
                                                {revision.displayName}
                                            </MenuItem>
                                        ),
                                    )}
                                </TextField>
                            </Box>
                        )}
                        <Box mb={3}>
                            <TextField
                                autoFocus
                                name='description'
                                margin='dense'
                                variant='outlined'
                                label='Description'
                                inputProps={{ maxLength: maxCommentLength }}
                                helperText={(
                                    <FormattedMessage
                                        id='Apis.Details.Environments.Environments.revision.description.deploy'
                                        defaultMessage='Brief description of the new revision'
                                    />
                                )}
                                fullWidth
                                multiline
                                rows={3}
                                rowsMax={4}
                                defaultValue={description}
                                onBlur={handleChange}
                            />
                            <Typography className={classes.textCount} align='right'>
                                {currentLength + '/' + maxCommentLength}
                            </Typography>
                        </Box>
                        {api.gatewayVendor === 'wso2' && (
                            <Box mt={2}>
                                <Typography variant='h6' align='left' className={classes.sectionTitle}>
                                    <FormattedMessage
                                        id='Apis.Details.Environments.Environments.api.gateways.heading'
                                        defaultMessage='API Gateways'
                                    />
                                </Typography>
                                <Grid
                                    container
                                    spacing={3}
                                >
                                    {internalGateways && internalGateways.map((row) => (
                                        <Grid item xs={4}>
                                            <Card
                                                style={{
                                                    opacity: allEnvRevision && allEnvRevision.some(o1 => {
                                                        return o1.deploymentInfo.some(o2 =>
                                                            o2.name === row.name &&
                                                            o2.status === 'CREATED');
                                                    }) ? '0.6' : '1'
                                                }}
                                                className={clsx(SelectedEnvironment
                                                && SelectedEnvironment.includes(row.name)
                                                    ? (classes.changeCard)
                                                    : (classes.noChangeCard), classes.cardHeight)}
                                                variant='outlined'
                                            >
                                                <Box height='100%'>
                                                    <CardHeader
                                                        action={
                                                            <>
                                                                {allEnvRevision && allEnvRevision.some(o1 => {
                                                                    return o1.deploymentInfo.some(o2 =>
                                                                        o2.name === row.name &&
                                                                        o2.status === 'CREATED');
                                                                }) ?
                                                                    (
                                                                        <Checkbox
                                                                            color='primary'
                                                                            icon={<RadioButtonUncheckedIcon/>}
                                                                            checkedIcon={<
                                                                                CheckCircleIcon color='primary'/>}
                                                                            disabled
                                                                        />
                                                                    ) :
                                                                    (
                                                                        <Checkbox
                                                                            id={row.name.split(' ').join('')}
                                                                            value={row.name}
                                                                            checked={
                                                                                SelectedEnvironment.includes(row.name)}
                                                                            onChange={handleChange}
                                                                            color='primary'
                                                                            icon={<RadioButtonUncheckedIcon/>}
                                                                            checkedIcon={<
                                                                                CheckCircleIcon color='primary'/>}
                                                                            inputProps={{
                                                                                'aria-label': 'secondary checkbox'
                                                                            }}
                                                                            data-testid={
                                                                                row.displayName + 'gateway-select-btn'}
                                                                        />
                                                                    )
                                                                }
                                                            </>}
                                                        title={(
                                                            <Typography variant='subtitle2'>
                                                                {row.displayName}
                                                            </Typography>
                                                        )}
                                                        subheader={(
                                                            <Typography
                                                                variant='body2'
                                                                color='textSecondary'
                                                                gutterBottom
                                                            >
                                                                {row.type}
                                                            </Typography>
                                                        )}
                                                    />
                                                    <CardContent className={classes.cardContentHeight}>
                                                        <Grid
                                                            container
                                                            direction='column'
                                                            spacing={2}
                                                        >
                                                            <Grid item xs={12} sx={{ width: '100%' }}>
                                                                <Tooltip
                                                                    title={(
                                                                        <>
                                                                            <Typography color='inherit'>
                                                                                {getVhostHelperText(row.name,
                                                                                    selectedVhostDeploy)}
                                                                            </Typography>
                                                                        </>
                                                                    )}
                                                                    placement='right'
                                                                >
                                                                    <TextField
                                                                        id='vhost-selector'
                                                                        select
                                                                        label={(
                                                                            <FormattedMessage
                                                                                id='Apis.Details.
                                                                                Environments.deploy.vhost'
                                                                                defaultMessage='VHost'
                                                                            />
                                                                        )}
                                                                        SelectProps={{
                                                                            MenuProps: {
                                                                                getContentAnchorEl: null,
                                                                            },
                                                                        }}
                                                                        name={row.name}
                                                                        value={selectedVhostDeploy.find(
                                                                            (v) => v.env === row.name,
                                                                        ).vhost}
                                                                        onChange={handleVhostDeploySelect}
                                                                        margin='dense'
                                                                        variant='outlined'
                                                                        fullWidth
                                                                        helperText={getVhostHelperText(row.name,
                                                                            selectedVhostDeploy, true)}
                                                                    >
                                                                        {row.vhosts.map(
                                                                            (vhost) => (
                                                                                <MenuItem value={api.isWebSocket()
                                                                                    ? vhost.wsHost : vhost.host}>
                                                                                    {api.isWebSocket()
                                                                                        ? vhost.wsHost : vhost.host}
                                                                                </MenuItem>
                                                                            ),
                                                                        )}
                                                                    </TextField>
                                                                </Tooltip>
                                                            </Grid>
                                                            <Grid item>
                                                                {allEnvRevision && allEnvRevision
                                                                    .filter(o1 => {
                                                                        if (o1.deploymentInfo.some(
                                                                            o2 => o2.name === row.name &&
                                                                                (o2.status === null ||
                                                                                    o2.status === 'APPROVED'))) {
                                                                            return o1;
                                                                        }
                                                                        return null;
                                                                    })
                                                                    .map(o3 => (
                                                                        <div key={o3.displayName}>
                                                                            <Chip
                                                                                label={o3.displayName}
                                                                                style={{
                                                                                    backgroundColor: '#15B8CF',
                                                                                    width: '100px'
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                            </Grid>
                                                            <Grid item>
                                                                {allEnvRevision && allEnvRevision
                                                                    .filter(o1 => {
                                                                        if (o1.deploymentInfo.some(
                                                                            o2 => o2.name === row.name &&
                                                                                o2.status === 'CREATED')) {
                                                                            return o1;
                                                                        }
                                                                        return null;
                                                                    })
                                                                    .map(o3 => (
                                                                        <div key={o3.displayName}>
                                                                            <Chip
                                                                                label={
                                                                                    <div style={{
                                                                                        whiteSpace: 'normal',
                                                                                        fontSize: 'smaller'
                                                                                    }}>
                                                                                        <FormattedMessage
                                                                                            id='Apis.Details.
                                                                                            Environments.Environments.
                                                                                            pending.chip'
                                                                                            defaultMessage='Pending'
                                                                                        />
                                                                                        <br/>
                                                                                        {o3.displayName}
                                                                                    </div>
                                                                                }
                                                                                style={{
                                                                                    backgroundColor: '#FFBF00',
                                                                                    width: '100px'
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                            </Grid>
                                                            <Grid item/>
                                                        </Grid>
                                                    </CardContent>
                                                </Box>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                        {(api.gatewayVendor === 'solace') && (allExternalGateways.length > 0) && (
                            <Box mt={2}>
                                <Typography variant='h6' align='left' className={classes.sectionTitle}>
                                    <FormattedMessage
                                        id='Apis.Details.Environments.Environments.solace.platform.environments.heading'
                                        defaultMessage='Solace Platform Environments'
                                    />
                                </Typography>
                                <Grid
                                    container
                                    spacing={3}
                                >
                                    {externalGateways.map((row) => (
                                        <Grid item xs={4}>
                                            <Card
                                                className={clsx(SelectedEnvironment
                                                && SelectedEnvironment.includes(row.name)
                                                    ? (classes.changeCard)
                                                    : (classes.noChangeCard), classes.cardHeight)}
                                                variant='outlined'
                                            >
                                                <Box height='100%'>
                                                    <CardHeader
                                                        title={(
                                                            <Typography variant='subtitle2'>
                                                                {row.displayName}
                                                            </Typography>
                                                        )}
                                                        subheader={(
                                                            <Typography
                                                                variant='body2'
                                                                color='textSecondary'
                                                                gutterBottom
                                                            >
                                                                {row.provider}
                                                            </Typography>
                                                        )}
                                                        action={(
                                                            <Checkbox
                                                                id={row.name.split(' ').join('')}
                                                                value={row.name}
                                                                checked={SelectedEnvironment.includes(row.name)}
                                                                onChange={handleChange}
                                                                color='primary'
                                                                icon={<RadioButtonUncheckedIcon />}
                                                                checkedIcon={<CheckCircleIcon color='primary' />}
                                                                inputProps={{ 'aria-label': 'secondary checkbox' }}
                                                            />
                                                        )}
                                                    />
                                                    <CardContent>
                                                        <Grid
                                                            container
                                                            direction='column'
                                                            spacing={2}
                                                        >
                                                            <Grid item xs={12}>
                                                                <TextField
                                                                    id='Api.Details.Third.party.environment.name'
                                                                    label='Environment'
                                                                    variant='outlined'
                                                                    disabled
                                                                    fullWidth
                                                                    margin='dense'
                                                                    value={row.name}
                                                                />
                                                                <TextField
                                                                    id='Api.Details.
                                                                        Third.party.environment.organization'
                                                                    label='Organization'
                                                                    variant='outlined'
                                                                    disabled
                                                                    fullWidth
                                                                    margin='dense'
                                                                    value={getOrganizationFromAdditionalProperties(
                                                                        row.additionalProperties,
                                                                    )}
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    </CardContent>
                                                </Box>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDeployPopup}>
                            <FormattedMessage
                                id='Apis.Details.Environments.Environments.deploy.cancel'
                                defaultMessage='Cancel'
                            />
                        </Button>
                        <Button
                            type='submit'
                            variant='contained'
                            data-testid='btn-deploy'
                            onClick={
                                () => handleCreateAndDeployRevision(SelectedEnvironment, selectedVhostDeploy)
                            }
                            color='primary'
                            disabled={SelectedEnvironment.length === 0
                                || (allRevisions && allRevisions.length === revisionCount && !extraRevisionToDelete)
                                || isRestricted(['apim:api_create', 'apim:api_publish'], api)
                                || (api.advertiseInfo && api.advertiseInfo.advertised)
                                || isDeployButtonDisabled}
                        >
                            <FormattedMessage
                                id='Apis.Details.Environments.Environments.deploy.deploy'
                                defaultMessage='Deploy'
                            />
                        </Button>
                    </DialogActions>
                </StyledDialog>
            </Grid>
            {allRevisions && allRevisions.length !== 0 && (
                <>
                    <Grid
                        container
                        direction='row'
                        alignItems='flex-start'
                        spacing={1}
                    >
                        <Grid item>
                            <Typography variant='h6' gutterBottom>
                                <FormattedMessage
                                    id='Apis.Details.Environments.Environments.Deployments'
                                    defaultMessage='Revisions'
                                />
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Tooltip
                                title={(
                                    <FormattedMessage
                                        id='Apis.Details.Environments.Environments.Create.Revision.Deploy'
                                        defaultMessage='Create new revision and deploy'
                                    />
                                )}
                                placement='top-end'
                                aria-label='New Deployment'
                            >
                                <IconButton size='small' aria-label='delete'>
                                    <HelpOutlineIcon fontSize='small' />
                                </IconButton>
                            </Tooltip>
                        </Grid>

                    </Grid>
                    <Box className={classes.containerOverflow}>
                        <Grid
                            xs={12}
                            className={classes.containerInline}
                        >
                            {items}
                            {confirmDeleteDialog}
                            {confirmRestoreDialog}
                        </Grid>
                    </Box>
                </>
            )}
            <Grid container>
                <StyledDialog
                    open={open}
                    onClose={handleClose}
                    aria-labelledby='form-dialog-title'
                    classes={{ paper: classes.createRevisionDialogStyle }}
                >
                    <DialogTitle id='form-dialog-title' variant='h5'>
                        <FormattedMessage
                            id='Apis.Details.Environments.Environments.revision.create.heading'
                            defaultMessage='Create New Revision (From Current API)'
                        />
                    </DialogTitle>
                    <DialogContent className={classes.dialogContent}>
                        { allRevisions && allRevisions.length === revisionCount && (
                            <Typography align='left' className={classes.warningText}>
                                <FormattedMessage
                                    id='Apis.Details.Environments.Environments.select.rev.warning'
                                    defaultMessage={'Please delete a revision as '
                                    + 'the number of revisions have reached a maximum of {count}'}
                                    values={{ count: revisionCount }}
                                />
                            </Typography>
                        )}
                        { allRevisions && allRevisions.length === revisionCount && (
                            <Box mb={3}>
                                <TextField
                                    fullWidth
                                    id='revision-to-delete-selector'
                                    required
                                    select
                                    label={(
                                        <FormattedMessage
                                            id='Apis.Details.Environments.Environments.select.rev.delete'
                                            defaultMessage='Revision to delete'
                                        />
                                    )}
                                    name='extraRevisionToDelete'
                                    onChange={handleDeleteSelect}
                                    helperText={allRevisions && allRevisions.filter(
                                        (o1) => o1.deploymentInfo.length === 0,
                                    ).length === 0
                                        ? (
                                            <FormattedMessage
                                                id='Apis.Details.Environments.Environments.select.rev.helper1'
                                                defaultMessage={'Please undeploy and delete a revision as '
                                                + 'the number of revisions have reached a maximum of {count}'}
                                                values={{ count: revisionCount }}
                                            />
                                        ) : (
                                            <FormattedMessage
                                                id='Apis.Details.Environments.Environments.select.rev.helper'
                                                defaultMessage={'Please select a revision to delete as '
                                                + 'the number of revisions have reached a maximum of {count}'}
                                                values={{ count: revisionCount }}
                                            />
                                        )}
                                    margin='normal'
                                    variant='outlined'
                                    disabled={api.isRevision ||
                                        (settings && settings.portalConfigurationOnlyModeEnabled) ||
                                            allRevisions.filter(
                                                (o1) => o1.deploymentInfo.length === 0,
                                            ).length === 0}
                                >
                                    {allRevisions && allRevisions.length !== 0 && allRevisions.filter(
                                        (o1) => o1.deploymentInfo.length === 0,
                                    ).map(
                                        (revision) => (
                                            <MenuItem value={revision.id} name={revision.displayName}>
                                                {revision.displayName}
                                            </MenuItem>
                                        ),
                                    )}
                                </TextField>
                            </Box>
                        )}
                        <Box mb={3}>
                            <TextField
                                autoFocus
                                name='description'
                                margin='dense'
                                variant='outlined'
                                label='Description'
                                inputProps={{ maxLength: maxCommentLength }}
                                helperText={(
                                    <FormattedMessage
                                        id='Apis.Details.Environments.Environments.revision.description.create'
                                        defaultMessage='Brief description of the new revision'
                                    />
                                )}
                                fullWidth
                                multiline
                                rows={3}
                                rowsMax={4}
                                defaultValue={description}
                                onBlur={handleChange}
                            />
                            <Typography className={classes.textCount} align='right'>
                                {currentLength + '/' + maxCommentLength}
                            </Typography>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>
                            <FormattedMessage
                                id='Apis.Details.Environments.Environments.create.cancel'
                                defaultMessage='Cancel'
                            />
                        </Button>
                        <Button
                            onClick={handleClickAddRevision}
                            type='submit'
                            variant='contained'
                            color='primary'
                            disabled={api.isRevision || (settings && settings.portalConfigurationOnlyModeEnabled)
                                || (allRevisions && allRevisions.length === revisionCount && !extraRevisionToDelete)}
                        >
                            <FormattedMessage
                                id='Apis.Details.Environments.Environments.create.create'
                                defaultMessage='Create'
                            />
                        </Button>
                    </DialogActions>
                </StyledDialog>
            </Grid>
            {api.lifeCycleStatus !== 'RETIRED' 
            &&  allRevisions && allRevisions.length !== 0 && api.gatewayVendor === 'wso2' && (
                <Box mx='auto' mt={5}>
                    <Typography variant='h6' component='h2' className={classes.sectionTitle}>
                        <FormattedMessage
                            id='Apis.Details.Environments.Environments.APIGateways'
                            defaultMessage='API Gateways'
                        />
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell align='left'>
                                        <FormattedMessage
                                            id='Apis.Details.Environments.Environments.api.gateways.name'
                                            defaultMessage='Name'
                                        />
                                    </TableCell>
                                    <TableCell align='left'>
                                        <FormattedMessage
                                            id='Apis.Details.Environments.Environments.gateway.accessUrl'
                                            defaultMessage='Gateway Access URL'
                                        />
                                    </TableCell>
                                    {api && api.isDefaultVersion !== true
                                        ? (
                                            <TableCell align='left'>
                                                <FormattedMessage
                                                    id='Apis.Details.Environments.Environments.gateway
                                                    .deployment.current.revision'
                                                    defaultMessage='Current Revision'
                                                />
                                            </TableCell>
                                        )
                                        : (
                                            <TableCell align='left'>
                                                <FormattedMessage
                                                    id='Apis.Details.Environments.Environments.gateway.action'
                                                    defaultMessage='Action'
                                                />
                                            </TableCell>
                                        )}
                                    <TableCell align='left'>
                                        <FormattedMessage
                                            id='Apis.Details.Environments.Environments.gateway.deployment.next.revision'
                                            defaultMessage='Next Revision'
                                        />
                                    </TableCell>
                                    <TableCell align='left'>
                                        <FormattedMessage
                                            id='Apis.Details.Environments.Environments.visibility.in.devportal'
                                            defaultMessage='Gateway URL Visibility'
                                        />
                                        <Tooltip
                                            title={(
                                                <FormattedMessage
                                                    id='Apis.Details.Environments.Environments.display.devportal'
                                                    defaultMessage='Display Gateway Access URLs in developer portal.'
                                                />
                                            )}
                                            placement='top-end'
                                            aria-label='New Deployment'
                                        >
                                            <IconButton size='small' aria-label='delete'>
                                                <HelpOutlineIcon fontSize='small' />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {internalGateways && internalGateways.map((row) => (
                                    <TableRow key={row.name}>
                                        <TableCell component='th' scope='row'>
                                            {row.displayName}
                                        </TableCell>
                                        {allEnvDeployments[row.name].revision != null ? (
                                            <>
                                                <TableCell align='left' id='gateway-access-url-cell'>
                                                    <div className={classes.primaryEndpoint}>
                                                        {api.isWebSocket()
                                                            ? getGatewayAccessUrl(allEnvDeployments[row.name]
                                                                .vhost, 'WS')
                                                                .primary : getGatewayAccessUrl(
                                                                allEnvDeployments[row.name].vhost, 'HTTP',
                                                            ).primary}
                                                    </div>
                                                    <div className={classes.secondaryEndpoint}>
                                                        {api.isWebSocket()
                                                            ? getGatewayAccessUrl(allEnvDeployments[row.name]
                                                                .vhost, 'WS')
                                                                .secondary : getGatewayAccessUrl(
                                                                allEnvDeployments[row.name].vhost, 'HTTP',
                                                            ).secondary}
                                                    </div>
                                                    {api.isGraphql()
                                                    && (
                                                        <>
                                                            <div className={classes.primaryEndpoint}>
                                                                {getGatewayAccessUrl(allEnvDeployments[row.name]
                                                                    .vhost, 'WS')
                                                                    .primary}
                                                            </div>
                                                            <div className={classes.secondaryEndpoint}>
                                                                {getGatewayAccessUrl(allEnvDeployments[row.name]
                                                                    .vhost, 'WS')
                                                                    .secondary}
                                                            </div>
                                                        </>

                                                    )}
                                                </TableCell>
                                            </>
                                        ) : (
                                            <>
                                                <TableCell align='left' className={classes.tableCellVhostSelect}>
                                                    <Tooltip
                                                        title={(
                                                            <>
                                                                <Typography color='inherit'>
                                                                    {getVhostHelperText(row.name,
                                                                        selectedVhosts)}
                                                                </Typography>
                                                            </>
                                                        )}
                                                        placement='bottom'
                                                    >
                                                        <TextField
                                                            id='vhost-selector'
                                                            select
                                                            label={(
                                                                <FormattedMessage
                                                                    id='Apis.Details.Environments.Environments
                                                                    .select.vhost'
                                                                    defaultMessage='Select Access URL'
                                                                />
                                                            )}
                                                            SelectProps={{
                                                                MenuProps: {
                                                                    getContentAnchorEl: null,
                                                                },
                                                            }}
                                                            name={row.name}
                                                            value={selectedVhosts.find((v) => v.env === row.name).vhost}
                                                            onChange={handleVhostSelect}
                                                            margin='dense'
                                                            variant='outlined'
                                                            className={classes.vhostSelect}
                                                            fullWidth
                                                            disabled={api.isRevision
                                                            || (settings && settings.portalConfigurationOnlyModeEnabled)
                                                            || !allRevisions || allRevisions.length === 0}
                                                            helperText={getVhostHelperText(row.name, selectedVhosts,
                                                                true, 100)}
                                                        >
                                                            {row.vhosts.map(
                                                                (vhost) => (
                                                                    <MenuItem value={api.isWebSocket() 
                                                                        ? vhost.wsHost : vhost.host}>
                                                                        {api.isWebSocket() 
                                                                            ? vhost.wsHost : vhost.host}
                                                                    </MenuItem>
                                                                ),
                                                            )}
                                                        </TextField>
                                                    </Tooltip>
                                                </TableCell>
                                            </>
                                        )}
                                        <TableCell component='th' scope='row'>
                                            {getDeployedRevisionComponent(row, allEnvRevisionMapping)}
                                        </TableCell>
                                        <TableCell align='left' style={{ width: '300px' }}>
                                            {getDeployedRevisionStatusComponent(row, allEnvRevisionMapping)}
                                        </TableCell>
                                        <TableCell align='left'>
                                            <DisplayDevportal
                                                name={row.name}
                                                api={api}
                                                EnvDeployments={allEnvDeployments[row.name]}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
            {allRevisions && allRevisions.length !== 0 && (api.gatewayVendor === 'solace')
            && (allExternalGateways.length > 0) && (
                <Box mx='auto' mt={5}>
                    <Typography variant='h6' className={classes.sectionTitle}>
                        <FormattedMessage
                            id='Apis.Details.Solace.Platform.Environments'
                            defaultMessage='Solace Platform Environments'
                        />
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell align='left'>
                                        <FormattedMessage
                                            id='Apis.Details.Third.Party.Brokers.broker.displayName'
                                            defaultMessage='Name'
                                        />
                                    </TableCell>
                                    {externalEnvEndpoints && (
                                        <TableCell align='left'>
                                            <FormattedMessage
                                                id='Apis.Details.Third.Party.Brokers.broker.endpoints'
                                                defaultMessage='Access Endpoints'
                                            />
                                        </TableCell>
                                    )}
                                    <TableCell align='left'>
                                        <FormattedMessage
                                            id='Apis.Details.Third.Party.Brokers.broker.environment'
                                            defaultMessage='Environment'
                                        />
                                    </TableCell>
                                    <TableCell align='left'>
                                        <FormattedMessage
                                            id='Apis.Details.Third.Party.Brokers.broker.type'
                                            defaultMessage='Organization'
                                        />
                                    </TableCell>
                                    <TableCell align='left'>
                                        <FormattedMessage
                                            id='Apis.Details.Third.Party.Brokers.broker.name'
                                            defaultMessage='Provider'
                                        />
                                    </TableCell>
                                    {api && api.isDefaultVersion !== true
                                        ? (
                                            <TableCell align='left'>
                                                <FormattedMessage
                                                    id='Apis.Details.Environments.
                                                        Environments.gateway.deployed.revision'
                                                    defaultMessage='Deployed Revision'
                                                />
                                            </TableCell>
                                        )
                                        : (
                                            <TableCell align='left'>
                                                <FormattedMessage
                                                    id='Apis.Details.Environments.Environments.gateway.action'
                                                    defaultMessage='Action'
                                                />
                                            </TableCell>
                                        )}
                                    <TableCell align='left'>
                                        <FormattedMessage
                                            id='Apis.Details.Environments.Environments.display.in.devportal'
                                            defaultMessage='Display in Developer Portal'
                                        />
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {externalGateways.map((row) => (
                                    <TableRow key={row.name}>
                                        <TableCell component='th' scope='row'>
                                            {row.displayName}
                                        </TableCell>
                                        {externalEnvEndpoints && (
                                            <TableCell align='left'>
                                                {externalEnvEndpoints[row.name] &&
                                                    externalEnvEndpoints[row.name].map((e) => {
                                                        return (
                                                            <Grid container spacing={2}>
                                                                <Grid item>
                                                                    <Chip
                                                                        label={upperCaseString(e.protocol)}
                                                                        size='small'
                                                                        color='primary'
                                                                        variant='outlined'
                                                                    />
                                                                </Grid>
                                                                <Grid
                                                                    item
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                    }}
                                                                >
                                                                    {e.uri}
                                                                </Grid>
                                                            </Grid>
                                                        );
                                                    })
                                                }
                                            </TableCell>
                                        )}
                                        <TableCell align='left'>
                                            {row.name}
                                        </TableCell>
                                        <TableCell align='left'>
                                            {getOrganizationFromAdditionalProperties(row.additionalProperties)}
                                        </TableCell>
                                        <TableCell align='left'>
                                            {row.provider}
                                        </TableCell>
                                        <TableCell align='left' style={{ width: '300px' }}>
                                            {allExternalGatewaysMap[row.name].revision != null
                                                ? (
                                                    <div>
                                                        <Chip
                                                            label={allExternalGatewaysMap[row.name]
                                                                .revision.displayName}
                                                            style={{ backgroundColor: '#15B8CF' }}
                                                        />
                                                        <Button
                                                            className={classes.button1}
                                                            variant='outlined'
                                                            disabled={api.isRevision ||
                                                                (settings &&
                                                                    settings.portalConfigurationOnlyModeEnabled
                                                                )}
                                                            onClick={() => undeployRevision(
                                                                allExternalGatewaysMap[row.name]
                                                                    .revision.id, row.name,
                                                            )}
                                                            size='small'
                                                        >
                                                            <FormattedMessage
                                                                id='Apis.Details.Environments.Environments.undeploy.btn'
                                                                defaultMessage='Undeploy'
                                                            />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display:'flex', justifyContent: 'center' }}>
                                                        <TextField
                                                            id='revision-selector'
                                                            select
                                                            label={(
                                                                <FormattedMessage
                                                                    id='Apis.Details.Environments.
                                                                            Environments.select.table'
                                                                    defaultMessage='Select Revision'
                                                                />
                                                            )}
                                                            SelectProps={{
                                                                MenuProps: {
                                                                    getContentAnchorEl: null,
                                                                },
                                                            }}
                                                            name={row.name}
                                                            onChange={handleSelectForBrokers}
                                                            margin='dense'
                                                            variant='outlined'
                                                            style={{ width: '50%' }}
                                                            disabled={api.isRevision ||
                                                                (settings &&
                                                                    settings.portalConfigurationOnlyModeEnabled
                                                                )
                                                            || !allRevisions || allRevisions.length === 0}
                                                        >
                                                            {allRevisions && allRevisions.length !== 0
                                                            && allRevisions.map(
                                                                (number) => (
                                                                    <MenuItem value={number.id}>
                                                                        {number.displayName}
                                                                    </MenuItem>
                                                                ),
                                                            )}
                                                        </TextField>
                                                        <Button
                                                            className={classes.button2}
                                                            disabled={api.isRevision ||
                                                                (settings &&
                                                                    settings.portalConfigurationOnlyModeEnabled
                                                                )
                                                                || !selectedRevision.some(
                                                                    (r) => r.env === row.name && r.revision,
                                                                ) || (api.advertiseInfo && api.advertiseInfo.advertised)
                                                            || isDeployButtonDisabled}
                                                            variant='outlined'
                                                            onClick={() => deployRevision(selectedRevision.find(
                                                                (r) => r.env === row.name,
                                                            ).revision, row.name,
                                                            ' ', selectedRevision.find(
                                                                (r) => r.env === row.name,
                                                            ).displayOnDevPortal)}

                                                        >
                                                            <FormattedMessage
                                                                id='Apis.Details.Environments.Environments
                                                                .deploy.button'
                                                                defaultMessage='Deploy'
                                                            />
                                                        </Button>
                                                    </div>
                                                )}
                                        </TableCell>
                                        <TableCell align='left'>
                                            <DisplayDevportal
                                                name={row.name}
                                                api={api}
                                                EnvDeployments={allExternalGatewaysMap[row.name]}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </Root>
    );
}
