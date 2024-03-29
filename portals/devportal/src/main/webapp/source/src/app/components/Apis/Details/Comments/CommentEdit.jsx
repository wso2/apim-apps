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
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, } from 'react-intl';
import {TextField, Button, Typography, useTheme} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Grid';
import Alert from '../../../Shared/Alert';
import API from '../../../../data/api';

const PREFIX = 'CommentEditLegacy';

const classes = {
    textField: `${PREFIX}-textField`,
    contentWrapper: `${PREFIX}-contentWrapper`,
    category: `${PREFIX}-category`
};

const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.textField}`]: {
        marginTop: 0,
        width: '87.5%',
    },

    [`& .${classes.contentWrapper}`]: {
        maxWidth: theme.custom.contentAreaWidth,
        paddingLeft: theme.spacing(2),
        paddingTop: theme.spacing.unig,
        marginTop: theme.spacing(2),
    },

    [`& .${classes.category}`]: {
        width: '12%',
        marginRight: '0.5%',
    }
}));

/**
 * Display a component to edit a comment
 * @class CommmentEdit
 * @extends {React.Component}
 */
class CommentEditLegacy extends React.Component {
    /**
     * Creates an instance of CommentEditLegacy
     * @param {*} props properies passed by the parent element
     * @memberof CommentEditLegacy
     */
    constructor(props) {
        super(props);
        this.state = {
            commentText: '',
            category: '',
            currentLength: 0,
        };
        this.inputChange = this.inputChange.bind(this);
        this.handleCategoryChange = this.handleCategoryChange.bind(this);
        this.handleClickUpdateComment = this.handleClickUpdateComment.bind(this);
        this.handleClickCancel = this.handleClickCancel.bind(this);
        this.filterCommentToUpdate = this.filterCommentToUpdate.bind(this);
        this.filterCommentToUpdateReply = this.filterCommentToUpdateReply.bind(this);
    }

    /**
     * @memberof Comments
     */
    componentDidMount() {
        const { comment } = this.props;
        this.setState({
            commentText: comment.commentText,
            category: comment.category,
            currentLength: comment.commentText.length,
        });
    }

    /**
     * Handles the comment text when input changes
     * @param {Object} {target} target element
     * @memberof CommentEditLegacy
     */
    inputChange({ target }) {
        this.setState({ commentText: target.value, currentLength: target.value.length });
    }

    /**
     * Hides the component to edit a comment when cancelled
     * @memberof CommentEditLegacy
     */
    handleClickCancel() {
        const { toggleShowEdit, commentsUpdate, allComments } = this.props;
        toggleShowEdit();
        commentsUpdate(allComments);
    }

    /**
     * Handles category when the category is changed
     * @param {any} event Drop down select event
     * @memberof CommentEditLegacy
     */
    handleCategoryChange(event) {
        this.setState({ category: event.target.value });
    }

    /**
     * Filters the comment to update
     * @memberof CommentAdd
     */
    filterCommentToUpdate(commentToFilter) {
        const { comment } = this.props;
        return commentToFilter.commentId === comment.commentId;
    }

    /**
     * Filters the comment to update
     * @memberof CommentAdd
     */
    filterCommentToUpdateReply(commentToFilter) {
        const { comment } = this.props;
        return commentToFilter.commentId === comment.parentCommentId;
    }

    /**
     * Handles updating a comment
     * @memberof CommentEditLegacy
     */
    handleClickUpdateComment() {
        const {
            apiId, comment, allComments, toggleShowEdit, commentsUpdate, intl,
        } = this.props;
        const { category, commentText } = this.state;
        const Api = new API();
        const commentToEdit = comment;
        commentToEdit.commentText = commentText.trim();
        commentToEdit.category = category;

        // to check whether a string does not contain only whitehis spaces
        if (comment.commentText.replace(/\s/g, '').length) {
            Api.updateComment(apiId, commentToEdit.commentId, commentToEdit)
                .then((result) => {
                    const updatedComment = result.body;
                    if (commentToEdit.parentCommentId === undefined) {
                        const index = allComments.findIndex(this.filterCommentToUpdate);
                        allComments[index].category = updatedComment.category;
                        allComments[index].commentText = updatedComment.commentText;
                    } else {
                        const index = allComments.findIndex(this.filterCommentToUpdateReply);
                        const replyIndex = allComments[index].replies.findIndex(this.filterCommentToUpdate);
                        allComments[index].replies[replyIndex] = updatedComment;
                    }
                    toggleShowEdit();
                    commentsUpdate(allComments);
                })
                .catch((error) => {
                    console.error(error);
                    if (error.response) {
                        Alert.error(error.response.body.message);
                    } else {
                        Alert.error(
                            intl.formatMessage({
                                defaultMessage: 'Something went wrong while adding the comment',
                                id: 'Apis.Details.Comments.CommentEdit.something.went.wrong',
                            }),
                        );
                    }
                });
        } else {
            Alert.error(
                intl.formatMessage({
                    defaultMessage: 'You cannot enter a blank comment',
                    id: 'Apis.Details.Comments.CommentEdit.blank.comment.error',
                }),
            );
        }
    }

    /**
     * Render method of the component
     * @returns {React.Component} Comment html component
     * @memberof CommentEditLegacy
     */
    render() {
        const {  theme, intl } = this.props;
        const { category, commentText, currentLength } = this.state;
        return (
            <Root>
                <FormControl variant="standard" className={classes.category}>
                    <Select variant="standard" value={category} onChange={this.handleCategoryChange}>
                        <MenuItem value='General'>
                            <FormattedMessage id='Apis.Details.Comments.CommentEdit.general' defaultMessage='General' />
                        </MenuItem>
                        <MenuItem value='Feature Request'>
                            <FormattedMessage
                                id='Apis.Details.Comments.CommentEdit.feature.request'
                                defaultMessage='Feature Request'
                            />
                        </MenuItem>
                        <MenuItem value='Bug Report'>
                            <FormattedMessage
                                id='Apis.Details.Comments.CommentEdit.bug.report'
                                defaultMessage='Bug Report'
                            />
                        </MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    variant="standard"
                    id='multiline-static'
                    autoFocus
                    multiline
                    className={classes.textField}
                    margin='normal'
                    placeholder={intl.formatMessage({
                        defaultMessage: 'Write a comment',
                        id: 'Apis.Details.Comments.CommentEdit.write.a.comment',
                    })}
                    inputProps={{ maxLength: theme.custom.maxCommentLength }}
                    value={commentText}
                    onChange={this.inputChange}
                />
                <Typography className={classes.commentText} align='right'>
                    {currentLength + '/' + theme.custom.maxCommentLength}
                </Typography>
                <Grid container spacing={1}>
                    <Grid item>
                        <Button variant='contained' color='primary' onClick={() => this.handleClickUpdateComment()}>
                            <FormattedMessage id='Apis.Details.Comments.CommentEdit.btn.save' defaultMessage='Save' />
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button onClick={() => this.handleClickCancel()} className={classes.button}>
                            <FormattedMessage
                                id='Apis.Details.Comments.CommentEdit.btn.cancel'
                                defaultMessage='Cancel'
                            />
                        </Button>
                    </Grid>
                </Grid>
            </Root>
        );
    }
}

CommentEditLegacy.defaultProps = {
    commentsUpdate: null,
};

CommentEditLegacy.propTypes = {
    classes: PropTypes.instanceOf(Object).isRequired,
    apiId: PropTypes.string.isRequired,
    allComments: PropTypes.instanceOf(Array).isRequired,
    // todo make commentsUpdate required once comment edit feature is supported
    commentsUpdate: PropTypes.func,
    toggleShowEdit: PropTypes.func.isRequired,
    comment: PropTypes.instanceOf(Object).isRequired,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,
};

function CommentEdit(props) {
    const { comment, toggleShowEdit, commentsUpdate, allComments, apiId, intl } = props;
    const theme = useTheme();
    return (
        <CommentEditLegacy
            comment={comment}
            toggleShowEdit={toggleShowEdit}
            commentsUpdate={commentsUpdate}
            allComments={allComments}
            apiId={apiId}
            intl={intl}
            theme={theme}
        />
    );
}

export default injectIntl((CommentEdit));
