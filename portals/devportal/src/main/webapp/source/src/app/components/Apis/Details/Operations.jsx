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
import Typography from '@mui/material/Typography';
import { FormattedMessage, injectIntl } from 'react-intl';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import PropTypes from 'prop-types';
import Chip from '@mui/material/Chip';
import Api from 'AppData/api';
import { useTheme } from '@mui/material';

const PREFIX = 'Operations';

const classes = {
    root: `${PREFIX}-root`,
    heading: `${PREFIX}-heading`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')({
    [`& .${classes.root}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    [`& .${classes.heading}`]: {
        marginRight: 20,
    },
});

/**
 * @param {JSON} props props from parent
 * @returns {JSX} chip item
 */
function RenderMethod(props) {
    const { method } = props;
    const theme = useTheme();
    let chipColor = theme.custom.operationChipColor
        ? theme.custom.operationChipColor[method]
        : null;
    let chipTextColor = '#000000';
    if (!chipColor) {
        console.log('Check the theme settings. The resourceChipColors is not populated properly');
        chipColor = '#cccccc';
    } else {
        chipTextColor = theme.palette.getContrastText(theme.custom.operationChipColor[method]);
    }
    return <Chip label={method} style={{ backgroundColor: chipColor, color: chipTextColor, height: 20 }} />;
}

RenderMethod.propTypes = {
    theme: PropTypes.shape({}).isRequired,
    method: PropTypes.shape({}).isRequired,
};

/**
 *
 *
 * @class Operations
 * @extends {React.Component}
 */
class Operations extends React.Component {
    /**
     *Creates an instance of Operations.
     * @param {*} props
     * @memberof Operations
     */
    constructor(props) {
        super(props);
        this.state = {
            operations: null,
        };
        this.api = new Api();
    }

    /**
     *
     *
     * @memberof Operations
     */
    componentDidMount() {
        const { api } = this.props;
        this.setState({ operations: api.operations });
    }

    /**
     * @returns {JSX} operations
     * @memberof Operations
     */
    render() {
        const { operations } = this.state;
        if (!operations) {
            return (
                <div>
                    <FormattedMessage
                        id='Apis.Details.Operations.notFound'
                        defaultMessage='Operations Not Found'
                    />
                </div>
            );
        }

        return (
            <Root>
                <Table>
                    {operations && operations.length !== 0 && operations.map((item) => (
                        <TableRow style={{ borderStyle: 'hidden' }} key={item.target + '_' + item.verb}>
                            <TableCell>
                                <Typography className={classes.heading} component='p' variant='body2'>
                                    {item.target}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <RenderMethod method={item.verb.toLowerCase()} />
                            </TableCell>
                        </TableRow>
                    ))}
                </Table>
            </Root>
        );
    }
}
Operations.propTypes = {
    classes: PropTypes.shape({}).isRequired,
    intl: PropTypes.shape({
        formatMessage: PropTypes.func,
    }).isRequired,

};

export default injectIntl((Operations));
