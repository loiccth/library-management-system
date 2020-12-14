import React from 'react'
import Navbar from '../navbar/Navbar'
import { useNavigate } from 'react-router-dom'
import { Container, Grid, makeStyles } from '@material-ui/core'
import Login from './Login'
import Reset from './Reset'

const LoginPage = (props) => {
    const classes = useStyles()
    const navigate = useNavigate()

    if (props.user.isLoggedIn) {
        navigate('/dashboard', { replace: true })
    }

    return (
        <React.Fragment>
            <Navbar user={props.user} handleLogout={props.handleLogout} />
            <Container className={classes.container} maxWidth="lg">
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Login handleLogin={props.handleLogin} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Reset />
                    </Grid>
                </Grid>
            </Container>
        </React.Fragment>
    )
}

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        justifyContent: 'center',
        minHeight: '70vh',
        alignItems: 'center',
        marginTop: theme.spacing(8)
    }
}))

export default LoginPage