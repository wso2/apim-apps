import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
    mainStack: {
        boxSizing: 'border-box',
        fontFamily: 'sans-serif',
        padding: 10,
        top: '0px',
        left: '0px',
        bottom: '0px',
        right: '0px',
        width: '100%',
        background: '#0b1332',
        color: 'white',
        textAlign: 'left',
        fontSize: '16px',
        lineHeight: 1.2,
        overflow: 'auto',
    },
    message: {
        fontWeight: 'bold',
    },
    stack: {
        fontFamily: 'monospace',
        marginTop: '2em',
    },
    frame: {
        marginTop: '1em',
    },
    file: {
        fontSize: '0.8em',
        color: 'rgba(255, 255, 255, 0.7)',
    },
    linkToFile: {
        textDecoration: 'none',
        color: 'rgba(255, 255, 255, 0.7)',
    },
}));
export default useStyles;
