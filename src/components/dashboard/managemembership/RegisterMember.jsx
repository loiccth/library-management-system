import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import url from '../../../settings/api'
import {
    Alert,
    Box,
    Button,
    Grid,
    makeStyles,
    Snackbar,
    TextField,
} from '@material-ui/core'

const RegisterMember = () => {
    const classes = useStyles()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const { register, handleSubmit, errors, reset } = useForm()

    const handleClick = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const onSubmit = (data) => {
        console.log(data)
        axios.post(`${url}/users/register`, data, { withCredentials: true })
            .then(result => {
                setSnackbar({
                    type: 'success',
                    msg: `User registered - ${result.data.member.userid}`
                })
            })
            .catch(err => {
                setSnackbar({
                    type: 'warning',
                    msg: err.response.data.error
                })
            })
            .finally(() => {
                handleClick()
                reset()
            })
    }

    return (
        <>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert elevation={6} severity={snackbar.type === 'success' ? 'success' : 'warning'} onClose={handleClose}>
                    {snackbar.msg}
                </Alert>
            </Snackbar>
            <Box sx={{ mt: 3 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={11} md={8}>
                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            <Grid container justifyContent="center" spacing={2}>
                                <Grid item xs={10} md={5}>
                                    <TextField
                                        autoComplete="off"
                                        fullWidth
                                        variant="standard"
                                        margin="normal"
                                        required
                                        id="email"
                                        name="email"
                                        label="Email"
                                        error={!!errors.email}
                                        helperText={!!errors.email ? errors.email.message : " "}
                                        inputRef={register({
                                            required: "Email is required.",
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: "Invalid email address."
                                            }
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={10} md={10}>
                                    <Box sx={{ mt: 1 }} className={classes.boxAlign}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                        >
                                            Register
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </form>
                    </Grid>
                </Grid>
            </Box>
        </>
    )
}

const useStyles = makeStyles(() => ({
    boxAlign: {
        textAlign: 'right'
    }
}))

export default RegisterMember