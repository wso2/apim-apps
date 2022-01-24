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

import {
    Button, Grid, makeStyles, Paper,
} from '@material-ui/core';
import React, { useRef, useState }  from 'react';
import { FormattedMessage} from 'react-intl';
import CreatePolicyTemplate from 'AppComponents/PolicyTemplates/CreatePolicyTemplate';

const useStyles = makeStyles((theme: any) => ({
    root: {
        flexGrow: 1,
        marginTop: 10,
        display: 'flex',
        flexDirection: 'column',
        padding: 20,
    },
    titleWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing(3),
    },
    titleLink: {
        color: theme.palette.primary.main,
        marginRight: theme.spacing(1),
    },
    contentWrapper: {
        maxWidth: theme.custom.contentAreaWidth,
    },
    mainTitle: {
        paddingLeft: 0,
    },
    FormControl: {
        padding: `0 0 0 ${theme.spacing(1)}px`,
        width: '100%',
        marginTop: 0,
    },
    FormControlOdd: {
        padding: `0 0 0 ${theme.spacing(1)}px`,
        backgroundColor: theme.palette.background.paper,
        width: '100%',
        marginTop: 0,
    },
    FormControlLabel: {
        marginBottom: theme.spacing(1),
        marginTop: theme.spacing(1),
        fontSize: theme.typography.caption.fontSize,
    },
    buttonSection: {
        paddingTop: theme.spacing(3),
    },
    saveButton: {
        marginRight: theme.spacing(1),
    },
    helpText: {
        color: theme.palette.text.hint,
        marginTop: theme.spacing(1),
    },
    extraPadding: {
        paddingLeft: theme.spacing(2),
    },
    addNewOther: {
        paddingTop: 40,
    },
    titleGrid: {
        ' & .MuiGrid-item': {
            padding: 0,
            margin: 0,
        },
    },
    descriptionForm: {
        marginTop: theme.spacing(1),
    },
    progress: {
        marginLeft: theme.spacing(1),
    },
}));

interface Policy {
    id: number;
    name: string;
    description: string;
    flows: string[];
}

interface IProps {
    handleAdd: any;
    handleCloseAddPolicyPopup: React.Dispatch<React.SetStateAction<any>>;
}

/**
 * Renders the create policy view.
 * @param {JSON} props Input props from parent components.
 * @returns {TSX} Create policy page.
 */
const CreatePolicy: React.FC<IProps> = ({ handleAdd, handleCloseAddPolicyPopup }) => {
    const classes = useStyles();
    const inputRef = useRef<HTMLInputElement>(null);
    const [policyName, setPolicyName] = useState<string>("");
    const [policyDescription, setPolicyDescription] = useState<string>("");
    const [policyFlows, setPolicyFlows] = useState<Array<string>>([]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // setAddPolicy({id:Date.now(), policy: policyName, description: "", flows: [], isDone: false});
        handleAdd({id:Date.now(), name: policyName, description: policyDescription, flows: []});
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.name === 'policyName') {
            setPolicyName(e.target.value);
        } else if (e.target.name === 'policyDesc') {
            setPolicyDescription(e.target.value);
        }
        
    }

    return (
        <Grid container spacing={3}>
            <Grid item sm={12} md={8}>
                <Grid container spacing={5} className={classes.titleGrid}>
                    <Grid item md={12}>
                        <Paper elevation={1} className={classes.root}>
                            <div>
                                <form
                                    className='input'
                                    onSubmit={(e) => {
                                        submit(e);
                                    }}
                                >
                                    <input
                                        name='policyName'
                                        type='text'
                                        placeholder='Add API Policy'
                                        value={policyName}
                                        ref={inputRef}
                                        onChange={(e) => handleChange(e)}
                                        className='input__box'
                                    />
                                    <br/>
                                    <input
                                        name='policyDesc'
                                        type='text'
                                        placeholder='Add API Policy Desc'
                                        value={policyDescription}
                                        ref={inputRef}
                                        onChange={(e) => handleChange(e)}
                                        className='input__box'
                                    />
                                    <button type='submit' className='input_submit'>
                                        GO
                                    </button>
                                </form>
                            </div>
                            <CreatePolicyTemplate isAPI />
                            <div className={classes.addNewOther}>
                                <Button onClick={handleCloseAddPolicyPopup}>
                                    <FormattedMessage
                                        id='Apis.Details.Policies.CreatePolicy.cancel'
                                        defaultMessage='Cancel'
                                    />
                                </Button>
                            </div>
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default CreatePolicy;
