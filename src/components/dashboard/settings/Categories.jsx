import React, { useState } from 'react'
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
    MenuItem,
    Snackbar,
    TextField,
    Typography
} from '@material-ui/core'

const Categories = ({ categoriesSettings, handleUpdateCategoriesSettings }) => {
    const classes = useStyles()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const [category, setCategory] = useState('')
    const { register, handleSubmit, errors, reset } = useForm()
    const { t } = useTranslation()

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
                        <Typography variant="h6">{t('categories')}</Typography>
                    </Grid>

                    <Grid item xs={5}>
                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            <TextField
                                variant="standard"
                                margin="normal"
                                name='category'
                                id="category"
                                label={t('addCategory')}
                                fullWidth
                                required
                                error={!!errors.category}
                                inputRef={register({ required: t('requiredField') })}
                                helperText={!!errors.category ? errors.category.message : ""}
                            />
                            <Box sx={{ my: 3 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                >
                                    {t('add')}
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
                                label={t('removeCategory')}
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
                                    {t('remove')}
                                </Button>
                            </Box>
                        </form>
                    </Grid>
                </Grid>
            </Box>
        </>
    )
}

const useStyles = makeStyles(() => ({
    boxAlign: {
        textAlign: 'center'
    }
}))

Categories.propTypes = {
    categoriesSettings: PropTypes.array.isRequired,
    handleUpdateCategoriesSettings: PropTypes.func.isRequired
}

export default Categories