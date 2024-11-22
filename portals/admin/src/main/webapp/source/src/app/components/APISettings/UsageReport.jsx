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
import Configurations from 'Config';
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
    Image,
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
    fonts: [
        { src: 'https://fonts.gstatic.com/s/roboto/v16/zN7GBFwfMP4uA6AR0HCoLQ.ttf' },
        { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAw.ttf', fontWeight: 'bold' },
    ],
});

const colors = {
    wso2Orange: '#FF7300',
    wso2Black: '#282828',
    wso2White: '#FFFFFF',
    Orange: '#FCAB68',
    lightOrange: '#FFE0B2',
    lightGray: '#F5F5F5',
};

const pdfStyles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 12,
        fontFamily: 'Roboto',
        color: colors.wso2Black,
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        borderBottom: `2px solid ${colors.lightGray}`,
        paddingBottom: 10,
    },
    logo: {
        height: 'auto',
        width: 120,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.wso2Orange,
    },
    table: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: 20,
        width: '100%',
        border: `1px solid ${colors.lightGray}`,
        borderRadius: 5,
        overflow: 'hidden',
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderBottom: `1px solid ${colors.lightGray}`,
    },
    labelColumn: {
        width: '40%',
        textAlign: 'left',
        fontSize: 12,
        fontWeight: 'bold', // Making label text bold
        padding: '5px 10px',
        color: colors.wso2Black,
    },
    valueColumn: {
        width: '60%',
        textAlign: 'left',
        fontSize: 12,
        padding: '5px 10px',
        color: colors.wso2Black,
    },
    alternateRow: {
        backgroundColor: colors.Orange,
    },
    alternateRow2: {
        backgroundColor: colors.lightOrange,
    },
    alternateRow3: {
        backgroundColor: colors.lightGray,
    },
    reportContent: {
        backgroundColor: '#F7F7F7',
        borderRadius: 5,
        marginBottom: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        borderTop: `1px solid ${colors.lightGray}`,
        paddingTop: 10,
        fontSize: 10,
        textAlign: 'center',
    },
});

const logoUrl = '/site/public/images/wso2_logo.png';

const TransactionPDF = ({ startDate, endDate, totalTransactions }) => (
    <Document>
        <Page style={pdfStyles.page}>
            <View style={pdfStyles.header}>
                <Image
                    alt='WSO2 Logo'
                    src={Configurations.app.context + logoUrl}
                    style={pdfStyles.logo}
                />
                <View>
                    <Text style={pdfStyles.title}>Usage Report</Text>
                </View>
            </View>

            <View style={pdfStyles.table}>
                <View style={[pdfStyles.row, pdfStyles.alternateRow2]}>
                    <Text style={pdfStyles.labelColumn}>Report generated on :</Text>
                    <Text style={pdfStyles.valueColumn}>
                        {new Date().toLocaleDateString('en-GB', {
                            day: '2-digit', month: 'long', year: 'numeric',
                        })}
                        {' '}
                        {new Date().toLocaleTimeString('en-GB')}
                    </Text>
                </View>

                <View style={[pdfStyles.row, pdfStyles.alternateRow3]}>
                    <Text style={pdfStyles.labelColumn}>Reporting period :</Text>
                    <Text style={pdfStyles.valueColumn}>
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
                </View>
                <View style={[pdfStyles.row, pdfStyles.alternateRow]}>
                    <Text style={pdfStyles.labelColumn}>Total transaction count :</Text>
                    <Text style={pdfStyles.valueColumn}>
                        {totalTransactions}
                    </Text>
                </View>
            </View>
            <Text style={pdfStyles.footer}>
                {new Date().getFullYear()}
                {' '}
                WSO2 LLC. All Rights Reserved. | Report generated on
                {' '}
                {new Date().toLocaleDateString('en-GB')}
            </Text>
        </Page>
    </Document>
);

export default function UsageReport() {
    const [loading, setLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(0);
    const [startDate] = React.useState(dayjs().subtract(1, 'month'));
    const [endDate] = React.useState(dayjs());

    const [selectedStartDate, setSelectedStartDate] = useState(startDate);
    const [selectedEndDate, setSelectedEndDate] = useState(endDate);

    const fetchTransactionData = () => {
        setLoading(true);

        if (selectedStartDate && selectedEndDate) {
            const api = new API();
            api.getTransactionCount({
                startTime: selectedStartDate.unix().toString(),
                endTime: selectedEndDate.unix().toString(),
            })
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
                            value={selectedStartDate}
                            onChange={(newValue) => setSelectedStartDate(newValue)}
                            shouldDisableDate={(date) => disableFutureDates(date) || disableStartDateAfterEnd(date)}
                        />
                        <DatePicker
                            label='End Date'
                            value={selectedEndDate}
                            onChange={(newValue) => setSelectedEndDate(newValue)}
                            shouldDisableDate={(date) => disableFutureDates(date) || disableEndDateBeforeStart(date)}
                            sx={styles.datePicker}
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid item>
                    <Box sx={{ ...styles.cardContent, marginLeft: 0 }}>
                        {loading ? (
                            <Box sx={styles.loadingIndicator}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <Typography variant='h6' sx={{ textAlign: 'left' }}>
                                    <FormattedMessage
                                        id='TransactionList.total.transactions'
                                        defaultMessage='Total Transaction Count : '
                                    />
                                    {transactionCount}
                                </Typography>
                            </>
                        )}
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            marginTop: 2,
                            gap: 2,
                        }}
                    >
                        <Button
                            variant='contained'
                            color='primary'
                            onClick={fetchTransactionData}
                        >
                            <FormattedMessage
                                id='TransactionList.view.report'
                                defaultMessage='View'
                            />
                        </Button>
                        <PDFDownloadLink
                            document={(
                                <TransactionPDF
                                    startDate={selectedStartDate}
                                    endDate={selectedEndDate}
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
                                    id='TransactionList.download.report'
                                    defaultMessage='Download Report'
                                />
                            </Button>
                        </PDFDownloadLink>
                    </Box>
                </Grid>
            </Grid>
        </ContentBase>
    );
}
