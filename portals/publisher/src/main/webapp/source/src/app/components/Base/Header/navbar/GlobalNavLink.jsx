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
import { ListItemIcon, ListItem, ListItemText, useTheme } from '@mui/material';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';
import CustomIcon from 'AppComponents/Shared/CustomIcon';
import classNames from 'classnames';
import Tooltip from '@mui/material/Tooltip';

const PREFIX = 'GlobalNavLink';

const classes = {
    listRoot: `${PREFIX}-listRoot`,
    listText: `${PREFIX}-listText`,
    smallIcon: `${PREFIX}-smallIcon`,
    selected: `${PREFIX}-selected`,
    notSelected: `${PREFIX}-notSelected`,
    listHover: `${PREFIX}-listHover`,
    selectedText: `${PREFIX}-selectedText`,
    scopeIconColor: `${PREFIX}-scopeIconColor`,
    alertIconColor: `${PREFIX}-alertIconColor`,
    divider: `${PREFIX}-divider`,
    categoryHeader: `${PREFIX}-categoryHeader`,
    categoryHeaderPrimary: `${PREFIX}-categoryHeaderPrimary`,
    itemIcon: `${PREFIX}-itemIcon`,
    arrow: `${PREFIX}-arrow`,
    tooltip: `${PREFIX}-tooltip`
};

const StyledLink = styled(Link)((
    {
        theme
    }
) => ({
    [`& .${classes.listRoot}`]: {
        padding: 0,
        display: 'flex',
    },

    [`& .${classes.listText}`]: {
        color: theme.palette.getContrastText(theme.palette.background.drawer),
    },

    [`& .${classes.smallIcon}`]: {
        marginRight: 5,
        minWidth: 'auto',
    },

    [`& .${classes.selected}`]: {
        background: '#868686b5',
        borderLeft: '2px solid',
        color: '#f9f9f9',
    },

    [`& .${classes.notSelected}`]: {
        borderLeft: '2px solid',
        color: '#18202c',
    },

    [`& .${classes.listHover}`]: {
        paddingBottom: theme.spacing(2),
        paddingTop: theme.spacing(2),
        '&:hover': {
            backgroundColor: '#b3b3b373',
        },
    },

    [`& .${classes.selectedText}`]: {
        color: theme.palette.getContrastText(theme.palette.background.activeMenuItem),
    },

    [`& .${classes.scopeIconColor}`]: {
        fill: theme.palette.getContrastText(theme.palette.background.leftMenu),
    },

    [`& .${classes.alertIconColor}`]: {
        fill: theme.palette.getContrastText(theme.palette.background.leftMenu),
    },

    [`& .${classes.divider}`]: {
        marginTop: theme.spacing(1),
        backgroundColor: theme.palette.background.divider,
    },

    [`& .${classes.categoryHeader}`]: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        '& svg': {
            color: theme.palette.common.white,
        },
    },

    [`& .${classes.categoryHeaderPrimary}`]: {
        color: theme.palette.common.white,
    },

    [`& .${classes.itemIcon}`]: {
        minWidth: 'auto',
        marginRight: theme.spacing(2),
    },

    [`& .${classes.arrow}`]: {
        color: theme.palette.common.black,
    },

    [`& .${classes.tooltip}`]: {
        backgroundColor: theme.palette.common.black,
        ...theme.typography.body2,
    }
}));

/**
 *
 *
 * @param {*} props
 * @returns
 */
function GlobalNavLinks(props) {
    const { active, title, children, id, to, type, icon, isExternalLink } = props;
    const theme = useTheme();
    let tooltipTitle = title;
    if (!title) {
        tooltipTitle = children;
    }
    const linkTo = !isExternalLink ? to : '#';
    const iconWidth = 25;
    return (
        <StyledLink
            id={id}
            underline='none'
            component={!isExternalLink && RouterLink}
            to={linkTo}
        >
            <Tooltip
                classes={{ arrow: classes.arrow, tooltip: classes.tooltip }}
                PopperProps={{
                    popperOptions: {
                        modifiers: {
                            flip: {
                                enabled: false,
                            },
                            offset: {
                                offset: '0,0',
                            },
                        },
                    },
                }}
                arrow
                interactive
                title={tooltipTitle}
                placement='right'
            >
                <ListItem
                    className={clsx(classes.listHover, {
                        [classes.selected]: active,
                        [classes.notSelected]: !active,
                    })}
                    omponent='div'
                >
                    <ListItemIcon
                        className={classes.itemIcon}
                    >
                        {icon || (
                            <CustomIcon
                                width={iconWidth}
                                strokeColor={active ? theme.custom.globalNavBar.active : '#f2f2f2'}
                                height={iconWidth}
                                icon={type}
                            />
                        )}
                    </ListItemIcon>
                    <ListItemText
                        classes={{
                            primary: classNames({
                                [classes.selectedText]: active,
                                [classes.listText]: !active,
                            }),
                        }}
                        primary={children}
                    />
                </ListItem>
            </Tooltip>
        </StyledLink>
    );
}
GlobalNavLinks.propTypes = {
    theme: PropTypes.shape({
        palette: PropTypes.shape({
            getContrastText: PropTypes.func,
            background: PropTypes.shape({
                drawer: PropTypes.string,
                leftMenu: PropTypes.string,
            }),
        }),
    }).isRequired,
};

export default (GlobalNavLinks);
