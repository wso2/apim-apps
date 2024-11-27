import * as React from 'react';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const WelcomeMessage = () => {    
    return (
      <Stack spacing={2} sx={{ maxWidth: '100%', alignItems: 'center', textAlign: 'center' }}>
            <Typography sx={{ color: '#606060', fontWeight: 'bold', fontSize: '1.5rem' }}>
            Welcome to the

            <Typography component="span" sx={{ color: '#5989de', fontWeight: 'bold', fontSize: '1.5rem' }}>
                {' API Design Assistant!'}
            </Typography>
            </Typography>
    
            <Typography sx={{ whiteSpace: 'pre-line', fontSize: '1.0rem'  }}>
                Simplifying the API design process with expert recommendations and enhanced security!{'\n'}
                <Typography sx={{ marginTop: '8px', fontSize: '0.9rem'  }}>
                        Share your API details or
                        <Typography component="span" sx={{ color: '#5989de', fontWeight: 'bold', marginBottom: '5px' }}>
                            {' select a template below '}
                        </Typography>
                        to get started!
                </Typography>
            </Typography>
      </Stack>
    );
};
export default WelcomeMessage