import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../settings/api'
import {
    Alert,
    Button,
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
    useTheme
} from '@material-ui/core'

const RestoreCopies = (props) => {
    const classes = useStyles()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)
    const theme = useTheme()
    const { t } = useTranslation()

    const handleClick = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    // Open/close confirmation window to restore book
    const handleToggle = () => {
        setOpenDialog(!openDialog)
    }

    const handleRestore = (id) => {
        axios.post(`${url}/books/restore`, { isbn: props.isbn, id }, { withCredentials: true })
            .then(res => {
                setSnackbar({
                    type: 'success',
                    msg: t(res.data.message)
                })
                props.formatData(res.data.book)
            })
            .catch(err => {
                setSnackbar({
                    type: 'warning',
                    msg: t(err.response.data.error)
                })
            })
            .finally(() => handleClick())
    }

    return (
        <>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert elevation={6} severity={snackbar.type === 'success' ? 'success' : 'warning'} onClose={handleClose}>
                    {snackbar.msg}
                </Alert>
            </Snackbar>
            <Grid container justifyContent="center">
                <Grid item xs={12} md={11} lg={10}>
                    <Paper className={classes.paper}>
                        <Table className={classes.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell width={'20%'}>{t('copyid')}</TableCell>
                                    <TableCell width={'15%'}>{t('removedDate')}</TableCell>
                                    <TableCell width={'55%'}>{t('reason')}</TableCell>
                                    <TableCell />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {props.copies.map(copy => (
                                    <TableRow key={copy._id}>
                                        <TableCell>{copy._id}</TableCell>
                                        <TableCell>{new Date(copy.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{copy.reason}</TableCell>
                                        <TableCell>
                                            <Button variant="contained" onClick={handleToggle}>{t('restore')}</Button>
                                            <Dialog
                                                open={openDialog}
                                                onClose={handleToggle}
                                                style={{ direction: theme.direction }}
                                            >
                                                <DialogContent>
                                                    <DialogContentText>
                                                        {t('restoreDialog')}
                                                    </DialogContentText>
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button variant="contained" onClick={handleToggle} color="secondary">
                                                        {t('cancel')}
                                                    </Button>
                                                    <Button variant="contained" onClick={() => {
                                                        setOpenDialog(false)
                                                        handleRestore(copy._id)
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
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>
            </Grid>
        </>
    )
}

const useStyles = makeStyles(() => ({
    table: {
        minWidth: 850
    },
    hidden: {
        display: 'none'
    },
    paper: {
        overflowX: 'auto'
    }
}))

RestoreCopies.propTypes = {
    copies: PropTypes.array.isRequired,
    isbn: PropTypes.string.isRequired,
    formatData: PropTypes.func.isRequired
}

export default RestoreCopies