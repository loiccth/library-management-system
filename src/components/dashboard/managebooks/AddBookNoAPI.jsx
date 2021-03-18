import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useForm, Controller } from 'react-hook-form'
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
    TextField
} from '@material-ui/core'
import { LocalizationProvider, DatePicker } from '@material-ui/lab'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import frLocale from 'date-fns/locale/fr'

const localeMap = {
    fr: frLocale,
}

const maskMap = {
    fr: '__/__/____',
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

    useEffect(() => {
        setValue('location', '')

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watch('campus')])

    const handleClick = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const onSubmit = (data) => {
        console.log(data)
        axios.post(`${url}/books/add_single`, data, { withCredentials: true })
            .then(result => {
                setSnackbar({
                    type: 'success',
                    msg: `Book added - ${result.data.title}`
                })
            })
            .catch(err => {
                setSnackbar({
                    type: 'warning',
                    msg: err.response.data.error
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
                                            Add Book
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
                                        label="Title"
                                        inputRef={register({ required: "Empty title field" })}
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
                                        label="ISBN"
                                        inputRef={register({
                                            required: "Empty ISBN field.",
                                            validate: value =>
                                                value.length === 10 || value.length === 13 || "Invalid ISBN length"
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
                                        label="Author(s)"
                                        inputRef={register({ required: "Empty author field" })}
                                        helperText={!!errors.authors ? errors.authors.message : "Seperate using comma (,)"}
                                    />
                                    <Controller
                                        as={
                                            <TextField
                                                fullWidth
                                                variant="standard"
                                                margin="normal"
                                                required
                                                error={!!errors.category}
                                                label="Category"
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
                                        rules={{ required: "Category is required." }}
                                    />
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        margin="normal"
                                        required
                                        error={!!errors.publisher}
                                        id="publisher"
                                        name="publisher"
                                        label="Publisher"
                                        inputRef={register({ required: "Empty publisher field" })}
                                        helperText={!!errors.publisher ? errors.publisher.message : " "}
                                    />
                                    <LocalizationProvider dateAdapter={AdapterDateFns} locale={localeMap['fr']}>
                                        <Controller
                                            render={({ onChange, value }) => (
                                                <DatePicker
                                                    mask={maskMap['fr']}
                                                    label="Published Date *"
                                                    value={value}
                                                    onChange={onChange}
                                                    disableFuture
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            variant="standard"
                                                            name="publishedDate"
                                                            fullWidth
                                                            helperText={params.errors ? "Invalid date" : params.helperText}
                                                        />
                                                    )}
                                                />
                                            )}
                                            name="publishedDate"
                                            control={control}
                                        />
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
                                        label="Number of pages"
                                        inputRef={register({ required: "Empty page number field.", validate: value => !isNaN(value) })}
                                        helperText={!!errors.noOfPages ? errors.noOfPages.message === "" ? "Value is not a number" : errors.noOfPages.message : " "}
                                    />
                                    <Controller
                                        as={
                                            <TextField
                                                fullWidth
                                                variant="standard"
                                                margin="normal"
                                                required
                                                label="Copies"
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
                                    />
                                    <Controller
                                        as={
                                            <TextField
                                                fullWidth
                                                variant="standard"
                                                margin="normal"
                                                required
                                                label="Campus"
                                                select
                                                helperText=" "
                                            >
                                                <MenuItem value="rhill">Rose-Hill Campus</MenuItem>
                                                <MenuItem value="pam">Swami Dayanand Campus</MenuItem>
                                            </TextField>
                                        }
                                        name="campus"
                                        control={control}
                                    />
                                    <Controller
                                        as={
                                            <TextField
                                                fullWidth
                                                variant="standard"
                                                margin="normal"
                                                required
                                                error={!!errors.location}
                                                label="Location"
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
                                        rules={{ required: "Location is required." }}
                                    />
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        margin="normal"
                                        required
                                        error={!!errors.description}
                                        id="description"
                                        name="description"
                                        label="Description"
                                        multiline
                                        minRows={5}
                                        inputRef={register({ required: "Empty description field" })}
                                        helperText={!!errors.description ? errors.description.message : " "}
                                    />
                                </Grid>
                                <Grid item xs={10} md={10}>
                                    <Box sx={{ mt: 1 }} className={classes.boxAlign}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                        >
                                            Add Book
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