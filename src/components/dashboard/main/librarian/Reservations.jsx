import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'
import Tooltip from '@material-ui/core/Tooltip'
import { Toolbar } from '@material-ui/core'

const Reservations = (props) => {
    const classes = useStyles()

    return (
        <React.Fragment>
            <TableContainer component={Paper}>
                <Toolbar className={classes.table}>
                    <Typography variant="h6">Book Reservations</Typography>
                </Toolbar>
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
            </TableContainer>
        </React.Fragment>
    )
}

const useStyles = makeStyles(theme => ({
    table: {
        minWidth: 650,
        maxWidth: '80%',
        margin: 'auto'
    }
}))

export default Reservations