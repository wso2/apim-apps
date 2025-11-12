import React from 'react';
import { TableRow, TableCell, Tooltip, IconButton, Icon } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';

export default function EndpointRow({
    labelId,
    defaultLabel,
    endpoint,
    urlCopied,
    onCopy,
    classes,
}) {
    const intl = useIntl(); // ✅ Now the component handles its own intl instance

    if (!endpoint) {
        return null;
    }

    return (
        <TableRow>
            <TableCell component="th" scope="row" className={classes.leftCol}>
                <FormattedMessage id={labelId} defaultMessage={defaultLabel} />
            </TableCell>
            <TableCell>
                {endpoint}
                <Tooltip
                    title={
                        urlCopied
                            ? intl.formatMessage({
                                  id: 'Shared.AppsAndKeys.KeyConfiguration.copied',
                                  defaultMessage: 'Copied',
                              })
                            : intl.formatMessage({
                                  id: 'Shared.AppsAndKeys.KeyConfiguration.copy.to.clipboard',
                                  defaultMessage: 'Copy to clipboard',
                              })
                    }
                    placement="right"
                    className={classes.iconStyle}
                >
                    <IconButton
                        aria-label="Copy to clipboard"
                        classes={{ root: classes.iconButton }}
                        size="large"
                        onClick={() => {
                            navigator.clipboard.writeText(endpoint).then(onCopy);
                        }}
                    >
                        <Icon color="secondary">file_copy</Icon>
                    </IconButton>
                </Tooltip>
            </TableCell>
        </TableRow>
    );
}
