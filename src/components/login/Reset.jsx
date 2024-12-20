import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useForm, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import ReCAPTCHA from 'react-google-recaptcha'
import url from '../../settings/api'
import { analytics } from '../../functions/analytics'
import {
    Alert,
    Button,
    Container,
    FormHelperText,
    makeStyles,
    Paper,
    Snackbar,
    TextField,
    Typography
} from '@material-ui/core'

const Reset = (props) => {
    const { register, handleSubmit, errors, reset, control, setValue } = useForm()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const recaptchaRef = useRef()
    const { t } = useTranslation()

    // Open snackbar feedback
    const handleClick = () => {
        setOpen(true)
    }

    // Close snackbar
    const handleClose = () => {
        setOpen(false)
    }

    // Validate recaptcha challenge
    const handleReCaptcha = (e) => {
        setValue('reCaptcha', e, { shouldValidate: true })
    }

    // Reset password request
    const onSubmit = (data) => {
        axios.patch(`${url}/users/reset`, data)
            .then(result => {
                analytics('action', `password reset success - memberid: ${data.userid}`)
                setSnackbar({
                    type: 'success',
                    msg: t(result.data.message)
                })
            })
            .catch(err => {
                // Password reset failed
                analytics('action', `password reset failed - memberid: ${data.userid}`)
                setSnackbar({
                    type: 'warning',
                    msg: t(err.response.data.error)
                })
            })
            .finally(() => {
                handleClick()
            })
        // Reset form and recaptcha
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
                        {t('requestPassword')}
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
                            label={t('memberid')}
                            inputRef={register({ required: t('requiredField') })}
                            helperText={!!errors.userid ? errors.userid.message : " "}
                        />
                        <div className={classes.recaptcha}>
                            <Controller
                                control={control}
                                name="reCaptcha"
                                rules={{ required: t('requiredReCaptcha') }}
                                defaultValue={""}
                            />
                            <ReCAPTCHA sitekey="6LcKJ_4ZAAAAAOVAPr-9y6qCttIaIfff_qIxC26N" theme={props.darkMode ? "dark" : "light"} ref={recaptchaRef} onChange={handleReCaptcha} />
                            <FormHelperText error children={!!errors.reCaptcha ? errors.reCaptcha.message : " "} />
                        </div>
                        <div style={{ display: 'flex', flexGrow: 1 }}>
                            <Button
                                className={classes.button}
                                type="submit"
                                variant="contained"
                                fullWidth
                            >{t('resetPassword')}</Button>
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
        height: '100%',
        padding: 10,
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

Reset.propTypes = {
    darkMode: PropTypes.bool.isRequired
}

export default Reset