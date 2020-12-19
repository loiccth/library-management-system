import React, { useState, useEffect } from 'react'
import axios from 'axios'
import url from '../../../settings/api'
import DateFnsUtils from '@date-io/date-fns'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import MenuItem from '@material-ui/core/MenuItem'
import Snackbar from '@material-ui/core/Snackbar'
import Alert from '@material-ui/lab/Alert'
import Grid from '@material-ui/core/Grid'

import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'

const ModifyBook = (props) => {
    const classes = useStyles()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const { register, handleSubmit, errors, control, watch, setValue } = useForm({
        defaultValues: {
            campus: '',
            location: ''
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
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                    <Grid item md={6}>
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
                            id="isbn"
                            name="isbn"
                            label="ISBN"
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
                        <TextField
                            fullWidth
                            variant="standard"
                            margin="normal"
                            id="categories"
                            name="categories"
                            label="Categories"
                            error={!!errors.categories}
                            inputRef={register({ required: "Empty categories field." })}
                            helperText={!!errors.categories ? errors.categories.message : "Seperate using comma (,)"}
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
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <Controller
                                render={({ onChange, value }) => (
                                    <KeyboardDatePicker
                                        margin="normal"
                                        color="primary"
                                        label="Published Date"
                                        format="dd/MM/yyyy"
                                        disableFuture
                                        fullWidth
                                        value={value}
                                        onChange={onChange}
                                    />
                                )}
                                name="publishedDate"
                                control={control}
                            />
                        </MuiPickersUtilsProvider>
                    </Grid>
                    <Grid item md={6}>
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
                </Grid>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                >Modify Book</Button>
            </form>
        </>
    )
}

const useStyles = makeStyles(theme => ({
    hidden: {
        display: 'none'
    }
}))


export default ModifyBook