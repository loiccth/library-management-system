import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from '../../../settings/api'
import {
    Box,
    Container,
    Divider,
    Grid,
    makeStyles,
    Paper,
    Toolbar,
    Typography
} from '@material-ui/core'
import SessionsChart from './SessionsChart'
import DevicesPie from './DevicesPie'
import LatestLogins from './LatestLogins'

const AdminAnalytics = () => {
    const classes = useStyles()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState()
    const [sessions, setSessions] = useState()
    const [latest, setLatest] = useState()
    const [devices, setDevices] = useState()
    const { t } = useTranslation()

    useEffect(() => {
        const fetchData = async () => {
            const tempSession = await axios.get(`${url}/analytics/sessions`, { withCredentials: true })
            setSessions(tempSession.data)
            const tempDevices = await axios.get(`${url}/analytics/devices`, { withCredentials: true })
            setDevices(tempDevices.data)
            const getStats = await axios.get(`${url}/analytics/stats`, { withCredentials: true })
            setStats(getStats.data)
            const getLatest = await axios.get(`${url}/analytics/latest`, { withCredentials: true })
            setLatest(getLatest.data)

            setLoading(false)
        }
        fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            {loading ? null :
                <Box sx={{ my: 5 }}>
                    <Container>
                        <Toolbar>
                            <Typography variant="h6">{t('stats')}</Typography>
                        </Toolbar>
                    </Container>
                    <Box sx={{ my: 3 }}>
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
                        <Box sx={{ my: 5 }}>
                            <Divider />
                        </Box>
                        <Grid container justifyContent="center">
                            <Grid item xs={11} md={10}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={7}>
                                        <SessionsChart sessions={sessions} />
                                    </Grid>
                                    <Grid item xs={12} md={5}>
                                        <DevicesPie devices={devices} />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Box sx={{ my: 5 }}>
                            <Divider />
                        </Box>
                        <LatestLogins latest={latest} />
                    </Box>
                </Box>
            }
        </>
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


export default AdminAnalytics