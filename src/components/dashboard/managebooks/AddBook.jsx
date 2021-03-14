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

const AddBook = (props) => {
    const classes = useStyles()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const { register, handleSubmit, errors, reset, control, watch, setValue } = useForm({
        defaultValues: {
            APIValidation: true,
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
        setValue('APIValidation', true)
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
                                </Grid>
                                <Grid item xs={10} md={5}>
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

AddBook.propTypes = {
    locations: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired
}

export default AddBook