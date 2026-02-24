import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import {
    Paper,
    Typography,
    Box,
    Chip,
    Divider,
    List,
    ListItemButton,
    ListItemText,
    CircularProgress,
    Alert,
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';

const PREFIX = 'GenerateDocumentForSOAP';

const classes = {
    container: `${PREFIX}-container`,
    sidebar: `${PREFIX}-sidebar`,
    apiHeader: `${PREFIX}-apiHeader`,
    sectionTitle: `${PREFIX}-sectionTitle`,
    operationList: `${PREFIX}-operationList`,
    operationItem: `${PREFIX}-operationItem`,
    operationItemActive: `${PREFIX}-operationItemActive`,
    mainContent: `${PREFIX}-mainContent`,
    detailBox: `${PREFIX}-detailBox`,
    operationHeader: `${PREFIX}-operationHeader`,
    metadataRow: `${PREFIX}-metadataRow`,
    metadataLabel: `${PREFIX}-metadataLabel`,
    metadataValue: `${PREFIX}-metadataValue`,
    bindingChip: `${PREFIX}-bindingChip`,
};

const Root = styled('div')(({ theme }) => ({
    [`&.${classes.container}`]: {
        display: 'flex',
        height: '100%',
        gap: theme.spacing(3),
        padding: theme.spacing(3),
        boxSizing: 'border-box',
    },

    [`& .${classes.sidebar}`]: {
        width: 300,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: theme.shape.borderRadius * 2,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
    },
    [`& .${classes.apiHeader}`]: {
        padding: theme.spacing(2.5, 2),
        background:
            theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1e3a4a 0%, #162d3d 100%)'
                : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    [`& .${classes.sectionTitle}`]: {
        padding: theme.spacing(2, 2, 1),
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: theme.palette.text.secondary,
    },
    [`& .${classes.operationList}`]: {
        padding: theme.spacing(0, 1, 1),
        overflowY: 'auto',
        flex: 1,
    },
    [`& .${classes.operationItem}`]: {
        borderRadius: theme.shape.borderRadius * 1.5,
        marginBottom: theme.spacing(0.5),
        cursor: 'pointer',
        padding: theme.spacing(1, 1.5),
        border: '1px solid transparent',
        transition: 'background 0.15s, border-color 0.15s',
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
            borderColor: theme.palette.divider,
        },
    },
    [`& .${classes.operationItemActive}`]: {
        backgroundColor:
            theme.palette.mode === 'dark'
                ? 'rgba(14,165,233,0.15)'
                : 'rgba(14,165,233,0.08)',
        borderColor:
            theme.palette.mode === 'dark' ? '#0ea5e9' : '#38bdf8',
    },

    [`& .${classes.mainContent}`]: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
    },
    [`& .${classes.detailBox}`]: {
        borderRadius: theme.shape.borderRadius * 2,
        border: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(3),
        flex: 1,
    },
    [`& .${classes.operationHeader}`]: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1.5),
        marginBottom: theme.spacing(2.5),
    },
    [`& .${classes.metadataRow}`]: {
        display: 'flex',
        alignItems: 'flex-start',
        padding: theme.spacing(1.5, 0),
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&:last-child': { borderBottom: 'none' },
    },
    [`& .${classes.metadataLabel}`]: {
        minWidth: 160,
        fontSize: 13,
        color: theme.palette.text.secondary,
        fontWeight: 500,
        flexShrink: 0,
    },
    [`& .${classes.metadataValue}`]: {
        fontSize: 13,
        fontFamily: "'Roboto Mono', 'Courier New', monospace",
        color: theme.palette.text.primary,
        wordBreak: 'break-all',
    },
    [`& .${classes.bindingChip}`]: {
        height: 22,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.03em',
    },
}));

const SOAP_NS = 'http://schemas.xmlsoap.org/wsdl/soap/';
const SOAP12_NS = 'http://schemas.xmlsoap.org/wsdl/soap12/';
const WSDL_NS = 'http://schemas.xmlsoap.org/wsdl/';

/**
 * Detects SOAP binding type from a WSDL <binding> element.
 * Returns 'SOAP11' | 'SOAP12' | null — null means skip this binding.
 */
function detectBindingType(bindingEl) {
    if (bindingEl.getElementsByTagNameNS(SOAP_NS, 'binding').length > 0) return 'SOAP11';
    if (bindingEl.getElementsByTagNameNS(SOAP12_NS, 'binding').length > 0) return 'SOAP12';

    return null;
}

/**
 * Parses a WSDL XML string and returns an array of SOAP 1.1 / 1.2 operations.
 */
function parseWSDLToOperations(xmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');

    const parseError = doc.querySelector('parsererror');
    if (parseError) throw new Error('Invalid WSDL XML');

    // Resolve the WSDL namespace URI dynamically
    // lookupNamespaceURI('wsdl') walks up from the document element to find the xmlns:wsdl declaration
    const wsdlNs = doc.documentElement.lookupNamespaceURI('wsdl') ?? WSDL_NS;

    const operations = [];

    [...doc.getElementsByTagNameNS(wsdlNs, 'binding')].forEach((bindingEl) => {
        const bindingType = detectBindingType(bindingEl);
        if (!bindingType) return;

        const bindingName = bindingEl.getAttribute('name') ?? '';

        [...bindingEl.children]
            .filter((c) => c.localName === 'operation')
            .forEach((opEl) => {
                const name = opEl.getAttribute('name') ?? '';

                const soapOpEl = opEl.getElementsByTagNameNS(SOAP_NS, 'operation')[0]
                    || opEl.getElementsByTagNameNS(SOAP12_NS, 'operation')[0];
                const soapAction = soapOpEl?.getAttribute('soapAction') ?? null;

                operations.push({
                    name,
                    binding: bindingName,
                    bindingType,
                    soapAction,
                    httpMethod: 'POST',
                });
            });
    });

    return operations;
}

const getBindingColor = (bindingType) => {
    switch (bindingType) {
        case 'SOAP11': return 'primary';
        case 'SOAP12': return 'secondary';
        default: return 'default';
    }
};

const getBindingLabel = (bindingType) => {
    switch (bindingType) {
        case 'SOAP11': return 'SOAP 1.1';
        case 'SOAP12': return 'SOAP 1.2';
        default: return 'Unknown';
    }
};

const GenerateDocumentForSOAP = ({ apiName, apiVersion, wsdlData }) => {
    const [operations, setOperations] = useState([]);
    const [selectedOperation, setSelectedOperation] = useState(null);
    const [error, setError] = useState(null);
    const intl = useIntl();

    useEffect(() => {
        if (!wsdlData) {
            setOperations([]);
            setSelectedOperation(null);
            return;
        }

        try {
            const ops = parseWSDLToOperations(wsdlData);
            setOperations(ops);
            setSelectedOperation(ops[0] ?? null);
            setError(null);
        } catch (err) {
            console.error('Error parsing WSDL', err);
            setError(intl.formatMessage({
                id: 'Apis.Details.WSDL.view.error',
                defaultMessage: 'Something went wrong while retrieving the WSDL.',
            }));
            setOperations([]);
            setSelectedOperation(null);
        }
    }, [wsdlData]);

    const loading = !wsdlData && !error;

    return (
        <Root className={classes.container}>

            {/* ── Sidebar ── */}
            <Paper className={classes.sidebar} elevation={0}>

                {/* API name / version header */}
                <Box className={classes.apiHeader}>
                    <Typography variant='h6' fontWeight={700} noWrap>
                        {apiName}
                    </Typography>
                    {apiVersion && (
                        <Typography variant='caption' color='text.secondary'>
                            {apiVersion}
                        </Typography>
                    )}
                </Box>

                {/* Section label */}
                <Typography className={classes.sectionTitle}>
                    <FormattedMessage
                        id='Apis.Details.Documents.wsdl.no.operations.error'
                        defaultMessage='No SOAP operations found.'
                    />
                </Typography>

                {loading && (
                    <Box display='flex' justifyContent='center' py={4}>
                        <CircularProgress size={28} />
                    </Box>
                )}

                {error && (
                    <Box px={1}>
                        <Alert severity='error' sx={{ fontSize: 12 }}>{error}</Alert>
                    </Box>
                )}

                {/* Operation list */}
                {!loading && !error && (
                    <List className={classes.operationList} disablePadding>
                        {operations.length === 0 && (
                            <Typography variant='body2' color='text.secondary' px={1} py={2}>
                                <FormattedMessage
                                    id='Apis.Details.Documents.wsdl.operations'
                                    defaultMessage='Operations'
                                />
                            </Typography>
                        )}
                        {operations.map((op) => {
                            const isActive = selectedOperation === op;
                            return (
                                <ListItemButton
                                    key={`${op.binding}::${op.name}`}
                                    className={`${classes.operationItem} ${isActive ? classes.operationItemActive : ''}`}
                                    onClick={() => setSelectedOperation(op)}
                                >
                                    <ListItemText
                                        primary={(
                                            <Box display='flex' alignItems='center' justifyContent='space-between' gap={1}>
                                                <Typography
                                                    variant='body2'
                                                    fontWeight={isActive ? 700 : 500}
                                                    noWrap
                                                    title={op.name}
                                                >
                                                    {op.name}
                                                </Typography>
                                                <Chip
                                                    label={getBindingLabel(op.bindingType)}
                                                    size='small'
                                                    color={getBindingColor(op.bindingType)}
                                                    className={classes.bindingChip}
                                                />
                                            </Box>
                                        )}
                                    />
                                </ListItemButton>
                            );
                        })}
                    </List>
                )}
            </Paper>

            {/* ── Main content ── */}
            <Box className={classes.mainContent}>

                {loading && (
                    <Paper className={classes.detailBox} elevation={0}>
                        <Box display='flex' justifyContent='center' py={6}>
                            <CircularProgress size={32} />
                        </Box>
                    </Paper>
                )}

                {/* Selected operation detail */}
                {!loading && selectedOperation && (
                    <Paper className={classes.detailBox} elevation={0}>

                        <Box className={classes.operationHeader}>
                            <Typography variant='h5' fontWeight={700}>
                                {selectedOperation.name}
                            </Typography>
                            <Chip
                                label={getBindingLabel(selectedOperation.bindingType)}
                                size='small'
                                color={getBindingColor(selectedOperation.bindingType)}
                                className={classes.bindingChip}
                            />
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        <Box className={classes.metadataRow}>
                            <Typography className={classes.metadataLabel}>
                                <FormattedMessage
                                    id='Apis.Details.Documents.wsdl.http.method'
                                    defaultMessage='HTTP Method:'
                                />
                            </Typography>
                            <Typography className={classes.metadataValue}>POST</Typography>
                        </Box>

                        {selectedOperation.soapAction !== null && (
                            <Box className={classes.metadataRow}>
                                <Typography className={classes.metadataLabel}>
                                    <FormattedMessage
                                        id='Apis.Details.Documents.wsdl.soap.action'
                                        defaultMessage='SOAP Action:'
                                    />
                                </Typography>
                                <Typography className={classes.metadataValue}>
                                    {selectedOperation.soapAction || '""'}
                                </Typography>
                            </Box>
                        )}

                        <Box className={classes.metadataRow}>
                            <Typography className={classes.metadataLabel}>
                                <FormattedMessage
                                    id='Apis.Details.Documents.wsdl.binding'
                                    defaultMessage='Binding:'
                                />
                            </Typography>
                            <Typography className={classes.metadataValue}>
                                {selectedOperation.binding}
                            </Typography>
                        </Box>
                    </Paper>
                )}

                {/* Error fallback */}
                {!loading && !selectedOperation && (
                    <Paper className={classes.detailBox} elevation={0}>
                        <Typography color='text.secondary'>
                            {error
                                ? (
                                    <FormattedMessage
                                        id='Apis.Details.Documents.wsdl.load.error'
                                        defaultMessage='Unable to load SOAP operations.'
                                    />
                                ) : (
                                    <FormattedMessage
                                        id='Apis.Details.Documents.wsdl.select.operation'
                                        defaultMessage='Select an operation to view details.'
                                    />
                                )}
                        </Typography>
                    </Paper>
                )}
            </Box>
        </Root>
    );
};

GenerateDocumentForSOAP.propTypes = {
    apiName: PropTypes.string,
    apiVersion: PropTypes.string,
    wsdlData: PropTypes.string,
};

GenerateDocumentForSOAP.defaultProps = {
    apiName: null,
    apiVersion: null,
    wsdlData: null,
};

export default GenerateDocumentForSOAP;
