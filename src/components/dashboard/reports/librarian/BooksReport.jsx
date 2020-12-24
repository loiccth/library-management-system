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

const BooksReport = (props) => {
    const csvlink = useRef()
    const classes = useStyles()
    const [date, setDate] = useState([new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()])

    const handleDateUpdate = (date) => {
        setDate(date)
        props.getNewBooksReport(date)
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
                                        <Typography variant="h6">Transaction Report</Typography>
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
                                data={props.filteredBooks.length === 0 ? 'No records found' : props.filteredBooks}
                                filename={`Book_Transactions_Report_${new Date().toLocaleDateString()}.csv`}
                                ref={csvlink}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={3} md={2}>
                        <TextField
                            name="type"
                            fullWidth
                            variant="standard"
                            label="Type"
                            select
                            value={props.filterBooks.type}
                            onChange={props.handleBookChange}
                        >
                            <MenuItem value="All">All</MenuItem>
                            <MenuItem value="Reserve">Reserve</MenuItem>
                            <MenuItem value="Borrow">Borrow</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={3} md={2}>
                        <TextField
                            name="status"
                            fullWidth
                            variant="standard"
                            label="Status"
                            select
                            value={props.filterBooks.status}
                            onChange={props.handleBookChange}
                        >
                            <MenuItem value="All">All</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="archive">Archived</MenuItem>
                            {props.filterBooks.type === 'Reserve' && <MenuItem value="expired">Expired</MenuItem>}
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
                                    <TableCell>Transaction Details</TableCell>
                                    <TableCell>MemberID</TableCell>
                                    <TableCell>Book Details</TableCell>
                                    <TableCell>Reservation Details</TableCell>
                                    <TableCell>Borrow Details</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {props.filteredBooks.map(record => (
                                    <TableRow key={record.TransactionID}>
                                        <TableCell>
                                            <Typography variant="caption" display="block">Type: {record.Transaction}</Typography>
                                            <Typography variant="caption" display="block">ID: {record.TransactionID}</Typography>
                                            <Typography variant="caption" display="block">Date: {record.Created}</Typography>
                                            <Typography variant="caption" display="block">Status: {record.Status}</Typography>
                                        </TableCell>
                                        <TableCell>{record.MemberID}</TableCell>
                                        <TableCell>
                                            <Typography variant="caption" display="block">Title: {record.BookTitle}</Typography>
                                            <Typography variant="caption" display="block">ISBN: {record.BookISBN}</Typography>
                                            {record.Transaction === 'Borrow' && <Typography variant="caption" display="block">CopyID: {record.BookCopyID}</Typography>}
                                        </TableCell>
                                        {record.Transaction === 'Reserve' ?
                                            <TableCell>
                                                <Typography variant="caption" display="block">Expire: {record.ReservationExpire}</Typography>
                                                <Typography variant="caption" display="block">Cancelled: {record.ReservationCancelled === true ? "Yes" : "No"}</Typography>
                                            </TableCell>
                                            :
                                            <TableCell></TableCell>
                                        }
                                        {record.Transaction === 'Borrow' ?
                                            <TableCell>
                                                <Typography variant="caption" display="block">High Demand: {record.HighDemand === true ? "Yes" : "No"}</Typography>
                                                <Typography variant="caption" display="block">Renews: {record.Renews}</Typography>
                                                <Typography variant="caption" display="block">Due: {record.Due}</Typography>
                                                <Typography variant="caption" display="block">Return: {record.Returned === undefined ? "N/A" : record.Returned}</Typography>
                                            </TableCell>
                                            :
                                            <TableCell></TableCell>
                                        }
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


export default BooksReport