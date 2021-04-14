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
    MenuItem,
    Snackbar,
    TextField,
    ThemeProvider,
    useTheme
} from '@material-ui/core'
import { LocalizationProvider, DatePicker } from '@material-ui/lab'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import { enGB, fr, zhCN, arSA } from 'date-fns/locale'

// Date locale
const localeMap = {
    enUS: enGB,
    frFR: fr,
    zhCN: zhCN,
    arEG: arSA
}

// Date mask
const maskMap = {
    enUS: '__/__/____',
    frFR: '__/__/____',
    zhCN: '__-__-__',
    arEG: '__/__/____'
}

const ModifyBook = (props) => {
    const classes = useStyles()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const { register, handleSubmit, errors, control, watch, setValue } = useForm({
        defaultValues: {
            campus: '',
            location: '',
            category: ''
        }
    })
    const { t } = useTranslation()
    const theme = useTheme()

    // On book update, set values to the react-hook-form
    useEffect(() => {
        Object.entries(props.book).map(([key, value]) => (
            setValue(key, value)
        ))
    }, [props.book, setValue])

    // Open snackbar feedback
    const handleClick = () => {
        setOpen(true)
    }

    // Close snackbar
    const handleClose = () => {
        setOpen(false)
    }

    // Send updated book details to the server
    const onSubmit = (data) => {
        axios.put(`${url}/books/edit`, data, { withCredentials: true })
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
            <Box sx={{ mt: 3 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={11} md={8}>
                        <form noValidate onSubmit={handleSubmit(onSubmit)}>
                            <Grid container justifyContent="center" spacing={2}>
                                <Grid item xs={10} md={10}>
                                    <Box className={classes.boxAlign}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                        >
                                            {t('updateBook')}
                                        </Button>
                                    </Box>
                                </Grid>
                                <Grid item xs={10} md={5}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        margin="normal"
                                        id="title"
                                        name="title"
                                        label={t('title')}
                                        error={!!errors.title}
                                        inputRef={register({ required: t('requiredField') })}
                                        helperText={!!errors.title ? errors.title.message : " "}
                                    />
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        margin="normal"
                                        label={t('isbn')}
                                        value={props.book.isbn}
                                        disabled
                                    />
                                    <TextField className={classes.hidden}
                                        fullWidth
                                        variant="standard"
                                        margin="normal"
                                        id="isbn"
                                        name="isbn"
                                        inputRef={register()}
                                    />
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        margin="normal"
                                        id="author"
                                        name="author"
                                        label={t('authors')}
                                        error={!!errors.author}
                                        inputRef={register({ required: t('requiredField') })}
                                        helperText={!!errors.author ? errors.author.message : t('authorHelper')}
                                    />
                                    <Controller
                                        as={
                                            <TextField
                                                fullWidth
                                                variant="standard"
                                                margin="normal"
                                                required
                                                error={!!errors.category}
                                                label={t('category')}
                                                select
                                                helperText={!!errors.category ? errors.category.message : " "}
                                            >
                                                {props.categories.map((category, index) => (
                                                    <MenuItem key={index} value={category}>{category}</MenuItem>
                                                ))}
                                            </TextField>
                                        }
                                        name="category"
                                        control={control}
                                        rules={{ required: t('requiredField') }}
                                    />
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        margin="normal"
                                        id="publisher"
                                        name="publisher"
                                        label={t('publisher')}
                                        error={!!errors.publisher}
                                        inputRef={register({ required: t('requiredField') })}
                                        helperText={!!errors.publisher ? errors.publisher.message : " "}
                                    />
                                    <LocalizationProvider dateAdapter={AdapterDateFns} locale={localeMap[props.locale]}>
                                        <ThemeProvider theme={{ ...theme, direction: 'ltr' }}>
                                            <Controller
                                                render={({ onChange, value }) => (
                                                    <DatePicker
                                                        mask={maskMap[props.locale]}
                                                        label={t('publishedDate')}
                                                        value={value}
                                                        onChange={onChange}
                                                        disableFuture
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                variant="standard"
                                                                name="publishedDate"
                                                                fullWidth
                                                                required
                                                                error={params.error || !!errors.publishedDate}
                                                                helperText={params.error ? "Invalid date" : !!errors.publishedDate ? errors.publishedDate.message : params.helperText}
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
                                                name="publishedDate"
                                                control={control}
                                                defaultValue={{}}
                                                rules={{ required: t('requiredField') }}
                                            />
                                        </ThemeProvider>
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={10} md={5}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        margin="normal"
                                        id="noOfPages"
                                        name="noOfPages"
                                        label={t('pages')}
                                        inputRef={register({ required: t('requiredField'), validate: value => !isNaN(value) })}
                                        error={!!errors.noOfPages}
                                        helperText={!!errors.noOfPages ? errors.noOfPages.message === "" ? t('valueNotNumber') : errors.noOfPages.message : " "}
                                    />
                                    <Controller
                                        as={
                                            <TextField
                                                fullWidth
                                                variant="standard"
                                                margin="normal"
                                                required
                                                label={t('campus')}
                                                select
                                            >
                                                <MenuItem value="rhill">Rose-Hill Campus</MenuItem>
                                                <MenuItem value="pam">Swami Dayanand Campus</MenuItem>
                                            </TextField>
                                        }
                                        name="campus"
                                        control={control}
                                        rules={{ required: t('requiredField') }}
                                    />
                                    <Controller
                                        as={
                                            <TextField
                                                fullWidth
                                                variant="standard"
                                                margin="normal"
                                                required
                                                error={!!errors.location}
                                                label={t('location')}
                                                select
                                                helperText={!!errors.location ? errors.location.message : " "}
                                            >
                                                {watch('campus') === 'rhill' ?
                                                    props.locations.rhill.options.map(location => (
                                                        <MenuItem key={location} value={location}>{location}</MenuItem>
                                                    ))
                                                    :
                                                    props.locations.pam.options.map(location => (
                                                        <MenuItem key={location} value={location}>{location}</MenuItem>
                                                    ))
                                                }
                                            </TextField>
                                        }
                                        name="location"
                                        control={control}
                                        rules={{ required: t('requiredField') }}
                                    />
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        margin="normal"
                                        id="description"
                                        name="description"
                                        label={t('description')}
                                        multiline
                                        rows={5}
                                        error={!!errors.description}
                                        inputRef={register({ required: t('requiredField') })}
                                        helperText={!!errors.description ? errors.description.message : " "}
                                    />
                                </Grid>
                                <Grid item xs={10} md={10}>
                                    <Box sx={{ mt: 1 }} className={classes.boxAlign}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                        >
                                            {t('updateBook')}
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </form>
                    </Grid>
                </Grid>
            </Box>
        </>
    )
}

const useStyles = makeStyles(() => ({
    hidden: {
        display: 'none'
    },
    boxAlign: {
        textAlign: 'right'
    }
}))

ModifyBook.propTypes = {
    book: PropTypes.object.isRequired,
    locations: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
    locale: PropTypes.string.isRequired
}

export default ModifyBook