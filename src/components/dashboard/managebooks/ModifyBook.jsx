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
    TextField,
} from '@material-ui/core'
import { LocalizationProvider, DatePicker } from '@material-ui/lab'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'

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

    useEffect(() => {
        Object.entries(props.book).map(([key, value]) => (
            setValue(key, value)
        ))
    }, [props.book, setValue])

    const handleClick = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const onSubmit = (data) => {
        axios.put(`${url}/books/edit`, data, { withCredentials: true })
            .then(() => {
                setSnackbar({
                    type: 'success',
                    msg: 'Success! Book updated.'
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
                                            Update Book
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
                                        label="Title"
                                        error={!!errors.title}
                                        inputRef={register({ required: "Empty title field." })}
                                        helperText={!!errors.title ? errors.title.message : " "}
                                    />
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        margin="normal"
                                        label="ISBN"
                                        value={props.book.isbn}
                                        disabled
                                    />
                                    <TextField className={classes.hidden}
                                        fullWidth
                                        variant="standard"
                                        margin="normal"
                                        id="isbn"
                                        name="isbn"
                                        label="ISBN"
                                        inputRef={register()}
                                    />
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        margin="normal"
                                        id="author"
                                        name="author"
                                        label="Author(s)"
                                        error={!!errors.author}
                                        inputRef={register({ required: "Empty author field." })}
                                        helperText={!!errors.author ? errors.author.message : "Seperate using comma (,)"}
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
                                        id="publisher"
                                        name="publisher"
                                        label="Publisher"
                                        error={!!errors.publisher}
                                        inputRef={register({ required: "Empty publisher field." })}
                                        helperText={!!errors.publisher ? errors.publisher.message : " "}
                                    />
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <Controller
                                            render={({ onChange, value }) => (
                                                <DatePicker
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
                                            defaultValue={{}}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={10} md={5}>
                                    <TextField
                                        fullWidth
                                        variant="standard"
                                        margin="normal"
                                        id="noOfPages"
                                        name="noOfPages"
                                        label="Number of pages"
                                        inputRef={register({ required: "Empty page number field.", validate: value => !isNaN(value) })}
                                        error={!!errors.noOfPages}
                                        helperText={!!errors.noOfPages ? errors.noOfPages.message === "" ? "Value is not a number" : errors.noOfPages.message : " "}
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
                                            >
                                                <MenuItem value="rhill">Rose-Hill Campus</MenuItem>
                                                <MenuItem value="pam">Swami Dayanand Campus</MenuItem>
                                            </TextField>
                                        }
                                        name="campus"
                                        control={control}
                                        rules={{ required: "Campus is required." }}
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
                                        id="description"
                                        name="description"
                                        label="Description"
                                        multiline
                                        rows={5}
                                        error={!!errors.description}
                                        inputRef={register({ required: "Empty description field." })}
                                        helperText={!!errors.description ? errors.description.message : " "}
                                    />
                                </Grid>
                                <Grid item xs={10} md={10}>
                                    <Box sx={{ mt: 1 }} className={classes.boxAlign}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                        >
                                            Update Book
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
    categories: PropTypes.array.isRequired
}

export default ModifyBook