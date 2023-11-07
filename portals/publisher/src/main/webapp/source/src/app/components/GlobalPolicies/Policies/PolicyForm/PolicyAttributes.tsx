/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import React, { FC, useState, } from 'react';
import { useIntl } from 'react-intl';
import PolicyAttributesShared from 'AppComponents/Shared/PoliciesUI/PolicyAttributes';
import { PolicyAttribute } from './Types';
import { ACTIONS } from './PolicyCreateForm';

interface PolicyAttributesProps {
    policyAttributes: PolicyAttribute[];
    dispatch?: React.Dispatch<any>;
    isViewMode: boolean;
}

/**
 * Handles the addition of policy attributes for a given policy.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Policy attributes UI.
 */
const PolicyAttributes: FC<PolicyAttributesProps> = ({
    policyAttributes, dispatch, isViewMode
}) => {
    const intl = useIntl();
    const [descriptionAnchorEl, setDescriptionAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [valuePropertiesAnchorEl, setValuePropertiesAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [openedDescriptionPopoverId, setOpenedDescriptionPopoverId] = useState<string | null>(null);
    const [openedValuesPopoverId, setOpenedValuesPopoverId] = useState<string | null>(null);

    const addNewPolicyAttribute = () => {
        if (dispatch) {
            dispatch({ type: ACTIONS.ADD_POLICY_ATTRIBUTE });
        }
    }

    const getAttributeFormError = (attribute: PolicyAttribute, fieldName: string) => {
        let error = '';
        switch(fieldName) {
            case 'name': {
                if (attribute.name === '') {
                    error = intl.formatMessage({
                        id: 'Apis.Details.Policies.PolicyForm.PolicyAttributes.name.required.error',
                        defaultMessage: 'Name is Empty',
                    });
                }
                return error;
            }
            case 'displayName': {
                if (attribute.displayName === '') {
                    error = intl.formatMessage({
                        id: 'Apis.Details.Policies.PolicyForm.PolicyAttributes.displayName.required.error',
                        defaultMessage: 'Display Name is Empty',
                    });
                }
                return error;
            }
            case 'validationRegex': {
                const regex = attribute.validationRegex;
                if (regex && regex !== '') {
                    try {
                        // eslint-disable-next-line no-new
                        new RegExp(regex);
                    } catch(e) {
                        error = intl.formatMessage({
                            id: 'AApis.Details.Policies.PolicyForm.PolicyAttributes.validationRegex.invalid',
                            defaultMessage: 'Provided regular expression is invalid',
                        })
                    }
                }
                return error;
            }
            case 'defaultValue': {
                const defaultVal = attribute.defaultValue;
                const regex = attribute.validationRegex;
                if (defaultVal && defaultVal !== '' && regex && regex !== '') {
                    try {
                        if (!new RegExp(regex).test(defaultVal)) {
                            error = intl.formatMessage({
                                id: 'Apis.Details.Policies.PolicyForm.PolicyAttributes.defaultValue.validation.error',
                                defaultMessage: 'Please enter a valid input',
                            });
                        }
                    } catch(e) {
                        console.error(e);
                    }
                }
                return error;
            }
            default:
                return error;
        }
    }

    /**
     * Function to handle form inputs
     * @param {any} event Event
     * @param {string} id Policy Attribute ID
     */
    const handleAttributeChange = (event: any, id: string) => {
        if (dispatch) {
            dispatch({
                type: ACTIONS.UPDATE_POLICY_ATTRIBUTE,
                id,
                field: event.target.name,
                value: event.target.value
            });
        }
    }

    /**
     * Function to handle toggle of required attribute
     * @param {boolean} currentState Current state of the required attrbute before toggle
     * @param {string} id Policy Attribute ID
     */
    const handleToggle = (currentState: boolean, id: string) => {
        if (dispatch) {
            dispatch({
                type: ACTIONS.UPDATE_POLICY_ATTRIBUTE,
                id,
                field: 'required',
                value: !currentState,
            });
        }
    }

    /**
     * Function to handle allowed values attribute
     * @param {React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>} event Event
     * @param {string} id Policy Attribute ID
     */
    const handleAllowedValues = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, id: string) => {
        if (dispatch) {
            dispatch({
                type: ACTIONS.UPDATE_POLICY_ATTRIBUTE,
                id,
                field: event.target.name,
                value: event.target.value.split(/[,][\s]*/)
            });
        }
    }

    // Description toggle button related actions
    const handleDescriptionToggle = (event: React.FormEvent<HTMLButtonElement>, id: string) => {
        setOpenedDescriptionPopoverId(id);
        setDescriptionAnchorEl(event.currentTarget);
    }
    const handleDescriptionClose = () => {
        setOpenedDescriptionPopoverId(null);
        setDescriptionAnchorEl(null);
    };

    // Value properties toggle button related actions
    const handleValuePropertiesToggle = (event: React.FormEvent<HTMLButtonElement>, id: string) => {
        setOpenedValuesPopoverId(id);
        setValuePropertiesAnchorEl(event.currentTarget);
    }
    const handleValuePropertiesClose = () => {
        setOpenedValuesPopoverId(null);
        setValuePropertiesAnchorEl(null);
    };

    return (
        <PolicyAttributesShared
            policyAttributes={policyAttributes}
            dispatch={dispatch}
            isViewMode={isViewMode}
            addNewPolicyAttribute={addNewPolicyAttribute}
            getAttributeFormError={getAttributeFormError}
            handleAttributeChange={handleAttributeChange}
            handleToggle={handleToggle}
            handleDescriptionToggle={handleDescriptionToggle}
            openedDescriptionPopoverId={openedDescriptionPopoverId}
            descriptionAnchorEl={descriptionAnchorEl}
            handleDescriptionClose={handleDescriptionClose}
            handleValuePropertiesToggle={handleValuePropertiesToggle}
            openedValuesPopoverId={openedValuesPopoverId}
            valuePropertiesAnchorEl={valuePropertiesAnchorEl}
            handleValuePropertiesClose={handleValuePropertiesClose}
            handleAllowedValues={handleAllowedValues}
            ACTIONS={ACTIONS}
        />
    );
}

export default React.memo(PolicyAttributes);
