import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Hidden from '@material-ui/core/Hidden'
import ProfileDetails from './ProfileDetails'
import ChangePassword from './ChangePassword'

const Profile = (props) => {
    const classes = useStyles()

    return (
        <>
            <Container className={classes.wrapper}>
                <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={10} sm={5} md={4}>
                        <ProfileDetails user={props.user} />
                    </Grid>
                    <Hidden smDown>
                        <Divider orientation="vertical" flexItem={true} />
                    </Hidden>
                    <Grid item xs={10} sm={5} md={4}>
                        <ChangePassword handlePasswordChange={props.handlePasswordChange} parent='profile' />
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

export default Profile