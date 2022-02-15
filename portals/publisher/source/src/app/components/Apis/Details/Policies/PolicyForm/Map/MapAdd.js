import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
    Grid,
    Typography,
    Button,
    TextField,
} from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import Box from '@material-ui/core/Box';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import Select from '@material-ui/core/Select';
import Autocomplete from '@material-ui/lab/Autocomplete';
//DatePicker

const useStyles = makeStyles(theme => ({
    titleCta: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    avatar: {
        width: theme.spacing(14),
        height: theme.spacing(14),
    },
    paper: {
        width: theme.spacing(97),
        marginLeft: theme.spacing(2),
        display: 'flex',
    },
    dialogContentRoot: {
        overflowY: 'hidden',
    }

}));

const LanguageAdd = props => {
    const { addLanguageItem, ...rest } = props;
    const languageItem = props.languageItem || {};
    const editMode = !!props.languageItem;
    const classes = useStyles();
    const [showForm, setShowForm] = useState(false);
    let initState = editMode ? { ...languageItem } : {
        language: 'en',
        proficiency: 'intermediate'
    };
    const [state, setState] = useState(initState);
    /**
     * Handle input change event
     * @param {event} event     
     */
    const onInputChange = (event) => {
        if (event.target) {
            setState({ ...state, [event.target.name]: event.target.value });
        }
    }

    // When image changes
    const submitForm = async (event) => {
        event.preventDefault();
        const updateCandidates = {};

        Object.keys(state).forEach((key) => {
            const value = state[key];
            if (value) {
                updateCandidates[key] = value;
            } 
        });
        addLanguageItem(updateCandidates);
        toggleForm();
    };

    // Reset the content
    const cancel = () => {
        setShowForm(false);
        setState(initState);
    }

    const toggleForm = () => {
        setShowForm(!showForm);
    }
    // Generate an array of years to select range between this year an 60 years back.
    const thisYear = (new Date()).getFullYear();
    const years = [];
    for (var i = 0; i < 60; i++) {
        years.push(thisYear - i);
    }

    // Distrust variables from the state.
    const { proficiency, language } = state;
    const resetDisabled = Object.keys(state).filter(k => !!state[k]).length === 0;
    return (
        <>
            {editMode && (<IconButton aria-label="edit" onClick={toggleForm}>
                <EditIcon />
            </IconButton>)}
            {!editMode && (<Grid item xs={12}>
                <Button variant="outlined" color="primary" onClick={toggleForm}>
                    Add Language
                </Button>
            </Grid>)}
            <Dialog disableBackdropClick open={showForm} onClose={toggleForm} aria-labelledby="form-dialog-title" maxWidth='md' fullWidth>
                <form onSubmit={submitForm}>
                    <DialogTitle id="form-dialog-title">{editMode ? `Edit ${languageItem.institute}` : `Add Language`}</DialogTitle>
                    <DialogContent classes={{ root: classes.dialogContentRoot }}>
                        <DialogContentText>
                            Select the language and proficiency
                        </DialogContentText>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Typography
                                    variant="subtitle1"
                                    color="textPrimary"
                                    className={classes.inputTitle} >
                                    Language
                                    </Typography>
                                <Autocomplete
                                    value={getLanguage(language || languageItem.language)}
                                    onChange={(event, newValue) => {
                                        if (newValue) {
                                            setState({ ...state, language: newValue.value });
                                        }
                                    }}
                                    name="language"
                                    margin="dense"
                                    fullWidth
                                    options={worldLanguages}
                                    getOptionLabel={(option) => `(${option.value}) -  ${option.label}`}
                                    renderInput={(params) => <TextField margin="dense" fullWidth {...params} variant="outlined" />}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography
                                    variant="subtitle1"
                                    color="textPrimary"
                                    className={classes.inputTitle} >
                                    Proficiency
                                </Typography>
                                <Select
                                    native
                                    fullWidth
                                    variant="outlined"
                                    margin="dense"
                                    value={proficiency || languageItem.proficiency}
                                    onChange={onInputChange}
                                    inputProps={{
                                        name: 'proficiency',
                                    }}
                                    style={{ marginTop: '8px' }}
                                >
                                    <option value='Beginner'>Beginner</option>
                                    <option value='Intermediate'>Intermediate</option>
                                    <option value='Proficient'>Proficient</option>
                                </Select>
                            </Grid>
                            <Grid item container justify="flex-start" xs={12}>
                                <Box textAlign='right' width='100%'>
                                    <Button onClick={cancel} color="primary">
                                        Cancel
                                    </Button>
                                    <Button variant="contained" onClick={resetDisabled} color="primary" type="submit" disabled={resetDisabled}>
                                        {editMode ? 'Update' : `Add Language`}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </DialogContent>
                </form>
            </Dialog>
        </>
    );
};

LanguageAdd.propTypes = {
                /**
                 * External classes
                 */
                className: PropTypes.string,
};

export default LanguageAdd;
