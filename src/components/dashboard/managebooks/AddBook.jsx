import React, { useState, useEffect } from 'react'
import axios from 'axios'
import url from '../../../settings/api'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import Snackbar from '@material-ui/core/Snackbar'
import Alert from '@material-ui/core/Alert'
import Grid from '@material-ui/core/Grid'
import LocalizationProvider from '@material-ui/lab/LocalizationProvider'
import AdapterDateFns from '@material-ui/lab/AdapterDateFns'
import DatePicker from '@material-ui/lab/DatePicker'
import Box from '@material-ui/core/Box'

const AddBook = (props) => {
    const classes = useStyles()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const { register, handleSubmit, errors, reset, control, watch, setValue } = useForm({
        defaultValues: {
            noOfCopies: 1,
            campus: 'rhill',
            location: '',
            publishedDate: new Date()
        }
    })

    useEffect(() => {
        setValue('location', '')

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watch('campus')])

    useEffect(() => {
        setValue('APIValidation', props.api)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.api])

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
        setValue('APIValidation', props.api)
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
                    <Grid item xs={12} md={10}>
                        <form noValidate onSubmit={handleSubmit(onSubmit)}>
                            <Grid container justifyContent="space-evenly">
                                <Grid item xs={10} md={5}>
                                    <TextField
                                        className={classes.hidden}
                                        required
                                        id="APIValidation"
                                        name="APIValidation"
                                        inputRef={register({ required: true })}
                                    />
                                    {!props.api &&
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
                                    }
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
                                    {!props.api &&
                                        <>
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

                                            <TextField
                                                fullWidth
                                                variant="standard"
                                                margin="normal"
                                                required
                                                error={!!errors.categories}
                                                id="categories"
                                                name="categories"
                                                label="Categories"
                                                inputRef={register({ required: "Empty categories field" })}
                                                helperText={!!errors.categories ? errors.categories.message : "Seperate using comma (,)"}
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
                                                />
                                            </LocalizationProvider>
                                        </>
                                    }
                                    {props.api &&
                                        <Controller
                                            as={
                                                <TextField
                                                    fullWidth
                                                    variant="standard"
                                                    margin="normal"
                                                    required
                                                    label="Copies"
                                                    select
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
                                    }
                                </Grid>
                                <Grid item xs={10} md={5}>
                                    {!props.api &&
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
                                    }
                                    {!props.api &&
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
                                    }
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
                                    {!props.api &&
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
                                    }
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 3 }} className={classes.boxAlign}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                >
                                    Add Book
                            </Button>
                            </Box>
                        </form>
                    </Grid>
                </Grid>
            </Box>
        </>
    )
}

const useStyles = makeStyles(theme => ({
    boxAlign: {
        textAlign: 'center'
    },
    hidden: {
        display: 'none !important'
    }
}))

export default AddBook