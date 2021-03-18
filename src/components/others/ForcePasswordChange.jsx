import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import Navbar from '../navbar/Navbar'
import ChangePassword from '../dashboard/profile/ChangePassword'
import { Container, Grid, makeStyles, Paper, Typography } from '@material-ui/core'

const ForcePasswordChange = (props) => {
    const classes = useStyles()
    const { t } = useTranslation()

    return (
        <>
            <Navbar user={props.user} darkMode={props.darkMode} handleToggleTheme={props.handleToggleTheme} handleLocale={props.handleLocale} handleLogout={props.handleLogout} />
            <Container className={classes.wrapper}>
                <Grid container spacing={10} justifyContent="center">
                    <Grid item xs={10} sm={5} md={4} component={Paper}>
                        <Typography variant="h6">{t('changeTempPassword')}</Typography>
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

ForcePasswordChange.propTypes = {
    user: PropTypes.object.isRequired,
    darkMode: PropTypes.bool.isRequired,
    handleToggleTheme: PropTypes.func.isRequired,
    handleLocale: PropTypes.func.isRequired,
    handleLogout: PropTypes.func.isRequired,
    handlePasswordChange: PropTypes.func.isRequired
}


export default ForcePasswordChange