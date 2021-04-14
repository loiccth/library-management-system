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

const TransactionsReport = (props) => {
    const csvlink = useRef()
    const classes = useStyles()
    const [transactions, setTransactions] = useState([])
    const [filteredTransactions, setFilteredTransactions] = useState([])
    const [filterTransactions, setFilterTransactions] = useState({
        type: 'All',
        status: 'All'
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
            const getTransactions = await getTransactionsReport(firstDay, new Date())
            setTransactions(getTransactions)
            setFilteredTransactions(getTransactions)
        }
        fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Change filter type
    const handleTransactionChange = (e) => {
        setFilterTransactions({
            ...filterTransactions,
            [e.target.name]: e.target.value
        })
        handleFilterTransactions(e.target.name, e.target.value)
    }

    // Get new data on date range update
    const handleDateUpdate = (date) => {
        setDate(date)
        getNewTransactionsReport(date)
    }

    // Function to get transactions data
    const getTransactionsReport = async (from, to) => {
        const getBooks = await axios.post(`${url}/books/transactionsreport`, { from, to }, { withCredentials: true })

        const temp = getBooks.data.map(transaction => {
            return {
                Transaction: transaction.transactionType,
                TransactionID: transaction._id,
                Created: new Date(transaction.createdAt).toLocaleString(),
                Status: transaction.status,
                MemberID: transaction.userid.userid,
                BookTitle: transaction.bookid.title,
                BookISBN: transaction.bookid.isbn,
                BookCopyID: transaction.transactionType === 'Reserve' ? 'null' : transaction.copyid,
                ReservationExpire: transaction.transactionType === 'Reserve' ? new Date(transaction.expireAt).toLocaleString() : 'null',
                ReservationCancelled: transaction.transactionType === 'Reserve' ? transaction.isCancel : 'null',
                HighDemand: transaction.transactionType === 'Reserve' ? 'null' : transaction.isHighDemand,
                Renews: transaction.transactionType === 'Reserve' ? 'null' : transaction.renews,
                RenewDates: transaction.transactionType === 'Reserve' ? 'null' : transaction.renewedOn,
                Due: transaction.transactionType === 'Reserve' ? 'null' : new Date(transaction.dueDate).toLocaleString(),
                Returned: transaction.transactionType === 'Reserve' ? 'null' : transaction.returnedOn && new Date(transaction.returnedOn).toLocaleString()
            }
        })
        return temp
    }

    // Get new transactons report when date range is updated
    const getNewTransactionsReport = async (date) => {
        if (date[0] instanceof Date && !isNaN(date[0].getTime()) && date[1] instanceof Date && !isNaN(date[1].getTime())) {
            const getBooks = await getTransactionsReport(date[0], date[1])
            setTransactions(getBooks)

            if (filterTransactions.type !== 'All')
                handleFilterTransactions('type', filterTransactions.type)
            else if (filterTransactions.status !== 'All')
                handleFilterTransactions('status', filterTransactions.status)
            else
                setFilteredTransactions(getBooks)
        }
    }

    // Filter data depending on filters
    const handleFilterTransactions = (key, value) => {
        if (key === 'type') {
            if (value !== 'All' && filterTransactions.status !== 'All')
                setFilteredTransactions(transactions.filter((record) => record.Transaction === value && record.Status === filterTransactions.status))
            else if (filterTransactions.status !== 'All')
                setFilteredTransactions(transactions.filter((record) => record.Status === filterTransactions.status))
            else if (value !== 'All')
                setFilteredTransactions(transactions.filter((record) => record.Transaction === value))
            else
                setFilteredTransactions([...transactions])
        }
        if (key === 'status') {
            if (value !== 'All' && filterTransactions.type !== 'All') {
                setFilteredTransactions(transactions.filter((record) => record.Status === value && record.Transaction === filterTransactions.type))
            }
            else if (filterTransactions.type !== 'All')
                setFilteredTransactions(transactions.filter((record) => record.Transaction === filterTransactions.type))
            else if (value !== 'All')
                setFilteredTransactions(transactions.filter((record) => record.Status === value))
            else
                setFilteredTransactions([...transactions])
        }
    }

    // Download csv
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
                    <Typography variant="h6">{t('transactionReport')}</Typography>
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
                                            <Grid item xs={12} sm={5} md={3} lg={2}>
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
                                            <Grid item xs={12} sm={5} md={3} lg={2}>
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
                                        data={filteredTransactions.length === 0 ? 'No records found' : filteredTransactions}
                                        filename={`Book_Transactions_Report_${new Date().toLocaleDateString()}.csv`}
                                        ref={csvlink}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={5} md={3} lg={2}>
                                <TextField
                                    name="type"
                                    fullWidth
                                    variant="standard"
                                    label={t('type')}
                                    select
                                    value={filterTransactions.type}
                                    onChange={handleTransactionChange}
                                >
                                    <MenuItem value="All">{t('all')}</MenuItem>
                                    <MenuItem value="Reserve">{t('reserve')}</MenuItem>
                                    <MenuItem value="Borrow">{t('borrow')}</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={5} md={3} lg={2}>
                                <TextField
                                    name="status"
                                    fullWidth
                                    variant="standard"
                                    label={t('status')}
                                    select
                                    value={filterTransactions.status}
                                    onChange={handleTransactionChange}
                                >
                                    <MenuItem value="All">{t('all')}</MenuItem>
                                    <MenuItem value="active">{t('active')}</MenuItem>
                                    <MenuItem value="archive">{t('archived')}</MenuItem>
                                    {filterTransactions.type === 'Reserve' && <MenuItem value="expired">{t('expired')}</MenuItem>}
                                </TextField>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>


            <Box sx={{ mt: 3 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={11} md={10}>
                        <Paper className={classes.paper}>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell width={'20%'}>{t('transactionDetails')}</TableCell>
                                        <TableCell width={'15%'}>{t('memberid')}</TableCell>
                                        <TableCell width={'25%'}>{t('bookDetails')}</TableCell>
                                        <TableCell width={'20%'}>{t('reservations')}</TableCell>
                                        <TableCell width={'20%'}>{t('borrowDetails')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredTransactions.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">{t('noRecords')}</TableCell>
                                        </TableRow>
                                    }
                                    {filteredTransactions.slice((page - 1) * rowPerPage, (page - 1) * rowPerPage + rowPerPage).map(record => (
                                        <TableRow key={record.TransactionID}>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('type')}: {record.Transaction}</Typography>
                                                <Typography variant="caption" display="block">{t('id')}: {record.TransactionID}</Typography>
                                                <Typography variant="caption" display="block">{t('date')}: {record.Created}</Typography>
                                                <Typography variant="caption" display="block">{t('status')}: {record.Status}</Typography>
                                            </TableCell>
                                            <TableCell>{record.MemberID}</TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('title')}: {record.BookTitle}</Typography>
                                                <Typography variant="caption" display="block">{t('isbn')}: {record.BookISBN}</Typography>
                                                {record.Transaction === 'Borrow' && <Typography variant="caption" display="block">{t('copyId')}: {record.BookCopyID}</Typography>}
                                            </TableCell>
                                            {record.Transaction === 'Reserve' ?
                                                <TableCell>
                                                    <Typography variant="caption" display="block">{t('expire')}: {record.ReservationExpire}</Typography>
                                                    <Typography variant="caption" display="block">{t('cancel')}: {record.ReservationCancelled === true ? "Yes" : "No"}</Typography>
                                                </TableCell>
                                                :
                                                <TableCell></TableCell>
                                            }
                                            {record.Transaction === 'Borrow' ?
                                                <TableCell>
                                                    <Typography variant="caption" display="block">{t('highDemand')}: {record.HighDemand === true ? "Yes" : "No"}</Typography>
                                                    <Typography variant="caption" display="block">{t('renews')}: {record.Renews}</Typography>
                                                    <Typography variant="caption" display="block">{t('due')}: {record.Due}</Typography>
                                                    <Typography variant="caption" display="block">{t('return')}: {record.Returned === undefined ? "N/A" : record.Returned}</Typography>
                                                </TableCell>
                                                :
                                                <TableCell></TableCell>
                                            }
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Grid container justifyContent="center">
                                                <Grid item xs={12}>
                                                    <Pagination
                                                        className={classes.pagination}
                                                        count={Math.ceil(filteredTransactions.length / rowPerPage)}
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
        minWidth: 900,
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
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center'
    }
}))

TransactionsReport.propTypes = {
    locale: PropTypes.string.isRequired
}

export default TransactionsReport