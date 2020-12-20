import React, { useState, useEffect } from 'react'
import axios from 'axios'
import url from '../../../settings/api'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import LocalizationProvider from '@material-ui/lab/LocalizationProvider'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import TimePicker from '@material-ui/lab/TimePicker'
import Snackbar from '@material-ui/core/Snackbar'
import Alert from '@material-ui/core/Alert'

const LibraryHours = ({ hours }) => {
    const classes = useStyles()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const { register, handleSubmit, errors, control, setValue, getValues, trigger } = useForm()

    useEffect(() => {
        Object.entries(hours).map(([key, value]) => (
            setValue(key, value)
        ))
    }, [hours, setValue])

    const handleClick = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const onSubmit = (data) => {
        let updated = false

        for (let i = 0; i < hours.opening.length; i++) {
            if (new Date(hours.opening[i].time) - new Date(data.opening[i].time) !== 0 ||
                new Date(hours.closing[i].time) - new Date(data.closing[i].time) !== 0) {
                updated = true
            }
        }

        if (updated)
            axios.put(`${url}/settings/hours`, data, { withCredentials: true })
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
                msg: 'Opening/closing hours did not change.'
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
            <form onSubmit={handleSubmit(onSubmit)}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    {hours.opening.map((openHrs, index) => (
                        <Grid container key={openHrs.day}>
                            <Grid item>
                                <Controller
                                    render={({ onChange, value }) => (
                                        <TimePicker
                                            label={`${openHrs.day} - Open`}
                                            value={value}
                                            ampm={false}
                                            onChange={onChange}
                                            onClose={trigger}
                                            maxTime={getValues(`closing[${index}].time`)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    margin="normal"
                                                    variant="standard"
                                                    helperText={errors.opening === undefined ? "" : !!errors.opening[index] ? "Invalid time range" : ""}
                                                />
                                            )}
                                        />
                                    )}
                                    name={`opening[${index}].time`}
                                    control={control}
                                    rules={{
                                        validate: value =>
                                            new Date(value) <= new Date(getValues(`closing[${index}].time`))
                                    }}
                                    defaultValue={{}}
                                />
                                <TextField
                                    className={classes.hidden}
                                    name={`opening[${index}].day`}
                                    inputRef={register()}
                                />
                            </Grid>
                            <Grid item>
                                <Controller
                                    render={({ onChange, value }) => (
                                        <TimePicker
                                            label={`${hours.closing[index].day}  - Close`}
                                            value={value}
                                            ampm={false}
                                            onChange={onChange}
                                            onClose={trigger}
                                            minTime={getValues(`opening[${index}].time`)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    margin="normal"
                                                    variant="standard"
                                                    helperText={errors.closing === undefined ? "" : !!errors.closing[index] ? "Invalid time range" : ""}
                                                />
                                            )}
                                        />
                                    )}
                                    name={`closing[${index}].time`}
                                    control={control}
                                    rules={{
                                        validate: value =>
                                            new Date(value) >= new Date(getValues(`opening[${index}].time`))
                                    }}
                                    defaultValue={{}}
                                />
                                <TextField
                                    className={classes.hidden}
                                    name={`closing[${index}].day`}
                                    inputRef={register()}
                                />
                            </Grid>
                        </Grid>
                    ))}
                </LocalizationProvider>
                <Button
                    type="submit"
                    variant="contained"
                >Update</Button>
            </form>
        </>
    )
}

const useStyles = makeStyles(theme => ({
    hidden: {
        display: 'none'
    }
}))

export default LibraryHours