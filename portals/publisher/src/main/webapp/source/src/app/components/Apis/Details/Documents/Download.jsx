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

import React, {useState, useEffect} from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Icon from '@mui/material/Icon';
import Alert from 'AppComponents/Shared/Alert';
import Api from 'AppData/api';
import MCPServer from 'AppData/MCPServer';
import Utils from 'AppData/Utils';

/**
 * Download component
 * @param {*} props {any}
 * @returns {JSX.Element} - The Download component
 */
function Download(props) {
    const { intl } = props;

    const { docId, apiId, docName, apiType } = props;

    const handleDownload = () => {
        let api;
        if (apiType === MCPServer.CONSTS.MCP) {
            api = MCPServer;
        } else {
            api = new Api();
        }
        const promisedGetContent = api.getFileForDocument(apiId, docId);
        promisedGetContent
            .then((response) => {
                Utils.forceDownload(response);
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                    Alert.error(intl.formatMessage({
                        id:'Apis.Details.Documents.Download.documents.markdown.editor.download.error',
                        defaultMessage: 'Error downloading the file',
                    }));
                }
            });
    };

    return (
        <Button onClick={handleDownload} aria-label={'Download ' + docName}>
            <Icon>arrow_downward</Icon>
            <FormattedMessage
                id='Apis.Details.Documents.Download.documents.listing.download'
                defaultMessage='Download'
            />
        </Button>
    );
}

Download.propTypes = {
    apiId: PropTypes.shape({}).isRequired,
    docId: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({}).isRequired,
    apiType: PropTypes.string.isRequired,
};

export default injectIntl(Download);
