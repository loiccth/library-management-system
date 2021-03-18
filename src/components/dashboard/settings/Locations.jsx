import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../settings/api'
import {
    Alert,
    Box,
    Button,
    Grid,
    makeStyles,
    MenuItem,
    Snackbar,
    TextField,
    Typography
} from '@material-ui/core'

const Locations = ({ locationSettings, handleUpdateLocationsSettings }) => {
    const classes = useStyles()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const [campus, setCampus] = useState('')
    const [remove, setRemove] = useState('')
    const { register, handleSubmit, errors, reset } = useForm()
    const { t } = useTranslation()

    const handleClick = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const onSubmit = (data) => {
        if (campus === '') {
            setSnackbar({
                type: 'error',
                msg: 'No campus selected.'
            })
            handleClick()
        }
        else {
            axios.post(`${url}/settings/add_locations`, { campus: campus, location: data.location }, { withCredentials: true })
                .then(result => {
                    handleUpdateLocationsSettings({
                        campus: result.data.campus,
                        location: result.data.location
                    })
                    setSnackbar({
                        type: 'success',
                        msg: result.data.message
                    })
                })
                .catch(err => {
                    setSnackbar({
                        type: 'error',
                        msg: err.response.data.error
                    })
                })
                .finally(() => {
                    handleClick()
                    reset()
                })
        }
    }

    const handleRemove = (e) => {
        e.preventDefault()

        if (campus === '') {
            setSnackbar({
                type: 'error',
                msg: 'No category selected.'
            })
            handleClick()
        }
        else {
            axios.post(`${url}/settings/remove_locations`, { campus: campus, location: remove }, { withCredentials: true })
                .then(result => {
                    handleUpdateLocationsSettings({
                        campus: result.data.campus,
                        location: result.data.location
                    })
                    setSnackbar({
                        type: 'success',
                        msg: result.data.message
                    })
                })
                .catch(err => {
                    setSnackbar({
                        type: 'error',
                        msg: err.response.data.error
                    })
                })
                .finally(() => {
                    handleClick()
                    reset()
                })
        }
    }

    return (
        <>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert elevation={6} severity={snackbar.type === 'success' ? 'success' : 'warning'} onClose={handleClose}>
                    {snackbar.msg}
                </Alert>
            </Snackbar>

            <Box className={classes.boxAlign}>
                <Grid container justifyContent="space-evenly">
                    <Grid item xs={12}>
                        <Typography variant="h6">{t('locations')}</Typography>
                    </Grid>

                    <Grid item xs={8}>
                        <TextField
                            variant="standard"
                            margin="normal"
                            name="campus"
                            label={t('selectCampus')}
                            value={campus}
                            select
                            fullWidth
                            onChange={(e => {
                                setCampus(e.target.value)
                            })}
                        >
                            <MenuItem value="rhill">Rose-Hill Campus</MenuItem>
                            <MenuItem value="pam">Swami Dayanand Campus</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid item xs={5}>
                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            <TextField
                                variant="standard"
                                margin="normal"
                                name='location'
                                id="location"
                                label={t('addLocation')}
                                fullWidth
                                required
                                error={!!errors.location}
                                inputRef={register({ required: t('fieldRequired') })}
                                helperText={!!errors.location ? errors.location.message : ""}
                            />
                            <Box sx={{ my: 3 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                >
                                    {t('add')}
                                </Button>
                            </Box>
                        </form>
                    </Grid>
                    <Grid item xs={5}>
                        <form onSubmit={handleRemove} noValidate>
                            <TextField
                                variant="standard"
                                margin="normal"
                                name='location'
                                label={t('removeLocation')}
                                fullWidth
                                select
                                value={remove}
                                style={{ textAlign: 'left' }}
                                onChange={(e => {
                                    setRemove(e.target.value)
                                })}
                                required
                            >
                                {campus === 'rhill' && locationSettings.rhill.map((category, index) => (
                                    <MenuItem key={index} value={category}>{category}</MenuItem>
                                ))}
                                {campus === 'pam' && locationSettings.pam.map((category, index) => (
                                    <MenuItem key={index} value={category}>{category}</MenuItem>
                                ))}
                                {campus === '' &&
                                    <MenuItem value="">{t('selectCampus')}</MenuItem>
                                }
                            </TextField>
                            <Box sx={{ my: 3 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                >
                                    {t('remove')}
                                </Button>
                            </Box>
                        </form>
                    </Grid>
                </Grid>
            </Box>
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

Locations.propTypes = {
    locationSettings: PropTypes.array.isRequired,
    handleUpdateLocationsSettings: PropTypes.func.isRequired
}

export default Locations