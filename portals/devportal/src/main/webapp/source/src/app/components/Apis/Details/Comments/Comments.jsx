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
import React, { Component } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import Paper from '@mui/material/Paper';
import {Typography, useTheme} from '@mui/material';
import Grid from '@mui/material/Grid/Grid';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { FormattedMessage, injectIntl } from 'react-intl';
import CircularProgress from '@mui/material/CircularProgress';
import InlineMessage from 'AppComponents/Shared/InlineMessage';
import withSettings from 'AppComponents/Shared/withSettingsContext';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Comment from './Comment';
import CommentAdd from './CommentAdd';
import API from '../../../../data/api';
import { ApiContext } from '../ApiContext';
import AuthManager from '../../../../data/AuthManager';

const PREFIX = 'CommentsLegacy';

const classes = {
    root: `${PREFIX}-root`,
    paper: `${PREFIX}-paper`,
    contentWrapper: `${PREFIX}-contentWrapper`,
    contentWrapperOverview: `${PREFIX}-contentWrapperOverview`,
    titleSub: `${PREFIX}-titleSub`,
    link: `${PREFIX}-link`,
    verticalSpace: `${PREFIX}-verticalSpace`,
    loadMoreLink: `${PREFIX}-loadMoreLink`,
    genericMessageWrapper: `${PREFIX}-genericMessageWrapper`,
    paperProgress: `${PREFIX}-paperProgress`,
    button: `${PREFIX}-button`
};

const StyledApiContextConsumer = styled(ApiContext.Consumer)((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {
        display: 'flex',
        alignItems: 'center',
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },

    [`& .${classes.paper}`]: {
        marginRight: theme.spacing(3),
        paddingBottom: theme.spacing(3),
        paddingRight: theme.spacing(2),
        '& span, & h5, & label, & td, & li, & div, & input': {
            color: theme.palette.getContrastText(theme.palette.background.paper),
        },
    },

    [`& .${classes.contentWrapper}`]: {
        paddingLeft: theme.spacing(3),
        marginTop: theme.spacing(1),
    },

    [`& .${classes.contentWrapperOverview}`]: {
        width: '100%',
        boxShadow: 'none',
    },

    [`& .${classes.titleSub}`]: {
        cursor: 'pointer',
        color: theme.palette.getContrastText(theme.palette.background.default),
    },

    [`& .${classes.link}`]: {
        color: theme.palette.getContrastText(theme.palette.background.default),
        cursor: 'pointer',
    },

    [`& .${classes.verticalSpace}`]: {
        marginTop: theme.spacing(0.2),
    },

    [`& .${classes.loadMoreLink}`]: {
        textDecoration: 'none',
    },

    [`& .${classes.genericMessageWrapper}`]: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        marginRight: theme.spacing(3),
    },

    [`& .${classes.paperProgress}`]: {
        padding: theme.spacing(3),
        marginTop: theme.spacing(2),
    },

    [`& .${classes.button}`]: {
        textTransform: 'capitalize',
    }
}));

/**
 * Display a comment list
 * @class CommentsLegacy
 * @extends {React.Component}
 */
class CommentsLegacy extends Component {
    static contextType = ApiContext;

    /**
     * Creates an instance of CommentsLegacy
     * @param {*} props properies passed by the parent element
     * @memberof CommentsLegacy
     */
    constructor(props) {
        super(props);
        this.state = {
            expanded: true,
            allComments: null,
            comments: [],
            totalComments: 0,
            apiId: null,
            showCommentAdd: false,
        };
        this.handleExpandClick = this.handleExpandClick.bind(this);
        this.handleLoadMoreComments = this.handleLoadMoreComments.bind(this);
        this.toggleCommentAdd = this.toggleCommentAdd.bind(this);
        this.addComment = this.addComment.bind(this);
        this.updateComment = this.updateComment.bind(this);
        this.onDeleteComment = this.onDeleteComment.bind(this);
        this.isCrossTenant = this.isCrossTenant.bind(this);
    }

    /**
     * Gets all the comments for a particular API, when component mounts
     * @memberof CommentsLegacy
     */
    componentDidMount() {
        let {
            apiId, match, intl, isOverview, setCount,
        } = this.props;
        if (match) apiId = match.params.apiUuid;
        this.setState({ apiId });

        const restApi = new API();
        const limit = this.props.commentsLimit;
        const offset = 0;

        restApi
            .getAllComments(apiId, limit, offset)
            .then((result) => {
                let commentList = result.body.list;
                if (isOverview) {
                    setCount(commentList.length);
                    if (commentList.length > 2) {
                        commentList = commentList.slice(commentList.length - 3, commentList.length);
                    }
                }
                this.setState({
                    allComments: commentList,
                    comments: commentList,
                    totalComments: result.body.pagination.total,
                });
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
            });
    }

    /**
     * Handles loading the previous comments
     * @memberof CommentsLegacy
     */
    handleLoadMoreComments() {
        const { allComments, apiId, comments } = this.state;
        const restApi = new API();
        const limit = this.props.commentsLimit;
        const offset = comments.length;

        restApi
            .getAllComments(apiId, limit, offset)
            .then((result) => {
                const newAllCommentList = allComments.concat(result.body.list);
                this.setState({ allComments: newAllCommentList, comments: newAllCommentList });
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
            });
    }

    /**
     * Handles expanding the comment section
     * @memberof CommentsLegacy
     */
    handleExpandClick() {
        const { expanded } = this.state;
        this.setState({ expanded: !expanded });
    }

    /**
     * Add comment to the comment list
     * @param {any} comment added comment
     * @memberof CommentsLegacy
     */
    addComment(comment) {
        const { totalComments, allComments } = this.state;
        const newTotal = totalComments + 1;

        this.setState({
            allComments: [comment, ...allComments],
            totalComments: newTotal,
            comments: [comment, ...allComments],
        });
    }

    /**
     * Update a specific comment in the comment list
     * @param {any} comment updated comment
     * @memberof CommentsLegacy
     */
    updateComment(comment) {
        const { comments } = this.state;

        const newComments = comments.reduce((acc, cur) => {
            let temp = cur;
            if (cur.id === comment.id) {
                temp = comment;
            }
            return [...acc, temp];
        }, []);
        this.setState({
            allComments: newComments,
            comments: newComments,
        });
    }

    /**
     * Delete a comment
     * @param {string} commentIdOfCommentToDelete id of deleted commetn
     * @memberof CommentsLegacy
     */
    onDeleteComment(commentIdOfCommentToDelete) {
        const {
            apiId, comments, totalComments,
        } = this.state;

        const remainingComments = comments.filter((item) => item.id !== commentIdOfCommentToDelete);
        const newTotal = totalComments - 1;

        if (newTotal > remainingComments.length) {
            const restApi = new API();

            restApi
                .getAllComments(apiId, 1, remainingComments.length)
                .then((result) => {
                    if (result.body) {
                        this.setState({
                            totalComments: newTotal,
                            comments: [...remainingComments, ...result.body.list],
                            allComments: [...remainingComments, ...result.body.list],
                        });
                    }
                })
                .catch((error) => {
                    if (process.env.NODE_ENV !== 'production') {
                        console.log(error);
                    }
                });
        } else {
            this.setState({
                totalComments: newTotal,
                comments: remainingComments,
                allComments: remainingComments,
            });
        }
    }

    /**
     * Method to compare the tenant domains
     * @param {*} advertiseInfo advertiseInfo object for the API
     * @param {*} currentUser current logged in user
     * @returns {boolean} true or false
     */
    isCrossTenant(currentUser, tenantDomain) {
        if (!tenantDomain) {
            return false;
        }
        let loggedInUserDomain = null;
        const loggedInUser = currentUser.name;

        if (loggedInUser.includes('@')) {
            const splitLoggedInUser = loggedInUser.split('@');
            loggedInUserDomain = splitLoggedInUser[splitLoggedInUser.length - 1];
        } else {
            loggedInUserDomain = 'carbon.super';
        }

        if (tenantDomain !== loggedInUserDomain) {
            return true;
        } else {
            return false;
        }
    }

    toggleCommentAdd() {
        this.setState((prevState) => ({ showCommentAdd: !prevState.showCommentAdd }));
    }

    /**
     * Render method of the component
     * @returns {React.Component} Comment html component
     * @memberof CommentsLegacy
     */
    render() {
        const { isOverview, tenantDomain } = this.props;
        const {
            comments, allComments, totalComments, showCommentAdd,
        } = this.state;
        const isCrossTenantUser = AuthManager.getUser() && this.isCrossTenant(AuthManager.getUser(), tenantDomain);
        return (
            <StyledApiContextConsumer>
                {({ api }) => (
                    <Box
                        sx={(theme) => ({
                            paddingLeft: isOverview ? null : theme.spacing(3),
                            marginTop: isOverview ? null : theme.spacing(3),
                            width: isOverview ? '100%' : null,
                            boxShadow: isOverview ? 'none' : null,
                        })}
                    >
                        {!isOverview && (
                            <div className={classes.root}>
                                <Typography variant='h4' component='h2' className={classes.titleSub}>
                                    {totalComments + (' ')}
                                    <FormattedMessage id='Apis.Details.Comments.title' defaultMessage='Comments' />
                                </Typography>
                            </div>
                        )}

                        {!isCrossTenantUser && AuthManager.getUser() &&(
                            <Box mt={2} ml={1}>
                                {!showCommentAdd && (
                                    <Button
                                        color='primary'
                                        size='small'
                                        className={classes.button}
                                        startIcon={<AddCircleOutlineIcon />}
                                        onClick={this.toggleCommentAdd}
                                    >
                                        <FormattedMessage
                                            id='Apis.Details.Comments.write.a.new.comment'
                                            defaultMessage='Write a New Comment'
                                        />
                                    </Button>
                                )}
                                {showCommentAdd && (
                                    <CommentAdd
                                        apiId={api.id}
                                        commentsUpdate={this.addComment}
                                        addComment={this.addComment}
                                        allComments={allComments}
                                        replyTo={null}
                                        cancelCallback={this.toggleCommentAdd}
                                        cancelButton
                                    />
                                )}
                            </Box>
                        )}
                        {!allComments && (
                            <Paper className={classes.paperProgress}>
                                <CircularProgress size={24} />
                            </Paper>
                        )}
                        {allComments && totalComments === 0
                            && (
                                <Box mt={2} mb={2} ml={1}>
                                    <InlineMessage
                                        type='info'
                                        title={(
                                            <FormattedMessage
                                                id='Apis.Details.Comments.no.comments'
                                                defaultMessage='No Comments Yet'
                                            />
                                        )}
                                    >
                                        <Typography component='p'>
                                            <FormattedMessage
                                                id='Apis.Details.Comments.no.comments.content'
                                                defaultMessage='No comments available for this API yet'
                                            />
                                        </Typography>
                                    </InlineMessage>
                                </Box>
                            )}
                        <Comment
                            comments={comments}
                            isCrossTenantUser={isCrossTenantUser}
                            apiId={api.id}
                            allComments={allComments}
                            onDeleteComment={this.onDeleteComment}
                            updateComment={this.updateComment}
                        />
                        {totalComments > comments.length && (
                            <div className={classes.contentWrapper}>
                                <Grid container spacing={4} className={classes.root}>
                                    <Grid item>
                                        <Typography className={classes.verticalSpace} variant='body1'>
                                            <a
                                                className={classes.link + ' ' + classes.loadMoreLink}
                                                onClick={this.handleLoadMoreComments}
                                            >
                                                <FormattedMessage
                                                    id='Apis.Details.Comments.load.previous.comments'
                                                    defaultMessage='Show More'
                                                />
                                            </a>
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography className={classes.verticalSpace} variant='body1'>
                                            {'(' + comments.length + ' of ' + totalComments + ')'}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </div>
                        )}
                    </Box>
                )}
            </StyledApiContextConsumer>
        );
    }
}

CommentsLegacy.defaultProps = {
    setCount: () => { },
};
CommentsLegacy.propTypes = {
    classes: PropTypes.instanceOf(Object).isRequired,
    setCount: PropTypes.func,
};

function Comments(props) {
    const { apiId, match, intl, isOverview, setCount, tenantDomain } = props;
    const theme = useTheme();
    return (
        <CommentsLegacy
            apiId={apiId}
            match={match}
            intl={intl}
            isOverview={isOverview}
            setCount={setCount}
            tenantDomain={tenantDomain}
            commentsLimit={theme.custom.commentsLimit}
        />
    );
}

export default injectIntl((withSettings(Comments)));
