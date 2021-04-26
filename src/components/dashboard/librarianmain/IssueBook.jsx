import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../settings/api'
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    Grid,
    Radio,
    RadioGroup,
    TextField,
    Typography,
    useTheme
} from '@material-ui/core'

const IssueBook = (props) => {
    const [open, setOpen] = useState(false)
    const [check, setCheck] = useState(false)
    const [message, setMessage] = useState()
    const { register, handleSubmit, errors, reset, control } = useForm({
        defaultValues: {
            campus: ''
        }
    })
    const { t } = useTranslation()
    const theme = useTheme()

    // Issue book
    const onSubmit = (data) => {
        axios.post(`${url}/books/issue`, data, { withCredentials: true })
            .then(result => {
                setMessage(t(result.data.message,
                    {
                        title: result.data.title,
                        userid: data.userid,
                        date: new Date(result.data.dueDate)
                    }))
                if (result.data.reservationid)
                    props.handleIssueBook(result.data.reservationid)
            })
            .catch(err => {
                if (err.response.data.error === 'msgBorrowLibrarianLimit' || err.response.data.error === 'msgBorrowMemberLimit')
                    setMessage(t(err.response.data.error, { limit: err.response.data.limit }))
                else
                    setMessage(t(err.response.data.error))
            })
            .finally(() => {
                setCheck(true)
                reset()
            })
    }

    // Open window for issuing book
    const handleClickOpen = () => {
        setOpen(true)
    }

    // Close window and reset all data inform
    const handleClose = () => {
        setOpen(false)
        setCheck(false)
        setMessage()
        reset()
    }

    // Reset data to issue another book
    const handleReset = () => {
        setCheck(false)
        setMessage()
        reset()
    }

    return (
        <>
            <Button variant="contained" fullWidth onClick={handleClickOpen}>
                {t('issueBook')}
            </Button>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth style={{ direction: theme.direction }}>
                <DialogTitle id="form-dialog-title">{t('issueBook')}</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    autoFocus
                                    required
                                    autoComplete="off"
                                    id="userid"
                                    name="userid"
                                    label={t('MemberID')}
                                    fullWidth
                                    variant="standard"
                                    inputRef={register({ required: t('requiredField') })}
                                    error={!!errors.userid}
                                    helperText={!!errors.userid ? errors.userid.message : ""}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    autoComplete="off"
                                    id="isbn"
                                    name="isbn"
                                    label={t('isbn')}
                                    fullWidth
                                    variant="standard"
                                    inputRef={register({ required: t('requiredField') })}
                                    error={!!errors.isbn}
                                    helperText={!!errors.isbn ? errors.isbn.message : ""}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl component="fieldset" error={!!errors.campus} >
                                    <FormLabel component="legend">{t('campus')}</FormLabel>
                                    <Controller
                                        as={
                                            <RadioGroup row name="campus">
                                                <FormControlLabel
                                                    control={<Radio color="primary" />}
                                                    label="Rose-Hill Campus"
                                                    value="rhill"
                                                />
                                                <FormControlLabel
                                                    control={<Radio color="primary" />}
                                                    label="Swami Dayanand Campus"
                                                    value="pam"
                                                />
                                            </RadioGroup>
                                        }
                                        name="campus"
                                        control={control}
                                        rules={{ required: t('requiredField') }}
                                    />
                                    {!!errors.campus && <FormHelperText>{errors.campus.message}</FormHelperText>}
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: 3 }}>
                            <Button type="submit" variant="contained">{t('issueBook')}</Button>
                        </Box>
                    </form>

                    {check &&
                        <Typography variant="body1" align="center">
                            {message}
                        </Typography>
                    }
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="primary" onClick={handleReset}>{t('reset')}</Button>
                    <Button variant="contained" color="secondary" onClick={handleClose}>{t('close')}</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

IssueBook.propTypes = {
    handleIssueBook: PropTypes.func.isRequired
}

export default IssueBook