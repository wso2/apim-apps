/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
import React, { useState } from "react";
import { styled } from '@mui/material/styles';
import { injectIntl, FormattedMessage } from "react-intl";
import PropTypes from "prop-types";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import Grid from "@mui/material/Grid";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import Typography from "@mui/material/Typography";
import Validation from 'AppData/Validation';

const PREFIX = 'ApiKeyRestriction';

const classes = {
  FormControl: `${PREFIX}-FormControl`,
  outterBox: `${PREFIX}-outterBox`,
  Fab: `${PREFIX}-Fab`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
  {
    theme
  }
) => ({
  [`& .${classes.FormControl}`]: {
    "margin-bottom": theme.spacing(1),
    width: "100%",
    padding: theme.spacing(0, 1),
  },

  [`& .${classes.outterBox}`]: {
    margin: theme.spacing(1),
    padding: theme.spacing(1),
    marginLeft: 20,
    borderColor: '#cccccc',
  },

  [`& .${classes.Fab}`]: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  }
}));

/**
 * Used to display IP address and Http Referer restrictions in generate api key UI
 */
const apiKeyRestrictions = (props) => {
  const [invalidIP, setInvalidIP] = useState(false);
  const [invalidReferer, setInvalidReferer] = useState(false);

  const {
    intl,
    newIP,
    updateNewIp,
    ipList,
    updateIpList,
    restrictSchema,
    updateRestrictSchema,
    newReferer,
    updateNewReferer,
    refererList,
    updateRefererList,
  } = props;

  const onRefererTextUpdate = (e) => {
    updateNewReferer(e.target.value.trim());
    if (e.target.value.trim() === "") {
      setInvalidReferer(false);
    }
  };

  const addRefererItem = () => {
    if (newReferer !== null && newReferer !== "") {
      setInvalidReferer(false);
      refererList.push(newReferer.trim());
      updateRefererList(refererList);
      updateNewReferer("");
    } else {
      setInvalidReferer(true);
    }
  };

  const deleteRefererItem = (refererItem) => {
    refererList.splice(refererList.indexOf(refererItem), 1);
    updateRefererList(refererList);
  };

  const onIpTextUpdate = (e) => {
    updateNewIp(e.target.value.trim());
    if (e.target.value.trim() === "") {
      setInvalidIP(false);
    }
  };

  const addIpItem = () => {
    if (newIP !== null && newIP !== "") {
      if (Validation.ipAddress.validate(newIP).error) {
        setInvalidIP(true);
      } else {
        setInvalidIP(false);
        ipList.push(newIP);
        updateIpList(ipList);
        updateNewIp("");
      }
    }
  };

  const deleteIpItem = (ipItem) => {
    ipList.splice(ipList.indexOf(ipItem), 1);
    updateIpList(ipList);
  };

  const onRestrictSchemaChange = (e) => {
    updateRestrictSchema(e.target.value);
    updateIpList([]);
    updateRefererList([]);
    updateNewIp("");
    updateNewReferer("");
    setInvalidIP(false);
    setInvalidReferer(false);
  };

  return (
    <Root>
      <Box border={1} borderRadius="5px" className={classes.outterBox}>
        <Typography variant="body1">
          <FormattedMessage
              defaultMessage='Key Restrictions'
              id='Shared.ApiKeyRestriction.key.restrictions'
          />
        </Typography>
        <FormControl variant="standard" component="fieldset">
          <RadioGroup
            aria-label="API Key Restrictions"
            value={restrictSchema}
            row
            onChange={onRestrictSchemaChange}
          >
            <FormControlLabel
              value="none"
              control={<Radio color="primary" id={'api-key-restriction-none'}/>}
              label={intl.formatMessage({
                defaultMessage: "None",
                id:
                  "Shared.ApiKeyRestriction.key.restrictions.none",
              })}
              labelPlacement="end"
            />
            <FormControlLabel
              value="ip"
              control={<Radio color="primary" id={'api-key-restriction-ip'}/>}
              label={intl.formatMessage({
                defaultMessage: "IP Addresses",
                id:
                  "Shared.ApiKeyRestriction.key.restrictions.ip.addresses",
              })}
              labelPlacement="end"
            />
            <FormControlLabel
              value="referer"
              control={<Radio color="primary" id={'api-key-restriction-referer'}/>}
              label={intl.formatMessage({
                defaultMessage: "HTTP Referrers (Web Sites)",
                id:
                  "Shared.ApiKeyRestriction.key.restrictions.http.referrers",
              })}
              labelPlacement="end"
            />
          </RadioGroup>
        </FormControl>

        {restrictSchema === "ip" && (
          <Box component="div" id="ipPanel">
            <Grid
              container
              direction="row"
              spacing={0}
              justifyContent="left"
              alignItems="left"
            >
              <Grid item md={10} xs={10}>
                <TextField
                  label={intl.formatMessage({
                    defaultMessage: "IP Address",
                    id:
                      "Shared.AppsAndKeys.Tokens.apiKeyRestriction.ip.address.label",
                  })}
                  value={newIP}
                  onChange={onIpTextUpdate}
                  className={classes.inputText}
                  helperText={
                    invalidIP
                      ? intl.formatMessage({
                          defaultMessage: "Invalid IP Address",
                          id:
                            "Shared.AppsAndKeys.Tokens.apiKeyRestriction.ip.validity.error",
                        })
                      : ""
                  }
                  error={invalidIP}
                  size='small'
                  margin="dense"
                  variant="outlined"
                  placeholder={intl.formatMessage({
                    defaultMessage: "Enter IP Address",
                    id: "Shared.AppsAndKeys.Tokens.apiKeyRestriction.enter.ip",
                  })}
                  fullWidth
                  id='ip-address-txt'
                />
              </Grid>
              <Grid item md={2} xs={2}>
                <span>
                  <Fab
                    className={classes.Fab}
                    size="small"
                    color="primary"
                    aria-label="add"
                    onClick={addIpItem}
                    id='ip-address-add-btn'
                  >
                    <AddIcon />
                  </Fab>
                </span>
              </Grid>
            </Grid>
            <Grid
              container
              direction="row"
              spacing={0}
              justifyContent="left"
              alignItems="left"
              md={10}
              xs={10}
            >
              {ipList.length > 0 && (
                <List>
                  {ipList.map((ip, index) => (
                    <ListItem>
                      <ListItemText primary={ip} />
                      <ListItemSecondaryAction>
                        <Tooltip title={
                          intl.formatMessage({
                            defaultMessage: 'Delete task',
                            id: 'Shared.ApiKeyRestriction.key.restrictions.delete.task.tooltip',
                          })}
                          placement="top"
                        >
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => deleteIpItem(ip)}
                            size="large">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>
          </Box>
        )}

        {restrictSchema === "referer" && (
          <Box component="div" id="refererPanel">
            <Grid
              container
              direction="row"
              spacing={0}
              justifyContent="left"
              alignItems="left"
            >
              <Grid item md={10} xs={10}>
                <TextField
                  label={intl.formatMessage({
                    defaultMessage: "Referer",
                    id:
                      "Shared.AppsAndKeys.Tokens.apiKeyRestriction.referer.label",
                  })}
                  value={newReferer}
                  onChange={onRefererTextUpdate}
                  className={classes.inputText}
                  helperText={
                    invalidReferer
                      ? intl.formatMessage({
                          defaultMessage: "Invalid Http Referer",
                          id: "Shared.AppsAndKeys.Tokens.apiKeyRestriction.referer.validity.error",
                        })
                      : ""
                  }
                  error={invalidReferer}
                  size='small'
                  margin="dense"
                  variant="outlined"
                  placeholder={intl.formatMessage({
                    defaultMessage: "Enter Http Referer",
                    id: "Shared.AppsAndKeys.Tokens.apiKeyRestriction.enter.referer",
                  })}
                  fullWidth
                  id='referer-txt'
                />
              </Grid>
              <Grid item md={2} xs={2}>
                <span>
                  <Fab
                  size="small"
                    className={classes.Fab}
                    color="primary"
                    aria-label="add"
                    onClick={addRefererItem}
                  id='referer-add-btn'
                  >
                    <AddIcon />
                  </Fab>
                </span>
              </Grid>
            </Grid>
            <Grid
              container
              direction="row"
              spacing={0}
              justifyContent="left"
              alignItems="left"
              md={10}
              xs={10}
            >
              {refererList.length > 0 && (
                <List>
                  {refererList.map((referer, index) => (
                    <ListItem>
                      <ListItemText primary={referer} />
                      <ListItemSecondaryAction>
                        <Tooltip title={
                          intl.formatMessage({
                            defaultMessage: 'Delete task',
                            id: 'Shared.ApiKeyRestriction.key.restrictions.delete.task.tooltip',
                          })}
                          placement="top"
                        >
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => deleteRefererItem(referer)}
                            size="large">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Grid>
          </Box>
        )}
      </Box>
    </Root>
  );
};
apiKeyRestrictions.contextTypes = {
  intl: PropTypes.shape({}).isRequired,
};
export default injectIntl((apiKeyRestrictions));
