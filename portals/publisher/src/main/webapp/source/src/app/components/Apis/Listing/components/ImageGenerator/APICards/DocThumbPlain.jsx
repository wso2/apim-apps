import React from 'react';
import { styled } from '@mui/material/styles';
import Icon from '@mui/material/Icon';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

const PREFIX = 'DocThumbPlain';

const classes = {
    root: `${PREFIX}-root`,
    bullet: `${PREFIX}-bullet`,
    title: `${PREFIX}-title`,
    pos: `${PREFIX}-pos`,
    thumbHeader: `${PREFIX}-thumbHeader`,
    contextBox: `${PREFIX}-contextBox`,
    caption: `${PREFIX}-caption`,
    imageDisplay: `${PREFIX}-imageDisplay`
};

const StyledCard = styled(Card)((
    {
        theme
    }
) => ({
    [`&.${classes.root}`]: {
        minWidth: 200,
        marginTop: 10,
        marginRight: 10,
        marginBottom: 10,
    },

    [`& .${classes.bullet}`]: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },

    [`& .${classes.title}`]: {
        fontSize: 14,
    },

    [`& .${classes.pos}`]: {
        marginBottom: 12,
    },

    [`& .${classes.thumbHeader}`]: {
        width: '150px',
        color: '#444',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        cursor: 'pointer',
        margin: 0,
        'padding-left': '5px',
    },

    [`& .${classes.contextBox}`]: {
        maxWidth: 120,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },

    [`& .${classes.caption}`]: {
        color: theme.palette.grey[700],
    },

    [`& .${classes.imageDisplay}`]: {
        maxWidth: '40px',
        maxHeight: '40px',
    }
}));

/**
 * Render a thumbnail
 * @param {JSON} props required pros.
 * @returns {JSX} Thumbnail rendered output.
 */
function DocThumbPlain(props) {

    const { doc } = props;
    return (
        <StyledCard className={classes.root} variant='outlined' sx={{ border: '2px solid purple'}}>
            <CardContent>
                <Box>
                    <Link to={'/apis/' + doc.apiUUID + '/documents/' + doc.id + '/details'} aria-hidden='true'>
                        <Box display='flex'>
                            <Box>
                                <Icon className={classes.icon} style={{ fontSize: 40 + 'px', color: '#ccc' }}>
                                    description
                                </Icon>
                            </Box>
                            <Typography
                                variant='h5'
                                gutterBottom
                                title={doc.name}
                                className={classes.thumbHeader}
                            >
                                {doc.name}
                            </Typography>
                        </Box>

                    </Link>
                </Box>
                <Box mt={2}>
                    <Typography variant='subtitle1' className={classes.contextBox}>
                        {doc.apiName}
                    </Typography>
                    <Typography
                        variant='caption'
                        gutterBottom
                        align='right'
                        className={classes.caption}
                        Component='div'
                    >
                        <FormattedMessage
                            id='Apis.Listing.components.ImageGenerator.DocThumb.apiName'
                            defaultMessage='API Name'
                        />
                    </Typography>
                </Box>
                <Box display='flex' mt={2}>
                    <Box flex={1}>
                        <Typography variant='subtitle1'>{doc.sourceType}</Typography>
                        <Typography variant='caption' gutterBottom align='left' className={classes.caption}>
                            <FormattedMessage
                                id='Apis.Listing.components.ImageGenerator.DocThumb.sourceType'
                                defaultMessage='Source Type:'
                            />
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant='subtitle1' align='right' className={classes.contextBox}>
                            {doc.apiVersion}
                        </Typography>
                        <Typography
                            variant='caption'
                            gutterBottom
                            align='right'
                            className={classes.caption}
                            Component='div'
                        >
                            <FormattedMessage
                                id='Apis.Listing.components.ImageGenerator.DocThumb.apiVersion'
                                defaultMessage='API Version'
                            />
                        </Typography>
                    </Box>
                </Box>


            </CardContent>
        </StyledCard>
    );
}

export default DocThumbPlain;
