import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../settings/api'
import {
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
    useTheme
} from '@material-ui/core'

const RequestBooks = (props) => {
    const [window, setWindow] = useState(false)
    const { register, handleSubmit, errors, reset } = useForm()
    const { t } = useTranslation()
    const theme = useTheme()

    const handleToggle = () => {
        setWindow(!window)
    }

    const handleWindowClose = () => {
        setWindow(!window)
        reset()
    }

    const onSubmit = (data) => {
        axios.post(`${url}/books/request`, data, { withCredentials: true })
            .then(result => {
                props.handleRequestBook(result.data)
            })
            .catch(err => {
                props.handleRequestBook(err.response.data)
            })
            .finally(() => {
                setWindow(false)
                reset()
            })
    }

    return (
        <>
            <Container>
                <Button variant="contained" onClick={handleToggle}>{t('requestBook')}</Button>
            </Container>
            <Grid container justifyContent="flex-end">
                <Grid item>
                    <Dialog
                        maxWidth="sm"
                        fullWidth
                        open={window}
                        onClose={handleWindowClose}
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
                            <Button variant="contained" onClick={handleWindowClose} color="secondary">
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

RequestBooks.propTypes = {
    handleRequestBook: PropTypes.func.isRequired
}

export default RequestBooks