/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import ContentBase from './ContentBase';

function TabbedContentBase(props) {
    const {
        title,
        help,
        pageDescription,
        tabs,
    } = props;

    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <ContentBase
            title={title}
            help={help}
            pageDescription={pageDescription}
        >
            <Grid container>

                <Grid item xs={12}>
                    <Tabs
                        variant='standard'
                        indicatorColor='primary'
                        textColor='primary'
                        value={value}
                        onChange={handleChange}
                        sx={{
                            backgroundColor: 'grey.200',
                            minHeight: 48,
                            paddingLeft: 0,
                            '& .MuiTab-root': {
                                minHeight: 48,
                                margin: 0,
                            },
                        }}
                    >
                        {tabs.map((tab) => (
                            <Tab
                                key={tab.id}
                                label={tab.label}
                                sx={{
                                    textTransform: 'none',
                                    px: 3,
                                    minWidth: 'auto',
                                    minHeight: 48,
                                    height: 48,
                                    backgroundColor: 'grey.200',
                                    color: 'text.disabled',
                                    '&.Mui-selected': {
                                        backgroundColor: 'background.paper',
                                        fontWeight: 600,
                                    },
                                    '&:hover': {
                                        backgroundColor: 'background.paper',
                                    },
                                }}
                            />
                        ))}
                    </Tabs>
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ mt: 0 }}>
                        {tabs[value]?.content}
                    </Box>
                </Grid>

            </Grid>
        </ContentBase>
    );
}

TabbedContentBase.propTypes = {
    title: PropTypes.string.isRequired,
    help: PropTypes.element.isRequired,
    pageDescription: PropTypes.string,
    tabs: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            content: PropTypes.element.isRequired,
        }),
    ).isRequired,
    PaperProps: PropTypes.shape({
        elevation: PropTypes.number,
        square: PropTypes.bool,
        sx: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.array,
        ]),
        className: PropTypes.string,
    }),
};

TabbedContentBase.defaultProps = {
    pageDescription: null,
    PaperProps: { elevation: 1 },
};

export default TabbedContentBase;
