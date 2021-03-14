import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
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
    Typography
} from '@material-ui/core'

const UserSettings = ({ userSettings, handleUpdateUserSettings }) => {
    const classes = useStyles()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const { register, handleSubmit, errors, setValue } = useForm()

    useEffect(() => {
        Object.entries(userSettings).map(([key, value]) => (
            setValue(`settings[${key}].value`, value.value)
        ))
    }, [userSettings, setValue])

    const handleClick = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const onSubmit = (data) => {
        let updated = false

        for (let i = 0; i < userSettings.length; i++) {
            if (parseInt(userSettings[i].value) !== parseInt(data.settings[i].value)) {
                updated = true
                break
            }
        }

        if (updated)
            axios.put(`${url}/settings/users`, { userSettings: data.settings }, { withCredentials: true })
                .then(result => {
                    setSnackbar({
                        type: 'success',
                        msg: result.data.message
                    })
                    handleUpdateUserSettings(data.settings)
                    handleClick()
                })
        else {
            setSnackbar({
                type: 'warning',
                msg: 'Settings did not change.'
            })
            handleClick()
        }
    }

    return (
        <>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert elevation={6} severity={snackbar.type === 'success' ? 'success' : 'warning'} onClose={handleClose}>
                    {snackbar.msg}
                </Alert>
            </Snackbar>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Box sx={{ mt: 3 }} className={classes.boxAlign}>
                    <Grid container justifyContent="space-evenly">
                        <Grid item xs={12}>
                            <Typography variant="h6">User Settings</Typography>
                        </Grid>
                        {userSettings.map((setting, index) => (
                            <React.Fragment key={setting.name}>
                                <Grid item xs={5}>
                                    <TextField
                                        label={setting.name}
                                        name={`settings[${index}].value`}
                                        variant="standard"
                                        margin="normal"
                                        required
                                        fullWidth
                                        error={errors.settings === undefined ? false : errors.settings[index] === undefined ? false : true}
                                        inputRef={register({ required: "Field is required.", validate: value => !isNaN(value) })}
                                        helperText={errors.settings === undefined ? setting.name === "Temporary password" ? "Time in minutes" : "" :
                                            errors.settings[index] === undefined ? setting.name === "Temporary password" ? "Time in minutes" : "" :
                                                errors.settings[index].value.message === "" ? "Value is not a number" :
                                                    errors.settings[index].value.message}
                                    />
                                </Grid>
                                <TextField
                                    className={classes.hidden}
                                    name={`settings[${index}].name`}
                                    value={setting.name}
                                    inputRef={register()}
                                />
                            </React.Fragment>
                        ))}
                    </Grid>
                    <Box sx={{ my: 3 }}>
                        <Button
                            type="submit"
                            variant="contained"
                        >
                            Update
                    </Button>
                    </Box>
                </Box>
            </form>
        </>
    )
}

const useStyles = makeStyles(() => ({
    hidden: {
        display: 'none !important'
    },
    boxAlign: {
        textAlign: 'center'
    }
}))

UserSettings.propTypes = {
    userSettings: PropTypes.array.isRequired,
    handleUpdateUserSettings: PropTypes.func.isRequired
}

export default UserSettings