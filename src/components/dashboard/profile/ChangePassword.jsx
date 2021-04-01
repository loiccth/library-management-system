import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../settings/api'
import { analytics } from '../../../functions/analytics'
import {
    Alert,
    Button,
    FormControl,
    FormHelperText,
    IconButton,
    Input,
    InputLabel,
    InputAdornment,
    makeStyles,
    Snackbar
} from '@material-ui/core'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'

const ChangePassword = (props) => {
    const classes = useStyles()
    const navigate = useNavigate()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const { register, handleSubmit, errors, reset, watch } = useForm()
    const [showPasswords, setShowPassword] = useState({
        oldpassword: false,
        newpassword: false,
        confirmpassword: false
    })
    const { t } = useTranslation()

    // TODO: Add form validation to check new pwd = old pwd

    const onSubmit = (data) => {
        axios.patch(`${url}/users`, data, { withCredentials: true })
            .then(result => {
                props.handlePasswordChange(props.parent)

                if (props.parent === 'forcePasswordChange') {
                    analytics('action', 'changed temporary password')
                    navigate('/dashboard', { replace: true })
                }
                else {
                    analytics('action', 'password change success')
                    setSnackbar({
                        type: 'success',
                        msg: t(result.data.message)
                    })
                }
            })
            .catch(err => {
                analytics('action', 'password change fail')
                setSnackbar({
                    type: 'error',
                    msg: t(err.response.data.error)
                })
            })
            .finally(() => {
                handleClick()
            })
        reset()
    }

    const handleClickShowOldPassword = () => {
        setShowPassword({
            ...showPasswords,
            oldpassword: !showPasswords.oldpassword,
        })
    }

    const handleClickShowNewPassword = () => {
        setShowPassword({
            ...showPasswords,
            newpassword: !showPasswords.newpassword,
        })
    }

    const handleClickShowConfirmPassword = () => {
        setShowPassword({
            ...showPasswords,
            confirmpassword: !showPasswords.confirmpassword,
        })
    }

    const handleClick = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const handleMouseDownPassword = (e) => {
        e.preventDefault();
    }

    return (
        <>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert elevation={6} severity={snackbar.type === 'success' ? 'success' : 'warning'} onClose={handleClose}>
                    {snackbar.msg}
                </Alert>
            </Snackbar>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className={classes.form}>
                <FormControl fullWidth>
                    <InputLabel htmlFor="oldpassword">{t('oldPassword')}</InputLabel>
                    <Input
                        id="oldpassword"
                        name="oldpassword"
                        fullWidth
                        type={showPasswords.oldpassword ? "text" : "password"}
                        inputRef={register({ required: t('requiredField') })}
                        error={!!errors.oldpassword}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    id="oldpasswordtoggle"
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowOldPassword}
                                    onMouseDown={handleMouseDownPassword}
                                >
                                    {showPasswords.oldpassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                    <FormHelperText error>{!!errors.oldpassword ? errors.oldpassword.message : " "}</FormHelperText>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel htmlFor="newpassword">{t('newPassword')}</InputLabel>
                    <Input
                        id="newpassword"
                        name="newpassword"
                        fullWidth
                        type={showPasswords.newpassword ? "text" : "password"}
                        inputRef={register({
                            required: t('requiredField'),
                            minLength: {
                                value: 8,
                                message: t('Password must have at least 8 characters')
                            }
                        })}
                        error={!!errors.newpassword}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    id="newpasswordtoggle"
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowNewPassword}
                                    onMouseDown={handleMouseDownPassword}
                                >
                                    {showPasswords.newpassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                    <FormHelperText error>{!!errors.newpassword ? errors.newpassword.message : " "}</FormHelperText>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel htmlFor="confirmpassword">{t('confirmPassword')}</InputLabel>
                    <Input
                        id="confirmpassword"
                        name="confirmpassword"
                        fullWidth
                        type={showPasswords.confirmpassword ? "text" : "password"}
                        inputRef={register({
                            required: t('requiredField'),
                            validate: value =>
                                value === watch('newpassword') || t('passwordMatch')
                        })}
                        error={!!errors.confirmpassword}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    id="confirmpasswordtoggle"
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowConfirmPassword}
                                    onMouseDown={handleMouseDownPassword}
                                >
                                    {showPasswords.confirmpassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                    <FormHelperText error>{!!errors.confirmpassword ? errors.confirmpassword.message : " "}</FormHelperText>
                </FormControl>
                <Button variant="contained" type="submit">
                    {t('updatePassword')}
                </Button>
            </form>
        </>
    )
}

const useStyles = makeStyles(() => ({
    form: {
        textAlign: 'center'
    }
}))

ChangePassword.propTypes = {
    handlePasswordChange: PropTypes.func.isRequired,
    parent: PropTypes.string.isRequired
}

export default ChangePassword