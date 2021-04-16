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

const ReservedBooks = () => {
    const classes = useStyles()
    const [reserved, setReserved] = useState({ booksReserved: [], position: [] })
    const [open, setOpen] = useState(false)
    const [openSnack, setOpenSnack] = useState(false)
    const [snackbar, setSnackbar] = useState({ type: null })
    const { t } = useTranslation()
    const theme = useTheme()

    // Get list of reserved books on page load
    useEffect(() => {
        const fetchData = async () => {
            const tempReserved = await axios.get(`${url}/books/reserved`, { withCredentials: true })
            setReserved(tempReserved.data)
        }
        fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Toggle snackbar feedback
    const handleSnackbar = () => {
        setOpenSnack(!openSnack)
    }

    // Open confirmation box to cancel reservation
    const handleToggle = () => {
        setOpen(!open)
    }

    // Cancel reservation and update table
    const handleCancel = (id, index) => {
        setOpen(false)
        axios.patch(`${url}/books/cancel_reservation/${id}`, {}, { withCredentials: true })
            .then(result => {
                setReserved({
                    booksReserved: reserved.booksReserved.filter((reserve) => reserve.bookid._id !== id),
                    position: reserved.position.filter((pos, loc) => loc !== index)
                })
                setSnackbar({
                    type: 'success',
                    msg: t(result.data.message)
                })
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
                    <Typography variant="h6">{t('reservation')}</Typography>
                </Toolbar>
            </Container>
            <Box sx={{ mt: 3 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={12} md={11} lg={10}>
                        <Paper className={classes.paper}>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell width={'30%'}>{t('reservations')}</TableCell>
                                        <TableCell width={'25%'}>{t('bookDetails')}</TableCell>
                                        <TableCell width={'25%'}>{t('availability')}</TableCell>
                                        <TableCell width={'10%'}>{t('flags')}</TableCell>
                                        <TableCell width={'10%'}></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reserved.booksReserved.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">{t('noRecords')}</TableCell>
                                        </TableRow>
                                    }
                                    {reserved.booksReserved.map((row, index) => (
                                        <TableRow key={row._id}>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('reservedDate')}: {new Date(row.createdAt).toLocaleString()}</Typography>
                                                <Typography variant="caption" display="block">{t('expireDate')}: {row.expireAt ? new Date(row.expireAt).toLocaleString() : 'TBD'}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('title')}: {row.bookid.title}</Typography>
                                                <Typography variant="caption" display="block">{t('isbn')}: {row.bookid.isbn}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('total')}: {row.bookid.copies.length}</Typography>
                                                <Typography variant="caption" display="block">{t('onloan')}: {row.bookid.noOfBooksOnLoan}</Typography>
                                                <Typography variant="caption" display="block">{t('hold')}: {row.bookid.noOfBooksOnHold}</Typography>
                                                <Typography variant="caption" display="block">{t('reservation')}: {row.bookid.reservation.length}</Typography>
                                                <Typography variant="caption" display="block">{t('queuePosition')}: {reserved.position[index]}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                {row.bookid.isHighDemand &&
                                                    <Tooltip title={t('highDemand')} arrow>
                                                        <PriorityHighIcon className={classes.highpriority} />
                                                    </Tooltip>
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="contained" onClick={handleToggle} >{t('cancel')}</Button>
                                                <Dialog
                                                    open={open}
                                                    onClose={handleToggle}
                                                    aria-labelledby="alert-dialog-title"
                                                    aria-describedby="alert-dialog-description"
                                                    style={{ direction: theme.direction }}
                                                >
                                                    <DialogContent>
                                                        <DialogContentText id="alert-dialog-description">
                                                            {t('cancelMsg') + ` ${row.bookid.title}?`}
                                                        </DialogContentText>
                                                    </DialogContent>
                                                    <DialogActions>
                                                        <Button onClick={handleToggle} variant="contained" color="secondary">
                                                            {t('cancel')}
                                                        </Button>
                                                        <Button onClick={() => handleCancel(row.bookid._id, index)} variant="contained" autoFocus>
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
        minWidth: 850
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