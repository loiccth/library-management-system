import React from 'react'
import { Bar } from 'react-chartjs-2'
import Paper from '@material-ui/core/Paper'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { makeStyles, useTheme } from '@material-ui/core/styles'

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

const useStyles = makeStyles(theme => ({
    title: {
        textAlign: 'center'
    }
}))

export default SessionsChart