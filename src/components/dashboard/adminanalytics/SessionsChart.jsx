import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Bar } from 'react-chartjs-2'
import { Paper, Box, Typography, makeStyles, useTheme } from '@material-ui/core'

const SessionsChart = ({ sessions }) => {
    const classes = useStyles()
    const theme = useTheme()
    const { t } = useTranslation()

    // Set data for barchart
    // Use translators for labels for multilingual support
    const data = {
        labels: sessions.labels,
        datasets: [
            {
                label: t('total'),
                data: sessions.totalData,
                backgroundColor: 'rgba(255,99,132)'
            },
            {
                label: t('users'),
                data: sessions.usersData,
                backgroundColor: 'rgb(54, 162, 235)'
            },
            {
                label: t('guests'),
                data: sessions.guestsData,
                backgroundColor: 'rgb(75, 192, 192)'
            }
        ]
    }

    return (
        <Paper>
            <Box sx={{ p: 2 }}>
                <Typography className={classes.title} variant="h6">{t('session')}</Typography>
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