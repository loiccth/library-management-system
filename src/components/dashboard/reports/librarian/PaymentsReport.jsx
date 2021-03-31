import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { CSVLink } from 'react-csv'
import {
    Box,
    Button,
    Container,
    Grid,
    makeStyles,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    ThemeProvider,
    Toolbar,
    Typography,
    useTheme
} from '@material-ui/core'
import { LocalizationProvider, DateRangePicker } from '@material-ui/lab'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import { enGB, fr, zhCN, arSA } from 'date-fns/locale'

const localeMap = {
    enUS: enGB,
    frFR: fr,
    zhCN: zhCN,
    arEG: arSA
}

const maskMap = {
    enUS: '__/__/____',
    frFR: '__/__/____',
    zhCN: '__-__-__',
    arEG: '__/__/____'
}

const PaymentsReport = (props) => {
    const csvlink = useRef()
    const classes = useStyles()
    const [date, setDate] = useState([new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()])
    const { t } = useTranslation()
    const theme = useTheme()

    const handleDateUpdate = (date) => {
        setDate(date)
        props.getNewPaymentsReport(date)
    }

    const handleDownloadCSV = () => {
        csvlink.current.link.click()
    }

    return (
        <>
            <Container>
                <Toolbar>
                    <Typography variant="h6">{t('paymentReport')}</Typography>
                </Toolbar>
            </Container>
            <Box sx={{ mt: 1 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={11} md={10}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} locale={localeMap[props.locale]}>
                            <ThemeProvider theme={{ ...theme, direction: 'ltr' }}>
                                <DateRangePicker
                                    mask={maskMap[props.locale]}
                                    startText={t('from')}
                                    endText={t('to')}
                                    value={date}
                                    onChange={handleDateUpdate}
                                    renderInput={(startProps, endProps) => (
                                        <Grid container className={classes.heading} spacing={1}>
                                            <Grid item xs={12} sm={3} md={2}>
                                                <TextField
                                                    {...startProps}
                                                    variant="standard"
                                                    fullWidth
                                                    InputLabelProps={{
                                                        style: {
                                                            left: theme.direction === 'rtl' ? 'auto' : 0
                                                        }
                                                    }}
                                                    FormHelperTextProps={{
                                                        style: {
                                                            textAlign: theme.direction === 'rtl' ? 'right' : 'left'
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={3} md={2}>
                                                <TextField
                                                    {...endProps}
                                                    variant="standard"
                                                    fullWidth
                                                    InputLabelProps={{
                                                        style: {
                                                            left: theme.direction === 'rtl' ? 'auto' : 0
                                                        }
                                                    }}
                                                    FormHelperTextProps={{
                                                        style: {
                                                            textAlign: theme.direction === 'rtl' ? 'right' : 'left'
                                                        }
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    )}
                                />
                            </ThemeProvider>
                        </LocalizationProvider>
                        <Grid container className={classes.heading} spacing={1}>
                            <Grid item xs={12} sm={5} md={3} lg={2}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    height: '100%'
                                }}
                                >
                                    <Button variant="contained" fullWidth onClick={handleDownloadCSV}>{t('downloadcsv')}</Button>
                                    <CSVLink
                                        data={props.filteredPayments.length === 0 ? 'No records found' : props.filteredPayments}
                                        filename={`Payments_Report_${new Date().toLocaleDateString()}.csv`}
                                        ref={csvlink}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={5} md={3} lg={2}>
                                <TextField
                                    name="paid"
                                    fullWidth
                                    variant="standard"
                                    label="Paid"
                                    select
                                    value={props.filterPayment.paid}
                                    onChange={props.handlePayChange}
                                >
                                    <MenuItem value="All">{t('all')}</MenuItem>
                                    <MenuItem value="Paid">{t('paid')}</MenuItem>
                                    <MenuItem value="Unpaid">{t('unpaid')}</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{ mt: 3 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={12} md={10}>
                        <Paper className={classes.paper}>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('paymentDetails')}</TableCell>
                                        <TableCell>{t('memberid')}</TableCell>
                                        <TableCell>{t('bookDetails')}</TableCell>
                                        <TableCell>{t('amount')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.filteredPayments.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">{t('noRecords')}</TableCell>
                                        </TableRow>
                                    }
                                    {props.filteredPayments.map(record => (
                                        <TableRow key={record.PaymentID}>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('id')}: {record.PaymentID}</Typography>
                                                <Typography variant="caption" display="block">{t('paid')}: {record.Paid === true ? 'Yes' : 'No'}</Typography>
                                                <Typography variant="caption" display="block">{t('date')}: {record.Created}</Typography>
                                            </TableCell>
                                            <TableCell>{record.MemberID}</TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('title')}: {record.BookTitle}</Typography>
                                                <Typography variant="caption" display="block">{t('isbn')}: {record.BookISBN}</Typography>
                                                {record.Transaction === 'Borrow' && <Typography variant="caption" display="block">{t('copyId')}: {record.BookCopyID}</Typography>}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('pricePerDay')}: Rs {record.PricePerDay}</Typography>
                                                <Typography variant="caption" display="block">{t('daysOverdue')}: {record.NumberOfDays}</Typography>
                                                <Typography variant="caption" display="block">{t('total')}: Rs {record.PricePerDay * record.NumberOfDays}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </>
    )
}

const useStyles = makeStyles(theme => ({
    table: {
        minWidth: 650,
        overflowX: 'auto'
    },
    title: {
        flex: 1
    },
    paper: {
        overflowX: 'auto'
    },
    heading: {
        justifyContent: 'flex-end',
        [theme.breakpoints.down("sm")]: {
            justifyContent: 'center'
        }
    }
}))

PaymentsReport.propTypes = {
    filteredPayments: PropTypes.array.isRequired,
    filterPayment: PropTypes.object.isRequired,
    getNewPaymentsReport: PropTypes.func.isRequired,
    handlePayChange: PropTypes.func.isRequired,
    locale: PropTypes.string.isRequired
}

export default PaymentsReport