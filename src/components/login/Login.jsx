import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../settings/api'
import { analytics } from '../../functions/analytics'
import {
    Alert,
    Button,
    Checkbox,
    Container,
    FormControl,
    FormControlLabel,
    FormHelperText,
    IconButton,
    Input,
    InputAdornment,
    InputLabel,
    makeStyles,
    Paper,
    Snackbar,
    TextField,
    Typography
} from '@material-ui/core'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'

const Login = (props) => {
    const classes = useStyles()
    const { register, handleSubmit, errors, reset } = useForm()
    const [snackbar, setSnackbar] = useState()
    const [open, setOpen] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const { t } = useTranslation()

    // Open snackbar feedback
    const handleClick = () => {
        setOpen(true);
    }

    // Close snackbar feedback
    const handleClose = () => {
        setOpen(false);
    }

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword)
    }

    // Login button pressed send userid and password to server
    const onSubmit = (data) => {
        axios.post(`${url}/users/login`, data, { withCredentials: true })
            .then(result => {
                props.handleLogin(result.data)
            })
            .catch(err => {
                // Incorrct credentials
                analytics('action', `login attempt failed - memberid: ${data.userid}`)
                setSnackbar(t(err.response.data.error))
                handleClick()
            })
        reset()
    }

    const handleMouseDownPassword = (e) => {
        e.preventDefault()
    }

    return (
        <React.Fragment>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert elevation={6} severity="warning" onClose={handleClose}>
                    {snackbar}
                </Alert>
            </Snackbar>

            <Container component="div" maxWidth="sm">
                <Paper className={classes.paper}>
                    <Typography component="h1" variant="h5">
                        {t('login')}
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
                            autoFocus
                            inputRef={register({ required: t('requiredField') })}
                            helperText={!!errors.userid ? errors.userid.message : " "}
                        />
                        <FormControl fullWidth style={{ marginTop: 16, marginBottom: 16 }}>
                            <InputLabel error={!!errors.password} htmlFor="password" required>{t('password')}</InputLabel>
                            <Input
                                type={showPassword ? "text" : "password"}
                                variant="standard"
                                required
                                error={!!errors.password}
                                id="password"
                                name="password"
                                label={t('password')}
                                inputRef={register({ required: t('requiredField') })}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            id="passwordtoggle"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                            <FormHelperText error>{!!errors.password ? errors.password.message : " "}</FormHelperText>
                        </FormControl>
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary" />}
                            label={t('rememberMe')}
                        />
                        <Button
                            className={classes.button}
                            type="submit"
                            variant="contained"
                            fullWidth
                        >{t('login')}</Button>
                    </form>
                </Paper>
            </Container>
        </React.Fragment>
    )
}

const useStyles = makeStyles(theme => ({
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 10,
    },
    form: {
        width: '100%',
        padding: theme.spacing(3),
    },
    button: {
        marginTop: theme.spacing(2),
    }
}))

Login.propTypes = {
    handleLogin: PropTypes.func.isRequired
}

export default Login