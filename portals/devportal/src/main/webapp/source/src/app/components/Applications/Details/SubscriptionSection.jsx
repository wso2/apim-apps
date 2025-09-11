/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Icon from '@mui/material/Icon';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { FormattedMessage } from 'react-intl';
import ResourceNotFound from 'AppComponents/Base/Errors/ResourceNotFound';
import InlineMessage from 'AppComponents/Shared/InlineMessage';
import SubscriptionTableData from './SubscriptionTableData';

const PREFIX = 'SubscriptionSection';

const classes = {
    root: `${PREFIX}-root`,
    firstCell: `${PREFIX}-firstCell`,
    cardContent: `${PREFIX}-cardContent`,
    titleWrapper: `${PREFIX}-titleWrapper`,
    genericMessageWrapper: `${PREFIX}-genericMessageWrapper`,
    subsTable: `${PREFIX}-subsTable`,
    sectionContainer: `${PREFIX}-sectionContainer`,
};

const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`& .${classes.sectionContainer}`]: {
        marginBottom: theme.spacing(4),
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(2),
    },

    [`& .${classes.firstCell}`]: {
        paddingLeft: 0,
    },

    [`& .${classes.cardContent}`]: {
        '& table tr td': {
            paddingLeft: theme.spacing(1),
        },
        '& table tr:nth-child(even)': {
            backgroundColor: theme.custom.listView.tableBodyEvenBackgrund,
            '& td, & a': {
                color: theme.palette.getContrastText(theme.custom.listView.tableBodyEvenBackgrund),
            },
        },
        '& table tr:nth-child(odd)': {
            backgroundColor: theme.custom.listView.tableBodyOddBackgrund,
            '& td, & a': {
                color: theme.palette.getContrastText(theme.custom.listView.tableBodyOddBackgrund),
            },
        },
        '& table th': {
            backgroundColor: theme.custom.listView.tableHeadBackground,
            color: theme.palette.getContrastText(theme.custom.listView.tableHeadBackground),
            paddingLeft: theme.spacing(1),
        },
    },

    [`& .${classes.titleWrapper}`]: {
        display: 'flex',
        alignItems: 'center',
        paddingBottom: theme.spacing(2),
        '& h5': {
            marginRight: theme.spacing(1),
        },
    },

    [`& .${classes.genericMessageWrapper}`]: {
        margin: theme.spacing(2),
    },

    [`& .${classes.subsTable}`]: {
        '& td': {
            padding: '4px 8px',
        },
        '& th': {
            padding: '8px',
        },
        // Define consistent column widths
        '& th:nth-of-type(1)': { // Entity Name (API/MCP Server)
            width: '25%',
            minWidth: '200px',
        },
        '& th:nth-of-type(2)': { // Lifecycle State
            width: '20%',
            minWidth: '150px',
        },
        '& th:nth-of-type(3)': { // Business Plan
            width: '20%',
            minWidth: '150px',
        },
        '& th:nth-of-type(4)': { // Subscription Status
            width: '20%',
            minWidth: '150px',
        },
        '& th:nth-of-type(5)': { // Action
            width: '15%',
            minWidth: '120px',
        },
        // Apply same widths to table cells
        '& td:nth-of-type(1)': {
            width: '25%',
            minWidth: '200px',
        },
        '& td:nth-of-type(2)': {
            width: '20%',
            minWidth: '150px',
        },
        '& td:nth-of-type(3)': {
            width: '20%',
            minWidth: '150px',
        },
        '& td:nth-of-type(4)': {
            width: '20%',
            minWidth: '150px',
        },
        '& td:nth-of-type(5)': {
            width: '15%',
            minWidth: '120px',
        },
        // Ensure table layout is fixed for consistent columns
        tableLayout: 'fixed',
        width: '100%',
    },
}));

/**
 * Reusable subscription section component
 * @param {Object} props Component props
 * @returns {JSX.Element} The subscription section component
 */
const SubscriptionSection = ({
    title,
    buttonText,
    subscriptions,
    subscriptionsNotFound,
    pseudoSubscriptions,
    onAddClick,
    handleSubscriptionDelete,
    handleSubscriptionUpdate,
    noSubscriptionsMessage,
    noSubscriptionsContent,
    entityNameColumn,
    ...otherProps
}) => {
    return (
        <Root {...otherProps}>
            <Box className={classes.sectionContainer}>
                <Box className={classes.titleWrapper}>
                    <Typography
                        variant='h5'
                        sx={{
                            textTransform: 'capitalize',
                        }}
                    >
                        {title}
                    </Typography>
                    <Button
                        color='secondary'
                        size='small'
                        onClick={onAddClick}
                        sx={{ ml: 'auto', mr: 2 }}
                    >
                        <Icon>add_circle_outline</Icon>
                        {buttonText}
                    </Button>
                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        {((subscriptions && subscriptions.length === 0) || pseudoSubscriptions)
                            ? (
                                <Box className={classes.genericMessageWrapper}>
                                    <InlineMessage
                                        type='info'
                                        sx={(theme) => ({
                                            width: '100%',
                                            padding: theme.spacing(2),
                                        })}
                                    >
                                        <Typography variant='h5' component='h3'>
                                            {noSubscriptionsMessage}
                                        </Typography>
                                        <Typography component='p'>
                                            {noSubscriptionsContent}
                                        </Typography>
                                    </InlineMessage>
                                </Box>
                            )
                            : (
                                <Box className={classes.cardContent}>
                                    {subscriptionsNotFound ? (
                                        <ResourceNotFound />
                                    ) : (
                                        <Table className={classes.subsTable}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell className={classes.firstCell}>
                                                        {entityNameColumn}
                                                    </TableCell>
                                                    <TableCell>
                                                        <FormattedMessage
                                                            id='Applications.Details.Subscriptions.subscription.state'
                                                            defaultMessage='Lifecycle State'
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <FormattedMessage
                                                            id='Applications.Details.Subscriptions.business.plan'
                                                            defaultMessage='Business Plan'
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <FormattedMessage
                                                            id='Applications.Details.Subscriptions.Status'
                                                            defaultMessage='Subscription Status'
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <FormattedMessage
                                                            id='Applications.Details.Subscriptions.action'
                                                            defaultMessage='Action'
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {subscriptions
                                                    && subscriptions.map((subscription) => {
                                                        return (
                                                            <SubscriptionTableData
                                                                key={subscription.subscriptionId}
                                                                subscription={subscription}
                                                                handleSubscriptionDelete={handleSubscriptionDelete}
                                                                handleSubscriptionUpdate={handleSubscriptionUpdate}
                                                            />
                                                        );
                                                    })}
                                            </TableBody>
                                        </Table>
                                    )}
                                </Box>
                            )}
                    </Grid>
                </Grid>
            </Box>
        </Root>
    );
};

SubscriptionSection.propTypes = {
    title: PropTypes.node.isRequired,
    buttonText: PropTypes.node.isRequired,
    subscriptions: PropTypes.arrayOf(PropTypes.shape({})),
    subscriptionsNotFound: PropTypes.bool,
    pseudoSubscriptions: PropTypes.bool,
    onAddClick: PropTypes.func.isRequired,
    handleSubscriptionDelete: PropTypes.func.isRequired,
    handleSubscriptionUpdate: PropTypes.func.isRequired,
    noSubscriptionsMessage: PropTypes.node.isRequired,
    noSubscriptionsContent: PropTypes.node.isRequired,
    entityNameColumn: PropTypes.node.isRequired,
};

SubscriptionSection.defaultProps = {
    subscriptions: [],
    subscriptionsNotFound: false,
    pseudoSubscriptions: false,
};

export default SubscriptionSection;
