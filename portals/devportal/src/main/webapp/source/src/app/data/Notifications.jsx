import APIClientFactory from 'AppData/APIClientFactory';
import Utils from 'AppData/Utils';
import Resource from 'AppData/Resource';

// Class to expose Notification {Resource} related operations

// eslint-disable-next-line require-jsdoc
export default class Notification extends Resource {
    /**
     * Get all Notifications
     * @param {number} limit Limit of the Notifications list which needs to be retrieved
     * @param {number} offset Offset of the Notifications list which needs to be retrieved
     * @param {String} sortOrder The attribute used to sort notifications based on created time
     * @returns {Promise} Promise containing Notifications list
    */
    static getNotifications(limit = null, offset = 0, sortOrder = 'desc') {
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
    static deleteNotification(notificationId) {
        const restApiClient = new APIClientFactory().getAPIClient(Utils.getEnvironment().label).client;
        return restApiClient.then((client) => {
            // eslint-disable-next-line dot-notation
            return client.apis['Notifications'].deleteNotification(
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
