import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../settings/api'
import {
    Alert,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Snackbar,
    TextField,
    useTheme
} from '@material-ui/core'

const RequestBooks = () => {
    const [window, setWindow] = useState(false)
    const { register, handleSubmit, errors, reset } = useForm()
    const { t } = useTranslation()
    const [openSnack, setOpenSnack] = useState(false)
    const [snackbar, setSnackbar] = useState({ type: null })
    const theme = useTheme()

    // Toggle snackbar feedback
    const handleSnackbar = () => {
        setOpenSnack(!openSnack)
    }

    // Toggle window to request a book
    const handleToggle = () => {
        setWindow(!window)
        reset()
    }

    // Request a book
    const onSubmit = (data) => {
        axios.post(`${url}/books/request`, data, { withCredentials: true })
            .then(result => {
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
                handleSnackbar()
                setWindow(false)
                reset()
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
                <Button variant="contained" onClick={handleToggle}>{t('requestBook')}</Button>
            </Container>
            <Grid container justifyContent="flex-end">
                <Grid item>
                    <Dialog
                        maxWidth="sm"
                        fullWidth
                        open={window}
                        onClose={handleToggle}
                        style={{ direction: theme.direction }}
                    >
                        <DialogTitle>
                            {t('requestBook')}
                        </DialogTitle>
                        <DialogContent>
                            <form onSubmit={handleSubmit(onSubmit)} id="request-form" noValidate>
                                <TextField
                                    autoFocus
                                    required
                                    autoComplete="off"
                                    id="isbn"
                                    name="isbn"
                                    label={t('isbn')}
                                    fullWidth
                                    variant="standard"
                                    error={!!errors.isbn}
                                    helperText={!!errors.isbn ? errors.isbn.message : " "}
                                    inputRef={register({
                                        required: t('requiredField'),
                                        validate: value =>
                                            value.length === 10 || value.length === 13 || t('isbnLength')
                                    })}
                                />
                            </form>
                        </DialogContent>
                        <DialogActions>
                            <Button variant="contained" onClick={handleToggle} color="secondary">
                                {t('close')}
                            </Button>
                            <Button
                                variant="contained"
                                type="submit"
                                form="request-form"
                            >
                                {t('request')}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Grid>
            </Grid>
        </>
    )
}

export default RequestBooks