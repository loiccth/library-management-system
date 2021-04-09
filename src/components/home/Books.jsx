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

    // On search query update, set page and set number of books per page
    useEffect(() => {
        setPage(searchQuery.page ? parseInt(searchQuery.page) : 0)
        setNumPerPage(searchQuery.rowsperpage ? parseInt(searchQuery.rowsperpage) : 10)
    }, [searchQuery])

    // Update query string and redirect to query string
    const handlePagination = (value) => {
        setNumPerPage(value.pageSize)
        setPage(value.page)
        searchQuery.page = value.page
        searchQuery.rowsperpage = value.pageSize
        const stringified = queryString.stringify(searchQuery)
        navigate(`?${stringified}`)
    }

    // Set table headers using datagrid
    const columns = [
        {
            field: 'id',
            hide: true
        },
        {
            field: 'no',
            headerName: 'No',
            width: 80
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
            flex: 2,
            renderCell: (param) => (
                <Typography variant="body2" display="block">{param.value}</Typography>
            )
        },
        {
            field: 'authors',
            headerName: t('authors'),
            flex: 1,
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
                    <Typography variant="caption" display="block">{t('isbn')}: {param.value.isbn}</Typography>
                    <Typography variant="caption" display="block">{t('shelfLocation')}: {param.value.location}</Typography>
                    <Typography variant="caption" display="block">{t('availableAt')}: {param.value.campus === 'pam' ? "Swami Dayanand Campus" : "Rose-Hill Campus"}</Typography>
                    <Typography variant="caption" display="block">{t('holdings')}: {param.value.copies}</Typography>
                </div>
            )
        },
        {
            field: 'flags',
            headerName: 'Flags',
            width: 90,
            renderCell: (param) => {
                if (param.value.highDemand && param.value.recentlyAdded) {
                    return (
                        <>
                            <Tooltip title={t('highDemand')} arrow>
                                <PriorityHighIcon className={classes.highpriority} />
                            </Tooltip>
                            <Tooltip title={t('recentlyAdded')} arrow>
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
            },
            sortComparator: (v1, v2) => {
                // Sort by high demand and recentlyadded
                let count = 0
                if (v2.highDemand)
                    count += 2
                count += v2.recentlyAdded

                if (v1.highDemand)
                    count -= 2
                count -= v1.recentlyAdded

                return count
            }
        }
    ]

    const rows = []
    let count = 1

    // Format book details to display in datagrid
    props.books.forEach(book => {
        let temp = ''

        // Convert author array to string with , delimiter
        for (let i = 0; i < book.author.length; i++) {
            temp += book.author[i]
            if (book.author.length - 1 > i)
                temp += ', '
        }

        // Push object to book array
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
            <Box sx={{ mb: 7 }} className={classes.container}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    disableSelectionOnClick
                    sortModel={[
                        {
                            field: 'title',
                            sort: 'asc'
                        }
                    ]}
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
    container: {
        maxWidth: '80%',
        margin: 'auto',
        overflowY: 'auto',
        [theme.breakpoints.down("xl")]: {
            maxWidth: '95%'
        }
    },
    table: {
        [theme.breakpoints.down("xl")]: {
            minWidth: '1300px'
        }
    },
    thumbnail: {
        maxWidth: '80px'
    },
    highpriority: {
        color: 'red'
    }
}))

Books.propTypes = {
    books: PropTypes.array.isRequired
}

export default Books