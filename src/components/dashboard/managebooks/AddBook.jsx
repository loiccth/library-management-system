import React, { useState, useEffect } from 'react'
import axios from 'axios'
import url from '../../../settings/api'
import { useForm, Controller } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import Snackbar from '@material-ui/core/Snackbar'
import Alert from '@material-ui/lab/Alert'

const AddBook = () => {
    const classes = useStyles()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const { register, handleSubmit, errors, reset, control, watch, getValues, setValue } = useForm({
        defaultValues: {
            noOfCopies: 1,
            campus: 'rhill',
            location: ''
        }
    })

    const [rhillLocation] = useState([
        {
            value: 'rhill1',
            name: 'rhill1'
        },
        {
            value: 'rhill2',
            name: 'rhill2'
        },
        {
            value: 'rhill3',
            name: 'rhill3'
        }
    ])
    const [pamLocation] = useState([
        {
            value: 'pam4',
            name: 'pam4'
        },
        {
            value: 'pam5',
            name: 'pam5'
        },
        {
            value: 'pam6',
            name: 'pam6'
        }
    ])

    useEffect(() => {
        setValue('location', '')
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

        console.log(getValues())
    }

    return (
        <>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert elevation={6} severity={snackbar.type === 'success' ? 'success' : 'warning'} onClose={handleClose}>
                    {snackbar.msg}
                </Alert>
            </Snackbar>
            <form className={classes.root} noValidate onSubmit={handleSubmit(onSubmit)}>
                <TextField
                    fullWidth
                    variant="standard"
                    margin="normal"
                    required
                    error={!!errors.isbn}
                    id="isbn"
                    name="isbn"
                    label="ISBN"
                    autoFocus
                    inputRef={register({ required: "Empty ISBN field." })}
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
                                rhillLocation.map(location => (
                                    <MenuItem key={location.value} value={location.value}>{location.name}</MenuItem>
                                ))
                                :
                                pamLocation.map(location => (
                                    <MenuItem key={location.value} value={location.value}>{location.name}</MenuItem>
                                ))
                            }
                        </TextField>
                    }
                    name="location"
                    control={control}
                    rules={{ required: "Location is required." }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                >Add Book</Button>
            </form>
        </>
    )
}

const useStyles = makeStyles(theme => ({
}))

export default AddBook