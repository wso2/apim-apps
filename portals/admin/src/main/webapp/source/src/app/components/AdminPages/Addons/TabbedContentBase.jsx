/*
 * Copyright (c) 2026, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';

/**
 * This is a wrapper component around ContentBase used for displaying a tabbed structure.
 * @param {object} props - The component props.
 * @returns {JSX.Element} The rendered tabbed content component.
 */
function TabbedContentBase(props) {
    const {
        title,
        help,
        pageDescription,
        tabs,
        warning,
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
            warning={value === 1 ? warning : null}
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
                            minHeight: 48,
                            backgroundColor: 'grey.200',
                            ml: 0,
                            pl: 0,
                            borderBottom: 'none',
                            '& .MuiTab-root': {
                                minHeight: 48,
                                margin: 0,
                                px: 6,
                                textTransform: 'none',
                                borderTop: 1,
                                borderLeft: 1,
                                borderRight: 1,
                                borderBottom: 1,
                                borderColor: 'divider',
                                borderBottomColor: 'divider',
                                borderTopLeftRadius: 8,
                                borderTopRightRadius: 8,
                                backgroundColor: 'grey.200',
                                color: 'text.secondary',
                                '&.Mui-selected': {
                                    backgroundColor: 'background.paper',
                                    color: 'primary.main',
                                    fontWeight: 600,
                                    borderBottom: 'none',
                                },
                                '&:hover': {
                                    backgroundColor: 'background.paper',
                                },
                            },
                        }}
                    >
                        {tabs.map((tab, index) => (
                            <Tab
                                key={tab.id ?? index}
                                label={tab.label}
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
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            label: PropTypes.node.isRequired,
            content: PropTypes.element.isRequired,
        }),
    ).isRequired,
    warning: PropTypes.node,
};

TabbedContentBase.defaultProps = {
    pageDescription: null,
    warning: null,
};

export default TabbedContentBase;
