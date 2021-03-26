import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
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
} from '@material-ui/core'

const ReturnBook = () => {
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState()
    const [paymentID, setPaymentID] = useState()
    const [click, setClick] = useState(false)
    const [paymentMsg, setPaymentMsg] = useState()
    const { register, handleSubmit, errors, reset, control } = useForm({
        defaultValues: {
            campus: ''
        }
    })
    const { t } = useTranslation()

    const onSubmit = (data) => {
        axios.post(`${url}/books/return_book`, data, { withCredentials: true })
            .then(result => {
                if (result.data.noOfDaysOverdue <= 0)
                    setMessage(t('msgReturnBookNoOverdue'))
                else {
                    setMessage(t('msgReturnBookOverdue', { days: result.data.noOfDaysOverdue, fine: result.data.finePerDay, total: result.data.noOfDaysOverdue * result.data.finePerDay }))
                    setPaymentID(result.data.paymentID)
                }
            })
            .catch(err => {
                setMessage(t(err.response.data.error))
            })
            .finally(() => {
                reset()
            })
    }

    const handleFine = () => {
        setClick(true)
        axios.post(`${url}/users/payfine/${paymentID}`)
            .then(result => {
                setPaymentMsg(t(result.data.message))
            })
    }

    const handleClick = () => {
        setClick(true)
    }

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        setClick(false)
        setMessage()
        setPaymentID()
        setPaymentMsg()
        reset()
    }

    const handleReset = () => {
        setClick(false)
        setMessage()
        setPaymentID()
        setPaymentMsg()
        reset()
    }

    return (
        <>
            <Button variant="contained" fullWidth onClick={handleClickOpen}>
                {t('returnBook')}
            </Button>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth="sm" fullWidth>
                <DialogTitle id="form-dialog-title">{t('returnBook')}</DialogTitle>
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
                                    label="MemberID"
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
                                    label="ISBN"
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
                            <Button type="submit" variant="contained">{t('returnBook')}</Button>
                        </Box>
                    </form>

                    {message &&
                        <>
                            <Typography variant="body1" align="center">
                                {message}
                            </Typography>

                            {paymentID &&
                                <>
                                    {!click &&
                                        <>
                                            <Typography variant="body1" align="center">
                                                {t('paidFine')}
                                            </Typography>
                                            <Button variant="outlined" onClick={handleFine}>Yes</Button>
                                            <Button variant="outlined" onClick={handleClick}>No</Button>
                                        </>
                                    }
                                    {paymentMsg &&
                                        <Typography variant="body1" align="center">
                                            {paymentMsg}
                                        </Typography>
                                    }
                                </>
                            }
                        </>
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

export default ReturnBook