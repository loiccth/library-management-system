import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Hidden from '@material-ui/core/Hidden'
import ProfileDetails from './ProfileDetails'
import ChangePassword from './ChangePassword'

const Profile = (props) => {
    const classes = useStyles()

    return (
        <>
            <div className={classes.wrapper}>
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
            </div>
        </>
    )
}

const useStyles = makeStyles(theme => ({
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: '1280px',
        margin: 'auto',
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