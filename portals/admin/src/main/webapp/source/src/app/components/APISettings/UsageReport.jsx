/*
* Copyright (c) 2024, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
*
* WSO2 LLC. licenses this file to you under the Apache License,
* Version 2.0 (the 'License"); you may not use this file except
* in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
    PDFDownloadLink,
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Font,
} from '@react-pdf/renderer';
import API from '../../data/api';

const styles = {
    card: {
        display: 'flex',
        flexDirection: 'column',
        padding: 2,
    },
    cardContent: {
        marginTop: 2,
        marginBottom: 2,
        marginLeft: 2,
    },
    datePicker: {
        marginLeft: 2,
    },
    downloadButton: {
        marginBottom: 2,
        marginLeft: 2,
    },
    loadingIndicator: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    },
};

Font.register({
    family: 'Roboto',
    src: 'https://fonts.gstatic.com/s/roboto/v16/zN7GBFwfMP4uA6AR0HCoLQ.ttf',
});

const pdfStyles = StyleSheet.create({
    page: {
        padding: 60,
        fontSize: 12,
        fontFamily: 'Roboto',
    },
    header: {
        marginBottom: 15,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 20,
    },
    section: {
        marginBottom: 10,
    },
    label: {
        fontSize: 12,
        marginBottom: 1,
    },
});

const TransactionPDF = ({ startDate, endDate, totalTransactions }) => (
    <Document>
        <Page style={pdfStyles.page}>
            <View style={pdfStyles.header}>
                <Text style={pdfStyles.title}>Usage Report</Text>
            </View>

            <View style={pdfStyles.section}>
                <Text style={pdfStyles.label}>
                    Report generated on :
                    {' '}
                    {new Date().toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'long', year: 'numeric',
                    })}
                    {' '}
                    {new Date().toLocaleTimeString('en-GB')}
                </Text>
            </View>

            <View style={pdfStyles.section}>
                <Text style={pdfStyles.label}>
                    Reporting period :
                    {' '}
                    {new Date(startDate).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'long', year: 'numeric',
                    })}
                    {' '}
                    to
                    {' '}
                    {new Date(endDate).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'long', year: 'numeric',
                    })}
                </Text>
                <Text style={pdfStyles.label}>
                    Total transaction count :
                    {' '}
                    {totalTransactions}
                </Text>
            </View>

        </Page>
    </Document>
);

export default function UsageReport() {
    const [loading, setLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(0);
    const [startDate, setStartDate] = React.useState(dayjs().subtract(1, 'month'));
    const [endDate, setEndDate] = React.useState(dayjs());

    const fetchTransactionData = () => {
        setLoading(true);

        if (startDate && endDate) {
            const api = new API();
            api.getTransactionCount({ startTime: startDate.unix().toString(), endTime: endDate.unix().toString() })
                .then((result) => {
                    setTransactionCount(result.body.count);
                })
                .catch((error) => {
                    console.error('Error fetching transaction count:', error);
                    throw error;
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    };

    useEffect(() => {
        if (startDate && endDate) {
            fetchTransactionData();
        }
    }, [startDate, endDate]);

    const disableFutureDates = (date) => date.isAfter(dayjs());

    const disableEndDateBeforeStart = (date) => startDate && date.isBefore(startDate, 'day');
    const disableStartDateAfterEnd = (date) => endDate && date.isAfter(endDate, 'day');

    return (
        <ContentBase
            title={(
                <FormattedMessage
                    id='Settings.UsageReport.title'
                    defaultMessage='Usage Report'
                />
            )}
        >
            <Grid container sx={styles.card}>
                <Grid item>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                            label='Start Date'
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                            shouldDisableDate={(date) => disableFutureDates(date) || disableStartDateAfterEnd(date)}
                        />
                        <DatePicker
                            label='End Date'
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
                            shouldDisableDate={(date) => disableFutureDates(date) || disableEndDateBeforeStart(date)}
                            sx={styles.datePicker}
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid item>
                    <Box sx={styles.cardContent}>
                        {loading ? (
                            <Box sx={styles.loadingIndicator}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <Typography variant='h6'>
                                    <FormattedMessage
                                        id='TransactionList.total.transactions'
                                        defaultMessage='Total Transaction Count : '
                                    />
                                    {transactionCount}
                                </Typography>
                            </>
                        )}
                    </Box>
                    <PDFDownloadLink
                        document={(
                            <TransactionPDF
                                startDate={startDate}
                                endDate={endDate}
                                totalTransactions={transactionCount}
                            />
                        )}
                        fileName='usage_report.pdf'
                        style={{ textDecoration: 'none' }}
                    >
                        <Button
                            variant='contained'
                            color='primary'
                            disabled={loading}
                        >
                            <FormattedMessage
                                id='TransactionList.download.pdf'
                                defaultMessage='Download PDF'
                            />
                        </Button>
                    </PDFDownloadLink>
                </Grid>
            </Grid>
        </ContentBase>
    );
}
