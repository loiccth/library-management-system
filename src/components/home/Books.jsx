import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import queryString from 'query-string'
import { Box, makeStyles, Tooltip, Typography } from '@material-ui/core'
import { DataGrid } from '@material-ui/data-grid'
import FiberNewIcon from '@material-ui/icons/FiberNew'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'
import CustomNoRowsOverlay from '../../components/others/CustomNoRowsOverlay'

const Books = (props) => {
    const navigate = useNavigate()
    const { search } = useLocation()
    const searchQuery = queryString.parse(search)
    const classes = useStyles()
    const [page, setPage] = useState(searchQuery.page ? parseInt(searchQuery.page) : 0)
    const [numPerPage, setNumPerPage] = useState(searchQuery.rowsperpage ? parseInt(searchQuery.rowsperpage) : 10)
    const { t } = useTranslation()

    useEffect(() => {
        setPage(searchQuery.page ? parseInt(searchQuery.page) : 0)
        setNumPerPage(searchQuery.rowsperpage ? parseInt(searchQuery.rowsperpage) : 10)
    }, [searchQuery])

    const handlePagination = (value) => {
        setNumPerPage(value.pageSize)
        setPage(value.page)
        searchQuery.page = value.page
        searchQuery.rowsperpage = value.pageSize
        const stringified = queryString.stringify(searchQuery)
        navigate(`?${stringified}`)
    }

    const columns = [
        {
            field: 'id',
            hide: true
        },
        {
            field: 'no',
            headerName: 'No',
            width: 70
        },
        {
            field: 'thumbnail',
            headerName: t('thumbnail'),
            sortable: false,
            width: 120,
            renderCell: (param) => (
                param.value ? <img className={classes.thumbnail} src={param.value} alt="thumbnail" /> : null
            )
        },
        {
            field: 'title',
            headerName: t('title'),
            flex: 1,
            renderCell: (param) => (
                <Typography variant="body2" display="block">{param.value}</Typography>
            )
        },
        {
            field: 'authors',
            headerName: t('authors'),
            width: 200,
            renderCell: (param) => (
                <Typography variant="body2" display="block">{param.value}</Typography>
            )
        },
        {
            field: 'category',
            headerName: t('category'),
            width: 180,
            renderCell: (param) => (
                <Typography variant="body2" display="block">{param.value}</Typography>
            )
        },
        { field: 'year', headerName: t('year'), type: 'date', width: 110 },
        {
            field: 'information',
            headerName: t('information'),
            sortable: false,
            width: 260,
            renderCell: (param) => (
                <div>
                    <Typography variant="caption" display="block">ISBN: {param.value.isbn}</Typography>
                    <Typography variant="caption" display="block">{t('shelfLocation')}: {param.value.location}</Typography>
                    <Typography variant="caption" display="block">{t('availableAt')}: {param.value.campus === 'pam' ? "Swami Dayanand Campus" : "Rose-Hill Campus"}</Typography>
                    <Typography variant="caption" display="block">{t('holdings')}: {param.value.copies}</Typography>
                </div>
            )
        },
        {
            field: 'flags',
            headerName: 'Flags',
            sortable: false,
            width: 90,
            renderCell: (param) => {
                if (param.value.highDemand && param.value.recentlyAdded) {
                    return (
                        <>
                            <Tooltip title="High Demand" arrow>
                                <PriorityHighIcon className={classes.highpriority} />
                            </Tooltip>
                            <Tooltip title="Recently Added" arrow>
                                <FiberNewIcon />
                            </Tooltip>
                        </>
                    )
                }
                else if (param.value.highDemand && !param.value.recentlyAdded) {
                    return (
                        <Tooltip title={t('highDemand')} arrow>
                            <PriorityHighIcon className={classes.highpriority} />
                        </Tooltip>
                    )
                }
                else if (!param.value.highDemand && param.value.recentlyAdded) {
                    return (
                        <Tooltip title={t('recentlyAdded')} arrow>
                            <FiberNewIcon />
                        </Tooltip>
                    )
                }
                else
                    return <></>
            }
        }
    ]

    const rows = []
    let count = 1

    props.books.forEach(book => {
        let temp = ''

        for (let i = 0; i < book.author.length; i++) {
            temp += book.author[i]
            if (book.author.length - 1 > i)
                temp += ', '
        }

        rows.push({
            id: book._id,
            no: count,
            thumbnail: book.thumbnail ? book.thumbnail : null,
            title: book.title,
            authors: temp,
            category: book.category,
            year: new Date(book.publishedDate).toLocaleDateString(),
            information: {
                isbn: book.isbn,
                location: book.location,
                campus: book.campus,
                copies: book.copies.length
            },
            flags: {
                highDemand: book.isHighDemand,
                recentlyAdded: (new Date() - new Date(book.createdAt)) / (1000 * 60 * 60 * 24) <= 3
            }
        })
        count++
    })

    return (
        <React.Fragment>
            <Box sx={{ mb: 7 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    disableSelectionOnClick
                    className={classes.table}
                    autoHeight
                    page={page}
                    pageSize={numPerPage}
                    rowsPerPageOptions={[10, 15, 20, 25]}
                    rowHeight={150}
                    onPageChange={(param) => {
                        handlePagination(param)
                    }}
                    onPageSizeChange={(param) => {
                        handlePagination(param)
                    }}
                    onRowClick={(param) => {
                        navigate(`/book/${param.row.id}`)
                    }}
                    components={{
                        NoRowsOverlay: CustomNoRowsOverlay,
                    }}
                />
            </Box>
        </React.Fragment >
    )
}

const useStyles = makeStyles(theme => ({
    table: {
        maxWidth: '80%',
        margin: 'auto',
        [theme.breakpoints.down("xl")]: {
            maxWidth: '95%'
        }
    },
    thumbnail: {
        maxWidth: '80px'
    },
    highpriority: {
        color: 'red'
    },
}))

Books.propTypes = {
    books: PropTypes.array.isRequired
}

export default Books