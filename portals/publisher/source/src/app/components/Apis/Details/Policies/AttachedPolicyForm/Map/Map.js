import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme, makeStyles } from '@material-ui/core/styles';
import {
    useMediaQuery,
    Grid,
    Typography,
    Button,
    Divider,
    CircularProgress,
    Paper,
    Box,
    Select,
    FormHelperText,
} from '@material-ui/core';
import cloneDeep from 'lodash.clonedeep';
import { hasModifiedAbstract } from '../util/MapUtils';
import { uuidv4 } from '../../Utils';
import MapAdd from './MapAdd';
import MapDelete from './MapDelete';

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
    plainTable: {
        width: '100%',
        borderCollapse: 'collapse',
        margin: 0,
        '& th': {
            textAlign: 'left',
            paddingLeft: theme.spacing(),
        },
        '& td': {
            textAlign: 'left',
            paddingLeft: theme.spacing(),
        },
        '& tr.modified': {
            background: '#fff0d5',
            borderColor: '#fff0d5',
        },
    },
    paper: {
        width: theme.spacing(97),
    },
    inputTitle: {
        whiteSpace: 'nowrap',
        display: 'inline-block',
        marginRight: 20,
    }
}));
let languageWithoutChanges = null;

const Languages = (props) => {
    const { oldMapEntries } = props;
    const classes = useStyles();
    const theme = useTheme();
    const isMd = useMediaQuery(theme.breakpoints.up('md'), {
        defaultMatches: true,
    });
    const [saving, setSaving] = useState(false);
    const [mapEntries, setMapEntries] = useState([]);

    const defaults = {
        english: 'Intermediate',
    };

    React.useEffect(() => {
        const initState = (oldMapEntries) ? cloneDeep(oldMapEntries) : [];
        if (initState) {
            initState.forEach(item => {
                if (!item.id) {
                    // eslint-disable-next-line no-param-reassign
                    item.id = uuidv4()
                }
            });
            // We keep another copy of the init state just to check the changes.
            languageWithoutChanges = cloneDeep(initState);
            setMapEntries(cloneDeep(initState))
        }
    }, [oldMapEntries])
    // When image changes
    const saveLanguages = async () => {
        setSaving(true);

        // Saving field changes to backend
        // remove all the uuids
        const languageNew = cloneDeep(mapEntries);
        // eslint-disable-next-line no-param-reassign
        languageNew.forEach(item => item.id && delete item.id);
        // call the
    };

    const addLanguageItem = (item) => {
        if (!language || (language && language.length === 0)) {
            item.id = uuidv4();
            setLanguage([item]);
        } else {
            const languageNew = cloneDeep(language);
            const itemToUpdate = languageNew.filter((ed) => ed.id === item.id);
            if (itemToUpdate.length > 0) {
                Object.keys(item).forEach(key => itemToUpdate[0][key] = item[key]); // The update happens here
            } else {
                item.id = uuidv4();
                languageNew.push(item);
            }
            setLanguage(languageNew);
        }
    }

    const deleteLanguageItem = (item) => {
        const languageNew = cloneDeep(language);
        const languageWithoutItem = [];
        languageNew.forEach((ed) => {
            if (ed.id !== item.id) {
                languageWithoutItem.push(ed);
            }
        });
        setLanguage(languageWithoutItem);
    }

    const onInputChange = (event) => {
        setEnglish(event.target.value);
    }

    /**
 * This method finds out if an item is modified from it's initial state or not
 * @param {JSON} item 
 * @returns {Boolean}
 */
    const hasModified = (item) => {
        return hasModifiedAbstract(item, languageWithoutChanges);
    }
    // Reset the content
    const resetAll = () => {
        setLanguage(cloneDeep(languageWithoutChanges));
    }

    // Language level description
    const languageLevelSelected = english || (userData.language && userData.language.english) || defaults.english;
    const languageLevelDescription = getLanguageDescription(languageLevelSelected);

    if (!userData) {
        return <CircularProgress />
    }
    // Calculating button states ( disabled or enabled )
    let resetDisabled = true;
    if (language && languageWithoutChanges) {
        resetDisabled = language.length >= languageWithoutChanges.length
      && (language.length === 0 || (language && language.filter(ed => {
          return hasModified(ed);
      }).length === 0))
      && !english;
    }
    return (
        <Grid container spacing={isMd ? 4 : 2}>
            <Grid item xs={12}>
                <NavigateBlocker isBlocking={!resetDisabled} />
                <div className={classes.titleCta}>
                    <Typography variant='h6' color='textPrimary'>
                        Languages
                    </Typography>
                    <Button variant='outlined' color='primary' disabled={resetDisabled} onClick={resetAll}>
                        Reset all
                    </Button>
                </div>
            </Grid>
            {languageLevelSelected === '0' &&(<Grid item xs={12}><Alert variant='outlined' severity='warning'>
                You need at least level 1 English proficiency to accept cases.
            </Alert></Grid>)}
            <Grid item xs={12}>
                <Divider />
            </Grid>
            <Grid item xs={12}>
                <Typography
                    variant='subtitle1'
                    color='textPrimary'
                    className={classes.inputTitle}
                >
                    What is your English proficiency?
                </Typography>
                <Select
                    native
                    fullWidth
                    variant='outlined'
                    margin='dense'
                    value={english || (userData.language && userData.language.english) || defaults.english}
                    onChange={onInputChange}
                    inputProps={{
                        name: 'english',
                    }}
                    style={{ marginTop: '8px' }}
                >
                    <option value='0'>{getLanguageLabel(0)}</option>
                    <option value='1'>{getLanguageLabel(1)}</option>
                    <option value='2'>{getLanguageLabel(2)}</option>
                    <option value='3'>{getLanguageLabel(3)}</option>
                    <option value='4'>{getLanguageLabel(4)}</option>
                </Select>
                <FormHelperText>{languageLevelDescription}</FormHelperText>
            </Grid>
            <Grid item xs={12}>
                <Box display='flex' width='100%'>
                    <Typography
                        variant='subtitle1'
                        color='textPrimary'
                        className={classes.inputTitle}
                    >
                        What other languages do you speak?
                    </Typography>
                    <MapAdd language={language} addLanguageItem={addLanguageItem} />
                </Box>
            </Grid>
            <Grid item xs={12}>
                {(language.length === 0) &&
          (<Alert severity='info'>No additional language added.</Alert>)
                }
                {(language.length > 0) && (<Paper elevation={3} className={classes.paper} >
                    <Box p={2} >
                        <table className={classes.plainTable}>
                            <tr>
                                <th>Language</th>
                                <th>Duration</th>
                                <th />
                            </tr>
                            {language.map((ed) => (<tr className={hasModified(ed) && 'modified'}>
                                <td>{ed.language ? getLanguage(ed.language).label : ''}</td>
                                <td>{ed.proficiency}</td>
                                <td style={{ width: 120 }}>
                                    <MapAdd languageItem={ed} language={language} addLanguageItem={addLanguageItem} />
                                    <MapDelete languageItem={ed} deleteLanguageItem={deleteLanguageItem} />
                                </td>
                            </tr>))}
                        </table>
                    </Box>
                </Paper>)}
            </Grid>
            <Grid item container justify='flex-start' xs={12}>
                <Button
                    variant='contained'
                    color='primary'
                    size='large'
                    onClick={saveLanguages}
                    disabled={resetDisabled || saving}
                >
                    {saving ? <span><CircularProgress size='small' /> saving</span> : 'save'}
                </Button>
            </Grid>
        </Grid>
    );
};

Languages.propTypes = {
    /**
   * External classes
   */
    className: PropTypes.string,
};

export default Languages;
