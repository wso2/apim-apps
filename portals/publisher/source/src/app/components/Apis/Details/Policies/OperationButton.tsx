/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import { FC } from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Utils from 'AppData/Utils';

interface OPProps {
    operation: any;
    verb: any;
}

const OperationButton: FC<OPProps> = ({ operation, verb }) => {
    const useStyles = makeStyles((theme: any) => {
        const backgroundColor = theme.custom.resourceChipColors[verb];
        return {
            customButton: {
                '&:hover': { backgroundColor },
                backgroundColor,
                width: theme.spacing(12),
                color: theme.palette.getContrastText(backgroundColor),
            },
            paperStyles: {
                border: `1px solid ${backgroundColor}`,
                borderBottom: '',
                width: '100%',
            },
            customDivider: {
                backgroundColor,
            },
            linearProgress: {
                height: '2px',
            },
            highlightSelected: {
                backgroundColor: Utils.hexToRGBA(backgroundColor, 0.1),
            },
            contentNoMargin: {
                margin: theme.spacing(0),
            },
            overlayUnmarkDelete: {
                position: 'absolute',
                zIndex: theme.zIndex.operationDeleteUndo,
                right: '10%',
            },
            targetText: {
                maxWidth: 300,
                margin: '0px 20px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                display: 'inline-block',
            },
            title: {
                display: 'inline',
                margin: `0 ${theme.spacing(5)}px`,
            },
            dialogPaper: {
                width: '800px',
                maxHeight: '800px',
            },
            dialogContent: {
                overflow: 'auto',
                height: '90%',
            },
            flowSpecificPolicyAttachGrid: {
                marginTop: theme.spacing(1),
                overflowX: 'scroll'
            },
            operationSummaryGrid: {
                display: 'flex',
                alignItems: 'center',
                flexBasis: '100%',
                maxWidth: '100%',
            }
        };
    });

    const classes = useStyles();
    return (
        <>
            <Button
                disableFocusRipple
                variant='contained'
                aria-label={'HTTP verb ' + verb}
                size='small'
                className={classes.customButton}
            >
                {verb}
            </Button>
        </>
    );
};

export default OperationButton;
