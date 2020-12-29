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
import Box from '@material-ui/core/Box'

const IssueBook = () => {
    const classes = useStyles()
    const [open, setOpen] = useState(false)
    const [check, setCheck] = useState(false)
    const [message, setMessage] = useState()
    const { register, handleSubmit, errors, reset } = useForm()

    const onSubmit = (data) => {
        axios.post(`${url}/books/issue`, data, { withCredentials: true })
            .then(result => {
                if (result.status === 201) {
                    setMessage(`Book titled ${result.data.title} issued to ${data.userid} and is due on ${result.data.dueDate}`)
                }
                else if (result.status === 200) {
                    setMessage(result.data.message)
                }
            })
            .catch(err => {
                setMessage(err.response.data.error)
            })
            .finally(() => {
                setCheck(true)
            })
    }

    const handleClickOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        setCheck(false)
        setMessage()
        reset()
    }

    const handleReset = () => {
        setCheck(false)
        setMessage()
        reset()
    }

    return (
        <>
            <Button variant="contained" fullWidth onClick={handleClickOpen}>
                Issue Book
            </Button>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth="sm" fullWidth>
                <DialogTitle id="form-dialog-title">Issue book</DialogTitle>
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
                                    inputRef={register({ required: "MemberID is required." })}
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
                                    inputRef={register({ required: "ISBN is required." })}
                                    error={!!errors.isbn}
                                    helperText={!!errors.isbn ? errors.isbn.message : ""}
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{ mt: 3 }}>
                            <Button type="submit" variant="contained">Issue Book</Button>
                        </Box>
                    </form>

                    {check &&
                        <Typography variant="body1" align="center">
                            {message}
                        </Typography>
                    }
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="primary" onClick={handleReset}>Reset</Button>
                    <Button variant="contained" color="secondary" onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

const useStyles = makeStyles(theme => ({
}))

export default IssueBook