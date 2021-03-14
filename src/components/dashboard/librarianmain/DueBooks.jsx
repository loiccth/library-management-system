import React, { useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import url from '../../../settings/api'
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Container,
    Grid,
    makeStyles,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Toolbar,
    Tooltip,
    Typography,
} from '@material-ui/core'
import { LocalizationProvider, DateRangePicker } from '@material-ui/lab'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import AutorenewIcon from '@material-ui/icons/Autorenew'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'

const DueBooks = (props) => {
    const classes = useStyles()
    const [check, setCheck] = useState(false)
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const [date, setDate] = useState([new Date(), new Date()])

    const handleDateUpdate = (date) => {
        setDate(date)
        props.getNewDueBooks(date)
    }

    const handleClick = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleOnClick = () => {
        axios.post(`${url}/users/notify`, { type: 'due', books: props.dueBooks }, { withCredentials: true })
            .then(result => {
                setSnackbar({
                    type: 'success',
                    msg: `Success! ${result.data.length} notification(s) sent.`
                })
            })
            .catch(err => {
                setSnackbar({
                    type: 'warning',
                    msg: err.response.data.error
                })
            })
            .finally(() => {
                handleClick()
            })
        props.handleUncheckAllDue()
        setCheck(false)
    }

    const handleCheckAll = (e) => {
        setCheck(e.target.checked)
        props.handleCheckAllDue(e)
    }

    return (
        <>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert elevation={6} severity={snackbar.type === 'success' ? 'success' : 'warning'} onClose={handleClose}>
                    {snackbar.msg}
                </Alert>
            </Snackbar>
            <Container>
                <Toolbar>
                    <Typography variant="h6">Due Books</Typography>
                </Toolbar>
            </Container>
            <Box sx={{ mt: 1 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={11} md={10}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateRangePicker
                                startText="From"
                                endText="To"
                                value={date}
                                minDate={new Date()}
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
                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleOnClick}
                                >
                                    Send Reminder
                                </Button>
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
                                        <TableCell>
                                            <Checkbox checked={check} color="primary" onChange={handleCheckAll} />
                                        </TableCell>
                                        <TableCell>MemberID</TableCell>
                                        <TableCell>Book Details</TableCell>
                                        <TableCell>Borrow Details</TableCell>
                                        <TableCell>Flags</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.dueBooks.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">No records found.</TableCell>
                                        </TableRow>
                                    }
                                    {props.dueBooks.map(row => (
                                        <TableRow key={row._id}>
                                            <TableCell component="th" scope="row">
                                                <Checkbox value={row._id} checked={row.checked} color="primary" onChange={props.handleCheckDue} />
                                            </TableCell>
                                            <TableCell>
                                                {row.userid}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">Title: {row.title}</Typography>
                                                <Typography variant="caption" display="block">ISBN: {row.isbn}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">Borrow: {row.isHighDemand ? new Date(row.borrowDate).toLocaleString() : new Date(row.borrowDate).toLocaleDateString()}</Typography>
                                                <Typography variant="caption" display="block">Due: {row.isHighDemand ? new Date(row.dueDate).toLocaleString() : new Date(row.dueDate).toLocaleDateString()}</Typography>
                                                <Typography variant="caption" display="block">Renews: {row.renews}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                {/* TODO: get amount from db */}
                                                {row.renews === 3 &&
                                                    <Tooltip title="Max Renews" arrow>
                                                        <AutorenewIcon />
                                                    </Tooltip>
                                                }
                                                {row.isHighDemand &&
                                                    <Tooltip title="High Demand" arrow>
                                                        <PriorityHighIcon />
                                                    </Tooltip>
                                                }
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

DueBooks.propTypes = {
    dueBooks: PropTypes.array.isRequired,
    getNewDueBooks: PropTypes.func.isRequired,
    handleCheckDue: PropTypes.func.isRequired,
    handleCheckAllDue: PropTypes.func.isRequired,
    handleUncheckAllDue: PropTypes.func.isRequired,
}

export default DueBooks