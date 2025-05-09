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
import React, { useContext, useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { Link as MUILink } from '@mui/material';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import VerticalDivider from 'AppComponents/Shared/VerticalDivider';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CardContent from '@mui/material/CardContent';
import LaunchIcon from '@mui/icons-material/Launch';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';
import { ApiContext } from 'AppComponents/Apis/Details/ApiContext';
import ApiThumb from 'AppComponents/Apis/Listing/ApiThumb';
import StarRatingBar from 'AppComponents/Apis/Listing/StarRatingBar';
import StarRatingSummary from 'AppComponents/Apis/Details/StarRatingSummary';
import Social from 'AppComponents/Apis/Details/Social/Social';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import AuthManager from 'AppData/AuthManager';
import Alert from 'AppComponents/Shared/Alert';
import InlineMessage from 'AppComponents/Shared/InlineMessage';
import Progress from 'AppComponents/Shared/Progress';
import API from 'AppData/api';
import CONSTANTS from 'AppData/Constants';
import View from 'AppComponents/Apis/Details/Documents/View';
import Settings from 'Settings';
import SolaceEndpoints from './SolaceEndpoints';
import Environments from './Environments';
import Comments from './Comments/Comments';
import OverviewDocuments from './OverviewDocuments';
import SourceDownload from './SourceDownload';

const PREFIX = 'Overview';

const classes = {
    root: `${PREFIX}-root`,
    linkTitle: `${PREFIX}-linkTitle`,
    description: `${PREFIX}-description`,
    textLabel: `${PREFIX}-textLabel`,
    textValue: `${PREFIX}-textValue`,
    apiThumb: `${PREFIX}-apiThumb`,
    chipRoot: `${PREFIX}-chipRoot`,
    subtitle: `${PREFIX}-subtitle`,
    cardRoot: `${PREFIX}-cardRoot`,
    sectionTitle: `${PREFIX}-sectionTitle`,
    moreLink: `${PREFIX}-moreLink`,
    table: `${PREFIX}-table`,
    requestCount: `${PREFIX}-requestCount`,
    requestUnit: `${PREFIX}-requestUnit`,
    launchIcon: `${PREFIX}-launchIcon`,
    originalDevportalUrl: `${PREFIX}-originalDevportalUrl`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`& .${classes.root}`]: {
        width: '100%',
        height: '100vh',
        paddingLeft: theme.spacing(2),
        paddingTop: theme.spacing(2),
    },

    [`& .${classes.linkTitle}`]: {
        color: theme.palette.grey[800],
    },

    [`& .${classes.description}`]: {
        color: theme.palette.grey[700],
    },

    [`& .${classes.textLabel}`]: {
        fontWeight: 400,
        color: theme.palette.grey[800],
    },

    [`& .${classes.textValue}`]: {
        textIndent: theme.spacing(1),
    },

    [`& .${classes.apiThumb}`]: {
        padding: theme.spacing(),
        border: 'solid 1px',
        borderColor: theme.palette.grey[800],
        width: 100,
    },

    [`& .${classes.chipRoot}`]: {
        cursor: 'pointer',
        marginRight: theme.spacing(),
    },

    [`& .${classes.subtitle}`]: {
        color: theme.palette.grey[800],
    },

    [`& .${classes.cardRoot}`]: {
        width: 150,
        height: 150,
        marginRight: theme.spacing(),
        marginTop: theme.spacing(2),
    },

    [`& .${classes.sectionTitle}`]: {
        color: theme.palette.grey[800],
        fontSize: '0.95rem',
        fontWeight: 400,
    },

    [`& .${classes.moreLink}`]: {
        fontSize: '14px',
    },

    [`& .${classes.table}`]: {
        '& th': {
            fontWeight: 400,
        },
    },

    [`& .${classes.requestCount}`]: {
        fontSize: 22,
    },

    [`& .${classes.requestUnit}`]: {
        fontSize: 13,
    },

    [`& .${classes.launchIcon}`]: {
        paddingLeft: theme.spacing(1),
    },

    [`& .${classes.originalDevportalUrl}`]: {
        marginTop: theme.spacing(4),
    },
}));

/**
 * @returns {JSX} overview section
 */
function Overview() {
    const theme = useTheme();

    const {
        custom: {
            apiDetailPages: {
                showCredentials,
                showComments,
                showDocuments,
            },
            infoBar: { showThumbnail },
            social: { showRating },
            showSwaggerDescriptionOnOverview,
        },
    } = theme;
    const intl = useIntl();
    const {
        api,
        api: { advertiseInfo },
        subscribedApplications,
    } = useContext(ApiContext);
    const [descriptionHidden, setDescriptionHidden] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [allDocuments, setAllDocuments] = useState(null);
    const [overviewDocOverride, setOverviewDocOverride] = useState(null);
    const [swaggerDescription, setSwaggerDescription] = useState(null);
    const [allPolicies, setAllPolicies] = useState(null);
    const [rating, setRating] = useState({
        avgRating: 0,
        total: 0,
        count: 0,
    });
    const [selectedEndpoint, setSelectedEndpoint] = useState((api.endpointURLs && api.endpointURLs.length > 0)
        ? api.endpointURLs[0]
        : null);

    // Truncating the description
    let descriptionIsBig = false;
    let smallDescription = '';
    if (api.description) {
        const limit = 40;
        if (api.description.split(' ').length > limit) {
            const newContent = api.description.split(' ').slice(0, limit);
            smallDescription = newContent.join(' ') + '...';
            descriptionIsBig = true;
        }
    }

    const subscriptionTimeUnits = {
        min: intl.formatMessage({
            id: 'Apis.Details.Overview.business.plans.time.unit.min',
            defaultMessage: 'min',
        }),
        hours: intl.formatMessage({
            id: 'Apis.Details.Overview.business.plans.time.unit.hours',
            defaultMessage: 'hours',
        }),
        days: intl.formatMessage({
            id: 'Apis.Details.Overview.business.plans.time.unit.days',
            defaultMessage: 'days',
        }),
        months: intl.formatMessage({
            id: 'Apis.Details.Overview.business.plans.time.unit.months',
            defaultMessage: 'months',
        }),
        years: intl.formatMessage({
            id: 'Apis.Details.Overview.business.plans.time.unit.years',
            defaultMessage: 'years',
        }),
    };

    const isApiPolicy = (policyName) => {
        const filteredApiPolicies = api.tiers.filter((t) => t.tierName === policyName);
        return filteredApiPolicies && filteredApiPolicies.length > 0;
    };

    const isSubValidationDisabled = api.tiers && api.tiers.length === 1
            && api.tiers[0].tierName.includes(CONSTANTS.DEFAULT_SUBSCRIPTIONLESS_PLAN);

    const updateSelectedEndpoint = (e) => {
        const selectedEnvName = e.target.value;
        const filteredEndpoints = api.endpointURLs.filter((ep) => ep.environmentName === selectedEnvName);
        if (filteredEndpoints && filteredEndpoints.length > 0) {
            setSelectedEndpoint(filteredEndpoints[0]);
        } else {
            Alert.error(intl.formatMessage({
                id: 'Apis.Details.Overview.select.env.error',
                defaultMessage: 'Error Selecting Environment',
            }));
        }
    };

    const getSubscriptionPolicies = () => {
        const restApi = new API();
        return restApi.getAllTiers('subscription', Settings.app.throttlingPolicyLimit)
            .then((response) => {
                try {
                    // Filter policies base on async or not.
                    const filteredList = response.body.list.filter((str) => isApiPolicy(str.name));
                    setAllPolicies(filteredList);
                } catch (e) {
                    console.log(e);
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Details.Overview.error.occurred',
                        defaultMessage: 'Error occurred',
                    }));
                }
            }).catch((error) => {
                console.log(error);
                const { status } = error;
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Overview.error.occurred.subs',
                    defaultMessage: 'Error occurred when fetching subscription policies',
                }));
                if (status === 404) {
                    setNotFound(true);
                }
                setAllDocuments([]);
                setIsLoading(false);
            });
    };

    const getDocuments = () => {
        const restApi = new API();
        return restApi.getDocumentsByAPIId(api.id)
            .then((response) => {
                const overviewDoc = response.body.list.filter((item) => item.otherTypeName === '_overview');
                if (overviewDoc.length > 0) {
                    // We can override the UI with this content
                    setOverviewDocOverride(overviewDoc[0]); // Only one doc we can render
                }
                setAllDocuments(response.body.list);
            })
            .catch((error) => {
                console.log(error);
                const { status } = error;
                Alert.error(intl.formatMessage({
                    id: 'Apis.Details.Overview.error.occurred.docs',
                    defaultMessage: 'Error occurred when fetching documents',
                }));
                if (status === 404) {
                    setNotFound(true);
                }
                setAllDocuments([]);
                setIsLoading(false);
            });
    };
    useEffect(() => {
        setIsLoading(true);
        const { endpointURLs } = api;
        if (endpointURLs && endpointURLs.length > 0) {
            setSelectedEndpoint(endpointURLs[0]);
        }
        Promise.all([getDocuments(), getSubscriptionPolicies()])
            .then(() => {
                setIsLoading(false);
            });
    }, [api]);
    useEffect(() => {
        const restApi = new API();
        if (showSwaggerDescriptionOnOverview) {
            restApi.getSwaggerByAPIIdAndEnvironment(api.id, selectedEndpoint.environmentName)
                .then((swaggerResponse) => {
                    const swagger = swaggerResponse.obj;
                    if (swagger && swagger.info) {
                        setSwaggerDescription(swagger.info.description);
                    } else {
                        setSwaggerDescription('');
                    }
                })
                .catch((error) => {
                    console.log(error);
                    setSwaggerDescription('');
                });
        } else {
            setIsLoading(true);
            Promise.all([getDocuments(), getSubscriptionPolicies()])
                .then(() => {
                    setIsLoading(false);
                });
        }
    }, []);

    /**
     * @param {event} e click event
     */
    const collapseAllDescription = (e) => {
        e.preventDefault();
        setDescriptionHidden(!descriptionHidden);
    };

    /**
     * @returns {string} provider
     */
    const getProvider = () => {
        let { provider } = api;
        if (
            api.businessInformation
            && api.businessInformation.businessOwner
            && api.businessInformation.businessOwner.trim() !== ''
        ) {
            provider = api.businessInformation.businessOwner;
        }
        return provider;
    };

    /**
     * @param {number} ratings rating value
     */
    const setRatingUpdate = (ratingLocal) => {
        if (ratingLocal) {
            const { avgRating, total, count } = ratingLocal;
            setRating({ avgRating, total, count });
        }
    };

    /**
     * @param {JSON} api api object
     * @returns {JSON} key managers
     */
    const getKeyManagers = () => {
        if (api.keyManagers) {
            if (api.keyManagers[0] === 'all') {
                return null;
            } else {
                return (
                    api.keyManagers.map((km) => (<Typography variant='body2'>{km}</Typography>))
                );
            }
        } else {
            return null;
        }
    };

    const user = AuthManager.getUser();
    if (isLoading) {
        return (<Progress />);
    }
    if (showSwaggerDescriptionOnOverview) {
        if (!swaggerDescription) {
            return (<Progress />);
        } else {
            return (
                <Box p={3}>
                    <ReactMarkdown plugins={[gfm]} escapeHtml>
                        {swaggerDescription}
                    </ReactMarkdown>
                </Box>
            );
        }
    }
    if (!allDocuments) {
        return (<Progress />);
    }
    if (notFound) {
        return (
            <ResourceNotFound message={intl.formattedMessage({
                id: 'Apis.Details.Overview.not.found.message',
                defaultMessage: 'Resource Not Found',
            })}
            />
        );
    }
    if (overviewDocOverride) {
        return (
            <Root>
                <Paper className={classes.paperWithDoc} elevation={0}>
                    <View doc={overviewDocOverride} apiId={api.id} fullScreen dontShowName />
                </Paper>
            </Root>
        );
    }
    return (
        <Root>
            <Paper className={classes.root} elevation={0}>
                <Grid container>
                    <Grid item sm={8} xl={9}>
                        <Box display='flex' flexDirection='column'>
                            <Box display='flex' flexDirection='row'>
                                {showThumbnail && (
                                    <Box id='overview-thumbnail' width={86} display='flex' alignItems='center'>
                                        <Box className={classes.apiThumb}>
                                            <ApiThumb
                                                api={api}
                                                customWidth={70}
                                                customHeight={50}
                                                showInfo={false}
                                            />
                                        </Box>
                                    </Box>
                                )}
                                <Box ml={3} mr={2}>
                                    <Typography variant='h4' component='h2'>{api.name}</Typography>
                                    {api.description && (
                                        <Typography variant='body2' gutterBottom align='left' className={classes.description}>
                                            {(descriptionIsBig && descriptionHidden) ? smallDescription : api.description}
                                            {descriptionIsBig && (
                                                <a aria-label='Show more/less description' onClick={collapseAllDescription} href='#'>
                                                    {descriptionHidden
                                                        ? intl.formatMessage({
                                                            defaultMessage: ' more',
                                                            id: 'Apis.Details.Overview.description.more',
                                                        })
                                                        : intl.formatMessage({
                                                            defaultMessage: ' less',
                                                            id: 'Apis.Details.Overview.description.less',
                                                        })}
                                                </a>
                                            )}
                                        </Typography>
                                    )}
                                    <Box display='flex' area-lable='API version and owner details' flexDirection='row'>
                                        <Typography variant='body2' gutterBottom align='left' className={classes.textLabel}>
                                            <FormattedMessage
                                                id='Apis.Details.Overview.list.version'
                                                defaultMessage='Version '
                                            />
                                        </Typography>
                                        {' '}
                                        <Typography variant='body2' gutterBottom align='left' className={classes.textValue}>
                                            {api.version}
                                        </Typography>
                                        <VerticalDivider height={20} />
                                        <Typography variant='body2' gutterBottom align='left' className={classes.textLabel}>
                                            <FormattedMessage
                                                id='Apis.Details.Overview.list.provider'
                                                defaultMessage='By '
                                            />
                                        </Typography>
                                        {' '}
                                        <Typography variant='body2' gutterBottom align='left' className={classes.textValue}>
                                            {getProvider()}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            <Box display='flex' flexDirection='row' alignItems='center' mt={2} pr={6}>
                                {
                                    (api.gatewayVendor === 'solace') ? (
                                        <SolaceEndpoints />
                                    ) : (
                                        <Environments updateSelectedEndpoint={updateSelectedEndpoint} selectedEndpoint={selectedEndpoint} />
                                    )
                                }
                            </Box>
                            <Box
                                display='flex'
                                flexDirection='row'
                                alignItems='center'
                                className={classes.originalDevportalUrl}
                                mt={2}
                                pr={6}
                            >
                                {advertiseInfo && advertiseInfo.advertised && advertiseInfo.originalDevPortalUrl && (
                                    <MUILink
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        href={advertiseInfo.originalDevPortalUrl}
                                        variant='body3'
                                        underline='hover'
                                    >
                                        <FormattedMessage
                                            id={'Apis.Details.Credentials.Credentials.visit.original.'
                                                + 'developer.portal'}
                                            defaultMessage='Visit Original Developer Portal'
                                        />
                                        <LaunchIcon className={classes.launchIcon} />
                                    </MUILink>
                                )}
                            </Box>
                            {isSubValidationDisabled && (
                                <Box mt={2} ml={1} pr={6}>
                                    <InlineMessage
                                        type='info'
                                        title={(
                                            <FormattedMessage
                                                id='Apis.Details.Overview.subscriptions.not.required'
                                                defaultMessage='No subscriptions required'
                                            />
                                        )}
                                    >
                                        <Typography component='p'>
                                            <FormattedMessage
                                                id='Apis.Details.Overview.subscriptions.not.required.content'
                                                defaultMessage='Subscriptions are not required for this API.
                                                    You can consume this without subscribing to it.'
                                            />
                                        </Typography>
                                    </InlineMessage>
                                </Box>
                            )}
                            {(api.gatewayVendor === 'wso2' || !api.gatewayVendor)
                                && allPolicies && allPolicies.length > 0 && !isSubValidationDisabled && (
                                <>
                                    <Box mt={6}>
                                        <Typography variant='subtitle2' component='h3' className={classes.sectionTitle}>
                                            <FormattedMessage
                                                id='Apis.Details.Overview.business.plans.title'
                                                defaultMessage='Business Plans'
                                            />
                                        </Typography>
                                    </Box>
                                    <Box
                                        flexWrap='wrap'
                                        display='flex'
                                        flexDirection='row'
                                        alignItems='center'
                                        mt={2}
                                        ml={1}
                                        textAlign='center'
                                    >
                                        {allPolicies && allPolicies.map((tier) => (
                                            tier.name.includes(CONSTANTS.DEFAULT_SUBSCRIPTIONLESS_PLAN) ? null : (
                                                <Card className={classes.cardRoot} key={tier.name}>
                                                    <CardContent>
                                                        <Typography className={classes.cardMainTitle} color='textSecondary' gutterBottom>
                                                            {tier.name}
                                                        </Typography>
                                                        <Box mt={2}>
                                                            <Typography className={classes.requestCount} color='textSecondary'>
                                                                {tier.requestCount === 2147483647 ? 'Unlimited' : tier.requestCount}
                                                            </Typography>
                                                        </Box>
                                                        <Box>
                                                            <Typography className={classes.requestUnit} color='textSecondary'>
                                                                <FormattedMessage
                                                                    id='Apis.Details.Overview.business.plans.requests.unit'
                                                                    defaultMessage='Requests/{timeUnit}'
                                                                    values={{
                                                                        timeUnit: tier.timeUnit in subscriptionTimeUnits
                                                                            ? subscriptionTimeUnits[tier.timeUnit]
                                                                            : tier.timeUnit,
                                                                    }}
                                                                />
                                                            </Typography>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            )
                                        ))}
                                    </Box>
                                </>
                            )}
                            {(showCredentials && subscribedApplications.length > 0) && !isSubValidationDisabled && (
                                <>
                                    <Box mt={6}>
                                        <Typography variant='subtitle2' component='h3' className={classes.sectionTitle}>
                                            <FormattedMessage
                                                id='Apis.Details.Overview.subscriptions.title'
                                                defaultMessage='Subscriptions'
                                            />
                                        </Typography>
                                    </Box>
                                    <Box mt={2} ml={1} pr={6}>
                                        <TableContainer component={Paper}>
                                            <Table className={classes.table} aria-label='simple table'>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>
                                                            <FormattedMessage
                                                                id={'Apis.Details.Overview.'
                                                                    + 'api.credentials.subscribed.apps.name'}
                                                                defaultMessage='Application Name'
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <FormattedMessage
                                                                id={'Apis.Details.Overview.api.'
                                                                    + 'credentials.subscribed.apps.tier'}
                                                                defaultMessage='Throttling Tier'
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <FormattedMessage
                                                                id={'Apis.Details.Overview.'
                                                                    + 'api.credentials.subscribed.apps.status'}
                                                                defaultMessage='Application Status'
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {subscribedApplications.map((app) => (
                                                        <TableRow key={app.label}>
                                                            <TableCell component='th' scope='row'>
                                                                <MUILink
                                                                    component={Link}
                                                                    to={`/applications/${app.value}/overview`}
                                                                    underline='hover'
                                                                >
                                                                    {app.label}
                                                                </MUILink>
                                                            </TableCell>
                                                            <TableCell>{app.policy}</TableCell>
                                                            <TableCell>{app.status}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                </>
                            )}
                            <Box mt={6}>
                                {showComments && (
                                    <>
                                        <Typography variant='subtitle2' component='h3' className={classes.sectionTitle}>
                                            <FormattedMessage
                                                id='Apis.Details.Overview.comments.title'
                                                defaultMessage='Comments'
                                            />
                                        </Typography>
                                        <Box pr={6}>
                                            {api && (
                                                <Comments apiId={api.id} isOverview />
                                            )}
                                        </Box>
                                    </>
                                )}
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={4} xl={3}>
                        {user && showRating && (
                            <Box display='flex' flexDirection='row' alignItems='center'>
                                <StarRatingSummary avgRating={rating.avgRating} reviewCount={rating.total} returnCount={rating.count} />
                                <VerticalDivider height={30} />
                                <StarRatingBar
                                    apiId={api.id}
                                    isEditable
                                    showSummary={false}
                                    setRatingUpdate={setRatingUpdate}
                                />
                            </Box>
                        )}
                        <Box mt={6}>
                            <Social />
                        </Box>
                        {/* Subscription count */}
                        <Box mt={2} mb={1}>
                            <Typography variant='subtitle2' component='h3' className={classes.sectionTitle}>
                                <FormattedMessage
                                    id='Apis.Details.Overview.subscriptions.title'
                                    defaultMessage='Subscriptions'
                                />
                            </Typography>
                            { !isSubValidationDisabled ? (
                                <Typography variant='body2'>
                                    {api.subscriptions || 0}
                                </Typography>
                            ) : (
                                <Typography variant='body2'>
                                    N/A
                                </Typography>
                            )}
                        </Box>
                        <Box mt={2} mb={1}>
                            <Typography variant='subtitle2' component='h3' className={classes.sectionTitle}>
                                <FormattedMessage
                                    id='Apis.Details.Overview.tags.title'
                                    defaultMessage='Tags'
                                />
                            </Typography>
                        </Box>

                        <Typography variant='body2' className={classes.endpointLabel}>
                            {api.tags.map((tag) => (
                                <Chip
                                    label={tag}
                                    key={tag}
                                    component={Link}
                                    clickable
                                    to={`/apis?offset=0&query=tag:${tag}`}
                                    classes={{ root: classes.chipRoot }}
                                    variant='outlined'
                                    size='small'
                                />
                            ))}
                            {api.tags.length === 0 && (
                                <FormattedMessage
                                    id='Apis.Details.Overview.list.tags.not'
                                    defaultMessage='Not Tagged'
                                />
                            )}
                        </Typography>

                        {/* Documentation */}
                        {(showDocuments && allDocuments && allDocuments.length > 0) && (
                            <>
                                <Box mt={6}>
                                    <Typography variant='subtitle2' component='h3' className={classes.sectionTitle}>
                                        <FormattedMessage
                                            id='Apis.Details.Overview.documents.title'
                                            defaultMessage='Documents'
                                        />
                                    </Typography>
                                </Box>
                                <Box pr={2} pl={1}>
                                    <OverviewDocuments apiId={api.id} />
                                    {allDocuments.length > 2 && (
                                        <MUILink
                                            component={Link}
                                            to={'/apis/' + api.id + '/documents'}
                                            className={classes.moreLink}
                                            underline='hover'
                                        >
                                            {allDocuments.length - 2}
                                            {' '}
                                            <FormattedMessage
                                                id='Apis.Details.Overview.comments.show.more.more'
                                                defaultMessage='more'
                                            />
                                        </MUILink>
                                    )}
                                </Box>
                            </>

                        )}
                        {api.businessInformation.businessOwnerEmail && (
                            <>
                                <Box mt={6}>
                                    <Typography variant='subtitle2' component='h3' className={classes.sectionTitle}>
                                        <FormattedMessage
                                            id='Apis.Details.Overview.business.info'
                                            defaultMessage='Business Info'
                                        />
                                    </Typography>
                                </Box>
                                <Box mt={1}>
                                    <Typography variant='body2'>
                                        {api.businessInformation.businessOwnerEmail}
                                    </Typography>
                                </Box>
                            </>
                        )}
                        <Box mt={6}>
                            <Typography variant='subtitle2' component='h3' className={classes.sectionTitle}>
                                <FormattedMessage
                                    id='Apis.Details.Overview.source'
                                    defaultMessage='Source'
                                />
                            </Typography>
                        </Box>
                        {(api.type === 'HTTP' || api.type === 'SOAPTOREST'
                            || api.type === 'SOAP' || api.type === 'GRAPHQL' || api.type === 'WS' || api.type === 'WEBSUB'
                            || api.type === 'SSE' || api.type === 'ASYNC') && (
                            <Box mt={2}>
                                {selectedEndpoint && (<SourceDownload selectedEndpoint={selectedEndpoint} />)}
                            </Box>
                        )}
                        {/* Key Managers */}
                        {getKeyManagers() && (
                            <>
                                <Box mt={6}>
                                    <Typography variant='subtitle2' component='h3' className={classes.sectionTitle}>
                                        <FormattedMessage
                                            id='Apis.Details.Overview.key.manager'
                                            defaultMessage='Key Managers'
                                        />
                                    </Typography>
                                </Box>
                                <Box mt={1}>
                                    {getKeyManagers()}
                                </Box>
                            </>
                        )}
                        {api.additionalProperties && Object.keys(api.additionalProperties).length > 0 && (
                            <>
                                <Box mt={6}>
                                    <Typography variant='subtitle2' className={classes.sectionTitle}>
                                        <FormattedMessage
                                            id='Apis.Details.Overview.additional.properties'
                                            defaultMessage='Additonal properties'
                                        />
                                    </Typography>
                                </Box>
                                <Box mt={1} ml={1}>
                                    {api.additionalProperties
                                        .filter(({ name, display }) => display && !['slack_url', 'github_repo'].includes(name))
                                        .map(({ name, value }) => {
                                            return (
                                                <Typography variant='body2'>
                                                    {name}
                                                    {' '}
                                                    :
                                                    {' '}
                                                    {value}
                                                </Typography>
                                            );
                                        })}
                                </Box>
                            </>
                        )}
                    </Grid>
                </Grid>
            </Paper>
        </Root>
    );
}

export default Overview;
