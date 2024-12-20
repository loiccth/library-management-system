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
    Checkbox,
    FormControlLabel,
    Grid,
    makeStyles,
    Paper,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
} from '@material-ui/core'

const Copies = (props) => {
    const classes = useStyles()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const { register, handleSubmit, errors, getValues, trigger, reset } = useForm()
    const { t } = useTranslation()

    const handleClick = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    // When remove copies form is submit check if any copies is checked before
    // sending data to the backend server
    const onSubmit = (data) => {
        let isChecked = false
        data.copies.map(copy => {
            if (copy.checked)
                isChecked = true
            return copy
        })

        // If no copy is checked display error
        if (!isChecked) {
            setSnackbar({
                type: 'warning',
                msg: t('msgCopiesNoCheck')
            })
            handleClick()
        }
        else {
            // Else remove copy
            axios.post(`${url}/books/remove`, data, { withCredentials: true })
                .then(result => {
                    setSnackbar({
                        type: 'success',
                        msg: t(result.data.message, { amount: result.data.amount })
                    })
                    props.formatData(result.data.book)
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
        }
    }

    return (
        <>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert elevation={6} severity={snackbar.type === 'success' ? 'success' : 'warning'} onClose={handleClose}>
                    {snackbar.msg}
                </Alert>
            </Snackbar>
            <Grid container justifyContent="center">
                <Grid item xs={12} md={11} lg={10}>
                    <Paper className={classes.paper}>
                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell width={'10%'}>{t('check')}</TableCell>
                                        <TableCell width={'25%'}>{t('copyid')}</TableCell>
                                        <TableCell width={'10%'}>{t('availability')}</TableCell>
                                        <TableCell width={'55%'}>{t('reason')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.copies.map((copy, index) => (
                                        <TableRow key={copy._id}>
                                            <TableCell>
                                                <TextField
                                                    className={classes.hidden}
                                                    name={`copies[${index}]._id`}
                                                    inputRef={register()}
                                                    value={copy._id}
                                                />
                                                <TextField
                                                    className={classes.hidden}
                                                    name="isbn"
                                                    inputRef={register()}
                                                    value={props.isbn}
                                                />
                                                <FormControlLabel
                                                    control={<Checkbox />}
                                                    name={`copies[${index}].checked`}
                                                    inputRef={register}
                                                    onChange={(e) => { if (!e.target.checked) trigger() }}
                                                />
                                            </TableCell>
                                            <TableCell>{copy._id}</TableCell>
                                            <TableCell>{copy.availability}</TableCell>
                                            <TableCell>
                                                <TextField
                                                    autoComplete="off"
                                                    fullWidth
                                                    variant="standard"
                                                    margin="normal"
                                                    id="reason"
                                                    name={`copies[${index}].reason`}
                                                    error={errors.copies === undefined ? false : errors.copies[index] === undefined ? false : true}
                                                    helperText={errors.copies === undefined ? " " : errors.copies[index] === undefined ? " " : t('requiredField')}
                                                    inputRef={register({
                                                        validate: value => {
                                                            if (getValues(`copies[${index}].checked`) && value === "") {
                                                                return false
                                                            }
                                                            else
                                                                return true
                                                        }
                                                    })}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Box style={{ padding: 10 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                >{t('removeCopies')}</Button>
                            </Box>
                        </form>
                    </Paper>
                </Grid>
            </Grid>
        </>
    )
}

const useStyles = makeStyles(() => ({
    table: {
        minWidth: 850
    },
    hidden: {
        display: 'none'
    },
    paper: {
        overflowX: 'auto'
    }
}))

Copies.propTypes = {
    copies: PropTypes.array.isRequired,
    isbn: PropTypes.string.isRequired,
    formatData: PropTypes.func.isRequired
}

export default Copies