import React, { useRef, useState } from 'react'
import axios from 'axios'
import { useForm, Controller } from 'react-hook-form'
import ReCAPTCHA from 'react-google-recaptcha'
import url from '../../settings/api'
import Container from '@material-ui/core/Container'
import { Button, makeStyles, Paper, TextField, Typography, FormHelperText } from '@material-ui/core'
import Snackbar from '@material-ui/core/Snackbar'
import Alert from '@material-ui/lab/Alert'

const Reset = () => {
    const { register, handleSubmit, errors, reset, control, setValue } = useForm()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const recaptchaRef = useRef()

    const handleClick = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleReCaptcha = (e) => {
        setValue('reCaptcha', e, { shouldValidate: true })
    }

    const onSubmit = (data) => {
        axios.patch(`${url}/users/reset`, data)
            .then(() => {
                setSnackbar({
                    type: 'success',
                    msg: 'New temporary password sent.'
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
            })
        recaptchaRef.current.reset()
        reset()
    }

    const classes = useStyles()

    return (
        <React.Fragment>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert elevation={6} severity={snackbar.type === 'success' ? 'success' : 'warning'} onClose={handleClose}>
                    {snackbar.msg}
                </Alert>
            </Snackbar>
            <Container component="div" maxWidth="sm" className={classes.container}>
                <Paper className={classes.paper}>
                    <Typography component="h1" variant="h5">
                        Request new password
                    </Typography>
                    <form className={classes.form} noValidate onSubmit={handleSubmit(onSubmit)}>
                        <TextField
                            variant="standard"
                            margin="normal"
                            required
                            fullWidth
                            error={!!errors.userid}
                            id="userid"
                            name="userid"
                            label="MemberID"
                            inputRef={register({ required: 'Empty MemberID field.' })}
                            helperText={!!errors.userid ? errors.userid.message : " "}
                        />
                        <div className={classes.recaptcha}>
                            <Controller
                                control={control}
                                name="reCaptcha"
                                rules={{ required: "ReCaptcha required." }}
                                defaultValue={""}
                            />
                            <ReCAPTCHA sitekey="" ref={recaptchaRef} onChange={handleReCaptcha} />
                            <FormHelperText error children={!!errors.reCaptcha ? errors.reCaptcha.message : " "} />
                        </div>
                        <div style={{ display: 'flex', flexGrow: 1 }}>
                            <Button
                                className={classes.button}
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                            >Reset password</Button>
                        </div>
                    </form>
                </Paper>
            </Container>
        </React.Fragment>
    )
}

const useStyles = makeStyles(theme => ({
    container: {
        height: '100%'
    },
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%'
    },
    form: {
        width: '100%',
        padding: theme.spacing(3),
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1
    },
    button: {
        marginTop: theme.spacing(2),
        alignSelf: 'flex-end'
    },
    recaptcha: {
        margin: 'auto',
        marginTop: '16px'
    }
}))

export default Reset