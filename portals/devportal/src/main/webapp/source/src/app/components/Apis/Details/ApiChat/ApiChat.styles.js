/*
 * Copyright (c) 2024, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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

import { makeStyles, createStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => createStyles({
    tryWithAiMain: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: theme.spacing(1),
    },
    tryAiBannerCont: {
        display: 'flex',
        gridGap: theme.spacing(1.5),
        maxWidth: theme.spacing(85),
    },
    tryAiBannerImgWrap: {
        flex: `0 0 ${theme.spacing(15)}px`,
        maxWidth: theme.spacing(15),
        fontSize: theme.spacing(15),
        display: 'flex',
        alignItems: 'center',
    },
    tryAiBannerContentWrap: {
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
    },
    tryAiBannerTriangle: {
        position: 'absolute',
        width: theme.spacing(3),
        height: theme.spacing(3),
        top: 0,
        left: theme.spacing(-3),
        overflow: 'hidden',
        '&:before': {
            content: '""',
            display: 'block',
            width: '200%',
            height: '200%',
            position: 'absolute',
            borderRadius: '50%',
            top: 0,
            right: 0,
            boxShadow: `${theme.spacing(2.5)} ${theme.spacing(-3.75)} 0 0 ${theme.palette.grey[100]}`,
        },
    },
    tryAiBannerContent: {
        background: theme.palette.grey[100],
        padding: theme.spacing(2),
        borderRadius: theme.spacing(0, 2, 2, 2),
        position: 'relative',
    },
    poweredBy: {
        display: 'flex',
        width: '100%',
    },
    tryAiBottom: {
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        marginLeft: theme.spacing(-1),
        marginRight: theme.spacing(-1),
    },
    tryAiBottomInner: {
        padding: theme.spacing(3, 1),
    },
    tryAiBottomTextInputWrap: {
        maxWidth: '100%',
        overflow: 'hidden',
    },
    reExecuteWrap: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    testResultsHeading: {
        display: 'flex',
        gridGap: theme.spacing(2),
        alignItems: 'center',
        marginBottom: theme.spacing(2.5),
    },
    testResultsTitle: {
        flexGrow: 1,
    },
    testResultsActions: {
        display: 'flex',
        alignItems: 'center',
        gridGap: theme.spacing(2),
    },
    sampleCardActionArea: {
        '&:hover $sampleExecuteButton': {
            background: theme.palette.grey[100],
            color: theme.palette.grey[100],
        },
    },
    disclaimerText: {
        marginTop: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sampleExecuteButton: {},
    trackingIdContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    trackingIdText: {
        color: theme.palette.secondary.main,
    },
}));

export default useStyles;
