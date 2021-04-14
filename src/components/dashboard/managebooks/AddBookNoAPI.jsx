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

const AddBookNoAPI = (props) => {
    const classes = useStyles()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const { register, handleSubmit, errors, reset, control, watch, setValue } = useForm({
        defaultValues: {
            APIValidation: false,
            noOfCopies: 1,
            campus: 'rhill',
            location: '',
            category: '',
            publishedDate: new Date()
        }
    })
    const { t } = useTranslation()
    const theme = useTheme()

    useEffect(() => {
        setValue('location', '')

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watch('campus')])

    // Open snackbar feedback
    const handleClick = () => {
        setOpen(true);
    }

    // Close snackbar feedback
    const handleClose = () => {
        setOpen(false);
    }

    // Add book to database
    const onSubmit = (data) => {
        console.log(data)
        axios.post(`${url}/books/add_single`, data, { withCredentials: true })
            .then(result => {
                setSnackbar({
                    type: 'success',
                    msg: t(result.data.message, { title: result.data.title })
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
        reset()
        setValue('APIValidation', false)
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
                                            {t('addBook')}
                                        </Button>
                                    </Box>
                                </Grid>
                                <Grid item xs={10} md={5}>
                                    <TextField
                                        className={classes.hidden}
                                        required
                                        id="APIValidation"
                                        name="APIValidation"
                                        inputRef={register({ required: true })}
                                    />
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        margin="normal"
                                        required
                                        error={!!errors.title}
                                        id="title"
                                        name="title"
                                        label={t('title')}
                                        inputRef={register({ required: t('requiredField') })}
                                        helperText={!!errors.title ? errors.title.message : " "}
                                    />
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        margin="normal"
                                        required
                                        error={!!errors.isbn}
                                        id="isbn"
                                        name="isbn"
                                        label={t('isbn')}
                                        inputRef={register({
                                            required: t('requiredField'),
                                            validate: value =>
                                                value.length === 10 || value.length === 13 || t('isbnLength')
                                        })}
                                        helperText={!!errors.isbn ? errors.isbn.message : " "}
                                    />
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        margin="normal"
                                        required
                                        error={!!errors.authors}
                                        id="authors"
                                        name="authors"
                                        label={t('authors')}
                                        inputRef={register({ required: t('requiredField') })}
                                        helperText={!!errors.authors ? errors.authors.message : t('authorHelper')}
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
                                        required
                                        error={!!errors.publisher}
                                        id="publisher"
                                        name="publisher"
                                        label={t('publisher')}
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
                                                                helperText={params.error ? t('invalidDate') : !!errors.publishedDate ? errors.publishedDate.message : params.helperText}
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
                                        required
                                        error={!!errors.noOfPages}
                                        id="noOfPages"
                                        name="noOfPages"
                                        label={t('pages')}
                                        inputRef={register({ required: t('requiredField'), validate: value => !isNaN(value) })}
                                        helperText={!!errors.noOfPages ? errors.noOfPages.message === "" ? t('valueNotNumber') : errors.noOfPages.message : " "}
                                    />
                                    <Controller
                                        as={
                                            <TextField
                                                fullWidth
                                                variant="standard"
                                                margin="normal"
                                                required
                                                label={t('copies')}
                                                select
                                                helperText=" "
                                            >
                                                <MenuItem value="1">1</MenuItem>
                                                <MenuItem value="2">2</MenuItem>
                                                <MenuItem value="3">3</MenuItem>
                                                <MenuItem value="4">4</MenuItem>
                                                <MenuItem value="5">5</MenuItem>
                                            </TextField>
                                        }
                                        name="noOfCopies"
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
                                                label={t('campus')}
                                                select
                                                helperText=" "
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
                                        required
                                        error={!!errors.description}
                                        id="description"
                                        name="description"
                                        label={t('description')}
                                        multiline
                                        minRows={5}
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
                                            {t('addBook')}
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
    boxAlign: {
        textAlign: 'right'
    },
    hidden: {
        display: 'none !important'
    }
}))

AddBookNoAPI.propTypes = {
    locations: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired
}

export default AddBookNoAPI