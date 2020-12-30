import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
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
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import FiberNewIcon from '@material-ui/icons/FiberNew'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'
import Tooltip from '@material-ui/core/Tooltip'

const BorrowedBooks = (props) => {
    const classes = useStyles()
    const [open, setOpen] = useState(false)

    const handleToggle = () => {
        setOpen(!open)
    }

    const handleRenew = (id) => {
        setOpen(false)
        props.handleRenew(id)
    }

    return (
        <>
            <Container>
                <Toolbar>
                    <Typography variant="h6">On Loan</Typography>
                </Toolbar>
            </Container>
            <Box sx={{ mt: 3 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={12} md={10}>
                        <Paper className={classes.paper}>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Book Details</TableCell>
                                        <TableCell>Loan Details</TableCell>
                                        <TableCell>Other Details</TableCell>
                                        <TableCell>Flag(s)</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.borrowed.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">No records found.</TableCell>
                                        </TableRow>
                                    }
                                    {props.borrowed.map(row => (
                                        <TableRow key={row._id}>
                                            <TableCell>
                                                <Typography variant="caption" display="block">Title: {row.bookid.title}</Typography>
                                                <Typography variant="caption" display="block">ISBN: {row.bookid.isbn}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">Loan Date: {new Date(row.createdAt).toLocaleDateString()}</Typography>
                                                <Typography variant="caption" display="block">Renewed Date: {row.renewedOn ? new Date(row.renewedOn).toLocaleDateString() : 'N/A'}</Typography>
                                                <Typography variant="caption" display="block">Due: {row.isHighDemand ? new Date(row.dueDate).toLocaleString() : new Date(row.dueDate).toLocaleDateString()}</Typography>
                                                <Typography variant="caption" display="block">Renews: {row.renews}</Typography>
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
                                                {row.isHighDemand &&
                                                    <Tooltip title="High Demand" arrow>
                                                        <PriorityHighIcon />
                                                    </Tooltip>
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="contained" onClick={handleToggle}>Renew</Button>
                                                <Dialog
                                                    open={open}
                                                    onClose={handleToggle}
                                                    aria-labelledby="alert-dialog-title"
                                                    aria-describedby="alert-dialog-description"
                                                >
                                                    <DialogContent>
                                                        <DialogContentText id="alert-dialog-description">
                                                            {`Are you sure you want to renew ${row.bookid.title}?`}
                                                        </DialogContentText>
                                                    </DialogContent>
                                                    <DialogActions>
                                                        <Button onClick={handleToggle} variant="contained" color="secondary">
                                                            Cancel
                                                            </Button>
                                                        <Button onClick={() => handleRenew(row._id)} variant="contained" autoFocus>
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
    }
}))

export default BorrowedBooks