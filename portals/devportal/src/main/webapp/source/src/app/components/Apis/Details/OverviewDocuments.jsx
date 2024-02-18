/* eslint-disable react/prop-types */
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
import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Icon from '@mui/material/Icon';
import { FormattedMessage, useIntl } from 'react-intl';
import API from 'AppData/api';
import Alert from 'AppComponents/Shared/Alert';

const PREFIX = 'OverviewDocuments';

const classes = {
    root: `${PREFIX}-root`,
    iconClass: `${PREFIX}-iconClass`,
    boxBadge: `${PREFIX}-boxBadge`,
    subscriptionBox: `${PREFIX}-subscriptionBox`,
    linkStyle: `${PREFIX}-linkStyle`,
    subscriptionTop: `${PREFIX}-subscriptionTop`,
    resourceWrapper: `${PREFIX}-resourceWrapper`,
    actionPanel: `${PREFIX}-actionPanel`,
    linkToTest: `${PREFIX}-linkToTest`,
    emptyBox: `${PREFIX}-emptyBox`,
    listWrapper: `${PREFIX}-listWrapper`,
    listItemStyle: `${PREFIX}-listItemStyle`,
    listItemIcon: `${PREFIX}-listItemIcon`,
    listItemPrimary: `${PREFIX}-listItemPrimary`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`& .${classes.root}`]: {
        padding: theme.spacing(3),
        maxWidth: theme.custom.contentAreaWidth,
    },

    [`& .${classes.iconClass}`]: {
        marginRight: 10,
        color: theme.palette.secondary.main,
    },

    [`& .${classes.boxBadge}`]: {
        background: theme.palette.grey.A400,
        color: theme.palette.getContrastText(theme.palette.grey.A400),
        fontSize: theme.typography.h5.fontSize,
        padding: theme.spacing(1),
        width: 30,
        height: 30,
        marginRight: 20,
        textAlign: 'center',
    },

    [`& .${classes.subscriptionBox}`]: {
        paddingLeft: theme.spacing(2),
    },

    [`& .${classes.linkStyle}`]: {
        color: theme.palette.getContrastText(theme.palette.background.default),
        fontSize: theme.typography.fontSize,
    },

    [`& .${classes.subscriptionTop}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },

    [`& .${classes.resourceWrapper}`]: {
        height: 192,
        overflow: 'auto',
    },

    [`& .${classes.actionPanel}`]: {
        justifyContent: 'flex-start',
    },

    [`& .${classes.linkToTest}`]: {
        textDecoration: 'none',
    },

    [`& .${classes.emptyBox}`]: {
        background: '#ffffff55',
        color: '#444',
        border: 'solid 1px #fff',
        padding: theme.spacing(2),
        marginTop: 50,
    },

    [`& .${classes.listWrapper}`]: {
        padding: 0,
        margin: 0,
        width: '100%',
    },

    [`& .${classes.listItemStyle}`]: {
        padding: 0,
        margin: 0,
    },

    [`& .${classes.listItemIcon}`]: {
        minWidth: 30,
        color: '#BBBEBC66',
    },

    [`& .${classes.listItemPrimary}`]: {
        fontSize: '14px',
    },
}));

/**
 * Add two numbers.
 * @param {number} props The second number.
 * @returns {JSX} jsx.
 */
function OverviewDocuments(props) {
    const [docs, setDocs] = useState([]);
    const intl = useIntl();
    const { apiId } = props;
    const history = useHistory();
    useEffect(() => {
        const restApi = new API();
        const promisedApi = restApi.getDocumentsByAPIId(apiId);
        promisedApi
            .then((response) => {
                if (response.obj.list.length > 0) {
                    // Rearanging the response to group them by the sourceType property.
                    setDocs(response.obj.list);
                }
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
                const { status } = error;
                if (status === 404) {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Details.Overview.documents.error.occurred',
                        defaultMessage: 'Error occurred',
                    }));
                }
            });
    }, []);

    const gotoDoc = (documentId) => {
        history.push('/apis/' + apiId + '/documents/' + documentId);
    };
    /**
     *
     *
     * @returns
     * @memberof Overview
     */

    if (docs.length === 0) {
        return (
            <Root>
                <Grid container className={classes.root} spacing={2}>
                    <Grid item xs={12}>
                        <div className={classes.emptyBox}>
                            <Typography variant='body2'>
                                <FormattedMessage
                                    id='Apis.Details.Overview.documents.no.content'
                                    defaultMessage='No Documents Available'
                                />
                            </Typography>
                        </div>
                    </Grid>
                </Grid>
            </Root>
        );
    }

    return (
        docs.length > 0 && (
            <Root>
                <List
                    component='nav'
                    aria-label='Available document list'
                    className={classes.listWrapper}
                >
                    {docs.map((doc, index) => (
                        index <= 1
                        && (
                            <ListItem button onClick={() => gotoDoc(doc.documentId)} className={classes.listItemStyle} key={doc.name}>
                                <ListItemIcon classes={{ root: classes.listItemIcon }}>
                                    <Icon>insert_drive_file</Icon>
                                </ListItemIcon>
                                <ListItemText
                                    primary={doc.name}
                                    // secondary={truncateString(100, doc.summary)}
                                    classes={{ primary: classes.listItemPrimary }}
                                />
                            </ListItem>
                        )
                    ))}
                </List>
            </Root>
        )
    );
}

OverviewDocuments.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    theme: PropTypes.shape({}).isRequired,
};

export default (OverviewDocuments);
