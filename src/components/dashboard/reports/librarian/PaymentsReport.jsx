import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../../settings/api'
import { CSVLink } from 'react-csv'
import {
    Box,
    Button,
    Container,
    Grid,
    makeStyles,
    MenuItem,
    Pagination,
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

// Date locale
const localeMap = {
    enUS: enGB,
    frFR: fr,
    zhCN: zhCN,
    arEG: arSA
}

// Date mask
const maskMap = {
    enUS: '__/__/____',
    frFR: '__/__/____',
    zhCN: '__-__-__',
    arEG: '__/__/____'
}

const PaymentsReport = (props) => {
    const csvlink = useRef()
    const classes = useStyles()
    const [payements, setPayments] = useState([])
    const [filteredPayments, setFilteredPayments] = useState([])
    const [filterPayment, setFilterPayment] = useState({
        paid: 'All'
    })
    const [date, setDate] = useState([new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()])
    const { t } = useTranslation()
    const theme = useTheme()
    const [page, setPage] = useState(1)
    const rowPerPage = 5
    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

    // Get data on page load
    useEffect(() => {
        const fetchData = async () => {
            const getPayments = await getPaymentsReport(firstDay, new Date())
            setPayments(getPayments)
            setFilteredPayments(getPayments)
        }
        fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Get new data when date range is updated
    const handleDateUpdate = (date) => {
        setDate(date)
        getNewPaymentsReport(date)
    }

    // Function to get payments data
    const getPaymentsReport = async (from, to) => {
        const getPayments = await axios.post(`${url}/books/paymentssreport`, { from, to }, { withCredentials: true })

        const temp = getPayments.data.map(payment => {
            return {
                PaymentID: payment._id,
                Created: payment.createdAt,
                Paid: payment.paid,
                MemberID: payment.userid.userid,
                BookTitle: payment.bookid.title,
                BookISBN: payment.bookid.isbn,
                BookCopyID: payment.copyid,
                NumberOfDays: payment.numOfDays,
                PricePerDay: payment.pricePerDay,
                BorrowDate: payment.borrowid.createdAt,
                DueDate: payment.borrowid.dueDate,
                ReturnedDate: payment.borrowid.returnedOn
            }
        })
        return temp
    }

    // Get new payments report when date range is updated
    const getNewPaymentsReport = async (date) => {
        if (date[0] instanceof Date && !isNaN(date[0].getTime()) && date[1] instanceof Date && !isNaN(date[1].getTime())) {
            const getPayments = await getPaymentsReport(date[0], date[1])
            setPayments(getPayments)

            if (filterPayment.paid !== 'All')
                handleFilterPayments(filterPayment.paid)
            else
                setFilteredPayments(getPayments)
        }
    }

    // Payment report filter change
    const handlePayChange = (e) => {
        setFilterPayment({
            ...filterPayment,
            [e.target.name]: e.target.value
        })
        handleFilterPayments(e.target.value)
    }

    // Filter data for payments report
    const handleFilterPayments = (value) => {
        if (value === 'All')
            setFilteredPayments([...payements])
        else
            if (value === 'Paid')
                setFilteredPayments(payements.filter(record => record.Paid))
            else if (value === 'Unpaid')
                setFilteredPayments(payements.filter(record => !record.Paid))
    }

    // Download csv file
    const handleDownloadCSV = () => {
        csvlink.current.link.click()
    }

    // Change page
    const handlePagination = (e, value) => {
        setPage(value)
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
                                            <Grid item xs={12} sm={4} md={3} lg={2}>
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
                                            <Grid item xs={12} sm={4} md={3} lg={2}>
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
                            <Grid item xs={12} sm={4} md={3} lg={2}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    height: '100%'
                                }}
                                >
                                    <Button variant="contained" fullWidth onClick={handleDownloadCSV}>{t('downloadcsv')}</Button>
                                    <CSVLink
                                        data={filteredPayments.length === 0 ? 'No records found' : filteredPayments}
                                        filename={`Payments_Report_${new Date().toLocaleDateString()}.csv`}
                                        ref={csvlink}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={4} md={3} lg={2}>
                                <TextField
                                    name="paid"
                                    fullWidth
                                    variant="standard"
                                    label={t('paid')}
                                    select
                                    value={filterPayment.paid}
                                    onChange={handlePayChange}
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
                    <Grid item xs={12} md={11} lg={10}>
                        <Paper className={classes.paper}>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell width={'25%'}>{t('paymentDetails')}</TableCell>
                                        <TableCell width={'10%'}>{t('memberid')}</TableCell>
                                        <TableCell width={'25%'}>{t('bookDetails')}</TableCell>
                                        <TableCell width={'25%'}>{t('borrowDetails')}</TableCell>
                                        <TableCell width={'15%'}>{t('fineDetails')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredPayments.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">{t('noRecords')}</TableCell>
                                        </TableRow>
                                    }
                                    {filteredPayments.slice((page - 1) * rowPerPage, (page - 1) * rowPerPage + rowPerPage).map(record => (
                                        <TableRow key={record.PaymentID}>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('id')}: {record.PaymentID}</Typography>
                                                <Typography variant="caption" display="block">{t('paid')}: {record.Paid === true ? 'Yes' : 'No'}</Typography>
                                                <Typography variant="caption" display="block">{t('date')}: {new Date(record.Created).toLocaleString()}</Typography>
                                            </TableCell>
                                            <TableCell>{record.MemberID}</TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('title')}: {record.BookTitle}</Typography>
                                                <Typography variant="caption" display="block">{t('isbn')}: {record.BookISBN}</Typography>
                                                <Typography variant="caption" display="block">{t('copyId')}: {record.BookCopyID}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('borrowDate')}: {new Date(record.BorrowDate).toLocaleString()}</Typography>
                                                <Typography variant="caption" display="block">{t('dueDate')}: {new Date(record.DueDate).toLocaleString()}</Typography>
                                                <Typography variant="caption" display="block">{t('returnDate')}: {new Date(record.ReturnedDate).toLocaleString()}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('pricePerDay')}: Rs {record.PricePerDay}</Typography>
                                                <Typography variant="caption" display="block">{t('daysOverdue')}: {record.NumberOfDays}</Typography>
                                                <Typography variant="caption" display="block">{t('total')}: Rs {record.PricePerDay * record.NumberOfDays}</Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Grid container justifyContent="center">
                                                <Grid item xs={12}>
                                                    <Pagination
                                                        className={classes.pagination}
                                                        count={Math.ceil(filteredPayments.length / rowPerPage)}
                                                        page={page}
                                                        onChange={handlePagination}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </TableCell>
                                    </TableRow>
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
        minWidth: 850
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
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center'
    }
}))

PaymentsReport.propTypes = {
    locale: PropTypes.string.isRequired
}

export default PaymentsReport