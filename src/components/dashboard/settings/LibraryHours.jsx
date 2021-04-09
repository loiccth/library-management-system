import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useForm, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
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
    Typography,
    useTheme
} from '@material-ui/core'
import { LocalizationProvider, TimePicker } from '@material-ui/lab'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'

const LibraryHours = ({ hours }) => {
    const theme = useTheme()
    const classes = useStyles(theme)
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const { register, handleSubmit, errors, control, setValue, getValues, trigger } = useForm()
    const { t } = useTranslation()

    // On page load set time in react-hook-form
    useEffect(() => {
        Object.entries(hours).map(([key, value]) => (
            setValue(key, value)
        ))

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Open snackbar feedback
    const handleClick = () => {
        setOpen(true)
    }

    // Close snackbar feedback
    const handleClose = () => {
        setOpen(false)
    }

    // Update settings
    const onSubmit = (data) => {
        axios.put(`${url}/settings/hours`, data, { withCredentials: true })
            .then(result => {
                setSnackbar({
                    type: 'success',
                    msg: t(result.data.message)
                })
            })
            .catch(err => {
                setSnackbar({
                    type: 'warning',
                    msg: t(err.response.data.error)
                })
            })
            .finally(() => {
                handleClick()
            })
    }

    return (
        <>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert elevation={6} severity={snackbar.type === 'success' ? 'success' : 'warning'} onClose={handleClose}>
                    {snackbar.msg}
                </Alert>
            </Snackbar>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Box className={classes.boxAlign}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Grid container justifyContent="space-evenly">
                            <Grid item xs={5}>
                                <Typography variant="h6">{t('openingHrs')}</Typography>
                            </Grid>
                            <Grid item xs={5}>
                                <Typography variant="h6">{t('closingHrs')}</Typography>
                            </Grid>
                            {hours.opening.map((openHrs, index) => (
                                <React.Fragment key={openHrs.day}>
                                    <Grid item xs={5}>
                                        <Controller
                                            render={({ onChange, value }) => (
                                                <TimePicker
                                                    className={classes.picker}
                                                    label={t(openHrs.day)}
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
                                                            error={errors.opening === undefined ? false : errors.opening[index] === undefined ? false : true}
                                                            helperText={errors.opening === undefined ? "" : !!errors.opening[index] ? t('invalidTimeRange') : ""}
                                                            InputLabelProps={{
                                                                style: {
                                                                    left: theme.direction === 'rtl' ? 'auto' : 0
                                                                }
                                                            }}
                                                            FormHelperTextProps={{
                                                                style: {
                                                                    textAlign: theme.direction === 'rtl' ? 'right' : 'left'
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                />
                                            )}
                                            name={`opening[${index}].time`}
                                            control={control}
                                            rules={{
                                                required: true,
                                                validate: value => {
                                                    const temp = new Date(value)
                                                    temp.setSeconds(0, 0)
                                                    const temp2 = new Date(getValues(`closing[${index}].time`))
                                                    temp2.setSeconds(0, 0)
                                                    return temp <= temp2
                                                }
                                            }}
                                            defaultValue={{}}
                                        />
                                        <TextField
                                            className={classes.hidden}
                                            name={`opening[${index}].day`}
                                            inputRef={register()}
                                        />
                                    </Grid>
                                    <Grid item xs={5}>
                                        <Controller
                                            render={({ onChange, value }) => (
                                                <TimePicker
                                                    className={classes.picker}
                                                    label={t(hours.closing[index].day)}
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
                                                            error={errors.closing === undefined ? false : errors.closing[index] === undefined ? false : true}
                                                            helperText={errors.closing === undefined ? "" : !!errors.closing[index] ? t('invalidTimeRange') : ""}
                                                            InputLabelProps={{
                                                                style: {
                                                                    left: theme.direction === 'rtl' ? 'auto' : 0
                                                                }
                                                            }}
                                                            FormHelperTextProps={{
                                                                style: {
                                                                    textAlign: theme.direction === 'rtl' ? 'right' : 'left'
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                />
                                            )}
                                            name={`closing[${index}].time`}
                                            control={control}
                                            rules={{
                                                required: true,
                                                validate: value => {
                                                    const temp = new Date(value)
                                                    temp.setSeconds(0, 0)
                                                    const temp2 = new Date(getValues(`opening[${index}].time`))
                                                    temp2.setSeconds(0, 0)
                                                    return temp >= temp2
                                                }
                                            }}
                                            defaultValue={{}}
                                        />
                                        <TextField
                                            className={classes.hidden}
                                            name={`closing[${index}].day`}
                                            inputRef={register()}
                                        />
                                    </Grid>
                                </React.Fragment>
                            ))}
                        </Grid>
                    </LocalizationProvider>
                    <Box sx={{ my: 3 }}>
                        <Button
                            type="submit"
                            variant="contained"
                        >
                            {t('update')}
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
    },
    picker: {
        direction: theme => theme.direction
    }
}))

LibraryHours.propTypes = {
    hours: PropTypes.object.isRequired
}

export default LibraryHours