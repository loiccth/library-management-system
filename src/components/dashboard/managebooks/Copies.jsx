import React, { useState } from 'react'
import axios from 'axios'
import url from '../../../settings/api'
import { useForm } from 'react-hook-form'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Checkbox from '@material-ui/core/Checkbox'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Snackbar from '@material-ui/core/Snackbar'
import Alert from '@material-ui/lab/Alert'

const Copies = (props) => {
    const classes = useStyles()
    const [snackbar, setSnackbar] = useState({ type: null })
    const [open, setOpen] = useState(false)
    const { register, handleSubmit, errors, getValues, trigger, reset } = useForm()

    const handleClick = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const onSubmit = (data) => {
        let isChecked = false
        data.copies.map(copy => {
            if (copy.checked)
                isChecked = true
            return copy
        })

        if (!isChecked) {
            setSnackbar({
                type: 'warning',
                msg: "No book copies checked."
            })
            handleClick()
        }
        else {
            axios.post(`${url}/books/remove`, data, { withCredentials: true })
                .then(result => {
                    setSnackbar({
                        type: 'success',
                        msg: `Success! ${result.data.noOfBooksRemoved} copies deleted`
                    })
                    props.deleteCopies(data)
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
            props.deleteCopies(data)
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
            <Grid container>
                <Grid item>
                    <TableContainer>
                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Check</TableCell>
                                        <TableCell>Copy ID</TableCell>
                                        <TableCell>Availability</TableCell>
                                        <TableCell>Reason</TableCell>
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
                                                    fullWidth
                                                    variant="standard"
                                                    margin="normal"
                                                    id="reason"
                                                    name={`copies[${index}].reason`}
                                                    error={errors.copies === undefined ? false : errors.copies[index] === undefined ? false : true}
                                                    helperText={errors.copies === undefined ? " " : errors.copies[index] === undefined ? " " : "Reason for removing copy cannot be empty."}
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
                            <button type="submit">Submit</button>
                        </form>
                    </TableContainer>
                </Grid>
            </Grid>
        </>
    )
}

const useStyles = makeStyles(theme => ({
    hidden: {
        display: 'none'
    }
}))


export default Copies