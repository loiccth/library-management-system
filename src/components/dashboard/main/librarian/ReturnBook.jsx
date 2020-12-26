import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import url from '../../../../settings/api'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

const ReturnBook = () => {
    const classes = useStyles()
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState()
    const [paymentID, setPaymentID] = useState()
    const [paymentMsg, setPaymentMsg] = useState()
    const { register, handleSubmit, errors, reset } = useForm()

    const onSubmit = (data) => {
        axios.post(`${url}/books/return_book`, data, { withCredentials: true })
            .then(result => {
                if (result.data.noOfDaysOverdue <= 0)
                    setMessage('Book record successfully updated.')
                else {
                    setMessage(`Book record successfully updated. Book overdue for ${result.data.noOfDaysOverdue} day(s). Fine per day: Rs ${result.data.finePerDay}. Total fine: Rs ${result.data.noOfDaysOverdue * result.data.finePerDay}`)
                    setPaymentID(result.data.paymentID)
                }
            })
            .catch(err => {
                setMessage(err.response.data.error)
            })
    }

    const handleFine = () => {
        axios.post(`${url}/user/payfine/${paymentID}`)
            .then(() => {
                setPaymentMsg('Payment record updated successfully.')
            })
    }

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        setMessage()
        setPaymentID()
        setPaymentMsg()
        reset()
    }

    return (
        <>
            <Button variant="contained" onClick={handleClickOpen}>
                Return Book
            </Button>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth="sm" fullWidth>
                <DialogTitle id="form-dialog-title">Return book</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    autoFocus
                                    required
                                    margin="normal"
                                    id="userid"
                                    name="userid"
                                    label="MemberID"
                                    fullWidth
                                    variant="standard"
                                    inputRef={register({ required: "MemberID is required." })}
                                    error={!!errors.userid}
                                    helperText={!!errors.userid ? errors.userid.message : " "}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    margin="normal"
                                    id="isbn"
                                    name="isbn"
                                    label="ISBN"
                                    fullWidth
                                    variant="standard"
                                    inputRef={register({ required: "ISBN is required." })}
                                    error={!!errors.isbn}
                                    helperText={!!errors.isbn ? errors.isbn.message : " "}
                                />
                            </Grid>
                        </Grid>
                        <Button type="submit" variant="outlined">Return Book</Button>
                    </form>

                    {message &&
                        <>
                            <Typography variant="body1" align="center">
                                {message}
                            </Typography>

                            {paymentID &&
                                <>
                                    <Typography variant="body1" align="center">
                                        Paid fine?
                                    </Typography>
                                    <Button variant="outlined" onClick={handleFine}>Yes</Button>
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
                    <Button variant="contained" color="secondary" onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

const useStyles = makeStyles(theme => ({
}))

export default ReturnBook