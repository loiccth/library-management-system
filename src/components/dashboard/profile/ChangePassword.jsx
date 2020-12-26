import React, { useState } from 'react'
import axios from 'axios'
import url from '../../../settings/api'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import FormHelperText from '@material-ui/core/FormHelperText'

const ChangePassword = (props) => {
    const classes = useStyles()
    const { register, handleSubmit, errors, reset, watch } = useForm()
    const [showPasswords, setShowPassword] = useState({
        oldpassword: false,
        newpassword: false,
        confirmpassword: false
    })

    const onSubmit = (data) => {
        axios.patch(`${url}/users`, { data }, { withCredentials: true })
            .then(() => {
                props.handlePasswordChange()
            })
            .catch(err => {
                console.log(err)
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


    const handleMouseDownPassword = (e) => {
        e.preventDefault();
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className={classes.form}>
                <FormControl fullWidth>
                    <InputLabel htmlFor="oldpassword">Old Password</InputLabel>
                    <Input
                        id="oldpassword"
                        name="oldpassword"
                        fullWidth
                        type={showPasswords.oldpassword ? "text" : "password"}
                        inputRef={register({ required: 'Field is required.' })}
                        error={!!errors.oldpassword}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    id="oldpassword"
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
                    <InputLabel htmlFor="newpassword">New Password</InputLabel>
                    <Input
                        id="newpassword"
                        name="newpassword"
                        fullWidth
                        type={showPasswords.newpassword ? "text" : "password"}
                        inputRef={register({
                            required: 'Field is required.',
                            minLength: {
                                value: 8,
                                message: "Password must have at least 8 characters"
                            }
                        })}
                        error={!!errors.newpassword}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    id="newpassword"
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
                    <InputLabel htmlFor="confirmpassword">Confirm Password</InputLabel>
                    <Input
                        id="confirmpassword"
                        name="confirmpassword"
                        fullWidth
                        type={showPasswords.confirmpassword ? "text" : "password"}
                        inputRef={register({
                            required: 'Field is required.',
                            validate: value =>
                                value === watch('newpassword') || "The passwords do not match"
                        })}
                        error={!!errors.confirmpassword}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                    id="confirmpassword"
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
                    Update password
                </Button>
            </form>
        </>
    )
}

const useStyles = makeStyles(theme => ({
    form: {
        textAlign: 'center'
    }
}))

export default ChangePassword