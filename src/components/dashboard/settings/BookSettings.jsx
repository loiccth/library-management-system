import React, { useState, useEffect } from 'react'
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
    Snackbar,
    TextField,
    Typography
} from '@material-ui/core'

const BookSettings = ({ bookSettings, handleUpdateBookSettings }) => {
    const classes = useStyles()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const { register, handleSubmit, errors, setValue } = useForm()
    const { t } = useTranslation()

    useEffect(() => {
        Object.entries(bookSettings).map(([key, value]) => (
            setValue(`settings[${key}].value`, value.value)
        ))

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleClick = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
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
                    handleUpdateBookSettings(data.settings)
                    handleClick()
                })
        else {
            setSnackbar({
                type: 'warning',
                msg: t('msgBookSettingsNotChange')
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
                            <Typography variant="h6">{t('bookSettings')}</Typography>
                        </Grid>
                        {bookSettings.map((setting, index) => (
                            <React.Fragment key={setting.name}>
                                <Grid item xs={5}>
                                    <TextField
                                        label={t(setting.id)}
                                        name={`settings[${index}].value`}
                                        variant="standard"
                                        margin="normal"
                                        required
                                        fullWidth
                                        error={errors.settings === undefined ? false : errors.settings[index] === undefined ? false : true}
                                        inputRef={register({ required: t('requiredField'), validate: value => !isNaN(value) })}
                                        helperText={errors.settings === undefined ? setting.name === "Time onhold" ? t('timeMinutes') : "" :
                                            errors.settings[index] === undefined ? setting.name === "Time onhold" ? t('timeMinutes') : "" :
                                                errors.settings[index].value.message === "" ? t('valueNotNumber') :
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
    }
}))

BookSettings.propTypes = {
    bookSettings: PropTypes.array.isRequired,
    handleUpdateBookSettings: PropTypes.func.isRequired
}

export default BookSettings