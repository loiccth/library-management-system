import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../settings/api'
import {
    Box,
    Grid,
    makeStyles,
    Paper,
} from '@material-ui/core'

const Statistics = () => {
    const classes = useStyles()
    const [stats, setStats] = useState({})
    const { t } = useTranslation()

    // Fetch data on page load
    useEffect(() => {
        const fetchData = async () => {
            const getStats = await axios.get(`${url}/analytics/stats`, { withCredentials: true })
            setStats(getStats.data)
        }
        fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Grid container justifyContent="center">
            <Grid item xs={11} md={10}>
                <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={10} sm={5} md={3} lg={3} className={classes.card}>
                        <Box>
                            <Paper className={classes.paper}>
                                {t('activeUsers')}: {stats.users}
                            </Paper>
                        </Box>
                    </Grid>
                    <Grid item xs={10} sm={5} md={3} lg={3} className={classes.card}>
                        <Box>
                            <Paper className={classes.paper}>
                                {t('guestUsers')}: {stats.guests}
                            </Paper>
                        </Box>
                    </Grid>
                    <Grid item xs={10} sm={5} md={3} lg={3} className={classes.card}>
                        <Box>
                            <Paper className={classes.paper}>
                                {t('loginFailed')}: {stats.failedLogin}
                            </Paper>
                        </Box>
                    </Grid>
                    <Grid item xs={10} sm={5} md={3} lg={3} className={classes.card}>
                        <Box>
                            <Paper className={classes.paper}>
                                {t('passwordReset')}: {stats.passwordReset}
                            </Paper>
                        </Box>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}

const useStyles = makeStyles(theme => ({
    card: {
        textAlign: 'center'
    },
    paper: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        fontSize: '1.3em'
    }
}))

export default Statistics