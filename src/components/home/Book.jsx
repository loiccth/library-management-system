import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import url from '../../settings/api'
import Navbar from '../navbar/Navbar'
import Footer from '../navbar/Footer'

const Book = (props) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [book, setBook] = useState(null)

    useEffect(() => {
        const getBook = (id) => {
            axios.get(`${url}/books/${id}`)
                .then(book => setBook(book.data.book))
                .catch(err => {
                    if (err.response.status === 404) navigate('/', { replace: true })
                })
        }
        getBook(id)
    }, [id, navigate])

    if (book === null) return null
    else {
        return (
            <React.Fragment>
                <Navbar user={props.user} handleLogout={props.handleLogout} />
                <div className="container book-details">
                    <img src={book.thumbnail} alt="thumbnail" />
                    <p>{book.title}</p>
                    <p>{book.isbn}</p>
                    <p>{book.publisher}</p>
                    <p>{book.publishedDate}</p>
                    <p>{book.noOfPages}</p>
                    <p>{book.location}</p>
                    <p>{book.campus}</p>
                    <p>{book.copies.length}</p>
                    <p>{book.noOfBooksOnLoan}</p>
                    <p>{book.isHighDemand}</p>
                    <p>{book.description}</p>
                    <button>Reserve Book</button>
                </div>
                <Footer style={{ position: 'absolute', bottom: 0, width: '100%' }} />
            </React.Fragment>
        )
    }
}

export default Book