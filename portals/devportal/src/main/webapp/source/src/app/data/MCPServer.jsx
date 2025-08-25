/*
 * Copyright (c) 2025, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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

import APIClientFactory from './APIClientFactory';
import Resource from './Resource';
import Utils from './Utils';

/**
 * MCPServer class to handle MCP server related operations.
 */
export default class MCPServer extends Resource {
    /**
     * Constructor for MCPServer.
     * @param {Object} config - Configuration object for the MCP server.
     */
    constructor() {
        super();
        this.client = new APIClientFactory().getAPIClient(Utils.getEnvironment().label).client;
        // eslint-disable-next-line no-underscore-dangle
        this._requestMetaData = Resource._requestMetaData;
    }

    /**
     * Get all MCP servers.
     * @param {*} params - Query parameters for the API request.
     * @param {*} callback - Optional callback function to handle the response.
     * @returns {Promise} - Promise resolving to the API response.
     */
    getAllMCPServers(params = {}, callback = null) {
        const promise = this.client.then((client) => {
            return client.apis['MCP Servers'].getAllMCPServers(params, this._requestMetaData());
        });
        if (callback) {
            return promise.then(callback);
        } else {
            return promise;
        }
    }

    /**
     * Get MCP server by ID.
     * @param {string} id - The ID of the MCP server.
     * @param {*} callback - Optional callback function to handle the response.
     * @returns {Promise} - Promise resolving to the API response.
     */
    getMCPServerById(id, callback = null) {
        const promise = this.client.then((client) => {
            return client.apis['MCP Servers'].getMCPServer({ mcpServerId: id }, this._requestMetaData());
        });
        if (callback) {
            return promise.then(callback);
        } else {
            return promise;
        }
    }

    /**
     * Get all comments of a MCP server.
     * @param {*} mcpServerId - The ID of the MCP server.
     * @param {*} limit - The maximum number of comments to retrieve.
     * @param {*} offset - The offset for pagination.
     * @returns {Promise} - Promise resolving to the API response.
     */
    getAllComments(mcpServerId, limit, offset) {
        const promise = this.client.then((client) => {
            return client.apis.Comments.getAllCommentsOfMCPServer(
                { mcpServerId, limit, offset },
                this._requestMetaData(),
            );
        });
        return promise;
    }

    /**
     * Add a comment to a MCP server.
     * @param {string} mcpServerId - The ID of the MCP server.
     * @param {string} comment - The comment to add.
     * @param {string} replyTo - The ID of the comment to reply to.
     * @returns {Promise} - Promise resolving to the API response.
     */
    addComment(mcpServerId, comment, replyTo) {
        const promise = this.client.then((client) => {
            const payload = { mcpServerId, replyTo };
            return client.apis.Comments.addCommentToMCPServer(
                payload,
                { requestBody: comment },
                this._requestMetaData(),
            );
        });
        return promise;
    }

    /**
     * Delete a comment from a MCP server.
     * @param {string} mcpServerId - The ID of the MCP server.
     * @param {string} commentId - The ID of the comment to delete.
     * @returns {Promise} - Promise resolving to the API response.
     */
    deleteComment(mcpServerId, commentId) {
        const promise = this.client.then((client) => {
            return client.apis.Comments.deleteCommentOfMCPServer(
                { mcpServerId, commentId },
                this._requestMetaData(),
            );
        });
        return promise;
    }

    /**
     * Update a comment on a MCP server.
     * @param {string} mcpServerId - The ID of the MCP server.
     * @param {string} commentId - The ID of the comment to update.
     * @param {string} commentInfo - The updated comment information.
     * @param {*} callback - Optional callback function to handle the response.
     * @returns {Promise} - Promise resolving to the API response.
     */
    updateComment(mcpServerId, commentId, commentInfo, callback = null) {
        const promise = this.client.then((client) => {
            return client.apis.Comments.editCommentOfMCPServer(
                { mcpServerId, commentId, body: commentInfo },
                this._requestMetaData(),
            );
        });
        if (callback) {
            return promise.then(callback);
        } else {
            return promise;
        }
    }

    /**
     * Get all replies to a comment on a MCP server.
     * @param {string} mcpServerId - The ID of the MCP server.
     * @param {string} commentId - The ID of the comment.
     * @param {number} limit - The maximum number of replies to retrieve.
     * @param {number} offset - The offset for pagination.
     * @returns {Promise} - Promise resolving to the API response.
     */
    getAllCommentReplies(mcpServerId, commentId, limit, offset) {
        const promise = this.client.then((client) => {
            return client.apis.Comments.getRepliesOfCommentOfMCPServer({
                mcpServerId, commentId, limit, offset,
            }, this._requestMetaData());
        });
        return promise;
    }

    /**
     * Get subscription throttling policies for a MCP server.
     * @param {string} mcpServerId - The ID of the MCP server.
     * @param {*} callback - Optional callback function to handle the response.
     * @returns {Promise} - Promise resolving to the API response.
     */
    getSubscriptionThrottlingPolicies(mcpServerId, callback = null) {
        const promise = this.client.then((client) => {
            return client.apis['MCP Servers'].getMCPServerSubscriptionPolicies(
                { mcpServerId },
                this._requestMetaData(),
            );
        });
        if (callback) {
            return promise.then(callback);
        } else {
            return promise;
        }
    }

    /**
     * Get the thumbnail of a MCP server.
     * @param {string} mcpServerId - The ID of the MCP server.
     * @returns {Promise} - Promise resolving to the API response.
     */
    getMCPServerThumbnail(mcpServerId) {
        const promise = this.client.then((client) => {
            return client.apis['MCP Servers'].getMCPServerThumbnail(
                { mcpServerId },
                this._requestMetaData(),
            );
        });
        return promise;
    }

    /**
     * Get the ratings of a MCP server.
     * @param {string} mcpServerId - The ID of the MCP server.
     * @param {number} limit - The maximum number of ratings to retrieve.
     * @param {number} offset - The offset for pagination.
     * @returns {Promise} - Promise resolving to the API response.
     */
    getMCPServerRatings(mcpServerId, limit, offset) {
        const promise = this.client.then((client) => {
            return client.apis.Ratings.getMCPServerRatings(
                { mcpServerId, limit, offset },
                this._requestMetaData(),
            );
        });
        return promise;
    }

    /**
     * Get the rating from a user for a MCP server.
     * @param {string} mcpServerId - The ID of the MCP server.
     * @returns {Promise} - Promise resolving to the API response.
     */
    getRatingFromUser(mcpServerId) {
        const promise = this.client.then((client) => {
            return client.apis.Ratings.getMCPServerRatings(
                { mcpServerId },
                this._requestMetaData(),
            );
        });
        return promise;
    }

    /**
     * Add a rating to a MCP server.
     * @param {string} mcpServerId - The ID of the MCP server.
     * @param {number} rating - The rating to add.
     * @returns {Promise} - Promise resolving to the API response.
     */
    addRating(mcpServerId, rating) {
        const promise = this.client.then((client) => {
            return client.apis.Ratings.addMCPServerRating(
                { mcpServerId },
                { requestBody: rating },
                this._requestMetaData(),
            );
        });
        return promise;
    }

    /**
     * Remove rating details from a MCP server.
     * @param {string} mcpServerId - The ID of the MCP server.
     * @returns {Promise} - Promise resolving to the API response.
     */
    removeRatingOfUser(mcpServerId) {
        const promise = this.client.then((client) => {
            return client.apis.Ratings.deleteMCPServerRating(
                { mcpServerId },
                this._requestMetaData(),
            );
        });
        return promise;
    }

    /**
     * Get documents for a MCP server.
     * @param {string} mcpServerId - The ID of the MCP server.
     * @param {*} callback - Optional callback function to handle the response.
     * @returns {Promise} - Promise resolving to the API response.
     */
    getDocuments(mcpServerId, callback = null) {
        const promise = this.client.then((client) => {
            return client.apis['MCP Server Documents'].getMCPServerDocuments(
                { mcpServerId },
                this._requestMetaData(),
            );
        });
        if (callback) {
            return promise.then(callback);
        } else {
            return promise;
        }
    }

    /**
     * Get a document by its ID for a MCP server.
     * @param {string} mcpServerId - The ID of the MCP server.
     * @param {string} documentId - The ID of the document.
     * @returns {Promise} - Promise resolving to the API response.
     */
    getDocumentByDocId(mcpServerId, documentId) {
        const promise = this.client.then((client) => {
            return client.apis['MCP Server Documents'].getMCPServerDocument(
                { mcpServerId, documentId },
                this._requestMetaData(),
            );
        });
        return promise;
    }

    /**
     * Get the file for a document for a MCP server.
     * @param {*} mcpServerId - The ID of the MCP server.
     * @param {*} documentId - The ID of the document.
     * @returns {Promise} - Promise resolving to the API response.
     */
    getFileForDocument(mcpServerId, documentId) {
        const promise = this.client.then((client) => {
            return client.apis['MCP Server Documents'].getMCPServerDocumentFile(
                { mcpServerId, documentId },
                this._requestMetaData(),
            );
        });
        return promise;
    }

    /**
     * Get the inline content of a document for a MCP server.
     * @param {string} mcpServerId - The ID of the MCP server.
     * @param {string} documentId - The ID of the document.
     * @returns {Promise} - Promise resolving to the API response.
     */
    getInlineContentOfDocument(mcpServerId, documentId) {
        const promise = this.client.then((client) => {
            return client.apis['MCP Server Documents'].getMCPServerDocumentContent(
                {
                    mcpServerId,
                    documentId,
                    Accept: 'application/octet-stream',
                },
                this._requestMetaData({
                    'Content-Type': 'multipart/form-data',
                }),
            );
        });
        return promise;
    }
}
