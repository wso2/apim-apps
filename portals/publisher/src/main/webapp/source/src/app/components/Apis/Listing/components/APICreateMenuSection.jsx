import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

const APICreateMenuSection = (props) => {
    const {
        title, children,
    } = props;


    return (
        <Grid
            item
            xs={11}
            sm={5}
            md={2}
        >
            <Box mb={2}>
                <Typography
                    variant='h6'
                    align='left'
                >
                    {title}
                </Typography>
            </Box>
            <Grid
                container
                direction='row'
                justifyContent='flex-start'
                alignItems='center'
                spacing={4}
            >
                {/* Menu links or buttons */}
                {children}
            </Grid>
        </Grid>
    );
};

export default APICreateMenuSection;
