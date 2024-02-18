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

import React from 'react';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import Chip from '@mui/material/Chip';
import { injectIntl } from 'react-intl';
import CONSTS from 'AppData/Constants';
import Api from 'AppData/api';
import Alert from 'AppComponents/Shared/Alert';
import Progress from 'AppComponents/Shared/Progress';
import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import { ApiContext } from './ApiContext';

/**
 * @param {JSON} props render the base
 * @returns {JSX} rendered output
 */
function RenderMethod(props) {
    const { method } = props;
    const theme = useTheme();
    let chipColor = theme.custom.resourceChipColors ? theme.custom.resourceChipColors[method] : null;
    let chipTextColor = '#000000';
    if (!chipColor) {
        chipColor = '#cccccc';
    } else {
        chipTextColor = theme.palette.getContrastText(theme.custom.resourceChipColors[method]);
    }
    return (
        <Chip
            label={method.toUpperCase()}
            style={{
                backgroundColor: chipColor,
                color: chipTextColor,
                height: 20,
                margin: '5px',
            }}
        />
    );
}

RenderMethod.propTypes = {
    theme: PropTypes.shape({}).isRequired,
    method: PropTypes.string.isRequired,
};

/**
 *
 *
 * @class Resources
 * @extends {React.Component}
 */
class Resources extends React.Component {
    /**
     *Creates an instance of Resources.
     * @param {*} props
     * @memberof Resources
     */
    constructor(props) {
        super(props);
        this.state = {
            paths: null,
        };
        this.api = new Api();
    }

    /**
     *
     *
     * @memberof Resources
     */
    componentDidMount() {
        const { api } = this.props;
        let promisedApi = null;

        const apiClient = new Api();
        promisedApi = apiClient.getSwaggerByAPIId(api.id);

        promisedApi
            .then((response) => {
                if (response.obj.paths !== undefined) {
                    this.setState({ paths: response.obj.paths });
                }
            })
            .catch((error) => {
                console.log(error);
                Alert.error(error);
            });
    }

    /**
     * @returns {JSX} rendered output
     * @memberof Resources
     */
    render() {
        const { paths } = this.state;
        if (!paths) {
            return <Progress />;
        }
        const { classes } = this.props;

        return (
            <div className={classes.contentWrapper}>
                {Object.keys(paths).map((key) => {
                    const path = paths[key];
                    return (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 10,
                            }}
                            key={key}
                        >
                            <Typography
                                sx={(theme) => ({
                                    marginRight: 20,
                                    color: theme.palette.getContrastText(theme.custom.infoBar.sliderBackground),
                                })}
                                variant='body2'
                            >
                                {key}
                            </Typography>
                            {Object.keys(path).map((innerKey) => {
                                return CONSTS.HTTP_METHODS.includes(innerKey) ? (
                                    <RenderMethod method={innerKey} key={innerKey} />
                                ) : null;
                            })}
                        </Box>
                    );
                })}
            </div>
        );
    }
}

Resources.contextType = ApiContext;

Resources.propTypes = {
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
};

export default injectIntl((Resources));
