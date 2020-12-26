import React, { useState, useEffect } from 'react'
import axios from 'axios'
import url from '../../../settings/api'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import Alert from '@material-ui/core/Alert'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

const BookSettings = ({ bookSettings }) => {
    const classes = useStyles()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const { register, handleSubmit, errors, setValue } = useForm()

    useEffect(() => {
        Object.entries(bookSettings).map(([key, value]) => (
            setValue(`settings[${key}].value`, value.value)
        ))

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleClick = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const onSubmit = (data) => {
        let updated = false

        for (let i = 0; i < bookSettings.length; i++) {
            if (parseInt(bookSettings[i].value) !== parseInt(data.settings[i].value)) {
                updated = true
                break
            }
        }

        if (updated)
            axios.put(`${url}/settings/books`, { bookSettings: data.settings }, { withCredentials: true })
                .then(result => {
                    setSnackbar({
                        type: 'success',
                        msg: result.data.message
                    })
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
                <Box className={classes.boxAlign}>
                    <Grid container justifyContent="space-evenly">
                        <Grid item xs={12}>
                            <Typography variant="h6">Book Settings</Typography>
                        </Grid>
                        {bookSettings.map((setting, index) => (
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
                                        helperText={errors.settings === undefined ? setting.name === "Time onhold" ? "Time in minutes" : "" :
                                            errors.settings[index] === undefined ? setting.name === "Time onhold" ? "Time in minutes" : "" :
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

const useStyles = makeStyles(theme => ({
    hidden: {
        display: 'none'
    },
    boxAlign: {
        textAlign: 'center'
    }
}))


export default BookSettings