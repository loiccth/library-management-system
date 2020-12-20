import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import queryString from 'query-string'
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
import FiberNewIcon from '@material-ui/icons/FiberNew'
import Tooltip from '@material-ui/core/Tooltip'
import Pagination from '@material-ui/core/Pagination'
import Footer from '../navbar/Footer'

const Books = (props) => {
    const navigate = useNavigate()
    const { search } = useLocation()
    const searchQuery = queryString.parse(search)
    const classes = useStyles()
    const [page, setPage] = useState(searchQuery.page ? parseInt(searchQuery.page) : 1)

    const bookSubset = props.books.slice((page - 1) * 10, (page * 10))

    useEffect(() => {
        setPage(searchQuery.page ? parseInt(searchQuery.page) : 1)
    }, [searchQuery.page])

    const handlePagination = (e, value) => {
        setPage(value)
        searchQuery.page = value
        const stringified = queryString.stringify(searchQuery)
        navigate(`?${stringified}`)
    }

    return (
        <React.Fragment>
            <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="books table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Thumbnail</TableCell>
                            <TableCell>Title</TableCell>
                            <TableCell>Author</TableCell>
                            <TableCell>Year</TableCell>
                            <TableCell className={classes.info}>Information</TableCell>
                            <TableCell className={classes.flag}>Flag(s)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bookSubset.map(row => (
                            <TableRow key={row._id}>
                                <TableCell component="th" scope="row">
                                    <img className={classes.thumbnail} src={row.thumbnail} alt="thumbnail" />
                                </TableCell>
                                <TableCell><Link to={'/book/' + row._id}>{row.title}</Link></TableCell>
                                <TableCell>
                                    {row.author.map((author, index) => (
                                        <span key={row._id + author}>{(index ? ', ' : '') + author}</span>
                                    ))}
                                </TableCell>
                                <TableCell>{new Date(row.publishedDate).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    {<React.Fragment>
                                        <Typography variant="caption" display="block">ISBN: {row.isbn}</Typography>
                                        <Typography variant="caption" display="block">Shelf Location: {row.location}</Typography>
                                        <Typography variant="caption" display="block">Available at: {row.campus === 'pam' ? "Swami Dayanand Campus" : "Rose-Hill Campus"}</Typography>
                                        <Typography variant="caption" display="block">Number of holdings: {row.copies.length}</Typography>
                                    </React.Fragment>}
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="Recently Added" arrow>
                                        <FiberNewIcon />
                                    </Tooltip>
                                    {row.isHighDemand ?
                                        <Tooltip title="High Demand" arrow>
                                            <PriorityHighIcon className={classes.highpriority} />
                                        </Tooltip>
                                        : null}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Pagination className={classes.pagination} count={Math.ceil(props.books.length / 10)} page={page} onChange={handlePagination} />
            <Footer />
        </React.Fragment>
    )
}

const useStyles = makeStyles(theme => ({
    table: {
        minWidth: 650,
        maxWidth: '80%',
        margin: 'auto'
    },
    info: {
        minWidth: 180
    },
    flag: {
        minWidth: 100
    },
    thumbnail: {
        maxWidth: '80px'
    },
    highpriority: {
        color: 'red'
    },
    pagination: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing(5),
        paddingBottom: theme.spacing(5)
    }
}))


export default Books