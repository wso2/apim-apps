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
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import Grid from '@mui/material/Grid';
import ApiKeyListing from './ApiKeyListing';

const PREFIX = 'ApiKeyManager';

const classes = {
  root: `${PREFIX}-root`,
  dialog: `${PREFIX}-dialog`,
  button: `${PREFIX}-button`,
  tokenSection: `${PREFIX}-tokenSection`,
  margin: `${PREFIX}-margin`,
  keyConfigWrapper: `${PREFIX}-keyConfigWrapper`,
  generateWrapper: `${PREFIX}-generateWrapper`,
  paper: `${PREFIX}-paper`,
  dialogTitle: `${PREFIX}-dialogTitle`,
  dialogContent: `${PREFIX}-dialogContent`,
  formGroup: `${PREFIX}-formGroup`,
  gridWrapper: `${PREFIX}-gridWrapper`,
  keyTitle: `${PREFIX}-keyTitle`,
  cardBody: `${PREFIX}-cardBody`,
  generateKey: `${PREFIX}-generateKey`
};

const StyledGrid = styled(Grid)((
  {
    theme
  }
) => ({
  [`& .${classes.root}`]: {
    padding: theme.spacing(3),
    '& span, & h5, & label, & input': {
      color: theme.palette.getContrastText(theme.palette.background.paper),
    },
  },

  [`& .${classes.dialog}`]: {
    '& span, & h2, & label': {
      color: theme.palette.getContrastText(theme.palette.background.paper),
    },
  },

  [`& .${classes.button}`]: {
    '& span': {
      color: theme.palette.getContrastText(theme.palette.primary.main),
    }
  },

  [`& .${classes.tokenSection}`]: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },

  [`& .${classes.margin}`]: {
    marginRight: theme.spacing(2),
  },

  [`& .${classes.keyConfigWrapper}`]: {
    flexDirection: 'column',
    marginBottom: 0,
  },

  [`& .${classes.generateWrapper}`]: {
    padding: '10px',
    'margin-inline-end': 'auto',
  },

  [`& .${classes.paper}`]: {
    display: 'flex',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(10),
  },

  [`& .${classes.dialogTitle}`]: {
    padding: '24px 24px 0px',
  },

  [`& .${classes.dialogContent}`]: {
    padding: '0 24px 0px',
  },

  [`& .${classes.formGroup}`]: {
    padding: '0px',
  },

  [`& .${classes.gridWrapper}`]: {
    'align-self': 'center',
  },

  [`& .${classes.keyTitle}`]: {
    textTransform: 'capitalize',
  },

  [`& .${classes.cardBody}`]: {
    padding: theme.spacing(1),
    lineHeight: 2,
  },

  [`& .${classes.generateKey}`]: {
    '& span': {
      color: theme.palette.getContrastText(theme.palette.primary.main),
    }
  }
}));

class ApiKeyManager extends React.Component {
  render() {
    const { keyType, selectedApp } = this.props;
    return (
      <StyledGrid container direction="column" spacing={0} justifyContent="flex-start">
        <Grid item xs={12}>
          <ApiKeyListing keyType={keyType} selectedApp={selectedApp} />
        </Grid>
      </StyledGrid>
    );
  }
}

ApiKeyManager.propTypes = {
  intl: PropTypes.shape({ formatMessage: PropTypes.func }).isRequired,
  keyType: PropTypes.string,
  selectedApp: PropTypes.shape({
    appId: PropTypes.string,
    label: PropTypes.string,
    tokenType: PropTypes.string,
    owner: PropTypes.string,
    hashEnabled: PropTypes.bool,
  }),
};

export default injectIntl((ApiKeyManager));
