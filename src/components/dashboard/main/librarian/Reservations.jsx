import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'
import Tooltip from '@material-ui/core/Tooltip'
import { Toolbar } from '@material-ui/core'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'

const Reservations = (props) => {
    const classes = useStyles()

    return (
        <>
            <Container>
                <Toolbar>
                    <Typography variant="h6">Book Reservations</Typography>
                </Toolbar>
            </Container>

            <Box sx={{ mt: 3 }}>
                <Grid container justifyContent="center">
                    <Grid item xs={12} md={10}>
                        <Paper className={classes.paper}>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>MemberID</TableCell>
                                        <TableCell>Book Details</TableCell>
                                        <TableCell>Reservation Details</TableCell>
                                        <TableCell>Flag(s)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {props.reservations.length === 0 &&
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">No records found.</TableCell>
                                        </TableRow>
                                    }
                                    {props.reservations.map(row => (
                                        <TableRow key={row._id}>
                                            <TableCell component="th" scope="row">
                                                {row.userid}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">Title: {row.title}</Typography>
                                                <Typography variant="caption" display="block">ISBN: {row.isbn}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption" display="block">Reserve: {new Date(row.reserveDate).toLocaleString()}</Typography>
                                                <Typography variant="caption" display="block">Expire: {new Date(row.expireDate).toLocaleString()}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                {row.isHighDemand &&
                                                    <Tooltip title="High Demand" arrow>
                                                        <PriorityHighIcon />
                                                    </Tooltip>
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </>
    )
}

const useStyles = makeStyles(theme => ({
    paper: {
        overflowX: 'auto'
    },
    table: {
        minWidth: 650,
        overflowX: 'auto'
    }
}))

export default Reservations