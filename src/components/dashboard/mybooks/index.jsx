import React, { useState, useEffect } from 'react'
import axios from 'axios'
import url from '../../../settings/api'
import { Alert, Box, Divider, Snackbar } from '@material-ui/core'
import BorrowedBooks from './BorrowedBooks'
import ReservedBooks from './ReservedBooks'

const MyBooks = () => {
    const [borrowed, setBorrowed] = useState()
    const [reserved, setReserved] = useState()
    const [loading, setLoading] = useState(true)
    const [snackbar, setSnackbar] = useState({ type: null })
    const [openSnack, setOpenSnack] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            const tempBorrowed = await axios.get(`${url}/books/borrowed`, { withCredentials: true })
            const tempReserved = await axios.get(`${url}/books/reserved`, { withCredentials: true })
            setBorrowed(tempBorrowed.data)
            setReserved(tempReserved.data)
            setLoading(false)
        }
        fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleClick = () => {
        setOpenSnack(true)
    }

    const handleClose = () => {
        setOpenSnack(false)
    }

    const handleRenew = (id) => {
        axios.post(`${url}/books/renew/${id}`, {}, { withCredentials: true })
            .then(result => {
                setBorrowed(borrowed.map(book => {
                    if (book._id === result.data._id) {
                        book.renews = result.data.renews
                        book.dueDate = result.data.dueDate
                        book.renewedOn = result.data.renewedOn
                    }
                    return book
                }))
                setSnackbar({
                    type: 'success',
                    msg: 'Book successfully renewed.'
                })
            })
            .catch(err => {
                setSnackbar({
                    type: 'warning',
                    msg: err.response.data.error
                })
            })
            .finally(() => {
                handleClick()
            })
    }

    const handleCancel = (id) => {
        axios.patch(`${url}/books/cancel_reservation/${id}`, {}, { withCredentials: true })
            .then(() => {
                setReserved(reserved.filter((reserve) => reserve.bookid._id !== id))
                setSnackbar({
                    type: 'success',
                    msg: 'Book reservation cancelled.'
                })
            })
            .catch(() => {
                setSnackbar({
                    type: 'warning',
                    msg: 'Unexpected error.'
                })
            })
            .finally(() => {
                handleClick()
            })
    }

    return (
        <>
            <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleClose}>
                <Alert elevation={6} severity={snackbar.type === 'success' ? 'success' : 'warning'} onClose={handleClose}>
                    {snackbar.msg}
                </Alert>
            </Snackbar>
            {loading ? null :
                <Box sx={{ my: 5 }}>
                    <BorrowedBooks borrowed={borrowed} handleRenew={handleRenew} />
                    <Box sx={{ my: 7 }}>
                        <Divider />
                    </Box>
                    <ReservedBooks reserved={reserved} handleCancel={handleCancel} />
                </Box>
            }
        </>
    )
}

export default MyBooks