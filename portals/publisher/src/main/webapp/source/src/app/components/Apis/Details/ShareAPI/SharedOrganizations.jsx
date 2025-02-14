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

import React from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import HelpOutline from '@mui/icons-material/HelpOutline';
import {
    RadioGroup,
    FormControlLabel,
    FormLabel,
    Radio,
    TextField,
    Checkbox,
    Tooltip,
    Box,
    Paper,
} from "@mui/material";

const PREFIX = 'SharedOrganizations';

const classes = {
    tooltip: `${PREFIX}-tooltip`,
    listItemText: `${PREFIX}-listItemText`,
    sharedOrganizationsPaper: `${PREFIX}-sharedOrganizationsPaper`
};

const StyledBox = styled(Box)(({ theme }) => ({
    [`& .${classes.tooltip}`]: {
        top: theme.spacing(1),
        marginLeft: theme.spacing(0.5),
    },

    [`& .${classes.listItemText}`]: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },

    [`& .${classes.sharedOrganizationsPaper}`]: {
        padding: theme.spacing(2),
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
    const { organizations, visibleOrganizations, setVisibleOrganizations, selectionMode, setSelectionMode } = props;

    if (organizations && !organizations.list) {
        return null;
    } else if (organizations && organizations.list) {
        const optionsList = organizations.list;
        const handleRadioChange = (event) => {
            const { value } = event.target;
            setSelectionMode(value);
        };
        const handleDropdownChange = (event, newValue) => {
            setVisibleOrganizations(newValue.map((org) => org.organizationId));
        };
        
        return (
            <StyledBox style={{ position: 'relative', marginTop: 8}}>
                <Paper className={classes.sharedOrganizationsPaper}>
                    <Box display='flex' alignItems='center' >
                        <FormLabel component='legend' style={{ marginTop: 8, marginBottom: 8}}>
                            <FormattedMessage
                                id='Apis.Details.Configuration.components.Shared.Organizations.label'
                                defaultMessage='Select an option to share the API with organizations.'
                            />
                        </FormLabel>
                    </Box>
                    <RadioGroup value={selectionMode} onChange={handleRadioChange} column>
                        <Box display='flex' alignItems='center'>
                            <FormControlLabel value='none' control={<Radio />} 
                                label='Do not share with any organization' />
                            <Tooltip
                                title={(
                                    <>
                                        <p>
                                            <FormattedMessage
                                                id='Apis.Details.ShareAPI.Shared.organizations.selection.none.tooltip'
                                                defaultMessage={'This will allow you to prevent sharing this API with'
                                                    + ' any of the existing organizations or new organizations that you'
                                                    + ' register under this organization in the future.'}
                                            />
                                        </p>
                                    </>
                                )}
                                aria-label='Shared Organizations'
                                placement='right-end'
                                interactive
                                className={classes.tooltip}
                            >
                                <HelpOutline fontSize='small'/>
                            </Tooltip>
                        </Box>
                        <Box display='flex' alignItems='center'>
                            <FormControlLabel value='all' control={<Radio />} label='Share with all organizations' />
                            <Tooltip
                                title={(
                                    <>
                                        <p>
                                            <FormattedMessage
                                                id='Apis.Details.ShareAPI.Shared.organizations.selection.all.tooltip'
                                                defaultMessage={'Select this to share the API with all the existing ' 
                                                    + 'organizations and all new organizations that you register under' 
                                                    + ' your current organization.'}
                                            />
                                        </p>
                                    </>
                                )}
                                aria-label='Shared Organizations'
                                placement='right-end'
                                interactive
                                className={classes.tooltip}
                            >
                                <HelpOutline fontSize='small'/>
                            </Tooltip>
                        </Box>
                        <FormControlLabel value='select' control={<Radio />} 
                            label='Share with only selected organizations' />
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
                                visibleOrganizations.includes(org.organizationId)
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
                                    margin='normal'
                                    variant='outlined'
                                />
                            )}
                        />
                    )}
                </Paper>
            </StyledBox>
        );
    }
}

SharedOrganizations.defaultProps = {
    organizations: [],
    configDispatcher: PropTypes.func.isRequired,
};

export default SharedOrganizations;
