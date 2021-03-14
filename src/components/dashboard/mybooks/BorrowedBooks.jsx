import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
    Button,
    Box,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    Grid,
    makeStyles,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Toolbar,
    Tooltip,
    Typography
} from '@material-ui/core'
import FiberNewIcon from '@material-ui/icons/FiberNew'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'

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
                                        <TableCell>Flags</TableCell>
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

const useStyles = makeStyles(() => ({
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

BorrowedBooks.propTypes = {
    borrowed: PropTypes.array.isRequired,
    handleRenew: PropTypes.func.isRequired
}

export default BorrowedBooks