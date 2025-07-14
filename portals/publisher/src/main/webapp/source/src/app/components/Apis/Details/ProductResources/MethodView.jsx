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
import { useTheme } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import PropTypes from 'prop-types';

/**
 * MethodView component displays the HTTP method of an API resource.
 * It uses a Chip component to visually represent the method,
 * with colors based on the method type (GET, POST, PUT, DELETE, etc.).
 * 
 * @param {Object} props - The component properties.
 * @returns {JSX.Element} The rendered MethodView component.
 */
function MethodView(props) {
    const theme = useTheme();
    const { method, className } = props;
    let chipColor = theme.custom.resourceChipColors ? theme.custom.resourceChipColors[method.toLowerCase()] : null;
    let chipTextColor = '#000000';

    if (!chipColor) {
        chipColor = '#cccccc';
    } else {
        chipTextColor = theme.palette.getContrastText(theme.custom.resourceChipColors[method.toLowerCase()]);
    }

    return (
        <Chip
            label={method}
            className={className || ''}
            style={{
                backgroundColor: chipColor, color: chipTextColor, height: 20, width: 65,
            }}
        />
    );
}

MethodView.propTypes = {
    className: PropTypes.string.isRequired,
    method: PropTypes.string.isRequired,
};

export default MethodView;
