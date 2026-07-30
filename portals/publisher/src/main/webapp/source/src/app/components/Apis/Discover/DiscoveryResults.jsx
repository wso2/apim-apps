/*
 * Copyright (c) 2026, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Chip,
    TextField,
    TablePagination,
    InputAdornment,
    Tooltip,
    Checkbox,
    IconButton,
    Select,
    MenuItem,
    FormControl,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import GetAppIcon from '@mui/icons-material/GetApp';
import RefreshIcon from '@mui/icons-material/Refresh';
import { styled } from '@mui/material/styles';
import { usePublisherSettings } from 'AppComponents/Shared/AppContext';
import API from 'AppData/api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FormattedMessage, useIntl, defineMessages } from 'react-intl';
import APIMAlert from 'AppComponents/Shared/Alert';

const Root = styled('div')(({ theme }) => ({
    padding: theme.spacing(4),
    '& .header': {
        marginBottom: theme.spacing(4),
    },
    '& .actions': {
        marginTop: theme.spacing(2),
    },
}));

// How often (ms) to poll the status endpoint while a task is PENDING
const POLL_INTERVAL_MS = 2000;
// Maximum time (ms) to wait before giving up on a task
const POLL_TIMEOUT_MS = 120000;

/**
 * Single poll attempt: checks GET /federated-apis/status/{taskId} once.
 */
const pollOnce = (taskId) => {
    return API.getFederatedAPIDiscoveryStatus(taskId).then((response) => {
        const data = response.body || response.obj;
        if (data.status === 'COMPLETED') {
            return data.result || [];
        }
        if (data.status === 'FAILED') {
            throw new Error(data.error || `Task ${taskId} failed on the server.`);
        }
        return null; // still PENDING
    });
};

/**
 * Delay that can be cancelled from outside (e.g. on unmount): clears the underlying setTimeout
 * instead of letting it fire uselessly, and rejects immediately so the caller's promise chain
 * settles right away instead of hanging until the timer would have fired naturally.
 * `pendingCancels`, if provided, is a ref holding a Set that the caller can iterate to cancel
 * every outstanding delay at once (see the unmount cleanup in DiscoveryResults).
 */
const cancellableDelay = (ms, pendingCancels) => {
    return new Promise((resolve, reject) => {
        let timeoutId;
        const cancel = () => {
            clearTimeout(timeoutId);
            reject(new Error('COMPONENT_UNMOUNTED'));
        };
        timeoutId = setTimeout(() => {
            if (pendingCancels) pendingCancels.current.delete(cancel);
            resolve();
        }, ms);
        if (pendingCancels) pendingCancels.current.add(cancel);
    });
};

/**
 * Polls GET /federated-apis/status/{taskId} until COMPLETED, FAILED, or component unmounted.
 */
const pollTaskStatus = (taskId, isMounted, pendingCancels, startTime = Date.now()) => {
    if (isMounted && !isMounted.current) {
        return Promise.reject(new Error('COMPONENT_UNMOUNTED'));
    }
    if (Date.now() - startTime >= POLL_TIMEOUT_MS) {
        return Promise.reject(
            new Error(`Discovery timed out after ${POLL_TIMEOUT_MS / 1000}s for task ${taskId}.`)
        );
    }
    return cancellableDelay(POLL_INTERVAL_MS, pendingCancels)
        .then(() => {
            if (isMounted && !isMounted.current) {
                throw new Error('COMPONENT_UNMOUNTED');
            }
            return pollOnce(taskId);
        })
        .then((result) => {
            if (isMounted && !isMounted.current) {
                throw new Error('COMPONENT_UNMOUNTED');
            }
            if (result !== null) {
                return result; // COMPLETED
            }
            return pollTaskStatus(taskId, isMounted, pendingCancels, startTime);
        });
};

// Message descriptors for the error explanations. Declared with defineMessages() (rather than as
// plain object literals picked between with a ternary) so the formatjs static extractor - which
// only recognizes single, statically-resolvable references at each intl.formatMessage() call site -
// can find all of them. See getFriendlyErrorMessage() below for why each is called from its own
// dedicated branch instead of a ternary/dynamic property lookup.
const errorMessages = defineMessages({
    generic: {
        id: 'Apis.Discover.DiscoveryResults.error.generic',
        defaultMessage: 'Discovery failed due to a server error or invalid gateway response. '
            + 'Please inspect the gateway logs.',
    },
    auth: {
        id: 'Apis.Discover.DiscoveryResults.error.auth',
        defaultMessage: 'Authentication failed. Please verify the credentials, API keys, '
            + 'or certificates configured for this gateway in the Admin portal.',
    },
    resourceNotFound: {
        id: 'Apis.Discover.DiscoveryResults.error.resource.not.found',
        defaultMessage: 'Resource not found or configuration is invalid. Please verify the project ID, '
            + 'tenant, organization, or environment/workspace settings configured '
            + 'for this gateway in the Admin portal.',
    },
    network: {
        id: 'Apis.Discover.DiscoveryResults.error.network',
        defaultMessage: 'Network connection issue. The third-party gateway is unreachable. '
            + 'Please verify network connectivity, firewall rules, and the host URL config.',
    },
    rateLimit: {
        id: 'Apis.Discover.DiscoveryResults.error.rate.limit',
        defaultMessage: 'Rate limit exceeded. The third-party gateway rejected the requests '
            + 'because the quota or rate limit has been reached. Please try again later.',
    },
});

// Maps groups of error keywords to the error message key shown to the user. Evaluated in order,
// so the earlier (more specific) categories take precedence over the later ones.
const DISCOVERY_ERROR_CATEGORIES = [
    {
        key: 'auth',
        keywords: ['aadsts', 'unauthorized', '401', 'invalid_client', 'invalid client',
            'invalid_grant', 'invalid grant', 'forbidden', '403', 'invalid key',
            'credentials', 'api key', 'service account'],
    },
    {
        key: 'resourceNotFound',
        keywords: ['tenant', 'project_id', 'project', 'not found', '404', 'resource not found',
            'environment', 'workspace', 'organization'],
    },
    {
        key: 'network',
        keywords: ['timeout', 'timed out', 'connect', 'connection refused', 'dns',
            'resolve', 'unreachable', 'host', 'network'],
    },
    {
        key: 'rateLimit',
        keywords: ['429', 'too many requests', 'rate limit', 'quota'],
    },
];

/**
 * Maps rawError to a friendly, localized explanation. `intl` is passed in explicitly since this
 * helper is also invoked from importSingleApi(), a module-level function outside the component
 * tree that has no access to the useIntl() hook.
 */
const getFriendlyErrorMessage = (rawError, intl) => {
    const errLower = (rawError || '').toLowerCase();
    const category = DISCOVERY_ERROR_CATEGORIES.find(
        ({ keywords }) => keywords.some((keyword) => errLower.includes(keyword))
    );
    // Each branch below is its own literal intl.formatMessage(errorMessages.x) call (rather than a
    // single call keyed off a dynamic variable) so the formatjs extractor can find every message.
    switch (category?.key) {
        case 'auth':
            return intl.formatMessage(errorMessages.auth);
        case 'resourceNotFound':
            return intl.formatMessage(errorMessages.resourceNotFound);
        case 'network':
            return intl.formatMessage(errorMessages.network);
        case 'rateLimit':
            return intl.formatMessage(errorMessages.rateLimit);
        default:
            return intl.formatMessage(errorMessages.generic);
    }
};

const importResultMessages = defineMessages({
    updateSuccess: {
        id: 'Apis.Discover.DiscoveryResults.import.update.success',
        defaultMessage: 'API "{apiName}" updated successfully',
    },
    importSuccess: {
        id: 'Apis.Discover.DiscoveryResults.import.success',
        defaultMessage: 'API "{apiName}" imported successfully',
    },
    updateError: {
        id: 'Apis.Discover.DiscoveryResults.import.update.error',
        defaultMessage: 'Failed to update API "{apiName}": {reason}',
    },
    importError: {
        id: 'Apis.Discover.DiscoveryResults.import.error',
        defaultMessage: 'Failed to import API "{apiName}": {reason}',
    },
});

// Summary messages for the batched (multi-API) path. One toast is shown per action group rather
// than one per API, so a large selection does not produce a wall of notifications.
const bulkResultMessages = defineMessages({
    importAllSuccess: {
        id: 'Apis.Discover.DiscoveryResults.bulk.import.all.success',
        defaultMessage: '{count} APIs imported successfully',
    },
    updateAllSuccess: {
        id: 'Apis.Discover.DiscoveryResults.bulk.update.all.success',
        defaultMessage: '{count} APIs updated successfully',
    },
    importPartial: {
        id: 'Apis.Discover.DiscoveryResults.bulk.import.partial',
        defaultMessage: '{successCount} of {totalCount} APIs imported, {failedCount} failed',
    },
    updatePartial: {
        id: 'Apis.Discover.DiscoveryResults.bulk.update.partial',
        defaultMessage: '{successCount} of {totalCount} APIs updated, {failedCount} failed',
    },
    importRequestFailed: {
        id: 'Apis.Discover.DiscoveryResults.bulk.import.request.failed',
        defaultMessage: 'Failed to import {count} APIs: {reason}',
    },
    updateRequestFailed: {
        id: 'Apis.Discover.DiscoveryResults.bulk.update.request.failed',
        defaultMessage: 'Failed to update {count} APIs: {reason}',
    },
    // Shown in the per-row tooltip when the batch reported this API in failedIds. The response
    // identifies WHICH APIs failed but not WHY, so the reason here is necessarily generic.
    importRowFailed: {
        id: 'Apis.Discover.DiscoveryResults.bulk.import.row.failed',
        defaultMessage: 'Import failed for this API. Check the gateway logs for the specific cause.',
    },
    updateRowFailed: {
        id: 'Apis.Discover.DiscoveryResults.bulk.update.row.failed',
        defaultMessage: 'Update failed for this API. Check the gateway logs for the specific cause.',
    },
});

/**
 * Helper to import/update a single API from a federated gateway, used by the per-row Import/Update
 * button. Multi-API selections go through importApiBatch instead; this path is kept separate
 * because a single API can be given its own specific failure reason and a named toast, neither of
 * which the batch response supports. Returns a promise that always resolves (never rejects) once
 * the attempt - success or failure - has been fully handled, so callers can safely await it.
 */
const importSingleApi = (item, gwName, intl, setImportingStates, setSelectedApis, setImportErrors) => {
    const apiId = item.id;
    const isUpdate = item.status === 'UPDATE';
    const actionLabel = isUpdate ? 'update' : 'import';
    setImportingStates((prev) => ({ ...prev, [apiId]: 'importing' }));
    return API.importFederatedAPIs(actionLabel, gwName, [{ id: apiId }])
        .then((response) => {
            if (!response.ok && response.status !== 200 && response.status !== 201) {
                const errorData = response.body || {};
                const backendMsg = errorData.message || `Failed to ${actionLabel} API`;
                throw new Error(backendMsg);
            }
            // The backend reports per-API failures in the response body rather than the HTTP status,
            // so a 200 alone does not mean this API was imported. Only one API is sent per request,
            // so any reported failure refers to this one.
            const data = response.body || response.obj || {};
            const failedIds = Array.isArray(data.failedIds) ? data.failedIds : [];
            if (failedIds.length > 0) {
                throw new Error(data.status || `Failed to ${actionLabel} API`);
            }
            setImportingStates((prev) => ({ ...prev, [apiId]: 'success' }));
            setSelectedApis((prev) => {
                const next = { ...prev };
                delete next[apiId];
                return next;
            });
            setImportErrors((prev) => {
                const next = { ...prev };
                delete next[apiId];
                return next;
            });
            if (isUpdate) {
                APIMAlert.success(intl.formatMessage(importResultMessages.updateSuccess, { apiName: item.apiName }));
            } else {
                APIMAlert.success(intl.formatMessage(importResultMessages.importSuccess, { apiName: item.apiName }));
            }
        })
        .catch((err) => {
            console.error(err);
            const friendly = getFriendlyErrorMessage(err.message, intl);
            setImportingStates((prev) => ({ ...prev, [apiId]: 'error' }));
            setImportErrors((prev) => ({ ...prev, [apiId]: friendly }));
            if (isUpdate) {
                APIMAlert.error(intl.formatMessage(
                    importResultMessages.updateError, { apiName: item.apiName, reason: friendly }
                ));
            } else {
                APIMAlert.error(intl.formatMessage(
                    importResultMessages.importError, { apiName: item.apiName, reason: friendly }
                ));
            }
        });
};

/**
 * Imports or updates a batch of APIs from one gateway in a single request.
 *
 * All items must share the same action, because /federated-apis/import and /federated-apis/update
 * are separate endpoints - handleBulkImport groups the selection before calling this.
 *
 * The backend reports per-API outcomes through failedIds in the response body rather than through
 * the HTTP status, so a 2xx does not by itself mean every API succeeded: anything not named in
 * failedIds is treated as successful. failedIds identifies WHICH APIs failed but not WHY (the
 * specific cause is only in the gateway-side logs), so failed rows get a generic reason.
 *
 * Like importSingleApi, the returned promise always resolves once the outcome has been handled.
 */
const importApiBatch = (items, gwName, isUpdate, intl, setImportingStates, setSelectedApis, setImportErrors) => {
    const action = isUpdate ? 'update' : 'import';
    const ids = items.map((item) => item.id);
    setImportingStates((prev) => {
        const next = { ...prev };
        ids.forEach((id) => { next[id] = 'importing'; });
        return next;
    });

    return API.importFederatedAPIs(action, gwName, ids.map((id) => ({ id })))
        .then((response) => {
            if (!response.ok && response.status !== 200 && response.status !== 201) {
                const errorData = response.body || {};
                throw new Error(errorData.message || `Failed to ${action} APIs`);
            }
            const data = response.body || response.obj || {};
            const failedIds = Array.isArray(data.failedIds) ? data.failedIds : [];
            const failedIdSet = new Set(failedIds);
            // failedIds echoes back the same identifiers that were sent, so they map directly onto rows.
            const succeededIds = ids.filter((id) => !failedIdSet.has(id));
            const rowFailureReason = isUpdate
                ? intl.formatMessage(bulkResultMessages.updateRowFailed)
                : intl.formatMessage(bulkResultMessages.importRowFailed);

            setImportingStates((prev) => {
                const next = { ...prev };
                succeededIds.forEach((id) => { next[id] = 'success'; });
                failedIds.forEach((id) => { next[id] = 'error'; });
                return next;
            });
            setSelectedApis((prev) => {
                const next = { ...prev };
                succeededIds.forEach((id) => { delete next[id]; });
                return next;
            });
            setImportErrors((prev) => {
                const next = { ...prev };
                succeededIds.forEach((id) => { delete next[id]; });
                failedIds.forEach((id) => { next[id] = rowFailureReason; });
                return next;
            });

            const summaryValues = {
                successCount: succeededIds.length,
                totalCount: ids.length,
                failedCount: failedIds.length,
            };
            if (failedIds.length === 0 && isUpdate) {
                APIMAlert.success(intl.formatMessage(
                    bulkResultMessages.updateAllSuccess, { count: succeededIds.length }
                ));
            } else if (failedIds.length === 0) {
                APIMAlert.success(intl.formatMessage(
                    bulkResultMessages.importAllSuccess, { count: succeededIds.length }
                ));
            } else if (isUpdate) {
                APIMAlert.error(intl.formatMessage(bulkResultMessages.updatePartial, summaryValues));
            } else {
                APIMAlert.error(intl.formatMessage(bulkResultMessages.importPartial, summaryValues));
            }
        })
        .catch((err) => {
            console.error(err);
            // The request itself failed, so no per-API outcome is available: every API in this
            // batch is marked failed, with the specific reason derived from the transport error.
            const friendly = getFriendlyErrorMessage(err.message, intl);
            setImportingStates((prev) => {
                const next = { ...prev };
                ids.forEach((id) => { next[id] = 'error'; });
                return next;
            });
            setImportErrors((prev) => {
                const next = { ...prev };
                ids.forEach((id) => { next[id] = friendly; });
                return next;
            });
            if (isUpdate) {
                APIMAlert.error(intl.formatMessage(
                    bulkResultMessages.updateRequestFailed, { count: ids.length, reason: friendly }
                ));
            } else {
                APIMAlert.error(intl.formatMessage(
                    bulkResultMessages.importRequestFailed, { count: ids.length, reason: friendly }
                ));
            }
        });
};

const DiscoveryResults = (props) => {
    const { history, location } = props;
    const selectedGateways = location.state?.selectedGateways || [];
    const intl = useIntl();

    const { data: settings, isLoading } = usePublisherSettings();
    const [discoveryResults, setDiscoveryResults] = useState({});
    const [discovering, setDiscovering] = useState(false);
    const [error, setError] = useState(null);
    const [searchQueries, setSearchQueries] = useState({});
    const [statusFilters, setStatusFilters] = useState({});
    const [pages, setPages] = useState({});
    const [rowsPerPage, setRowsPerPage] = useState({});
    const [importingStates, setImportingStates] = useState({});

    const [selectedApis, setSelectedApis] = useState({});
    const [importErrors, setImportErrors] = useState({});
    const [lastDiscoveredAt, setLastDiscoveredAt] = useState(null);
    const discoveryTriggered = useRef(false);
    const isMounted = useRef(true);
    // Holds the cancel function for every in-flight poll delay (one per gateway being polled in
    // parallel), so unmounting can clear those setTimeouts immediately instead of letting them
    // fire and leaving the promise chain waiting for them.
    const pollCancels = useRef(new Set());

    const discoveringStatusText = intl.formatMessage({
        id: 'Apis.Discover.DiscoveryResults.status.discovering',
        defaultMessage: 'Discovering...',
    });
    const queuedStatusText = intl.formatMessage({
        id: 'Apis.Discover.DiscoveryResults.status.queued',
        defaultMessage: 'Queued...',
    });
    const externalGatewayLabel = intl.formatMessage({
        id: 'Apis.Discover.DiscoveryResults.gateway.type.external',
        defaultMessage: 'External',
    });

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            pollCancels.current.forEach((cancel) => cancel());
            pollCancels.current.clear();
        };
    }, []);

    // Load cached results from DB on mount
    const loadCachedResults = (gw) => {
        return API.getCachedFederatedAPIs(gw)
            .then((response) => {
                if (!isMounted.current) return false;
                if (response.ok || response.status === 200) {
                    const data = response.body || response.obj;
                    if (data.lastDiscoveredAt) {
                        setLastDiscoveredAt(data.lastDiscoveredAt);
                    }
                    if (data.result && data.result.length > 0) {
                        setDiscoveryResults((prev) => ({
                            ...prev,
                            [gw]: { status: 'success', apis: data.result },
                        }));
                        return true;
                    }
                }
                return false;
            })
            .catch((err) => {
                console.warn('Failed to load cached results:', err);
                return false;
            });
    };

    useEffect(() => {
        if (!location.state?.selectedGateways?.length) {
            history.replace('/apis/discover');
        }
    }, [location.state, history]);

    // Errors are intentionally left to propagate (no .catch() here) - runGatewayDiscovery's own
    // try/catch is what turns a rejection into the per-gateway 'error' state.
    const discoverGateway = (gw) => {
        return API.discoverFederatedAPIs(gw)
            .then((submitResponse) => {
                if (!isMounted.current) return [];
                if (!submitResponse.ok && submitResponse.status !== 202 && submitResponse.status !== 200) {
                    throw new Error(`Failed to start discovery (HTTP ${submitResponse.status})`);
                }
                const submitData = submitResponse.body || submitResponse.obj;
                const { taskId } = submitData;
                if (!taskId) {
                    throw new Error('No task ID returned');
                }
                return pollTaskStatus(taskId, isMounted, pollCancels);
            })
            .then((apiList) => {
                if (!isMounted.current) return [];
                if (apiList.length > 0 && apiList[0].discoveredAt) {
                    setLastDiscoveredAt(apiList[0].discoveredAt);
                } else {
                    setLastDiscoveredAt(new Date().toISOString());
                }
                return apiList;
            });
    };

    // Discovers a single gateway and reflects the pending/success/error outcome in state.
    // Shared by the initial bulk discovery and the per-gateway retry.
    const runGatewayDiscovery = async (gw) => {
        try {
            if (!isMounted.current) return;
            setDiscoveryResults((prev) => ({
                ...prev,
                [gw]: { status: 'pending', statusText: discoveringStatusText, apis: [] },
            }));
            const apiList = await discoverGateway(gw);
            if (!isMounted.current) return;
            setDiscoveryResults((prev) => ({
                ...prev,
                [gw]: { status: 'success', apis: apiList },
            }));
        } catch (err) {
            if (err.message === 'COMPONENT_UNMOUNTED' || !isMounted.current) return;
            setDiscoveryResults((prev) => ({
                ...prev,
                [gw]: { status: 'error', error: err.message, apis: [] },
            }));
        }
    };

    const handleDiscover = async () => {
        setDiscovering(true);
        setError(null);
        setSearchQueries({});
        setStatusFilters({});
        setPages({});
        setRowsPerPage({});
        setImportingStates({});
        setSelectedApis({});
        setImportErrors({});

        const initialResults = {};
        selectedGateways.forEach((gw) => {
            initialResults[gw] = {
                status: 'pending',
                statusText: discoveringStatusText,
                apis: [],
            };
        });
        setDiscoveryResults(initialResults);

        try {
            await Promise.all(
                selectedGateways.map((gw) => runGatewayDiscovery(gw))
            );
        } catch (err) {
            if (err.message !== 'COMPONENT_UNMOUNTED' && isMounted.current) {
                setError(err.message);
            }
        } finally {
            if (isMounted.current) {
                setDiscovering(false);
            }
        }
    };

    useEffect(() => {
        const initDiscovery = async () => {
            if (selectedGateways.length > 0 && !discoveryTriggered.current) {
                discoveryTriggered.current = true;
                // Try loading from cache first
                const gw = selectedGateways[0];
                const hasCached = await loadCachedResults(gw);
                if (!hasCached && isMounted.current) {
                    // No cache - trigger fresh discovery
                    handleDiscover();
                }
            }
        };
        initDiscovery();
    }, [selectedGateways]);

    const handleAction = async (item) => {
        await importSingleApi(item, item.gatewayName, intl, setImportingStates, setSelectedApis, setImportErrors);
    };

    const handleBulkImport = (gwName, gwApis) => {
        const toProcess = gwApis.filter(
            (item) => selectedApis[item.id] && importingStates[item.id] !== 'success'
        );
        if (toProcess.length === 0) return Promise.resolve();

        // The selection can mix NEW and UPDATE rows, and import/update are separate backend
        // endpoints, so it is grouped and sent as at most two bulk requests. The backend accepts
        // many IDs per request, which avoids re-initialising the gateway connector and re-listing
        // the whole remote gateway once per API.
        const toUpdate = toProcess.filter((item) => item.status === 'UPDATE');
        const toImport = toProcess.filter((item) => item.status !== 'UPDATE');

        const batches = [];
        if (toImport.length > 0) {
            batches.push(importApiBatch(
                toImport, gwName, false, intl, setImportingStates, setSelectedApis, setImportErrors
            ));
        }
        if (toUpdate.length > 0) {
            batches.push(importApiBatch(
                toUpdate, gwName, true, intl, setImportingStates, setSelectedApis, setImportErrors
            ));
        }
        return Promise.all(batches);
    };

    // Extracted (rather than inlined) so the FormattedMessage below stays under the max-len limit
    // at this call site's deep JSX nesting.
    const renderBulkImportButton = (gwName, apis) => {
        const selectedCountForGw = apis.filter(
            (item) => selectedApis[item.id] && importingStates[item.id] !== 'success'
        ).length;
        if (selectedCountForGw === 0) {
            return null;
        }
        const isGwBulkImporting = apis.some(
            (item) => selectedApis[item.id] && importingStates[item.id] === 'importing'
        );
        return (
            <Button
                variant='contained'
                color='primary'
                size='small'
                disabled={isGwBulkImporting}
                onClick={() => handleBulkImport(gwName, apis)}
                startIcon={isGwBulkImporting ? (
                    <CircularProgress size={16} color='inherit' />
                ) : (
                    <GetAppIcon />
                )}
            >
                <FormattedMessage
                    id='Apis.Discover.DiscoveryResults.import.selected'
                    defaultMessage='Import Selected ({count})'
                    values={{ count: selectedCountForGw }}
                />
            </Button>
        );
    };

    // Extracted for the same reason as renderBulkImportButton above.
    const renderStatusFilterMenuItems = () => (
        <>
            <MenuItem value='ALL'>
                <FormattedMessage id='Apis.Discover.DiscoveryResults.filter.all.apis' defaultMessage='All APIs' />
            </MenuItem>
            <MenuItem value='NEW'>
                <FormattedMessage id='Apis.Discover.DiscoveryResults.filter.new.apis' defaultMessage='New APIs' />
            </MenuItem>
            <MenuItem value='UPDATE'>
                <FormattedMessage
                    id='Apis.Discover.DiscoveryResults.filter.updated.apis'
                    defaultMessage='Updated APIs'
                />
            </MenuItem>
        </>
    );

    const renderAction = (item) => {
        const apiId = item.id;
        const isUpdate = item.status === 'UPDATE';
        const importState = importingStates[apiId];

        if (importState === 'success') {
            return (
                <Chip
                    label={isUpdate ? (
                        <FormattedMessage
                            id='Apis.Discover.DiscoveryResults.chip.updated'
                            defaultMessage='Updated'
                        />
                    ) : (
                        <FormattedMessage
                            id='Apis.Discover.DiscoveryResults.chip.imported'
                            defaultMessage='Imported'
                        />
                    )}
                    color='success'
                    variant='filled'
                    size='small'
                />
            );
        }
        if (importState === 'importing') {
            return <CircularProgress size={24} />;
        }

        let buttonColor = 'primary';
        let buttonText = (
            <FormattedMessage id='Apis.Discover.DiscoveryResults.action.import' defaultMessage='Import' />
        );

        if (importState === 'error') {
            buttonColor = 'error';
            buttonText = (
                <FormattedMessage id='Apis.Discover.DiscoveryResults.action.retry' defaultMessage='Retry' />
            );
        } else if (isUpdate) {
            buttonColor = 'success';
            buttonText = (
                <FormattedMessage id='Apis.Discover.DiscoveryResults.action.update' defaultMessage='Update' />
            );
        }

        return (
            <Box display='flex' gap={1} justifyContent='flex-end' alignItems='center'>
                {importState === 'error' && importErrors[apiId] && (
                    <Tooltip title={importErrors[apiId]} arrow>
                        <IconButton size='small' color='error' sx={{ p: 0.5 }}>
                            <InfoIcon fontSize='small' />
                        </IconButton>
                    </Tooltip>
                )}
                <Button
                    variant='contained'
                    size='small'
                    color={buttonColor}
                    onClick={() => handleAction(item)}
                >
                    {buttonText}
                </Button>
            </Box>
        );
    };

    const renderGatewayResults = (gwName, res) => {
        if (res.status === 'pending') {
            return (
                <Paper
                    variant='outlined'
                    sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <CircularProgress size={32} />
                    <Typography color='textSecondary'>{res.statusText || discoveringStatusText}</Typography>
                </Paper>
            );
        }

        if (res.status === 'error') {
            const rawError = res.error || 'Unknown error occurred during discovery.';
            const friendlyMessage = getFriendlyErrorMessage(rawError, intl);

            return (
                <Box sx={{ mb: 2 }}>
                    <Alert severity='error' sx={{ mb: 1 }}>
                        <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
                            {friendlyMessage}
                        </Typography>
                    </Alert>
                    <Button
                        variant='outlined'
                        size='small'
                        color='error'
                        startIcon={<RefreshIcon />}
                        onClick={() => runGatewayDiscovery(gwName)}
                    >
                        <FormattedMessage
                            id='Apis.Discover.DiscoveryResults.retry.discovery'
                            defaultMessage='Retry Discovery'
                        />
                    </Button>
                </Box>
            );
        }

        if (res.apis.length === 0) {
            return (
                <Paper variant='outlined' sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                    <Typography color='textSecondary'>
                        <FormattedMessage
                            id='Apis.Discover.DiscoveryResults.no.apis.discovered'
                            defaultMessage='No new or updated APIs discovered from this gateway.'
                        />
                    </Typography>
                </Paper>
            );
        }

        const query = (searchQueries[gwName] || '').toLowerCase();
        const statusFilter = statusFilters[gwName] || 'ALL';
        const filteredApis = res.apis.filter((item) => {
            const matchesQuery =
                item.apiName?.toLowerCase().includes(query) ||
                item.version?.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query) ||
                item.context?.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === 'ALL' ||
                (statusFilter === 'NEW' && item.status === 'NEW') ||
                (statusFilter === 'UPDATE' && item.status === 'UPDATE');

            return matchesQuery && matchesStatus;
        });

        const page = pages[gwName] || 0;
        const rpp = rowsPerPage[gwName] || 5;
        const paginatedApis = filteredApis.slice(page * rpp, page * rpp + rpp);

        const checkableFilteredApis = filteredApis.filter(
            (item) => importingStates[item.id] !== 'success'
        );
        const selectedCheckableFilteredApis = checkableFilteredApis.filter(
            (item) => selectedApis[item.id]
        );
        const isAllSelected = checkableFilteredApis.length > 0
            && selectedCheckableFilteredApis.length === checkableFilteredApis.length;
        const isSomeSelected = selectedCheckableFilteredApis.length > 0
            && selectedCheckableFilteredApis.length < checkableFilteredApis.length;

        const handleSelectAll = (e) => {
            const { checked } = e.target;
            const next = { ...selectedApis };
            checkableFilteredApis.forEach((item) => {
                if (checked) {
                    next[item.id] = true;
                } else {
                    delete next[item.id];
                }
            });
            setSelectedApis(next);
        };

        const handleRowCheck = (e, item) => {
            const { checked } = e.target;
            const next = { ...selectedApis };
            if (checked) {
                next[item.id] = true;
            } else {
                delete next[item.id];
            }
            setSelectedApis(next);
        };

        const renderDescription = (desc) => {
            if (!desc) return '-';
            if (desc.length <= 50) return desc;
            const truncated = desc.substring(0, 47) + '...';
            return (
                <Tooltip title={desc} arrow>
                    <span style={{ cursor: 'pointer' }}>
                        {truncated}
                    </span>
                </Tooltip>
            );
        };

        // Protocol values are technical identifiers (REST, WebSocket), not translatable prose,
        // so they are intentionally left as-is here.
        const renderProtocol = (type) => {
            const typeUpper = (type || 'HTTP').toUpperCase();
            if (typeUpper === 'HTTP') return 'REST';
            if (typeUpper === 'WS') return 'WebSocket';
            if (typeUpper === 'WEBSOCKET') return 'WebSocket';
            return typeUpper;
        };

        const renderRow = (item) => {
            const isNew = item.status === 'NEW';
            return (
                <TableRow key={item.id || `${item.apiName}-${item.version}`}>
                    <TableCell padding='checkbox'>
                        <Checkbox
                            checked={!!selectedApis[item.id]}
                            disabled={
                                importingStates[item.id] === 'success'
                                || importingStates[item.id] === 'importing'
                            }
                            onChange={(e) => handleRowCheck(e, item)}
                        />
                    </TableCell>
                    <TableCell>
                        {item.apiName}
                    </TableCell>
                    <TableCell>{item.version}</TableCell>
                    <TableCell>
                        {renderDescription(item.description)}
                    </TableCell>
                    <TableCell>{item.context || '-'}</TableCell>
                    <TableCell>
                        {renderProtocol(item.apiType)}
                    </TableCell>
                    <TableCell>
                        <Chip
                            label={item.status}
                            color={isNew ? 'success' : 'primary'}
                            size='small'
                            variant='outlined'
                        />
                    </TableCell>
                    <TableCell align='right'>{renderAction(item)}</TableCell>
                </TableRow>
            );
        };

        return (
            <Box>
                {filteredApis.length === 0 ? (
                    <Paper variant='outlined' sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                        <Typography color='textSecondary'>
                            <FormattedMessage
                                id='Apis.Discover.DiscoveryResults.no.matching.apis'
                                defaultMessage='No matching discovered APIs found.'
                            />
                        </Typography>
                    </Paper>
                ) : (
                    <>
                        <TableContainer component={Paper} variant='outlined' sx={{ borderRadius: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding='checkbox'>
                                            <Checkbox
                                                indeterminate={isSomeSelected}
                                                checked={isAllSelected}
                                                disabled={checkableFilteredApis.length === 0}
                                                onChange={handleSelectAll}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormattedMessage
                                                id='Apis.Discover.DiscoveryResults.table.header.api.name'
                                                defaultMessage='API Name'
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormattedMessage
                                                id='Apis.Discover.DiscoveryResults.table.header.version'
                                                defaultMessage='Version'
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormattedMessage
                                                id='Apis.Discover.DiscoveryResults.table.header.description'
                                                defaultMessage='Description'
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormattedMessage
                                                id='Apis.Discover.DiscoveryResults.table.header.context'
                                                defaultMessage='Context'
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormattedMessage
                                                id='Apis.Discover.DiscoveryResults.table.header.protocol'
                                                defaultMessage='Protocol'
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormattedMessage
                                                id='Apis.Discover.DiscoveryResults.table.header.status'
                                                defaultMessage='Status'
                                            />
                                        </TableCell>
                                        <TableCell align='right'>
                                            <FormattedMessage
                                                id='Apis.Discover.DiscoveryResults.table.header.actions'
                                                defaultMessage='Actions'
                                            />
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedApis.map(renderRow)}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component='div'
                            count={filteredApis.length}
                            rowsPerPage={rpp}
                            page={page}
                            onPageChange={(event, newPage) => {
                                setPages(prev => ({ ...prev, [gwName]: newPage }));
                            }}
                            onRowsPerPageChange={(event) => {
                                setRowsPerPage(prev => ({
                                    ...prev,
                                    [gwName]: Number.parseInt(event.target.value, 10),
                                }));
                                setPages(prev => ({ ...prev, [gwName]: 0 }));
                            }}
                        />
                    </>
                )}
            </Box>
        );
    };

    if (isLoading || !selectedGateways || selectedGateways.length === 0) {
        return null;
    }

    const gateways = (settings?.environment || []).filter(
        (env) => !env.provider.toLowerCase().includes('wso2')
    );

    const totalApisCount = Object.values(discoveryResults).reduce(
        (sum, res) => sum + (res.apis || []).length,
        0
    );

    const hasErrors = Object.values(discoveryResults).some((r) => r.status === 'error');
    const isAnyPending = Object.values(discoveryResults).some((r) => r.status === 'pending');

    const handleBackToSelection = () => {
        history.push({
            pathname: '/apis/discover',
            state: { selectedGateways },
        });
    };

    return (
        <Root>
            <Box mb={2}>
                <Button
                    variant='text'
                    onClick={handleBackToSelection}
                    startIcon={<ArrowBackIcon />}
                    id='itest-apis-back-to-gateways'
                >
                    <FormattedMessage
                        id='Apis.Listing.SampleAPI.SampleAPI.back.to.gateways'
                        defaultMessage='Back to Gateway Selection'
                    />
                </Button>
            </Box>
            <div className='header'>
                <Typography variant='h4'>
                    <FormattedMessage
                        id='Apis.Discover.DiscoveryResults.title'
                        defaultMessage='Discover APIs'
                    />
                </Typography>
                <Typography variant='subtitle1' color='textSecondary'>
                    <FormattedMessage
                        id='Apis.Discover.DiscoveryResults.subtitle'
                        defaultMessage='Discover and import APIs from federated gateways into WSO2 API Manager.'
                    />
                </Typography>
            </div>

            {error && (
                <Alert severity='error' sx={{ mb: 3 }}>
                    {getFriendlyErrorMessage(error, intl)}
                </Alert>
            )}

            <Box>
                {discovering ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 4 }}>
                        <Typography variant='h6' gutterBottom>
                            <FormattedMessage
                                id='Apis.Discover.DiscoveryResults.discovering.apis'
                                defaultMessage='Discovering APIs'
                            />
                        </Typography>
                        {selectedGateways.map((gw) => {
                            const result = discoveryResults[gw] || {
                                status: 'pending',
                                statusText: queuedStatusText,
                            };

                            let displayStatusText = '';
                            if (result.status === 'pending') {
                                displayStatusText = result.statusText;
                            } else if (result.status === 'success') {
                                displayStatusText = intl.formatMessage({
                                    id: 'Apis.Discover.DiscoveryResults.apis.discovered.count',
                                    defaultMessage: '{count} APIs discovered',
                                }, { count: result.apis.length });
                            } else {
                                displayStatusText = getFriendlyErrorMessage(result.error, intl);
                            }

                            const gwObj = gateways.find((g) => g.name === gw);
                            const gwType = gwObj ? (gwObj.gatewayType || externalGatewayLabel).toUpperCase() : '';

                            return (
                                <Paper
                                    variant='outlined'
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderRadius: 2,
                                    }}
                                    key={gw}
                                >
                                    <Box display='flex' alignItems='center' gap={2}>
                                        {result.status === 'pending' && <CircularProgress size={20} />}
                                        {result.status === 'success' && (
                                            <Chip
                                                label={(
                                                    <FormattedMessage
                                                        id='Apis.Discover.DiscoveryResults.chip.done'
                                                        defaultMessage='Done'
                                                    />
                                                )}
                                                color='success'
                                                size='small'
                                            />
                                        )}
                                        {result.status === 'error' && (
                                            <Chip
                                                label={(
                                                    <FormattedMessage
                                                        id='Apis.Discover.DiscoveryResults.chip.failed'
                                                        defaultMessage='Failed'
                                                    />
                                                )}
                                                color='error'
                                                size='small'
                                            />
                                        )}
                                        <Typography sx={{ fontWeight: 'bold' }}>
                                            {gw}{gwType ? ` (${gwType})` : ''}
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant='body2'
                                        color='textSecondary'
                                        sx={{
                                            ml: 2,
                                            textAlign: 'right',
                                            wordBreak: 'break-word',
                                            maxWidth: '70%',
                                        }}
                                    >
                                        {displayStatusText}
                                    </Typography>
                                </Paper>
                            );
                        })}
                    </Box>
                ) : (
                    <>
                        <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
                            <Box display='flex' alignItems='center' gap={2}>
                                {lastDiscoveredAt && (
                                    <Typography
                                        variant='subtitle1'
                                        sx={{
                                            fontWeight: 'bold',
                                            color: '#1a3c73',
                                            fontSize: '1rem',
                                            backgroundColor: '#E8F0FE',
                                            py: 0.75,
                                            px: 1.5,
                                            borderRadius: '6px',
                                        }}
                                    >
                                        <FormattedMessage
                                            id='Apis.Discover.DiscoveryResults.last.discovered'
                                            defaultMessage='Last Discovered: {date}'
                                            values={{ date: new Date(lastDiscoveredAt).toLocaleString() }}
                                        />
                                    </Typography>
                                )}
                            </Box>
                            <Button
                                variant='outlined'
                                size='small'
                                startIcon={<RefreshIcon />}
                                disabled={discovering}
                                onClick={handleDiscover}
                            >
                                <FormattedMessage
                                    id='Apis.Discover.DiscoveryResults.refresh'
                                    defaultMessage='Refresh'
                                />
                            </Button>
                        </Box>

                        {totalApisCount === 0 && !hasErrors && !isAnyPending ? (
                            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }} variant='outlined'>
                                <Typography>
                                    {lastDiscoveredAt ? (
                                        <FormattedMessage
                                            id='Apis.Discover.DiscoveryResults.no.apis.discovered'
                                            defaultMessage='No new or updated APIs discovered from this gateway.'
                                        />
                                    ) : (
                                        <FormattedMessage
                                            id='Apis.Discover.DiscoveryResults.no.previous.discovery'
                                            defaultMessage='No previous discovery data. Click Refresh to discover APIs.'
                                        />
                                    )}
                                </Typography>
                                {!lastDiscoveredAt && (
                                    <Button
                                        variant='contained'
                                        color='primary'
                                        sx={{ mt: 2 }}
                                        startIcon={<RefreshIcon />}
                                        onClick={handleDiscover}
                                        disabled={discovering}
                                    >
                                        <FormattedMessage
                                            id='Apis.Discover.DiscoveryResults.discover.now'
                                            defaultMessage='Discover Now'
                                        />
                                    </Button>
                                )}
                            </Paper>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {Object.entries(discoveryResults).map(([gwName, res]) => {
                                    const isDone = res.status === 'success';
                                    const gwObj = gateways.find((g) => g.name === gwName);
                                    const gwType = gwObj
                                        ? (gwObj.gatewayType || externalGatewayLabel).toUpperCase()
                                        : '';
                                    return (
                                        <Box key={gwName}>
                                            <Box
                                                display='flex'
                                                justifyContent='space-between'
                                                alignItems='center'
                                                mb={2}
                                            >
                                                <Box display='flex' alignItems='center' gap={1}>
                                                    <Typography variant='subtitle1' sx={{ fontWeight: 'bold' }}>
                                                        <FormattedMessage
                                                            id='Apis.Discover.DiscoveryResults.gateway.label'
                                                            defaultMessage='Gateway: {gwName}'
                                                            values={{ gwName }}
                                                        />
                                                        {gwType ? ` (${gwType})` : ''}
                                                    </Typography>
                                                    {isDone ? (
                                                        <Chip
                                                            label={(
                                                                <FormattedMessage
                                                                    id='Apis.Discover.DiscoveryResults.chip.apis.count'
                                                                    defaultMessage='{count} APIs'
                                                                    values={{ count: res.apis.length }}
                                                                />
                                                            )}
                                                            color='primary'
                                                            size='small'
                                                            variant='outlined'
                                                        />
                                                    ) : (
                                                        <Chip
                                                            label={(
                                                                <FormattedMessage
                                                                    id='Apis.Discover.DiscoveryResults.chip.error'
                                                                    defaultMessage='Error'
                                                                />
                                                            )}
                                                            color='error'
                                                            size='small'
                                                            variant='outlined'
                                                        />
                                                    )}
                                                </Box>
                                                {isDone && res.apis && res.apis.length > 0 && (
                                                    <Box display='flex' alignItems='center' gap={2}>
                                                        {renderBulkImportButton(gwName, res.apis)}
                                                        <FormControl size='small' sx={{ minWidth: 140 }}>
                                                            <Select
                                                                value={statusFilters[gwName] || 'ALL'}
                                                                onChange={(e) => {
                                                                    setStatusFilters((prev) => ({
                                                                        ...prev,
                                                                        [gwName]: e.target.value,
                                                                    }));
                                                                    setPages((prev) => ({ ...prev, [gwName]: 0 }));
                                                                }}
                                                            >
                                                                {renderStatusFilterMenuItems()}
                                                            </Select>
                                                        </FormControl>
                                                        <TextField
                                                            size='small'
                                                            placeholder={intl.formatMessage({
                                                                id: 'Apis.Discover.DiscoveryResults.search.placeholder',
                                                                defaultMessage: 'Search APIs...',
                                                            })}
                                                            value={searchQueries[gwName] || ''}
                                                            onChange={(e) => {
                                                                setSearchQueries((prev) => ({
                                                                    ...prev,
                                                                    [gwName]: e.target.value,
                                                                }));
                                                                setPages((prev) => ({ ...prev, [gwName]: 0 }));
                                                            }}
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position='start'>
                                                                        <SearchIcon />
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                            sx={{ width: 250 }}
                                                        />
                                                    </Box>
                                                )}
                                            </Box>
                                            {renderGatewayResults(gwName, res)}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </>
                )}
            </Box>

        </Root>
    );
};

DiscoveryResults.propTypes = {
    history: PropTypes.shape({
        push: PropTypes.func,
        replace: PropTypes.func,
    }).isRequired,
    location: PropTypes.shape({
        state: PropTypes.shape({
            selectedGateways: PropTypes.arrayOf(PropTypes.string),
        }),
    }).isRequired,
};

export default DiscoveryResults;
