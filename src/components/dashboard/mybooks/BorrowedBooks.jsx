import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../settings/api'
import {
    Alert,
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
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Toolbar,
    Tooltip,
    Typography,
    useTheme
} from '@material-ui/core'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'

const BorrowedBooks = () => {
    const classes = useStyles()
    const [borrowed, setBorrowed] = useState([])
    const [snackbar, setSnackbar] = useState({ type: null })
    const [openSnack, setOpenSnack] = useState(false)
    const [open, setOpen] = useState(false)
    const { t } = useTranslation()
    const theme = useTheme()

    // Get list of borrowed books on page load
    useEffect(() => {
        const fetchData = async () => {
            const tempBorrowed = await axios.get(`${url}/books/borrowed`, { withCredentials: true })
            setBorrowed(tempBorrowed.data)
        }
        fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Toggle snackbar feedback
    const handleSnackbar = () => {
        setOpenSnack(!openSnack)
    }

    // Open/close window confirmation dialog
    const handleToggle = () => {
        setOpen(!open)
    }

    // Renew book and update value in table
    const handleRenew = (id) => {
        setOpen(false)
        axios.post(`${url}/books/renew/${id}`, {}, { withCredentials: true })
            .then(result => {
                setBorrowed(borrowed.map(book => {
                    if (book._id === result.data.borrow._id) {
                        book.renews = result.data.borrow.renews
                        book.dueDate = result.data.borrow.dueDate
                        book.renewedOn = result.data.borrow.renewedOn
                    }
                    return book
                }))
                setSnackbar({
                    type: 'success',
                    msg: t(result.data.message)
                })
            })
            .catch(err => {
                if (err.response.data.error === 'msgRenewOverdue')
                    setSnackbar({
                        type: 'warning',
                        msg: t(err.response.data.error, { days: err.response.data.days })
                    })
                else
                    setSnackbar({
                        type: 'warning',
                        msg: t(err.response.data.error)
                    })
            })
            .finally(() => {
                handleSnackbar()
            })
    }

    return (
        <>
            <Snackbar open={openSnack} autoHideDuration={6000} onClose={() => setOpenSnack(false)}>
                <Alert elevation={6} severity={snackbar.type === 'success' ? 'success' : 'warning'} onClose={() => setOpenSnack(false)}>
                    {snackbar.msg}
                </Alert>
            </Snackbar>
            <Container>
                <Toolbar>
                    <Typography variant="h6">{t('onloan')}</Typography>
                </Toolbar>
            </Container>
            <Box sx={{ mt: 3 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={12} md={10}>
                        <Paper className={classes.paper}>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('bookDetails')}</TableCell>
                                        <TableCell>{t('loanDetails')}</TableCell>
                                        <TableCell>{t('otherDetails')}</TableCell>
                                        <TableCell>{t('flags')}</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {borrowed.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">{t('noRecords')}</TableCell>
                                        </TableRow>
                                    }
                                    {borrowed.map(row => (
                                        <TableRow key={row._id}>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('title')}: {row.bookid.title}</Typography>
                                                <Typography variant="caption" display="block">{t('isbn')}: {row.bookid.isbn}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('loanDate')}: {new Date(row.createdAt).toLocaleDateString()}</Typography>
                                                <Typography variant="caption" display="block">{t('renewedDate')}: {row.renewedOn.length !== 0 ? new Date(row.renewedOn[row.renewedOn.length - 1]).toLocaleDateString() : 'N/A'}</Typography>
                                                <Typography variant="caption" display="block">{t('due')}: {row.isHighDemand ? new Date(row.dueDate).toLocaleString() : new Date(row.dueDate).toLocaleDateString()}</Typography>
                                                <Typography variant="caption" display="block">{t('renews')}: {row.renews}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('total')}: {row.bookid.copies.length}</Typography>
                                                <Typography variant="caption" display="block">{t('onloan')}: {row.bookid.noOfBooksOnLoan}</Typography>
                                                <Typography variant="caption" display="block">{t('hold')}: {row.bookid.noOfBooksOnHold}</Typography>
                                                <Typography variant="caption" display="block">{t('reservation')}: {row.bookid.reservation.length}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                {row.isHighDemand &&
                                                    <Tooltip title={t('highDemand')} arrow>
                                                        <PriorityHighIcon className={classes.highpriority} />
                                                    </Tooltip>
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="contained" onClick={handleToggle}>{t('renew')}</Button>
                                                <Dialog
                                                    open={open}
                                                    onClose={handleToggle}
                                                    aria-labelledby="alert-dialog-title"
                                                    aria-describedby="alert-dialog-description"
                                                    style={{ direction: theme.direction }}
                                                >
                                                    <DialogContent>
                                                        <DialogContentText id="alert-dialog-description">
                                                            {t('renewMsg') + ` ${row.bookid.title}?`}
                                                        </DialogContentText>
                                                    </DialogContent>
                                                    <DialogActions>
                                                        <Button onClick={handleToggle} variant="contained" color="secondary">
                                                            {t('cancel')}
                                                        </Button>
                                                        <Button onClick={() => handleRenew(row._id)} variant="contained" autoFocus>
                                                            {t('confirm')}
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
    },
    highpriority: {
        color: 'red'
    }
}))

export default BorrowedBooks