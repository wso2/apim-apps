import { styled, useTheme } from '@mui/material/styles';
import { FormattedMessage, injectIntl } from 'react-intl';
import React, { Component } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import Api from 'AppData/api';
import APIProduct from 'AppData/APIProduct';
import MaterialIcons from 'MaterialIcons';
import Alert from 'AppComponents/Shared/Alert';
import { withAPI } from 'AppComponents/Apis/Details/components/ApiContext';
import Configurations from 'Config';
import { green, red } from '@mui/material/colors';
import BaseThumbnail from './BaseThumbnail';

const PREFIX = 'ThumbnailView';

const classes = {
    acceptDrop: `${PREFIX}-acceptDrop`,
    dropzone: `${PREFIX}-dropzone`,
    dropZoneWrapper: `${PREFIX}-dropZoneWrapper`,
    preview: `${PREFIX}-preview`,
    rejectDrop: `${PREFIX}-rejectDrop`,
    group: `${PREFIX}-group`,
    popupHeader: `${PREFIX}-popupHeader`,
    iconView: `${PREFIX}-iconView`,
    subtitle: `${PREFIX}-subtitle`,
    subtitleWrapper: `${PREFIX}-subtitleWrapper`,
    body: `${PREFIX}-body`,
    imageGenWrapper: `${PREFIX}-imageGenWrapper`,
    backgroundSelection: `${PREFIX}-backgroundSelection`,
    actionBox: `${PREFIX}-actionBox`,
    imageContainer: `${PREFIX}-imageContainer`
};


const StyledDialog = styled(Dialog)(({ theme }) => ({
    [`& .${classes.acceptDrop}`]: {
        backgroundColor: green[50],
    },

    [`& .${classes.dropzone}`]: {
        border: '1px dashed ' + theme.palette.primary.main,
        borderRadius: '5px',
        cursor: 'pointer',
        height: 'calc(100vh - 10em)',
        padding: `${theme.spacing(2)} 0px`,
        position: 'relative',
        textAlign: 'center',
        width: '100%',
        margin: '10px 0',
    },

    [`& .${classes.dropZoneWrapper}`]: {
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& span': {
            fontSize: 100,
            color: theme.palette.primary.main,
        },
    },

    [`& .${classes.preview}`]: {
        height: theme.spacing(25),
    },

    [`& .${classes.rejectDrop}`]: {
        backgroundColor: red[50],
    },

    [`& .${classes.group}`]: {
        display: 'flex',
        flexDirection: 'row',
        padding: '0 0 0 20px',
    },

    [`& .${classes.popupHeader}`]: {
        display: 'flex',
        flexDirection: 'row',
    },

    [`& .${classes.iconView}`]: {
        width: 30,
        margin: 10,
        cursor: 'pointer',
    },

    [`& .${classes.subtitle}`]: {
        marginRight: 20,
    },

    [`& .${classes.subtitleWrapper}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },

    [`& .${classes.body}`]: {
        marginBottom: 10,
    },

    [`& .${classes.imageGenWrapper}`]: {
        '& > div': {
            position: 'fixed',
            marginTop: 20,
        },
    },

    [`& .${classes.backgroundSelection}`]: {
        cursor: 'pointer',
        marginRight: 10,
        display: 'inline-block',
        border: 'solid 1px #ccc',
    },

    [`& .${classes.actionBox}`]: {
        boxShadow:
            '0px 1px 5px 0px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.12)',
        justifyContent: 'flex-start',
        padding: '10px 0 10px 10px',
    },

    [`& .${classes.imageContainer}`]: {
        paddingTop: 10,
    }
}));

const windowURL = window.URL || window.webkitURL;
const dropzoneStyles = {
    border: '1px dashed ',
    borderRadius: '5px',
    cursor: 'pointer',
    height: 75,
    padding: '8px 0px',
    position: 'relative',
    textAlign: 'center',
    width: '100%',
    margin: '10px 0',
};

/**
 * Slide up transition for modal
 *
 * @param {any} props Properties
 * @returns {Slide} Slide up transition
 */
function Transition(props) {
    return <Slide direction='up' {...props} />;
}
/**
 * Provides a view for the API Thumbnail image.
 * This can be either user defined image uploaded earlier or a generated Image.
 */
class ThumbnailView extends Component {
    /**
     * Initializes the ThumbnailView Component
     *
     * @param {any} props Component properties
     */
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            file: null,
            thumbnail: null,
            selectedTab: 'upload',
            category: MaterialIcons.categories[0].name,
            selectedIcon: null,
            selectedIconUpdate: null,
            color: null,
            colorUpdate: null,
            backgroundIndex: null,
            backgroundIndexUpdate: null,
            uploading: false,
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    /**
     * Clean up resource
     */
    componentWillUnmount() {
        if (this.state.thumbnail) {
            windowURL.revokeObjectURL(this.state.thumbnail);
        }
    }

    /**
     * Event listener for file drop on the dropzone
     *
     * @param {File} acceptedFile dropped file
     */
    onDrop(acceptedFile) {
        this.setState({ file: acceptedFile });
    }

    selectIcon = (selectedIconUpdate) => {
        this.setState({ selectedIconUpdate });
    };

    selectBackground = (backgroundIndexUpdate) => {
        this.setState({ backgroundIndexUpdate });
    };

    /**
     * @param {SyntheticEvent} e React event object
     */
    handleClick = (action, intl) => () => {
        if (action === 'btnEditAPIThumb') {
            this.setState({ open: true });
        } else if (action === 'btnUploadAPIThumb') {
            const { api } = this.props;
            const {
                selectedTab, selectedIconUpdate, category, colorUpdate, backgroundIndexUpdate, file,
            } = this.state;
            let fileObj;
            if (selectedTab === 'upload') {
                if (!api.id && !file) {
                    Alert.error(intl.formatMessage({
                        id: 'Apis.Listing.components.ImageGenerator.ThumbnailView.thumbnail.validation.error',
                        defaultMessage: 'Invalid file or API information is not set correctly.',
                    }));
                    return;
                }
                /* eslint prefer-destructuring: ["error", {VariableDeclarator: {object: true}}] */
                fileObj = file[0];
            } else if (selectedTab === 'remove') {
                fileObj = new File([], 'FileName.jpg', { type: 'application/json' });
            } else {
                if (!selectedIconUpdate && !colorUpdate && !backgroundIndexUpdate) {
                    Alert.error(intl.formatMessage({
                        id: 'the.icon.is.not.modified',
                        defaultMessage: 'The icon is not modified',
                    }));
                    return;
                }
                const newIconJson = {
                    key: selectedIconUpdate,
                    category,
                    color: colorUpdate,
                    backgroundIndex: backgroundIndexUpdate,
                };
                const blob = new Blob([JSON.stringify(newIconJson)], { type: 'application/json' });
                fileObj = new File([blob], 'FileName.json', { type: 'application/json' });
            }

            this.uploadThumbnail(selectedTab, api.id, fileObj, intl);
        }
    };

    handleChange = (event, selectedTab) => {
        this.setState({ selectedTab });
    };

    handleSelectionChange = (name) => (event) => {
        this.setState({ [name]: event.target.value });
    };

    handleChangeComplete = (colorUpdate) => {
        this.setState({ colorUpdate: colorUpdate.hex });
    };

    /**
     * Handle modal close event
     */
    handleClose() {
        const { file, preview } = this.state;
        if (file) {
            windowURL.revokeObjectURL(preview);
        }
        this.setState((cState) => ({
            open: false,
            file: null,
            colorUpdate: cState.color,
            backgroundIndexUpdate: cState.background,
            selectedIconUpdate: cState.selectedIcon,
        }));
    }

    /**
     * Add new thumbnail image to an API
     *
     * @param {String} apiId ID of the API to be updated
     * @param {File} file new thumbnail image file
     */
    uploadThumbnail(selectedTab, apiId, file, intl) {
        this.setState({ uploading: true });
        const {
            api: { apiType, id },
            setImageUpdate,
        } = this.props;
        const promisedThumbnail = apiType === Api.CONSTS.APIProduct
            ? new APIProduct().addAPIProductThumbnail(id, file)
            : new Api().addAPIThumbnail(id, file);

        promisedThumbnail
            .then(() => {
                if (selectedTab === 'upload') {
                    Alert.info(intl.formatMessage({
                        id: 'Apis.Listing.components.ImageGenerator.ThumbnailView.thumbnail.upload.success',
                        defaultMessage: 'Thumbnail uploaded successfully',
                    }));
                } else if (selectedTab === 'remove') {
                    Alert.info(intl.formatMessage({
                        id: 'Apis.Listing.components.ImageGenerator.ThumbnailView.thumbnail.remove.success',
                        defaultMessage: 'Thumbnail removed successfully',
                    }));
                }
                if (selectedTab === 'upload') {
                    this.props.updateAPI({hasThumbnail: true});
                    this.setState({ open: false, thumbnail: windowURL.createObjectURL(file) });
                } else {
                    this.setState((cState) => ({
                        open: false,
                        thumbnail: file.preview,
                        selectedIcon: cState.selectedIconUpdate,
                        color: cState.colorUpdate,
                        backgroundIndex: cState.backgroundIndexUpdate,
                    }));
                }
                setImageUpdate();
            })
            .catch((error) => {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(error);
                }
                Alert.error(intl.formatMessage({
                    id: 'Apis.Listing.components.ImageGenerator.ThumbnailView.thumbnail.upload.error',
                    defaultMessage: 'Error occurred while uploading new thumbnail. Please try again.',
                }));
            })
            .finally(() => {
                this.setState({ uploading: false });
            });
    }

    saveDisableEnable() {
        const {
            file, selectedTab, selectedIconUpdate, colorUpdate, backgroundIndexUpdate, uploading,
        } = this.state;
        if (selectedTab === 'upload') {
            return !(file && file[0]) || uploading; // If no files is uploaded retrun true
        } else if (selectedTab === 'remove') {
            return false;
        } else {
            // If one of them is selected we return false
            return !(selectedIconUpdate || backgroundIndexUpdate || colorUpdate) || uploading;
        }
    }

    /**
     * @inheritdoc
     */
    render() {
        const {
            api, width, height, isEditable, intl, imageUpdate,
        } = this.props;
        const maxSize = 1000000;
        const {
            file,
            thumbnail,
            selectedTab,
            selectedIcon,
            color,
            backgroundIndex,
            uploading,
        } = this.state;
        let { category } = this.state;
        if (!category) category = MaterialIcons.categories[0].name;

        return (
            <div>
                <BaseThumbnail
                    isEditable={isEditable}
                    onClick={this.handleClick('btnEditAPIThumb', intl)}
                    thumbnail={thumbnail}
                    selectedIcon={selectedIcon}
                    color={color}
                    backgroundIndex={backgroundIndex}
                    category={category}
                    api={api}
                    width={width}
                    height={height}
                    imageUpdate={imageUpdate}
                />
                <StyledDialog
                    TransitionComponent={Transition}
                    aria-labelledby='thumb-dialog-title'
                    open={this.state.open}
                    onClose={this.handleClose}
                    fullWidth
                    maxWidth='lg'
                    fullScreen
                    sx={{ border: '1px solid green' }}
                >
                    <Paper square className={classes.popupHeader}>
                        <IconButton
                            color='inherit'
                            onClick={this.handleClose}
                            aria-label='Close'
                            size='large'>
                            <Icon>close</Icon>
                        </IconButton>
                        <RadioGroup
                            aria-label='APIThumbnail'
                            name='apiThumbnail'
                            className={classes.group}
                            value={this.state.selectedTab}
                            onChange={this.handleChange}
                        >
                            <FormControlLabel
                                value='upload'
                                control={<Radio color='primary' />}
                                label={(
                                    <FormattedMessage
                                        id='Apis.Listing.components.ImageGenerator.ThumbnailView.upload'
                                        defaultMessage='Upload'
                                    />
                                )}
                            />
                            <FormControlLabel
                                value='remove'
                                control={<Radio color='primary' />}
                                label={(
                                    <FormattedMessage
                                        id='Apis.Listing.components.ImageGenerator.ThumbnailView.remove'
                                        defaultMessage='Remove'
                                    />
                                )}
                            />
                        </RadioGroup>
                    </Paper>

                    <DialogContent>
                        {selectedTab === 'upload' && (
                            <Grid container spacing={4}>
                                <Grid item xs={3}>
                                    <div className={classes.imageContainer}>
                                        <img
                                            className={classes.preview}
                                            src={
                                                file && file.length > 0
                                                    ? windowURL.createObjectURL(file[0])
                                                    : Configurations.app.context
                                                      + '/site/public/images/api/api-default.png'
                                            }
                                            alt='Thumbnail Preview'
                                        />
                                    </div>
                                </Grid>
                                <Grid item xs={9} id='edit-api-thumbnail-upload'>
                                    <Dropzone
                                        multiple={false}
                                        accept='image/*'
                                        maxSize={maxSize}
                                        className={classes.dropzone}
                                        activeClassName={classes.acceptDrop}
                                        rejectClassName={classes.rejectDrop}
                                        onDrop={(dropFile, rejectedFiles) => {
                                            if (rejectedFiles && rejectedFiles.length > 0) {
                                                if (rejectedFiles[0].errors[0].code === 'file-too-large') { 
                                                    Alert.error(intl.formatMessage({
                                                        id: 'upload.image.size.info',
                                                        defaultMessage: 'Maximum file size limit to 1MB',
                                                    }));
                                                } else {
                                                    Alert.error(rejectedFiles[0].errors[0].message);
                                                }
                                            } else {
                                                this.onDrop(dropFile);
                                            }
                                        }}
                                    >
                                        {({ getRootProps, getInputProps, rejectedFiles }) => {
                                            const isFileTooLarge = rejectedFiles && rejectedFiles.length > 0
                                                && rejectedFiles[0].size > maxSize;
                                            return (
                                                <div {...getRootProps({ style: dropzoneStyles })}>
                                                    <input {...getInputProps()} />
                                                    {isFileTooLarge && (
                                                        <Typography color='error'>
                                                            <FormattedMessage
                                                                id='upload.image.size.error'
                                                                defaultMessage='Uploaded File is too large.
                                                                Maximum file size limit to 1MB'
                                                            />
                                                        </Typography>
                                                    )}
                                                    <div className={classes.dropZoneWrapper}>
                                                        <Icon className={classes.dropIcon}>cloud_upload</Icon>
                                                        <Typography>
                                                            <FormattedMessage
                                                                id='upload.image'
                                                                defaultMessage='Click or drag the image to upload.'
                                                            />
                                                        </Typography>
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    </Dropzone>
                                    <Typography>
                                        <FormattedMessage
                                            id='upload.image.size.info'
                                            defaultMessage='Maximum file size limit to 1MB'
                                        />
                                    </Typography>
                                </Grid>
                            </Grid>
                        )}
                    </DialogContent>
                    <DialogActions className={classes.actionBox}>
                        <Button
                            disabled={this.saveDisableEnable()}
                            variant='contained'
                            color='primary'
                            size='small'
                            onClick={this.handleClick('btnUploadAPIThumb', intl)}
                            id='edit-api-thumbnail-upload-btn'
                        >
                            {selectedTab === 'design' && uploading && (
                                <>
                                    <FormattedMessage
                                        id='Apis.Listing.components.ImageGenerator.ThumbnailView.saving.btn'
                                        defaultMessage='Saving'
                                    />
                                    <CircularProgress size={16} />
                                </>
                            )}
                            {selectedTab === 'design' && !uploading && (
                                <FormattedMessage
                                    id='Apis.Listing.components.ImageGenerator.ThumbnailView.save.btn'
                                    defaultMessage='Save'
                                />
                            )}

                            {selectedTab !== 'design' && uploading && (
                                <>
                                    <FormattedMessage
                                        id='Apis.Listing.components.ImageGenerator.ThumbnailView.uploading.btn'
                                        defaultMessage='Uploading'
                                    />
                                    <CircularProgress size={16} />
                                </>
                            )}
                            {selectedTab === 'upload' && !uploading && (
                                <FormattedMessage
                                    id='Apis.Listing.components.ImageGenerator.ThumbnailView.upload.btn'
                                    defaultMessage='Upload'
                                />
                            )}
                            {selectedTab === 'remove' && !uploading && (
                                <FormattedMessage
                                    id='Apis.Listing.components.ImageGenerator.ThumbnailView.remove.btn'
                                    defaultMessage='Remove'
                                />
                            )}
                        </Button>

                        <Button variant='contained' size='small' onClick={this.handleClose}>
                            <FormattedMessage
                                id='Apis.Listing.components.ImageGenerator.ThumbnailView.cancel.btn'
                                defaultMessage='CANCEL'
                            />
                        </Button>
                    </DialogActions>
                </StyledDialog>
            </div>
        );
    }
}

ThumbnailView.defaultProps = {
    height: 190,
    width: 250,
    isEditable: false,
    setImageUpdate: () => {},
};

ThumbnailView.propTypes = {
    api: PropTypes.shape({}).isRequired,
    imageUpdate: PropTypes.number.isRequired,
    height: PropTypes.number,
    width: PropTypes.number,
    isEditable: PropTypes.bool,
    intl: PropTypes.shape({}).isRequired,
    setImageUpdate: PropTypes.func,
};

export default injectIntl(withAPI((props) => {
    const theme = useTheme();
    return <ThumbnailView {...props} theme={theme} />;
}));
