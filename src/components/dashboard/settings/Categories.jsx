import React, { useState } from 'react'
import axios from 'axios'
import url from '../../../settings/api'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import Alert from '@material-ui/core/Alert'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import MenuItem from '@material-ui/core/MenuItem'
import Grid from '@material-ui/core/Grid'

const Categories = ({ categoriesSettings, handleUpdateCategoriesSettings }) => {
    const classes = useStyles()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const [category, setCategory] = useState('')
    const { register, handleSubmit, errors, reset } = useForm()

    const handleClick = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const onSubmit = (data) => {
        axios.post(`${url}/settings/add_categories`, data, { withCredentials: true })
            .then(result => {
                handleUpdateCategoriesSettings(result.data.categories)
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

    const handleRemove = (e) => {
        e.preventDefault()

        if (category === '') {
            setSnackbar({
                type: 'error',
                msg: 'No category selected.'
            })
            handleClick()
        }
        else {
            axios.post(`${url}/settings/remove_categories`, { category }, { withCredentials: true })
                .then(result => {
                    handleUpdateCategoriesSettings(result.data.categories)
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
                        <Typography variant="h6">Categories</Typography>
                    </Grid>

                    <Grid item xs={5}>
                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            <TextField
                                variant="standard"
                                margin="normal"
                                name='category'
                                id="category"
                                label="Add category"
                                fullWidth
                                required
                                error={!!errors.category}
                                inputRef={register({ required: "Field is required." })}
                                helperText={!!errors.category ? errors.category.message : ""}
                            />
                            <Box sx={{ my: 3 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                >
                                    Add
                                </Button>
                            </Box>
                        </form>
                    </Grid>
                    <Grid item xs={5}>
                        <form onSubmit={handleRemove} noValidate>
                            <TextField
                                variant="standard"
                                margin="normal"
                                name='category'
                                label="Remove category"
                                fullWidth
                                select
                                value={category}
                                style={{ textAlign: 'left' }}
                                onChange={(e => {
                                    setCategory(e.target.value)
                                })}
                                required
                            >
                                {categoriesSettings.map((category, index) => (
                                    <MenuItem key={index} value={category}>{category}</MenuItem>
                                ))}
                            </TextField>
                            <Box sx={{ my: 3 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                >
                                    Remove
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
    }
}))


export default Categories