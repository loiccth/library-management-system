import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Container from '@material-ui/core/Container'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import FiberNewIcon from '@material-ui/icons/FiberNew'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'
import Tooltip from '@material-ui/core/Tooltip'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'

const ReservedBooks = (props) => {
    const classes = useStyles()
    const [open, setOpen] = useState(false)

    const handleToggle = () => {
        setOpen(!open)
    }

    const handleCancel = (id) => {
        setOpen(false)
        props.handleCancel(id)
    }

    return (
        <>
            <Container>
                <Toolbar>
                    <Typography variant="h6">Reservations</Typography>
                </Toolbar>
            </Container>
            <Box sx={{ mt: 3 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={12} md={10}>
                        <Paper className={classes.paper}>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Reservation Details</TableCell>
                                        <TableCell>Book Details</TableCell>
                                        <TableCell>Availability</TableCell>
                                        <TableCell>Flags</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.reserved.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">No records found.</TableCell>
                                        </TableRow>
                                    }
                                    {props.reserved.map(row => (
                                        <TableRow key={row._id}>
                                            <TableCell>
                                                <Typography variant="caption" display="block">Reserved Date: {new Date(row.createdAt).toLocaleString()}</Typography>
                                                <Typography variant="caption" display="block">Expire Date: {row.expireAt ? new Date(row.expireAt).toLocaleString() : 'TBD'}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">Title: {row.bookid.title}</Typography>
                                                <Typography variant="caption" display="block">ISBN: {row.bookid.isbn}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">Total: {row.bookid.copies.length}</Typography>
                                                <Typography variant="caption" display="block">On loan: {row.bookid.noOfBooksOnLoan}</Typography>
                                                <Typography variant="caption" display="block">On hold: {row.bookid.noOfBooksOnHold}</Typography>
                                                <Typography variant="caption" display="block">Reservation: {row.bookid.reservation.length}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="Recently Added" arrow>
                                                    <FiberNewIcon />
                                                </Tooltip>
                                                {row.bookid.isHighDemand &&
                                                    <Tooltip title="High Demand" arrow>
                                                        <PriorityHighIcon className={classes.highpriority} />
                                                    </Tooltip>
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="contained" onClick={handleToggle} >Cancel</Button>
                                                <Dialog
                                                    open={open}
                                                    onClose={handleToggle}
                                                    aria-labelledby="alert-dialog-title"
                                                    aria-describedby="alert-dialog-description"
                                                >
                                                    <DialogContent>
                                                        <DialogContentText id="alert-dialog-description">
                                                            {`Are you sure you want to cancel reservation for ${row.bookid.title}?`}
                                                        </DialogContentText>
                                                    </DialogContent>
                                                    <DialogActions>
                                                        <Button onClick={handleToggle} variant="contained" color="secondary">
                                                            Cancel
                                                            </Button>
                                                        <Button onClick={() => handleCancel(row.bookid._id)} variant="contained" autoFocus>
                                                            Confirm
                                                            </Button>
                                                    </DialogActions>
                                                </Dialog>
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
    highpriority: {
        color: 'red'
    }
}))

export default ReservedBooks