import React from 'react'
import PropTypes from 'prop-types'
import { Bar } from 'react-chartjs-2'
import { Paper, Box, Typography, makeStyles, useTheme } from '@material-ui/core'

const SessionsChart = ({ sessions }) => {
    const classes = useStyles()
    const theme = useTheme()

    const data = {
        labels: sessions.labels,
        datasets: [
            {
                label: 'Total',
                data: sessions.totalData,
                backgroundColor: 'rgba(255,99,132)'
            },
            {
                label: 'Users',
                data: sessions.usersData,
                backgroundColor: 'rgb(54, 162, 235)'
            },
            {
                label: 'Guests',
                data: sessions.guestsData,
                backgroundColor: 'rgb(75, 192, 192)'
            }
        ]
    }

    return (
        <Paper>
            <Box sx={{ p: 2 }}>
                <Typography className={classes.title} variant="h6">Number of sessions for last seven days</Typography>
                <Bar
                    data={data}
                    options={{
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                    stepSize: 5,
                                    fontColor: theme.palette.text.primary
                                },
                                gridLines: {
                                    color: theme.palette.text.secondary
                                }
                            }],
                            xAxes: [{
                                ticks: {
                                    fontColor: theme.palette.text.primary
                                },
                                gridLines: {
                                    color: theme.palette.text.secondary
                                }
                            }]
                        },
                        legend: {
                            position: 'bottom',
                            labels: {
                                fontColor: theme.palette.text.primary
                            }
                        }
                    }}
                />
            </Box>
        </Paper>
    )
}

const useStyles = makeStyles(() => ({
    title: {
        textAlign: 'center'
    }
}))

SessionsChart.propTypes = {
    sessions: PropTypes.object.isRequired
}

export default SessionsChart