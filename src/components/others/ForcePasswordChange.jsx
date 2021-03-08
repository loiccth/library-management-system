import React from 'react'
import Navbar from '../navbar/Navbar'
import ChangePassword from '../dashboard/profile/ChangePassword'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'

const ForcePasswordChange = (props) => {
    const classes = useStyles()

    return (
        <>
            <Navbar user={props.user} darkMode={props.darkMode} handleToggleTheme={props.handleToggleTheme} handleLogout={props.handleLogout} />
            <Container className={classes.wrapper}>
                <Grid container spacing={10} justifyContent="center">
                    <Grid item xs={10} sm={5} md={4} component={Paper}>
                        <Typography variant="h6">Change password to proceed.</Typography>
                        <ChangePassword handlePasswordChange={props.handlePasswordChange} parent='forcePasswordChange' />
                    </Grid>
                </Grid>
            </Container>
        </>
    )
}

const useStyles = makeStyles(theme => ({
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
        [theme.breakpoints.up("sm")]: {
            minHeight: `calc(100vh - 64px)`
        },
        [theme.breakpoints.down("xs")]: {
            minHeight: `calc(100vh - 48px)`
        }
    }
}))

export default ForcePasswordChange