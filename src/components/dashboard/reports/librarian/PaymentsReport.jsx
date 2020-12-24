import React, { useState, useRef } from 'react'
import { CSVLink } from "react-csv"
import { makeStyles } from '@material-ui/core/styles'
import LocalizationProvider from '@material-ui/lab/LocalizationProvider'
import DateRangePicker from '@material-ui/lab/DateRangePicker'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import Container from '@material-ui/core/Container'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { Toolbar, Grid } from '@material-ui/core'
import Box from '@material-ui/core/Box'

const PaymentsReport = (props) => {
    const csvlink = useRef()
    const classes = useStyles()
    const [date, setDate] = useState([new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()])

    const handleDateUpdate = (date) => {
        console.log(date)
        setDate(date)
        props.getNewPaymentsReport(date)
    }

    const handleDownloadCSV = () => {
        csvlink.current.link.click()
    }

    return (
        <>
            <Container>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateRangePicker
                        startText="From"
                        endText="To"
                        value={date}
                        onChange={handleDateUpdate}
                        renderInput={(startProps, endProps) => (
                            <Grid container justifyContent="flex-end" spacing={3}>
                                <Grid item className={classes.title} >
                                    <Toolbar>
                                        <Typography variant="h6">Payment Report</Typography>
                                    </Toolbar>
                                </Grid>
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

                <Grid container justifyContent="flex-end" spacing={3}>
                    <Grid item xs={12} sm={3} md={2}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            height: '100%'
                        }}
                        >
                            <Button variant="outlined" onClick={handleDownloadCSV}>Download CSV</Button>
                            <CSVLink
                                data={props.filteredPayments.length === 0 ? 'No records found' : props.filteredPayments}
                                filename={`Payments_Report_${new Date().toLocaleDateString()}.csv`}
                                ref={csvlink}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={3} md={2}>
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
            </Container>
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
    }
}))


export default PaymentsReport