import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../settings/api'
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
    Pagination,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Toolbar,
    Typography,
    useTheme
} from '@material-ui/core'

const DuePayments = (props) => {
    const classes = useStyles()
    const { t } = useTranslation()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const [page, setPage] = useState(1)
    const [openDialog, setOpenDialog] = useState(false)
    const theme = useTheme()
    const rowPerPage = 5

    // Open snackbar feedback
    const handleClick = () => {
        setOpen(true)
    }

    // Close snackbar feedback
    const handleClose = () => {
        setOpen(false)
    }

    // Open/close confirmation window to remove payment due
    const handleToggle = () => {
        setOpenDialog(!openDialog)
    }

    // Fine paid
    const handleFine = (id) => {
        axios.post(`${url}/users/payfine/${id}`, {}, { withCredentials: true })
            .then(result => {
                setSnackbar({
                    type: 'success',
                    msg: t(result.data.message)
                })
                props.handleFinePayment(result.data.payment)
            })
            .catch(err => {
                // Update fine failed
                setSnackbar({
                    type: 'warning',
                    msg: t(err.response.data.error)
                })
            })
            .finally(() => {
                // Show feedback
                handleClick()
            })
    }

    // Change page
    const handlePagination = (e, value) => {
        setPage(value)
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
                    <Typography variant="h6">{t('duePayments')}</Typography>
                </Toolbar>
            </Container>
            <Box sx={{ mt: 3 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={12} md={10}>
                        <Paper className={classes.paper}>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('memberid')}</TableCell>
                                        <TableCell>{t('bookDetails')}</TableCell>
                                        <TableCell>{t('fineDetails')}</TableCell>
                                        <TableCell>{t('borrowDetails')}</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.duePayments.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">{t('noRecords')}</TableCell>
                                        </TableRow>
                                    }
                                    {props.duePayments.slice((page - 1) * rowPerPage, (page - 1) * rowPerPage + rowPerPage).map(row => (
                                        <TableRow key={row._id}>
                                            <TableCell component="th" scope="row">
                                                {row.userid}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('title')}: {row.title}</Typography>
                                                <Typography variant="caption" display="block">{t('isbn')}: {row.isbn}</Typography>
                                                <Typography variant="caption" display="block">{t('copyid')}: {row.copyid}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('date')}: {new Date(row.date).toLocaleString()}</Typography>
                                                <Typography variant="caption" display="block">{t('daysOverdue')}: {row.days}</Typography>
                                                <Typography variant="caption" display="block">{t('pricePerDay')}: Rs {row.price}</Typography>
                                                <Typography variant="caption" display="block">{t('total')}: Rs {row.price * row.days}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">{t('borrowDate')}: {new Date(row.borrowDate).toLocaleString()}</Typography>
                                                <Typography variant="caption" display="block">{t('dueDate')}: {new Date(row.dueDate).toLocaleString()}</Typography>
                                                <Typography variant="caption" display="block">{t('returnDate')}: {new Date(row.returnedDate).toLocaleString()}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="contained" onClick={handleToggle}>{t('paid')}</Button>
                                                <Dialog
                                                    open={openDialog}
                                                    onClose={handleToggle}
                                                    aria-labelledby="alert-dialog-title"
                                                    aria-describedby="alert-dialog-description"
                                                    style={{ direction: theme.direction }}
                                                >
                                                    <DialogContent>
                                                        <DialogContentText id="alert-dialog-description">
                                                            {t('paidDialog')}
                                                        </DialogContentText>
                                                    </DialogContent>
                                                    <DialogActions>
                                                        <Button variant="contained" onClick={handleToggle} color="secondary">
                                                            {t('cancel')}
                                                        </Button>
                                                        <Button variant="contained" onClick={() => {
                                                            setOpenDialog(false)
                                                            handleFine(row._id)
                                                        }}
                                                            autoFocus
                                                        >
                                                            {t('confirm')}
                                                        </Button>
                                                    </DialogActions>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Grid container justifyContent="center">
                                                <Grid item xs={12}>
                                                    <Pagination
                                                        className={classes.pagination}
                                                        count={Math.ceil(props.duePayments.length / rowPerPage)}
                                                        page={page}
                                                        onChange={handlePagination}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </TableCell>
                                    </TableRow>
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
    paper: {
        overflowX: 'auto'
    },
    table: {
        minWidth: 650,
        overflowX: 'auto'
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center'
    }
}))

DuePayments.propTypes = {
    duePayments: PropTypes.array.isRequired,
    handleFinePayment: PropTypes.func.isRequired
}

export default DuePayments