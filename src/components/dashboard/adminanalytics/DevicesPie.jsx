import React from 'react'
import { Pie } from 'react-chartjs-2'
import Paper from '@material-ui/core/Paper'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { makeStyles, useTheme } from '@material-ui/core/styles'

const DevicesPie = ({ devices }) => {
    const classes = useStyles()
    const theme = useTheme()

    const customLabels = devices.labels.map((label, index) => `${label}: ${devices.data[index]}`)

    const data = {
        labels: customLabels,
        datasets: [{
            data: devices.data,
            backgroundColor: [
                'rgba(255, 99, 132)',
                'rgba(54, 162, 235)',
                'rgba(255, 206, 86)'
            ],
            borderWidth: 0
        }]
    }

    return (
        <Paper style={{ height: '100%' }}>
            <Box sx={{ p: 2, height: '100%' }}>
                <Typography className={classes.title} variant="h6">Traffic by device for last seven days</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', height: '85%' }}>
                    <Pie
                        data={data}
                        options={{
                            tooltips: {
                                callbacks: {
                                    label: (tooltipItem, data) => {
                                        const dataset = data.datasets[tooltipItem.datasetIndex]
                                        const meta = dataset._meta[Object.keys(dataset._meta)[0]]
                                        const total = meta.total
                                        const currentValue = dataset.data[tooltipItem.index]
                                        const percentage = parseFloat((currentValue / total * 100).toFixed(1))
                                        return currentValue + ' (' + percentage + '%)'
                                    },
                                    title: (tooltipItem, data) => {
                                        return data.labels[tooltipItem[0].index]
                                    }
                                }
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
            </Box>
        </Paper>
    )
}

const useStyles = makeStyles(theme => ({
    title: {
        textAlign: 'center'
    }
}))

export default DevicesPie