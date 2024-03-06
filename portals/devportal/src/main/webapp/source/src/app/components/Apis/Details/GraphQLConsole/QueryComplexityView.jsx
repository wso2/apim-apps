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

import React, { useState, useEffect, useContext } from 'react';
import { styled } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Divider from '@mui/material/Divider';
import { ApiContext } from '../ApiContext';
import Api from '../../../../data/api';
import Progress from '../../../Shared/Progress';

const PREFIX = 'QueryComplexityView';

const classes = {
    root: `${PREFIX}-root`,
    title: `${PREFIX}-title`,
    heading: `${PREFIX}-heading`,
    column: `${PREFIX}-column`,
    row: `${PREFIX}-row`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`& .${classes.root}`]: {
        width: '100%',
    },

    [`& .${classes.title}`]: {
        fontSize: theme.typography.pxToRem(29),
        fontWeight: 'bold',
        flexBasis: '50%',
        flexShrink: 0,
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(2),
        marginRight: theme.spacing(1),
    },

    [`& .${classes.heading}`]: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
        flexBasis: '50%',
        flexShrink: 0,
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },

}));

const StyledAccordionDetails = styled(AccordionDetails)((
    {
        theme,
    },
) => ({

    [`& .${classes.column}`]: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
        flexBasis: '33.33%',
        marginLeft: theme.spacing(1),
    },

    [`& .${classes.row}`]: {
        display: 'flex',
    },
}));

/**
 * This component retrieve complexity details of API
 * @param {*} props The props passed to the layout
 */
export default function QueryComplexityView() {
    const { api } = useContext(ApiContext);
    const [typelist, setTypeList] = useState([]);
    const [state, setState] = useState(null);

    const useThemeDetector = () => {
        const getCurrentTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
        const [isDarkTheme, setIsDarkTheme] = useState(getCurrentTheme());
        const mqListener = ((e) => {
            setIsDarkTheme(e.matches);
        });

        useEffect(() => {
            const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
            darkThemeMq.addEventListener('change', mqListener);
            return () => darkThemeMq.removeEventListener('change', mqListener);
        }, []);
        return isDarkTheme;
    };

    const isDarkTheme = useThemeDetector();

    /**
     * If no complexity is defined for fields,Get default complexity value of 1.
     */
    function getDefaultComplexity() {
        const apiId = api.id;
        const apiClient = new Api();
        const promisedComplexityType = apiClient.getGraphqlPoliciesComplexityTypes(apiId);
        promisedComplexityType
            .then((res) => {
                const array = [];
                res.typeList.map((respond) => {
                    respond.fieldList.map((ob) => {
                        const obj = {};
                        obj.type = respond.type;
                        obj.field = ob;
                        obj.complexityValue = 1;
                        array.push(obj);
                        return ob;
                    });
                    return array;
                });
                setState(array);
                const type = [...new Set(array.map((respond) => respond.type))];
                setTypeList(type);
            });
    }

    useEffect(() => {
        const apiId = api.id;
        const apiClient = new Api();
        const promisedComplexity = apiClient.getGraphqlPoliciesComplexity(apiId);
        promisedComplexity
            .then((res) => {
                setState(res.list);
                const type = [...new Set(res.list.map((respond) => respond.type))];
                setTypeList(type);
                if (res.list.length === 0) {
                    getDefaultComplexity();
                }
            });
    }, []);

    if (state === null) {
        return <Progress />;
    }
    return (
        <Root>
            <div>
                <div className={classes.title} style={{ display: 'flex', position: 'relative' }}>
                    <div>
                        <FormattedMessage
                            id='Apis.Details.GraphQLConsole.QueryComplexityView.title'
                            defaultMessage='Custom Complexity Values'
                        />
                    </div>
                </div>
                <Divider />
                <div
                    className={classes.root}
                    style={{ maxHeight: '740px', overflow: 'scroll' }}
                >
                    <div>
                        {typelist.map((res) => (
                            <Accordion
                                sx={{
                                    backgroundColor: isDarkTheme ? '#212a3b' : '#fff',
                                    color: isDarkTheme ? '#b7c2d7' : '#3b4b68',
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon sx={{ color: isDarkTheme ? '#b7c2d7' : '#3b4b68' }} />}
                                    aria-controls='panel1a-content'
                                    id='panel1a-header'
                                >
                                    <Typography className={classes.heading}>
                                        {res}
                                    </Typography>
                                </AccordionSummary>
                                <Divider />
                                {state.map((respond) => ((respond.type === res) && (
                                    <StyledAccordionDetails>
                                        <div className={classes.row}>
                                            <div className={classes.column}>
                                                {respond.field}
                                                {':'}
                                            </div>
                                            <div className={classes.column}>
                                                {respond.complexityValue}
                                            </div>
                                        </div>
                                    </StyledAccordionDetails>
                                )))}
                            </Accordion>
                        ))}
                    </div>
                </div>
            </div>
        </Root>
    );
}
