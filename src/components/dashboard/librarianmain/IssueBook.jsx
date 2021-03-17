import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
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

const IssueBook = () => {
    const [open, setOpen] = useState(false)
    const [check, setCheck] = useState(false)
    const [message, setMessage] = useState()
    const { register, handleSubmit, errors, reset, control } = useForm({
        defaultValues: {
            campus: ''
        }
    })

    const onSubmit = (data) => {
        axios.post(`${url}/books/issue`, data, { withCredentials: true })
            .then(result => {
                setMessage(`Book titled ${result.data.title} issued to ${data.userid} and is due on ${new Date(result.data.dueDate).toLocaleString()}`)
            })
            .catch(err => {
                setMessage(err.response.data.error)
            })
            .finally(() => {
                setCheck(true)
                reset()
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
                            <Grid item xs={12}>
                                <FormControl component="fieldset" error={!!errors.campus} >
                                    <FormLabel component="legend">Campus</FormLabel>
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
                                        rules={{ required: "Campus is required." }}
                                    />
                                    {!!errors.campus && <FormHelperText>{errors.campus.message}</FormHelperText>}
                                </FormControl>
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

export default IssueBook