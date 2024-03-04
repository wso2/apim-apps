/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import { FormattedMessage } from 'react-intl';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import HelpOutline from '@mui/icons-material/HelpOutline';
import API from 'AppData/api';
import { useAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import { isRestricted } from 'AppData/AuthManager';

const PREFIX = 'APICategories';

const classes = {
    tooltip: `${PREFIX}-tooltip`,
    listItemText: `${PREFIX}-listItemText`
};

const StyledBox = styled(Box)(({ theme }) => ({
    [`& .${classes.tooltip}`]: {
        position: 'absolute',
        right: theme.spacing(-4),
        top: theme.spacing(1),
    },

    [`& .${classes.listItemText}`]: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    }
}));

const icon = <CheckBoxOutlineBlankIcon fontSize='small' />;
const checkedIcon = <CheckBoxIcon fontSize='small' />;

/**
 * Render the categories drop down.
 * @param {JSON} props props passed from it's parents.
 * @returns {JSX} Render the categories drop down.
 */
function APICategories(props) {
    const [categories, setCategories] = useState({});
    const { api, configDispatcher } = props;

    const [apiFromContext] = useAPI();

    useEffect(() => {
        API.apiCategories().then((response) => setCategories(response.body));
    }, []);

    if (!categories.list) {
        return null;
    } else {
        return (
            <StyledBox style={{ position: 'relative', marginTop: 10 }}>
                <Autocomplete
                    disabled={isRestricted(['apim:api_create', 'apim:api_publish'], apiFromContext)
                        || categories.list.length === 0
                    }
                    multiple
                    fullWidth
                    limitTags={5}
                    id='APICategories-autocomplete'
                    options={categories.list.map((category) => category.name)}
                    noOptionsText='No API categories defined'
                    disableCloseOnSelect
                    value={api.categories}
                    onChange={(e, newValue) => configDispatcher({ action: 'categories', value: newValue })}
                    renderOption={(options, category, { selected }) => (
                        <li {...options}>
                            <Checkbox
                                id={category}
                                key={category}
                                icon={icon}
                                checkedIcon={checkedIcon}
                                style={{ marginRight: 8 }}
                                checked={selected}
                            />
                            {category}
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField {...params}
                            disabled={isRestricted(['apim:api_create', 'apim:api_publish'], apiFromContext)
                                || categories.list.length === 0
                            }
                            fullWidth
                            label={categories.list.length !== 0 ? (
                                <FormattedMessage
                                    id='Apis.Details.Configurations.api.categories'
                                    defaultMessage='API Categories'
                                />
                            ) : (
                                <FormattedMessage
                                    id='Apis.Details.Configurations.api.categories.empty'
                                    defaultMessage='No API Categories defined.'
                                />
                            )
                            }
                            placeholder='Search API categories'
                            helperText='Select API Categories for the API'
                            margin='normal'
                            variant='outlined'
                            id='APICategories'
                        />
                    )}
                />
                <Tooltip
                    title={(
                        <>
                            <p>
                                <FormattedMessage
                                    id='Api.category.dropdown.tooltip'
                                    defaultMessage={'Allow to group APIs that have similar attributes.'
                                        + ' There has to be pre-defined API categories in the'
                                        + ' environment in order to be attached to an API.'}
                                />
                            </p>
                        </>
                    )}
                    aria-label='API Categories'
                    placement='right-end'
                    interactive
                    className={classes.tooltip}
                >
                    <HelpOutline />
                </Tooltip>
            </StyledBox>
        );
    }
}

APICategories.defaultProps = {
    categories: [],
    api: PropTypes.shape({}).isRequired,
    configDispatcher: PropTypes.func.isRequired,
};

export default APICategories;
