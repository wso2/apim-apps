import React, { Component } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Grid, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import API from 'AppData/api';
import Banner from 'AppComponents/Shared/Banner';
import { Progress } from 'AppComponents/Shared';

const PREFIX = 'BusinessPlans';

const classes = {
    root: `${PREFIX}-root`,
    margin: `${PREFIX}-margin`,
    rightDataColumn: `${PREFIX}-rightDataColumn`,
    grid: `${PREFIX}-grid`,
    box: `${PREFIX}-box`,
    tableCel: `${PREFIX}-tableCel`,
    table: `${PREFIX}-table`,
    tableHeadCell: `${PREFIX}-tableHeadCell`,
    stateWrapper: `${PREFIX}-stateWrapper`,
    tableHeadTitle: `${PREFIX}-tableHeadTitle`
};

const StyledGrid = styled(Grid)((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        flexGrow: 1,
        paddingBottom: '10px',
    },

    [`& .${classes.margin}`]: {
        margin: theme.spacing(),
    },

    [`& .${classes.rightDataColumn}`]: {
        display: 'flex',
        flex: 1,
    },

    [`& .${classes.grid}`]: {
        marginTop: '10px',
        paddingRight: '10px',
        paddingBottom: '10px',
    },

    [`& .${classes.box}`]: {
        display: 'block',
    },

    [`& .${classes.tableCel}`]: {
        width: 50,
    },

    [`& .${classes.table}`]: {
        width: '100%',
        border: 'solid 1px #ccc',
    },

    [`& .${classes.tableHeadCell}`]: {
        color: 'black',
        background: theme.palette.grey[200],
    },

    [`& .${classes.stateWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
    },

    [`& .${classes.tableHeadTitle}`]: {
        flex: 1,
        fontWeight: 'bold',
    }
}));

/**
 *
 *
 * @class BusinessPlans
 * @extends {Component}
 */
class BusinessPlans extends Component {
    /**
     *Creates an instance of BusinessPlans.
     * @param {Object} props
     * @memberof BusinessPlans
     */
    constructor(props) {
        super(props);
        this.state = {
            policies: [],
            monetizedPolices: null,
        };
        this.monetizationQuery = this.monetizationQuery.bind(this);
    }

    /**
     *
     * @inheritdoc
     * @memberof BusinessPlans
     */
    componentDidMount() {
        const { api } = this.props;
        api.getSubscriptionPolicies(api.id).then((policies) => {
            const filteredPolicies = policies.filter((policy) => policy.tierPlan === 'COMMERCIAL');
            this.setState({ policies: filteredPolicies });
        });
        api.getMonetization(api.id).then((status) => {
            this.setState({ monetizedPolices: status.properties });
        });
    }

    monetizationQuery(policyName) {
        const { monetizedPolices } = this.state;
        return policyName in monetizedPolices;
    }

    /**
     *
     * @inheritdoc
     * @returns {React.Component} Policies / Business plans list
     * @memberof BusinessPlans
     */
    render() {
        const { policies, monetizedPolices } = this.state;
        if (monetizedPolices === null) {
            return <Progress />;
        }
        const policiesList = policies.map((policy) => (
            <StyledGrid item xs={12}>
                <Table className={classes.table}>
                    <TableRow>
                        <TableCell variant='head' colSpan={2} className={classes.tableHeadCell}>
                            <Box display='flex'>
                                <Typography component='div' className={classes.tableHeadTitle} variant='subtitle1'>
                                    {policy.name}
                                </Typography>
                                {
                                    this.monetizationQuery(policy.name) ? (
                                        <div className={classes.stateWrapper}>
                                            <div><CheckIcon color='primary' /></div>
                                            <Typography component='div'>
                                                <FormattedMessage
                                                    id='Apis.Details.Monetization.BusinessPlans.monetized'
                                                    defaultMessage='Monetized'
                                                />
                                            </Typography>
                                        </div>
                                    ) : (
                                        <div className={classes.stateWrapper}>
                                            <div><CloseIcon color='error' /></div>
                                            <Typography component='div'>
                                                <FormattedMessage
                                                    id='Apis.Details.Monetization.BusinessPlans.not.monetized'
                                                    defaultMessage='Not Monetized'
                                                />
                                            </Typography>
                                        </div>
                                    )
                                }
                            </Box>
                        </TableCell>
                    </TableRow>
                    {Object.keys(policy.monetizationAttributes).map((key) => {
                        if (policy.monetizationAttributes[key] !== null) {
                            return (
                                <TableRow>
                                    <TableCell className={classes.tableCel} align='left'>
                                        <Typography component='p' variant='subtitle2'>
                                            {key}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align='left'>
                                        {policy.monetizationAttributes[key]}
                                    </TableCell>
                                </TableRow>
                            );
                        } else {
                            return false;
                        }
                    })}

                </Table>
            </StyledGrid>
        ));
        return (
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <Typography variant='h6' component='h3'>
                        <FormattedMessage
                            id='Apis.Details.Monetization.BusinessPlans.commercial.policies'
                            defaultMessage='Commercial Policies'
                        />
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Grid container direction='row' spacing={3}>
                        {policiesList}
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    {
                        (policies.length > 0) ? (
                            <Banner
                                disableActions
                                dense
                                paperProps={{ elevation: 1 }}
                                type='info'
                                message='Click Save to monetize all unmonetized policies'
                            />
                        ) : (
                            <Banner
                                disableActions
                                dense
                                paperProps={{ elevation: 1 }}
                                type='info'
                                message='No commercial policies to monetize'
                            />
                        )
                    }
                </Grid>
            </Grid>
        );
    }
}

BusinessPlans.propTypes = {
    api: PropTypes.instanceOf(API).isRequired,
    classes: PropTypes.shape({}).isRequired,
};

export default (BusinessPlans);
