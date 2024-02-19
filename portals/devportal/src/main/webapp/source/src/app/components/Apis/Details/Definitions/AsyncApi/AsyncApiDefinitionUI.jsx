/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import AsyncApiComponent from '@asyncapi/react-component';
import "@asyncapi/react-component/styles/default.css";
import { FormattedMessage, injectIntl } from 'react-intl';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import { ApiContext } from '../../ApiContext';
import Box from '@mui/material/Box';

const PREFIX = 'AsyncApiDefinitionUI';

const classes = {
    titleSub: `${PREFIX}-titleSub`,
    editorPane: `${PREFIX}-editorPane`,
    editorRoot: `${PREFIX}-editorRoot`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.titleSub}`]: {
        marginLeft: theme.spacing(3),
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        color: theme.palette.getContrastText(theme.palette.background.default),
    },

    [`& .${classes.editorPane}`]: {
        width: '100%',
        maxHeight: '100vh',
        minHeight: '100vh',
        overflow: 'auto',
    },

    [`& .${classes.editorRoot}`]: {
        height: '100%',
    }
}));


class AsyncApiDefinitionUI extends Component {
    static contextType = ApiContext;

    constructor(props) {
        super(props);
    }

    render() {
        // Avoid rendering the 'servers' portion from the AsyncAPI definition.
        const asyncApiDefinition = JSON.parse(this.context.api.apiDefinition);
        delete asyncApiDefinition.servers;
        return (
            <Root>
                <Typography variant='h4' className={classes.titleSub}>
                    <FormattedMessage
                        id='Apis.Details.Async.Definition.title'
                        defaultMessage='AsyncAPI Specification'
                    />
                </Typography>
                <Grid container spacing={1} className={classes.editorRoot}>
                    <Grid item className={classes.editorPane}>
                        <Box maxWidth={1250}>
                            <AsyncApiComponent schema={JSON.stringify(asyncApiDefinition)} />
                        </Box>

                    </Grid>
                </Grid>
            </Root>
        );
    }
}

AsyncApiDefinitionUI.propTypes = {
    classes: PropTypes.instanceOf(Object).isRequired,
};

export default injectIntl((AsyncApiDefinitionUI));
