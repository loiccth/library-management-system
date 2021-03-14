import React, { useState, useEffect } from 'react'
import axios from 'axios'
import url from '../../../settings/api'
import { Box, Divider, Grid, makeStyles, Paper } from '@material-ui/core'
import SessionsChart from './SessionsChart'
import DevicesPie from './DevicesPie'

const AdminAnalytics = () => {
    const classes = useStyles()
    const [loading, setLoading] = useState(true)
    const [sessions, setSessions] = useState()
    const [devices, setDevices] = useState()

    useEffect(() => {
        const fetchData = async () => {
            const tempSession = await axios.get(`${url}/analytics/sessions`, { withCredentials: true })
            setSessions(tempSession.data)
            const tempDevices = await axios.get(`${url}/analytics/devices`, { withCredentials: true })
            setDevices(tempDevices.data)

            setLoading(false)
        }
        fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            {loading ? null :
                <>
                    <Box sx={{ my: 5 }}>
                        <Grid container justifyContent="center">
                            <Grid item xs={11} md={10}>
                                <Grid container spacing={2} justifyContent="center">
                                    <Grid item xs={10} sm={5} md={3} lg={3} className={classes.card}>
                                        <Box>
                                            <Paper className={classes.paper}>
                                                hello
                                            </Paper>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={10} sm={5} md={3} lg={3} className={classes.card}>
                                        <Box>
                                            <Paper className={classes.paper}>
                                                hello
                                            </Paper>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={10} sm={5} md={3} lg={3} className={classes.card}>
                                        <Box>
                                            <Paper className={classes.paper}>
                                                hello
                                            </Paper>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={10} sm={5} md={3} lg={3} className={classes.card}>
                                        <Box>
                                            <Paper className={classes.paper}>
                                                hello
                                            </Paper>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Box sx={{ my: 7 }}>
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
                    </Box>
                </>
            }
        </>
    )
}

const useStyles = makeStyles(theme => ({
    card: {
        textAlign: 'center'
    },
    paper: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2)
    }
}))


export default AdminAnalytics