import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import url from '../../settings/api'
import {
    Alert,
    Button,
    Checkbox,
    Container,
    FormControlLabel,
    makeStyles,
    Paper,
    Snackbar,
    TextField,
    Typography
} from '@material-ui/core'

const Login = (props) => {
    const { register, handleSubmit, errors, reset } = useForm()
    const [snackbar, setSnackbar] = useState()
    const [open, setOpen] = useState(false)

    const handleClick = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    const onSubmit = (data) => {
        axios.post(`${url}/users/login`, data, { withCredentials: true })
            .then(result => {
                props.handleLogin(result.data)
            })
            .catch(err => {
                setSnackbar(err.response.data.error)
                handleClick()
            })
        reset()
    }

    const classes = useStyles()

    return (
        <React.Fragment>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert elevation={6} severity="warning" onClose={handleClose}>
                    {snackbar}
                </Alert>
            </Snackbar>

            <Container component="div" maxWidth="sm">
                <Paper className={classes.paper}>
                    <Typography component="h1" variant="h5">
                        Log in
                    </Typography>
                    <form className={classes.form} noValidate onSubmit={handleSubmit(onSubmit)}>
                        <TextField
                            variant="standard"
                            margin="normal"
                            required
                            fullWidth
                            error={!!errors.userid}
                            id="userid"
                            name="userid"
                            label="MemberID"
                            autoFocus
                            inputRef={register({ required: "Empty MemberID field." })}
                            helperText={!!errors.userid ? errors.userid.message : " "}
                        />
                        <TextField
                            type="password"
                            variant="standard"
                            margin="normal"
                            required
                            fullWidth
                            error={!!errors.password}
                            id="password"
                            name="password"
                            label="Password"
                            inputRef={register({ required: "Empty Password field." })}
                            helperText={!!errors.password ? errors.password.message : " "}
                        />
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary" />}
                            label="Remember Me!"
                        />
                        <Button
                            className={classes.button}
                            type="submit"
                            variant="contained"
                            fullWidth
                        >Log in</Button>
                    </form>
                </Paper>
            </Container>
        </React.Fragment>
    )
}

const useStyles = makeStyles(theme => ({
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    form: {
        width: '100%',
        padding: theme.spacing(3),
    },
    button: {
        marginTop: theme.spacing(2),
    }
}))

Login.propTypes = {
    handleLogin: PropTypes.func.isRequired
}

export default Login