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
import React from 'react';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import cloneDeep from 'lodash.clonedeep';
import AddEditAdditionalHeaders from 'AppComponents/Apis/Details/GraphQLConsole/AddEditAdditionalHeaders';
import DeleteHeader from 'AppComponents/Apis/Details/GraphQLConsole/DeleteHeader';
import Divider from '@mui/material/Divider';

const PREFIX = 'AdditionalHeaders';

const classes = {
    root: `${PREFIX}-root`,
    heading: `${PREFIX}-heading`,
    secondaryHeading: `${PREFIX}-secondaryHeading`,
    table: `${PREFIX}-table`,
    expandContentRoot: `${PREFIX}-expandContentRoot`,
    subsubTitle: `${PREFIX}-subsubTitle`,
    alert: `${PREFIX}-alert`,
    hr: `${PREFIX}-hr`,
    descriptionBox: `${PREFIX}-descriptionBox`,
};

const Root = styled('div')((
    {
        theme,
    },
) => ({
    [`&.${classes.root}`]: {
        width: '100%',
        marginBottom: 20,
    },

    [`& .${classes.heading}`]: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
        flex: 1,
        alignItems: 'center',
    },

    [`& .${classes.secondaryHeading}`]: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
        display: 'flex',
        alignItems: 'center',
    },

    [`& .${classes.table}`]: {
        marginBottom: 40,
        background: '#efefef',
        '& th': {
            background: '#ccc',
        },
    },

    [`& .${classes.expandContentRoot}`]: {
        flexDirection: 'column',
    },

    [`& .${classes.subsubTitle}`]: {
        fontSize: '0.81rem',
    },

    [`& .${classes.alert}`]: {
        flex: 1,
    },

    [`& .${classes.hr}`]: {
        border: 'solid 1px #efefef',
        width: '100%',
    },

    [`& .${classes.descriptionBox}`]: {
        marginLeft: theme.spacing(1),
    },
}));

/**
 * Create UUID
 * @returns {string} random uuid string.
 */
function getUUID() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
/**
 * Render a list
 * @returns {JSX} Header AppBar components.
 * @param {JSON} props Provides props from parent
 */
function AdditionalHeaders(props) {
    const { additionalHeaders, setAdditionalHeaders } = props;
    const [expanded, setExpanded] = React.useState(false);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };
    const getNewItem = () => {
        return ({
            id: '',
            name: '',
            value: '',
        });
    };

    const addItem = (item) => {
        const { name, value } = item;
        const newItem = getNewItem();
        newItem.id = getUUID();
        newItem.name = name;
        newItem.value = value;
        const updatedAdditionalHeaders = cloneDeep(additionalHeaders);
        updatedAdditionalHeaders.push(newItem);
        setAdditionalHeaders(updatedAdditionalHeaders);
    };

    const deleteItem = (item) => {
        const updatedAdditionalHeaders = cloneDeep(additionalHeaders);
        for (let i = 0; i < updatedAdditionalHeaders.length; i++) {
            if (updatedAdditionalHeaders[i].id === item.id) {
                updatedAdditionalHeaders.splice(i, 1);
            }
        }
        setAdditionalHeaders(updatedAdditionalHeaders);
    };

    const updateItem = (item, originalItem) => {
        const { name, value } = item;
        const updatedAdditionalHeaders = cloneDeep(additionalHeaders);
        for (let i = 0; i < updatedAdditionalHeaders.length; i++) {
            if (updatedAdditionalHeaders[i].id === originalItem.id) {
                updatedAdditionalHeaders[i].name = name;
                updatedAdditionalHeaders[i].value = value;
            }
        }
        setAdditionalHeaders(updatedAdditionalHeaders);
    };

    return (
        <Root className={classes.root}>
            <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls='panel1bh-content'
                    id='panel1bh-header'
                >
                    <div className={classes.heading}>
                        {!expanded && (
                            <Typography variant='caption'>
                                Add additional headers
                            </Typography>
                        )}
                    </div>
                    {!expanded && (
                        <Typography className={classes.secondaryHeading}>
                            Expand to edit
                        </Typography>
                    )}
                    {expanded && (
                        <Typography className={classes.secondaryHeading}>
                            Hide group
                        </Typography>
                    )}
                </AccordionSummary>
                <AccordionDetails classes={{ root: classes.expandContentRoot }}>
                    <>
                        <Divider sx={{ opacity: 0.2 }} className={classes.customDivider} />
                        <Box component='div' marginLeft={1} display='flex' alignItems='center'>
                            <Box flex={1}>
                                <Typography variant='caption'>
                                    <FormattedMessage
                                        id='GraphQL.Devportal.Tryout.Addtional.headers.help'
                                        defaultMessage='This configuration is used to add additional Headers.'
                                    />
                                </Typography>
                            </Box>
                            <Box component='span' m={1}>
                                <AddEditAdditionalHeaders
                                    callBack={addItem}
                                />

                            </Box>
                        </Box>

                        {additionalHeaders && (
                            <Box component='div' marginLeft={1}>
                                <Table className={classes.table} size='small' aria-label='a dense table'>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>
                                                <>
                                                    <FormattedMessage
                                                        id='GraphQL.Devportal.Tryout.Additional.headers.header.name'
                                                        defaultMessage='Header Name'
                                                    />
                                                </>
                                            </TableCell>
                                            <TableCell>
                                                <>
                                                    <FormattedMessage
                                                        id='GraphQL.Devportal.Tryout.Additional.headers.header.value'
                                                        defaultMessage='Header Value'
                                                    />
                                                </>
                                            </TableCell>
                                            <TableCell />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {additionalHeaders.map((item) => (
                                            <TableRow key={item.headerName}>
                                                <TableCell component='td' scope='row'>
                                                    {item.name}
                                                </TableCell>
                                                <TableCell component='td' scope='row'>
                                                    {item.value }
                                                </TableCell>
                                                <TableCell width={100} className={classes.actionColumn}>
                                                    <Box display='flex'>
                                                        <AddEditAdditionalHeaders
                                                            item={item}
                                                            callBack={updateItem}
                                                        />
                                                        <DeleteHeader
                                                            item={item}
                                                            callBack={deleteItem}
                                                        />
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        )}
                    </>
                    <Divider />
                </AccordionDetails>
            </Accordion>
        </Root>
    );
}
AdditionalHeaders.propTypes = {
    dataRow: PropTypes.shape({
        id: PropTypes.number.isRequired,
    }).isRequired,
    additionalHeaders: PropTypes.shape({
        array: PropTypes.arrayOf(PropTypes.element).isRequired,
    }).isRequired,
};
export default AdditionalHeaders;
