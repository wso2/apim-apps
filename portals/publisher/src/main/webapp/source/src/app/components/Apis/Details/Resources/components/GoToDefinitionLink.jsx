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
import PropTypes from 'prop-types';
import { makeStyles } from '@mui/styles';
import Box from '@mui/material/Box';
import LaunchIcon from '@mui/icons-material/Launch';
import { Link } from 'react-router-dom';
import Typography from '@mui/material/Typography';

const useStyles = makeStyles((theme) => ({
    link: {
        color: theme.palette.primary.dark,
        marginLeft: theme.spacing(2),
        display: 'inline',
    },
}));

/**
 *
 * Simply reders the edit api definition link in the bottom of the resources listing
 * @export
 * @param {*} props
 * @returns
 */
export default function GoToDefinitionLink(props) {
    const { api, message } = props;
    const classes = useStyles();
    return (
        <Box m={1}>
            <Link to={`/apis/${api.id}/api definition`}>
                <Typography className={classes.link} variant='caption'>
                    {message}
                    <LaunchIcon style={{ marginLeft: '2px' }} fontSize='small' />
                </Typography>
            </Link>
        </Box>
    );
}
GoToDefinitionLink.defaultProps = {
    message: 'Edit API Definition',
};
GoToDefinitionLink.propTypes = {
    api: PropTypes.shape({ id: PropTypes.string }).isRequired,
    message: PropTypes.string,
};
