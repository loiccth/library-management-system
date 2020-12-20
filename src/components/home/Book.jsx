import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import url from '../../settings/api'
import Navbar from '../navbar/Navbar'
import Footer from '../navbar/Footer'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'
import FiberNewIcon from '@material-ui/icons/FiberNew'
import Tooltip from '@material-ui/core/Tooltip'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import Snackbar from '@material-ui/core/Snackbar'
import Alert from '@material-ui/core/Alert'

const Book = (props) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const classes = useStyles()
    const [book, setBook] = useState(null)
    const [transaction, setTransaction] = useState(null)
    const [open, setOpen] = useState(false)
    const [snackbar, setSnackbar] = useState({ type: null })
    const [openSnack, setOpenSnack] = useState(false)


    // SnackBar
    const handleClick = () => {
        setOpenSnack(true);
    }

    const handleClose = () => {
        setOpenSnack(false);
    }

    const handleToggle = () => {
        setOpen(!open)
    }

    const handleConfirm = () => {
        setOpen(false)

        if (transaction === null) {
            axios.post(`${url}/books/reserve/${id}`, {}, { withCredentials: true })
                .then(() => {
                    setTransaction('Reserve')
                    setSnackbar({
                        type: 'success',
                        msg: 'Book reserved.'
                    })
                    getBook(id)
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
        }

        else if (transaction === 'Reserve') {
            axios.patch(`${url}/books/cancel_reservation/${id}`, {}, { withCredentials: true })
                .then(() => {
                    setTransaction(null)
                    setSnackbar({
                        type: 'success',
                        msg: 'Book reservation cancelled.'
                    })
                    getBook(id)
                    handleClick()
                })
        }
    }

    const getBook = useCallback((id) => {
        axios.get(`${url}/books/${id}`, { withCredentials: true })
            .then(book => {
                setBook(book.data.book)

                if (book.data.transaction)
                    setTransaction(book.data.transaction)
            })
            .catch(err => {
                if (err.response.status === 404) navigate('/', { replace: true })
            })
    }, [navigate])

    useEffect(() => {
        getBook(id)
    }, [getBook, id])

    if (book === null) return null
    else {
        return (
            <React.Fragment>
                <Navbar user={props.user} handleLogout={props.handleLogout} />
                <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleClose}>
                    <Alert elevation={6} severity={snackbar.type === 'success' ? 'success' : 'warning'} onClose={handleClose}>
                        {snackbar.msg}
                    </Alert>
                </Snackbar>
                <Container component={Paper}>
                    <Grid container spacing={3} className={classes.container}>
                        <Grid item xs={12} sm={4}>
                            <img className={classes.thumbnail} src={book.thumbnail} alt="thumbnail" />
                            <Grid container spacing={3} className={classes.container}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" align="center">Loan: {book.noOfBooksOnLoan}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" align="center">Reservations: {book.reservation.length}</Typography>
                                </Grid>
                                <Grid item xs={12} style={{ textAlign: 'center' }}>
                                    {props.user.isLoggedIn ?
                                        <React.Fragment>
                                            {transaction === null && <Button variant="outlined" onClick={handleToggle}>Reserve</Button>}
                                            {transaction === 'Reserve' && <Button variant="outlined" onClick={handleToggle}>Cancel Reservation</Button>}
                                            {transaction === 'Borrow' && <Button variant="outlined" disabled>Return Book</Button>}
                                            <Dialog
                                                open={open}
                                                onClose={handleToggle}
                                                aria-labelledby="alert-dialog-title"
                                                aria-describedby="alert-dialog-description"
                                            >
                                                <DialogContent>
                                                    <DialogContentText id="alert-dialog-description">
                                                        {transaction === null ? 'Are you sure you want to reserve this book?' : 'Are you sure you want to cancel this reservation?'}
                                                    </DialogContentText>
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button onClick={handleToggle} color="secondary">
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={handleConfirm} autoFocus>
                                                        Confirm
                                                    </Button>
                                                </DialogActions>
                                            </Dialog>
                                        </React.Fragment>
                                        :
                                        <Button variant="outlined" disabled>Reserve</Button>
                                    }
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} sm={8} >
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>Title</TableCell>
                                        <TableCell><Typography variant="body2">{book.title}</Typography></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Description</TableCell>
                                        <TableCell><Typography variant="body2">{book.description}</Typography></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>ISBN</TableCell>
                                        <TableCell><Typography variant="body2">{book.isbn}</Typography></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Author(s)</TableCell>
                                        <TableCell><Typography variant="body2">
                                            {book.author.map((author, index) => (
                                                <span key={author}>{(index ? ', ' : '') + author}</span>
                                            ))}</Typography></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Category</TableCell>
                                        <TableCell><Typography variant="body2">
                                            {book.categories.map((category, index) => (
                                                <span key={category}>{(index ? ', ' : '') + category}</span>
                                            ))}</Typography></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Number of pages</TableCell>
                                        <TableCell><Typography variant="body2">{book.noOfPages}</Typography></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Publisher</TableCell>
                                        <TableCell><Typography variant="body2">{book.publisher}</Typography></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Published Date</TableCell>
                                        <TableCell><Typography variant="body2">{new Date(book.publishedDate).toLocaleDateString()}</Typography></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Location</TableCell>
                                        <TableCell>
                                            <Typography variant="body2" display="block">{book.location}, {book.campus === 'pam' ? "Swami Dayanand Campus" : "Rose-Hill Campus"}</Typography>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Number of holdings</TableCell>
                                        <TableCell><Typography variant="body2" display="block">{book.copies.length}</Typography></TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell style={{ border: 'none' }}>Flag(s)</TableCell>
                                        <TableCell style={{ border: 'none' }}>
                                            <Tooltip title="Recently Added" arrow>
                                                <FiberNewIcon />
                                            </Tooltip>
                                            {book.isHighDemand ?
                                                <Tooltip title="High Demand" arrow>
                                                    <PriorityHighIcon className={classes.highpriority} />
                                                </Tooltip>
                                                : null}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Grid>
                    </Grid>
                </Container>
                <Footer style={{ position: 'absolute', bottom: 0, width: '100%' }} />
            </React.Fragment>
        )
    }
}

const useStyles = makeStyles(theme => ({
    container: {
        marginTop: '2em'
    },
    thumbnail: {
        width: '100%',
        maxWidth: '230px',
        margin: 'auto',
        display: 'block'
    },
    highpriority: {
        color: 'red'
    }
}))

export default Book