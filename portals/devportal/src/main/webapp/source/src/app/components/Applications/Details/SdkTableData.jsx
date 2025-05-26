/* eslint-disable */
/*
 * Copyright (c), WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Api from 'AppData/api';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import IconButton from '@mui/material/IconButton';

class SdkTableData extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tiers: [],
        };
        this.populateSubscriptionTiers = this.populateSubscriptionTiers.bind(this);
        this.handleMoveToSelected = this.handleMoveToSelected.bind(this);
        this.handleRemoveFromSelected = this.handleRemoveFromSelected.bind(this);
        
        this.searchTextTmp = '';
    }

    componentDidMount() {
        this.populateSubscriptionTiers(this.props.subscription.apiId);
    }

    handleMoveToSelected() {
        const {
            subscription,
            onApiSelect
        } = this.props;
            if (onApiSelect && typeof onApiSelect === 'function') {
            onApiSelect(subscription);
        }
    }

    handleRemoveFromSelected() {
        const {
            subscription,
            onApiRemove
        } = this.props;
            if (onApiRemove && typeof onApiRemove === 'function') {
            onApiRemove(subscription);
        }
    }

    populateSubscriptionTiers(apiUUID) {
        const apiClient = new Api();
        const promisedApi = apiClient.getAPIById(apiUUID);
        promisedApi.then((response) => {
        if (response && response.data) {
            const api = JSON.parse(response.data);
            const apiTiers = api.tiers;
            const tiers = [];
            for (let i = 0; i < apiTiers.length; i++) {
                const { tierName } = apiTiers[i];
                tiers.push({ value: tierName, label: tierName });
            }
            this.setState({ tiers });
        }
        });
    }

    render() {
        const {
            subscription: {
              apiInfo, 
              apiId,
            },
            isSelectable,
          } = this.props;
        const {
            tiers,
        } = this.state;

        const isHttpType = apiInfo.type === "HTTP";
        if (!isHttpType) {
            return null;
        }

        const apiLink = isHttpType ? (
            <Link
                to={tiers.length === 0 ? '' : '/apis/' + apiId}
                style={{ cursor: tiers.length === 0 ? 'default' : '' }}
                external
            >
                {apiInfo.name}
            </Link>
        ) : null;

        const verLink = isHttpType ? (
            <Link
                to={tiers.length === 0 ? '' : '/apis/' + apiId}
                style={{ cursor: tiers.length === 0 ? 'default' : '' }}
                external
            >
                {apiInfo.version}
            </Link>
        ) : null;
    
        return (
            <TableRow>
                {isSelectable ? (
                    <>
                        <TableCell component="th" scope="row">
                            {apiLink}
                        </TableCell>
                        <TableCell component="th" scope="row">
                            {verLink}
                        </TableCell>
                        <TableCell component="th" scope="row">
                            <IconButton
                                size="small"
                                onClick={this.handleMoveToSelected}
                                sx={{
                                    color: '#aaa',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    },
                                }}
                            >
                                <ArrowForwardIosRoundedIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        </TableCell>
                    </>
                ):(
                    <>
                        <TableCell component="th" scope="row" style={{ paddingLeft: '16px' }}>
                            <IconButton
                                size="small"
                                onClick={this.handleRemoveFromSelected}
                                sx={{
                                    color: '#aaa',
                                    marginLeft: '32px',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    },
                                }}
                            >
                                <ArrowBackIosRoundedIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        </TableCell>
                        <TableCell component="th" scope="row">
                            {apiLink}
                        </TableCell>
                        <TableCell component="th" scope="row">
                            {verLink}
                        </TableCell>
                    </>
                )}
            </TableRow>
        );
    }
}

SdkTableData.propTypes = {
    subscription: PropTypes.shape({
        apiInfo: PropTypes.shape({
            name: PropTypes.string.isRequired,
            version: PropTypes.string.isRequired,
            lifeCycleStatus: PropTypes.string.isRequired,
            type: PropTypes.string,
        }).isRequired,
        subscriptionId: PropTypes.string.isRequired,
        apiId: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
    }).isRequired,
};

export default SdkTableData;
