/*
* Copyright (c) 2024, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import APIClientFactory from 'AppData/APIClientFactory';
import Utils from 'AppData/Utils';
import Resource from 'AppData/Resource';

// Class to expose Notification {Resource} related operations

// eslint-disable-next-line require-jsdoc
export default class Notification extends Resource {
    /**
     * Get all Notifications
     * @param {String} sortOrder The attribute used to sort notifications based on created time
     * @param {number} limit Limit of the Notifications list which needs to be retrieved
     * @param {number} offset Offset of the Notifications list which needs to be retrieved
     * @returns {Promise} Promise containing Notifications list
    */
    static getNotifications(sortOrder, limit = null, offset = 0) {
        const restApiClient = new APIClientFactory().getAPIClient(Utils.getEnvironment().label).client;
        return restApiClient.then((client) => {
            // eslint-disable-next-line dot-notation
            return client.apis['Notifications'].getNotifications(
                { sortOrder, limit, offset },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Update Notification's Mark as Read status
     * @param {String} notificationId UUID of the Notification
     * @param {Object} body object which holds the updated read status
     * @returns {Promise} Response containing the information of the updated Notification
    */
    static markNotificationAsReadById(notificationId, body) {
        const restApiClient = new APIClientFactory().getAPIClient(Utils.getEnvironment().label).client;
        const requestBody = {
            requestBody: body,
        };
        return restApiClient.then((client) => {
            // eslint-disable-next-line dot-notation
            return client.apis['Notifications'].markNotificationAsReadById(
                { notificationId },
                requestBody,
                this._requestMetaData(),
            );
        });
    }

    /**
     * Update All Notifications as Mark as Read
     * @param {Object} body object which holds the updated read status
     * @returns {Promise} Response containing the information of the updated Notification
    */
    static markAllNotificationsAsRead(body) {
        const restApiClient = new APIClientFactory().getAPIClient(Utils.getEnvironment().label).client;
        const requestBody = {
            requestBody: body,
        };
        return restApiClient.then((client) => {
            // eslint-disable-next-line dot-notation
            return client.apis['Notifications'].markAllNotificationsAsRead(
                requestBody,
                this._requestMetaData(),
            );
        });
    }

    /**
     * Delete a Notification by it's Id
     * @param {String} notificationId UUID of the Notification
     * @returns {Promise} Response
    */
    static deleteNotificationById(notificationId) {
        const restApiClient = new APIClientFactory().getAPIClient(Utils.getEnvironment().label).client;
        return restApiClient.then((client) => {
            // eslint-disable-next-line dot-notation
            return client.apis['Notifications'].deleteNotificationById(
                { notificationId },
                this._requestMetaData(),
            );
        });
    }

    /**
     * Delete all Notifications
     * @returns {Promise} Response
    */
    static deleteNotifications() {
        const restApiClient = new APIClientFactory().getAPIClient(Utils.getEnvironment().label).client;
        return restApiClient.then((client) => {
            // eslint-disable-next-line dot-notation
            return client.apis['Notifications'].deleteNotifications(
                this._requestMetaData(),
            );
        });
    }
}
