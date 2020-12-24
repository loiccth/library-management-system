import React, { useState, useEffect } from 'react'
import axios from 'axios'
import url from '../../../settings/api'
import { useNavigate } from 'react-router-dom'
import Divider from '@material-ui/core/Divider'
import BooksReport from './librarian/BooksReport'
import PaymentsReport from './librarian/PaymentsReport'

const Reports = ({ user }) => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [books, setBooks] = useState()
    const [filteredBooks, setFilteredBooks] = useState()
    const [filterBooks, setFilterBooks] = useState({
        type: 'All',
        status: 'All'
    })
    const [payements, setPayments] = useState()
    const [filteredPayments, setFilteredPayments] = useState()
    const [filterPayment, setFilterPayment] = useState({
        paid: 'All'
    })
    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

    useEffect(() => {
        const getLibrarian = async () => {
            const getBooks = await getBooksReport(firstDay, new Date())
            setBooks(getBooks)
            setFilteredBooks(getBooks)

            const getPayments = await getPaymentsReport(firstDay, new Date())
            setPayments(getPayments)
            setFilteredPayments(getPayments)

            setLoading(false)
        }

        if (user.memberType === 'Librarian')
            getLibrarian()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleBookChange = (e) => {
        setFilterBooks({
            ...filterBooks,
            [e.target.name]: e.target.value
        })
        handleFilterBooks(e.target.name, e.target.value)
    }

    const getBooksReport = async (from, to) => {
        const getBooks = await axios.post(`${url}/books/booksreport`, { from, to }, { withCredentials: true })

        const temp = getBooks.data.map(transaction => {
            return {
                Transaction: transaction.transactionType,
                TransactionID: transaction._id,
                Created: new Date(transaction.createdAt).toLocaleString(),
                Status: transaction.status,
                MemberID: transaction.userid.userid,
                BookTitle: transaction.bookid.title,
                BookISBN: transaction.bookid.isbn,
                BookCopyID: transaction.transactionType === 'Reserve' ? 'null' : transaction.copyid,
                ReservationExpire: transaction.transactionType === 'Reserve' ? new Date(transaction.expireAt).toLocaleString() : 'null',
                ReservationCancelled: transaction.transactionType === 'Reserve' ? transaction.isCancel : 'null',
                HighDemand: transaction.transactionType === 'Reserve' ? 'null' : transaction.isHighDemand,
                Renews: transaction.transactionType === 'Reserve' ? 'null' : transaction.renews,
                Due: transaction.transactionType === 'Reserve' ? 'null' : new Date(transaction.dueDate).toLocaleString(),
                Returned: transaction.transactionType === 'Reserve' ? 'null' : transaction.returnedOn && new Date(transaction.returnedOn).toLocaleString()
            }
        })
        return temp
    }

    const getNewBooksReport = async (date) => {
        if (date[0] instanceof Date && !isNaN(date[0].getTime()) && date[1] instanceof Date && !isNaN(date[1].getTime())) {
            const getBooks = await getBooksReport(date[0], date[1])
            setBooks(getBooks)

            if (filterBooks.type !== 'All')
                handleFilterBooks('type', filterBooks.type)
            else if (filterBooks.status !== 'All')
                handleFilterBooks('status', filterBooks.status)
            else
                setFilteredBooks(getBooks)
        }
    }

    const handleFilterBooks = (key, value) => {
        if (key === 'type') {
            if (value !== 'All' && filterBooks.status !== 'All')
                setFilteredBooks(books.filter((record) => record.Transaction === value && record.Status === filterBooks.status))
            else if (filterBooks.status !== 'All')
                setFilteredBooks(books.filter((record) => record.Status === filterBooks.status))
            else if (value !== 'All')
                setFilteredBooks(books.filter((record) => record.Transaction === value))
            else
                setFilteredBooks([...books])
        }
        if (key === 'status') {
            if (value !== 'All' && filterBooks.type !== 'All') {
                setFilteredBooks(books.filter((record) => record.Status === value && record.Transaction === filterBooks.type))
            }
            else if (filterBooks.type !== 'All')
                setFilteredBooks(books.filter((record) => record.Transaction === filterBooks.type))
            else if (value !== 'All')
                setFilteredBooks(books.filter((record) => record.Status === value))
            else
                setFilteredBooks([...books])
        }
    }

    const getPaymentsReport = async (from, to) => {
        const getPayments = await axios.post(`${url}/books/paymentssreport`, { from, to }, { withCredentials: true })

        const temp = getPayments.data.map(payment => {
            return {
                PaymentID: payment._id,
                Created: payment.createdAt,
                Paid: payment.paid,
                MemberID: payment.userid.userid,
                BookTitle: payment.bookid.title,
                BookISBN: payment.bookid.isbn,
                BookCopyID: payment.copyid,
                NumberOfDays: payment.numOfDays,
                PricePerDay: payment.pricePerDay
            }
        })
        return temp
    }

    const getNewPaymentsReport = async (date) => {
        if (date[0] instanceof Date && !isNaN(date[0].getTime()) && date[1] instanceof Date && !isNaN(date[1].getTime())) {
            const getPayments = await getPaymentsReport(date[0], date[1])
            setPayments(getPayments)

            if (filterPayment.paid !== 'All')
                handleFilterPayments(filterPayment.paid)
            else
                setFilteredPayments(getPayments)
        }
    }

    const handlePayChange = (e) => {
        setFilterPayment({
            ...filterPayment,
            [e.target.name]: e.target.value
        })
        handleFilterPayments(e.target.value)
    }

    const handleFilterPayments = (value) => {
        if (value === 'All')
            setFilteredPayments([...payements])
        else
            if (value === 'Paid')
                setFilteredPayments(payements.filter(record => record.Paid))
            else if (value === 'Unpaid')
                setFilteredPayments(payements.filter(record => !record.Paid))
    }

    if (user.memberType !== 'Librarian' && user.memberType !== 'Admin') {
        navigate('/dashboard', { replace: true })
    }

    if (user.memberType === 'Librarian') {
        return (
            <>
                {loading ? null :
                    <>
                        <BooksReport filteredBooks={filteredBooks} getNewBooksReport={getNewBooksReport} handleBookChange={handleBookChange} filterBooks={filterBooks} />
                        <Divider />
                        <PaymentsReport filteredPayments={filteredPayments} getNewPaymentsReport={getNewPaymentsReport} handlePayChange={handlePayChange} filterPayment={filterPayment} />
                    </>
                }
            </>
        )
    }
    else if (user.memberType === 'Admin') {
        (
            <>
                hello admin {user.memberType}
            </>
        )
    }
}

export default Reports