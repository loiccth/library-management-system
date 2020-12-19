import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useForm, Controller } from 'react-hook-form'
import DateFnsUtils from '@date-io/date-fns'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Grid from '@material-ui/core/Grid'
import { MuiPickersUtilsProvider, TimePicker } from '@material-ui/pickers'

const LibraryHours = ({ hours }) => {
    const classes = useStyles()
    const { register, handleSubmit, errors, control, setValue } = useForm()

    useEffect(() => {
        Object.entries(hours).map(([key, value]) => (
            setValue(key, value)
        ))
    }, [[hours, setValue]])

    const onSubmit = (data) => {
        console.log(data)
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    {hours.opening.map((openHrs, index) => (
                        <Grid container key={openHrs.day}>
                            <Grid item>
                                <Controller
                                    render={({ onChange, value }) => (
                                        <TimePicker
                                            margin="normal"
                                            color="primary"
                                            label={`${openHrs.day} - Open`}
                                            disableFuture
                                            fullWidth
                                            value={value}
                                            onChange={onChange}
                                        />
                                    )}
                                    name={`opening[${index}].time`}
                                    control={control}
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
                                            margin="normal"
                                            color="primary"
                                            label={`${hours.closing[index].day}  - Close`}
                                            disableFuture
                                            fullWidth
                                            value={value}
                                            onChange={onChange}
                                        />
                                    )}
                                    name={`closing[${index}].time`}
                                    control={control}
                                />
                                <TextField
                                    className={classes.hidden}
                                    name={`closing[${index}].day`}
                                    inputRef={register()}
                                />
                            </Grid>
                        </Grid>
                    ))}
                </MuiPickersUtilsProvider>
                <button type="submit">Submit</button>
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