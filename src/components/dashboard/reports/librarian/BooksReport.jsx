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
                <Toolbar>
                    <Typography variant="h6">Transaction Report</Typography>
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
                                        <Grid item xs={12} sm={5} md={3} lg={2}>
                                            <TextField {...startProps} variant="standard" fullWidth />
                                        </Grid>
                                        <Grid item xs={12} sm={5} md={3} lg={2}>
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
                                        data={props.filteredBooks.length === 0 ? 'No records found' : props.filteredBooks}
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
                            <Grid item xs={12} sm={5} md={3} lg={2}>
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
                                        <TableCell>Transaction Details</TableCell>
                                        <TableCell>MemberID</TableCell>
                                        <TableCell>Book Details</TableCell>
                                        <TableCell>Reservation Details</TableCell>
                                        <TableCell>Borrow Details</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.filteredBooks.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">No records found.</TableCell>
                                        </TableRow>
                                    }
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

BooksReport.propTypes = {
    filteredBooks: PropTypes.array.isRequired,
    filterBooks: PropTypes.object.isRequired,
    getNewBooksReport: PropTypes.func.isRequired,
    handleBookChange: PropTypes.func.isRequired
}

export default BooksReport