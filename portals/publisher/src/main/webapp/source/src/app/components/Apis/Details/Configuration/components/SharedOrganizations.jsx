/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
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

import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import HelpOutline from '@mui/icons-material/HelpOutline';
import API from 'AppData/api';
import {
    RadioGroup,
    FormControlLabel,
    FormLabel,
    Radio,
    TextField,
    Checkbox,
    Tooltip,
    Box,
} from "@mui/material";

const PREFIX = 'SharedOrganizations';

const classes = {
    tooltip: `${PREFIX}-tooltip`,
    listItemText: `${PREFIX}-listItemText`
};

const StyledBox = styled(Box)(({ theme }) => ({
    [`& .${classes.tooltip}`]: {
        top: theme.spacing(1),
        marginLeft: theme.spacing(1),
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
 * Render the organizations drop down.
 * @param {JSON} props props passed from it's parents.
 * @returns {JSX} Render the organizations drop down.
 */
function SharedOrganizations(props) {
    const [organizations, setOrganizations] = useState({});
    const { api, configDispatcher } = props;
    const [selectionMode, setSelectionMode] = useState("all");

    useEffect(() => {
        API.getOrganizations().then((response) => setOrganizations(response.body));
        if (api.visibleOrganizations.includes("all")) {
            setSelectionMode("all");
        } else if (api.visibleOrganizations.length === 0) {
            setSelectionMode("none");
        } else {
            setSelectionMode("select");
        }
    }, []);

    if (organizations && !organizations.list) {
        return null;
    } else if (organizations && organizations.list) {
        const optionsList = organizations.list;
        const handleRadioChange = (event) => {
            const { value } = event.target;
            setSelectionMode(value);
            if (value === "all") {
                configDispatcher({ action: "visibleOrganizations", value: ["all"] });
            } else if (value === "none") {
                configDispatcher({ action: "visibleOrganizations", value: [] });
            }
        };
        const handleDropdownChange = (event, newValue) => {
            configDispatcher({
                action: "visibleOrganizations",
                value: newValue.map((org) => org.organizationId),
            });
        };
        
        return (
            <StyledBox style={{ position: 'relative'}}>
                <Box display='flex' alignItems='center'>
                    <FormLabel component='legend'>
                        <FormattedMessage
                            id='Apis.Details.Configuration.components.Shared.Organizations.label'
                            defaultMessage='Share API with Organizations'
                        />
                    </FormLabel>
                    <Tooltip
                        title={(
                            <>
                                <p>
                                    <FormattedMessage
                                        id='Apis.Details.Configuration.components.Shared.organizations.dropdown.tooltip'
                                        defaultMessage={'Allow to share API with other organizations.'
                                            + ' There has to be pre-defined organizations in the'
                                            + ' environment in order to share the API.'}
                                    />
                                </p>
                            </>
                        )}
                        aria-label='Shared Organizations'
                        placement='right-end'
                        interactive
                        className={classes.tooltip}
                    >
                        <HelpOutline />
                    </Tooltip>
                </Box>
                <RadioGroup value={selectionMode} onChange={handleRadioChange} row>
                    <FormControlLabel value='all' control={<Radio />} label='All' />
                    <FormControlLabel value='none' control={<Radio />} label='None' />
                    <FormControlLabel value='select' control={<Radio />} label='Select' />
                </RadioGroup>
                {selectionMode === "select" && (
                    <Autocomplete
                        multiple
                        fullWidth
                        limitTags={5}
                        id='SharedOrganizations-autocomplete'
                        options={optionsList}
                        noOptionsText='No organizations registered'
                        disableCloseOnSelect
                        getOptionLabel={(option) => option.displayName}
                        isOptionEqualToValue={(option, value) => option.organizationId === value.organizationId}
                        value={organizations.list.filter((org) =>
                            api.visibleOrganizations.includes(org.organizationId)
                        )}
                        onChange={handleDropdownChange}
                        renderOption={(optionProps, option, { selected }) => (
                            <li {...optionProps}>
                                <Checkbox
                                    key={option.organizationId}
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{ marginRight: 8 }}
                                    checked={selected}
                                />
                                {option.displayName}
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                label='Shared Organizations'
                                placeholder='Add Organizations'
                                helperText='Select organizations for sharing the API'
                                margin='normal'
                                variant='outlined'
                            />
                        )}
                    />
                )}
            </StyledBox>
        );
    }
}

SharedOrganizations.defaultProps = {
    organizations: [],
    api: PropTypes.shape({}).isRequired,
    configDispatcher: PropTypes.func.isRequired,
};

export default SharedOrganizations;
