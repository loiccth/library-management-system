import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
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
    Toolbar,
    Typography
} from '@material-ui/core'
import { LocalizationProvider, DateRangePicker } from '@material-ui/lab'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import frLocale from 'date-fns/locale/fr'

const localeMap = {
    fr: frLocale,
}

const maskMap = {
    fr: '__/__/____',
}

const PaymentsReport = (props) => {
    const csvlink = useRef()
    const classes = useStyles()
    const [date, setDate] = useState([new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()])

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
                    <Typography variant="h6">Payment Report</Typography>
                </Toolbar>
            </Container>
            <Box sx={{ mt: 1 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={11} md={10}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} locale={localeMap['fr']}>
                            <DateRangePicker
                                mask={maskMap['fr']}
                                startText="From"
                                endText="To"
                                value={date}
                                onChange={handleDateUpdate}
                                renderInput={(startProps, endProps) => (
                                    <Grid container className={classes.heading} spacing={1}>
                                        <Grid item xs={12} sm={3} md={2}>
                                            <TextField {...startProps} variant="standard" fullWidth />
                                        </Grid>
                                        <Grid item xs={12} sm={3} md={2}>
                                            <TextField {...endProps} variant="standard" fullWidth />
                                        </Grid>
                                    </Grid>
                                )}
                            />
                        </LocalizationProvider>
                        <Grid container className={classes.heading} spacing={1}>
                            <Grid item xs={12} sm={5} md={3} lg={2}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    height: '100%'
                                }}
                                >
                                    <Button variant="contained" fullWidth onClick={handleDownloadCSV}>Download CSV</Button>
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
                                    <MenuItem value="All">All</MenuItem>
                                    <MenuItem value="Paid">Paid</MenuItem>
                                    <MenuItem value="Unpaid">Unpaid</MenuItem>
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
                                        <TableCell>Payment Details</TableCell>
                                        <TableCell>MemberID</TableCell>
                                        <TableCell>Book Details</TableCell>
                                        <TableCell>Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.filteredPayments.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">No records found.</TableCell>
                                        </TableRow>
                                    }
                                    {props.filteredPayments.map(record => (
                                        <TableRow key={record.PaymentID}>
                                            <TableCell>
                                                <Typography variant="caption" display="block">ID: {record.PaymentID}</Typography>
                                                <Typography variant="caption" display="block">Paid: {record.Paid === true ? 'Yes' : 'No'}</Typography>
                                                <Typography variant="caption" display="block">Date: {record.Created}</Typography>
                                            </TableCell>
                                            <TableCell>{record.MemberID}</TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">Title: {record.BookTitle}</Typography>
                                                <Typography variant="caption" display="block">ISBN: {record.BookISBN}</Typography>
                                                {record.Transaction === 'Borrow' && <Typography variant="caption" display="block">CopyID: {record.BookCopyID}</Typography>}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">Price per day: Rs {record.PricePerDay}</Typography>
                                                <Typography variant="caption" display="block">Day(s) overdue: {record.NumberOfDays}</Typography>
                                                <Typography variant="caption" display="block">Total: Rs {record.PricePerDay * record.NumberOfDays}</Typography>
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
    handlePayChange: PropTypes.func.isRequired
}

export default PaymentsReport