import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../settings/api'
import { analytics } from '../../functions/analytics'
import {
    Alert,
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    Grid,
    makeStyles,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Tooltip,
    Typography,
    useTheme
} from '@material-ui/core'
import FiberNewIcon from '@material-ui/icons/FiberNew'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'
import Navbar from '../navbar/Navbar'
import Footer from '../navbar/Footer'

const Book = (props) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const classes = useStyles()
    const [book, setBook] = useState(null)
    const [transaction, setTransaction] = useState(null)
    const [position, setPosition] = useState(0)
    const [open, setOpen] = useState(false)
    const [snackbar, setSnackbar] = useState({ type: null })
    const [openSnack, setOpenSnack] = useState(false)
    const { t } = useTranslation()
    const theme = useTheme()

    // Open snackbar message for feedback
    const handleClick = () => {
        setOpenSnack(true)
    }

    // Close snackbar message
    const handleClose = () => {
        setOpenSnack(false)
    }

    // Open confirmation window
    const handleToggle = () => {
        setOpen(!open)
    }

    // Confirm window
    const handleConfirm = () => {
        setOpen(false)

        // If there is no transaction, reserve book
        if (transaction === null) {
            axios.post(`${url}/books/reserve/${id}`, {}, { withCredentials: true })
                .then(result => {
                    analytics('action', `book reservation success - id: ${id}`)
                    setTransaction('Reserve')
                    setSnackbar({
                        type: 'success',
                        msg: t(result.data.message)
                    })
                })
                .catch(err => {
                    if (err.response.data.error === 'msgReserveMax') {
                        analytics('action', `book reservation failed, max reservation - id :${id}`)
                        setSnackbar({
                            type: 'warning',
                            msg: t(err.response.data.error, { max: err.response.data.max })
                        })
                    }
                    else {
                        analytics('action', `book reservation failed - id :${id}`)
                        setSnackbar({
                            type: 'warning',
                            msg: t(err.response.data.error)
                        })
                    }
                })
                .finally(() => {
                    getBook(id)
                    handleClick()
                })
        }

        // If book has a reservation, cancel reservation
        else if (transaction === 'Reserve') {
            axios.patch(`${url}/books/cancel_reservation/${id}`, {}, { withCredentials: true })
                .then(result => {
                    setTransaction(null)
                    setSnackbar({
                        type: 'success',
                        msg: t(result.data.message)
                    })
                })
                .catch(err => {
                    setSnackbar({
                        type: 'warning',
                        msg: t(err.response.data.error)
                    })
                })
                .finally(() => {
                    getBook(id)
                    handleClick()
                })
        }
    }

    // Get book details
    const getBook = useCallback((id) => {
        axios.get(`${url}/books/${id}`, { withCredentials: true })
            .then(book => {
                setBook(book.data.book)
                setPosition(book.data.position)

                if (book.data.transaction)
                    setTransaction(book.data.transaction)
            })
            .catch(err => {
                // Book not found, redirect to home page
                if (err.response.status === 404) navigate('/', { replace: true })
            })
    }, [navigate])

    // Get book details when id is set
    useEffect(() => {
        getBook(id)
    }, [getBook, id])

    if (book === null) return null
    else {
        return (
            <React.Fragment>
                <Navbar user={props.user} darkMode={props.darkMode} handleToggleTheme={props.handleToggleTheme} handleLocale={props.handleLocale} handleLogout={props.handleLogout} />
                <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleClose}>
                    <Alert elevation={6} severity={snackbar.type === 'success' ? 'success' : 'warning'} onClose={handleClose}>
                        {snackbar.msg}
                    </Alert>
                </Snackbar>
                <Box className={classes.wrapper}>
                    <Box className={classes.bookcontainer}>
                        <Box sx={{ my: 7 }}>
                            <Container component={Paper}>
                                <Grid container spacing={3} className={classes.container}>
                                    <Grid item xs={12} sm={4}>
                                        <img className={classes.thumbnail} src={book.thumbnail} alt={t('thumbnail')} />
                                        <Grid container spacing={3} className={classes.container}>
                                            <Grid item xs={4}>
                                                <Typography variant="body2" align="center">{t('loan')}: {book.noOfBooksOnLoan}</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="body2" align="center">{t('reservation')}: {book.reservation.length}</Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Typography variant="body2" align="center">{t('hold')}: {book.noOfBooksOnHold}</Typography>
                                            </Grid>
                                            {transaction === 'Reserve' &&
                                                <Grid item xs={12}>
                                                    <Typography variant="body2" align="center">{t('queuePosition')}: {position}</Typography>
                                                </Grid>
                                            }
                                            <Grid item xs={12} style={{ textAlign: 'center' }}>
                                                {props.user.isLoggedIn ?
                                                    <React.Fragment>
                                                        {transaction === null && <Button variant="contained" onClick={handleToggle}>{t('reserve')}</Button>}
                                                        {transaction === 'Reserve' && <Button variant="contained" onClick={handleToggle}>{t('cancelReservation')}</Button>}
                                                        {transaction === 'Borrow' && <Button variant="contained" disabled>{t('returnBook')}</Button>}
                                                        <Dialog
                                                            open={open}
                                                            onClose={handleToggle}
                                                            aria-labelledby="alert-dialog-title"
                                                            aria-describedby="alert-dialog-description"
                                                            style={{ direction: theme.direction }}
                                                        >
                                                            <DialogContent>
                                                                <DialogContentText id="alert-dialog-description">
                                                                    {transaction === null ? t('reserveBookMsg') : t('cancelReserveMsg')}
                                                                </DialogContentText>
                                                            </DialogContent>
                                                            <DialogActions>
                                                                <Button variant="contained" onClick={handleToggle} color="secondary">
                                                                    {t('cancel')}
                                                                </Button>
                                                                <Button variant="contained" onClick={handleConfirm} autoFocus>
                                                                    {t('confirm')}
                                                                </Button>
                                                            </DialogActions>
                                                        </Dialog>
                                                    </React.Fragment>
                                                    :
                                                    <Button variant="outlined" disabled>{t('reserve')}</Button>
                                                }
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12} sm={8} >
                                        <Table>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>{t('title')}</TableCell>
                                                    <TableCell><Typography variant="body2">{book.title}</Typography></TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>{t('description')}</TableCell>
                                                    <TableCell><Typography variant="body2">{book.description}</Typography></TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>{t('isbn')}</TableCell>
                                                    <TableCell><Typography variant="body2">{book.isbn}</Typography></TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>{t('authors')}</TableCell>
                                                    <TableCell><Typography variant="body2">
                                                        {book.author.map((author, index) => (
                                                            <span key={author}>{(index ? ', ' : '') + author}</span>
                                                        ))}</Typography></TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>{t('category')}</TableCell>
                                                    <TableCell><Typography variant="body2">{book.category}</Typography></TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>{t('pages')}</TableCell>
                                                    <TableCell><Typography variant="body2">{book.noOfPages}</Typography></TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>{t('publisher')}</TableCell>
                                                    <TableCell><Typography variant="body2">{book.publisher}</Typography></TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>{t('publishedDate')}</TableCell>
                                                    <TableCell><Typography variant="body2">{new Date(book.publishedDate).toLocaleDateString()}</Typography></TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>{t('location')}</TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" display="block">{book.location}, {book.campus === 'pam' ? "Swami Dayanand Campus" : "Rose-Hill Campus"}</Typography>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>{t('holdings')}</TableCell>
                                                    <TableCell><Typography variant="body2" display="block">{book.copies.length}</Typography></TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell style={{ border: 'none' }}>{t('flags')}</TableCell>
                                                    <TableCell style={{ border: 'none' }}>
                                                        {book.isHighDemand &&
                                                            <Tooltip title={t('highDemand')} arrow>
                                                                <PriorityHighIcon className={classes.highpriority} />
                                                            </Tooltip>
                                                        }
                                                        {(new Date() - new Date(book.createdAt)) / (1000 * 60 * 60 * 24) <= 3 &&
                                                            <Tooltip title={t('recentlyAdded')} arrow>
                                                                <FiberNewIcon />
                                                            </Tooltip>
                                                        }
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </Grid>
                                </Grid>
                            </Container>
                        </Box>
                    </Box>
                    <Footer darkMode={props.darkMode} />
                </Box>
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
    },
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
        [theme.breakpoints.up("sm")]: {
            minHeight: `calc(100vh - 64px)`
        },
        [theme.breakpoints.down("xs")]: {
            minHeight: `calc(100vh - 48px)`
        }
    },
    bookcontainer: {
        flex: 1
    }
}))

Book.propTypes = {
    user: PropTypes.object.isRequired,
    darkMode: PropTypes.bool.isRequired,
    handleToggleTheme: PropTypes.func.isRequired,
    handleLocale: PropTypes.func.isRequired,
    handleLogout: PropTypes.func.isRequired
}

export default Book