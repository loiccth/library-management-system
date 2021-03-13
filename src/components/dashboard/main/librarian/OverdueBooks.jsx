import React, { useState } from 'react'
import axios from 'axios'
import url from '../../../../settings/api'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Checkbox from '@material-ui/core/Checkbox'
import Typography from '@material-ui/core/Typography'
import AutorenewIcon from '@material-ui/icons/Autorenew'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'
import Tooltip from '@material-ui/core/Tooltip'
import { Button, Toolbar, Container } from '@material-ui/core'
import Snackbar from '@material-ui/core/Snackbar'
import Alert from '@material-ui/core/Alert'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'

const OverdueBooks = (props) => {
    const classes = useStyles()
    const [check, setCheck] = useState(false)
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)

    const handleClick = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleOnClick = () => {
        axios.post(`${url}/users/notify`, { type: 'overdue', books: props.overdueBooks }, { withCredentials: true })
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
        props.handleUncheckAll()
        setCheck(false)
    }

    const handleCheckAll = (e) => {
        setCheck(e.target.checked)
        props.handleCheckAll(e)
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
                    <Typography variant="h6">Overdue Books</Typography>
                </Toolbar>
            </Container>
            <Box sx={{ mt: 1 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={11} md={10}>
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
                    <Grid item xs={11} md={10}>
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
                                    {props.overdueBooks.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">No records found.</TableCell>
                                        </TableRow>
                                    }
                                    {props.overdueBooks.map(row => (
                                        <TableRow key={row._id}>
                                            <TableCell component="th" scope="row">
                                                <Checkbox value={row._id} checked={row.checked} color="primary" onChange={props.handleCheck} />
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
    paper: {
        overflowX: 'auto'
    },
    table: {
        minWidth: 650,
        overflowX: 'auto'
    },
    heading: {
        justifyContent: 'flex-end',
        [theme.breakpoints.down("sm")]: {
            justifyContent: 'center'
        }
    }
}))

export default OverdueBooks