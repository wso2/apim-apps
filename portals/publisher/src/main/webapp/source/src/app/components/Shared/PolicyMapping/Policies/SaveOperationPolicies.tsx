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

import React, { useContext } from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';
import { isRestricted } from 'AppData/AuthManager';
import { FormattedMessage } from 'react-intl';
import CustomSplitButton from 'AppComponents/Shared/CustomSplitButton';
import ApiContext from 'AppComponents/Apis/Details/components/ApiContext';

interface SaveOperationPoliciesProps {
    saveApi: () => void;
    updating: boolean;
}

/**
 * Renders the save button (with Save option & Save and deploy option).
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Policies page save button.
 */
const SaveOperationPolicies: React.FC<SaveOperationPoliciesProps> = ({
    saveApi, updating
}) => {
    const { api } = useContext<any>(ApiContext);
    const history = useHistory();

    /**
     * Handle save button event
     *
     */
    const handleSave = () => {
        saveApi();
    }

    /**
     * Handle save and deploy button event
     * 
     */
    const handleSaveAndDeploy = () => {
        saveApi();
        history.push({
            pathname: `/apis/${api.id}/deployments`,
            state: 'deploy',
        });
    }

    return (
        <Grid container direction='row' spacing={1}>
            <Grid item>
                <Box p={1} mt={3}>
                    {api.isRevision || isRestricted(['apim:api_create'], api) ? (
                        <Button
                            disabled
                            type='submit'
                            variant='contained'
                            color='primary'
                        >
                            <FormattedMessage
                                id='Apis.Details.Policies.SaveOperationPolicies.save'
                                defaultMessage='Save'
                            />
                        </Button>
                    ) : (
                        <CustomSplitButton
                            handleSave={handleSave}
                            api={api}
                            handleSaveAndDeploy={handleSaveAndDeploy}
                            isUpdating={updating}
                        />
                    )}
                </Box>
            </Grid>
        </Grid>
    );
};

export default SaveOperationPolicies;
