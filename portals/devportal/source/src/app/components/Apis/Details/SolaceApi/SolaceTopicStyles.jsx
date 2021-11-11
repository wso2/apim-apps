/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { makeStyles } from '@material-ui/core/styles';


const solaceTopicStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(3, 2),
        '& td, & th': {
            color: theme.palette.getContrastText(theme.custom.infoBar.background),
        },
        '& option': {
            padding: '5px 0px 5px 0px',
        },
        background: theme.custom.infoBar.background,
    },
    table: {
        minWidth: '100%',
    },
    centerItems: {
        margin: 'auto',
    },
    leftCol: {
        width: 200,
    },
    iconAligner: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    iconTextWrapper: {
        display: 'inline-block',
        paddingLeft: 20,
    },
    iconEven: {
        color: theme.custom.infoBar.iconOddColor,
        width: theme.spacing(3),
    },
    iconOdd: {
        color: theme.custom.infoBar.iconOddColor,
        width: theme.spacing(3),
    },
    heading: {
        color: theme.palette.getContrastText(theme.palette.background.paper),
        paddingLeft: theme.spacing(1),
    },
    heading1: {
        marginRight: 20,
    },
    emptyBox: {
        background: '#ffffff55',
        color: theme.palette.getContrastText(theme.palette.background.paper),
        border: 'solid 1px #fff',
        padding: theme.spacing(2),
        width: '100%',
    },
    summaryRoot: {
        display: 'flex',
        alignItems: 'center',
    },
    actionPanel: {
        justifyContent: 'flex-start',
    },
    Paper: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
    },
    Box2: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2),
        height: '100%',
    },
    Box3: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        border: `solid 1px ${theme.palette.grey[300]}`,
        '& .MuiInputBase-root:before,  .MuiInputBase-root:hover': {
            borderBottom: 'none !important',
            color: theme.palette.primary.main,
        },
        '& .MuiSelect-select': {
            color: theme.palette.primary.main,
            paddingLeft: theme.spacing(),
        },
        '& .MuiInputBase-input': {
            color: theme.palette.primary.main,
        },
        '& .material-icons': {
            fontSize: 16,
            color: `${theme.palette.grey[700]} !important`,
        },
        borderRadius: 10,
        marginRight: theme.spacing(),
    },
    list: {
        width: '100%',
        maxWidth: 800,
        backgroundColor: theme.palette.background.paper,
        position: 'relative',
        overflow: 'auto',
        maxHeight: 175,
    },
    urlPaper: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        border: `solid 1px ${theme.palette.grey[300]}`,
        '& .MuiInputBase-root:before,  .MuiInputBase-root:hover': {
            borderBottom: 'none !important',
            color: theme.palette.primary.main,
        },
        '& .MuiSelect-select': {
            color: theme.palette.primary.main,
            paddingLeft: theme.spacing(),
        },
        '& .MuiInputBase-input': {
            color: theme.palette.primary.main,
        },
        '& .material-icons': {
            fontSize: 16,
            color: `${theme.palette.grey[700]} !important`,
        },
        borderRadius: 10,
        marginRight: theme.spacing(),
    },
    input: {
        marginLeft: theme.spacing(1),
        flex: 1,
    },
    avatar: {
        width: 30,
        height: 30,
        background: 'transparent',
        border: `solid 1px ${theme.palette.grey[300]}`,
    },
    iconStyle: {
        cursor: 'pointer',
        margin: '-10px 0',
        padding: '0 0 0 5px',
        '& .material-icons': {
            fontSize: 18,
            color: '#9c9c9c',
        },
    },
}));

export default solaceTopicStyles;
