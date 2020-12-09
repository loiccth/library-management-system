import React, { useState } from 'react'
import axios from 'axios'
import url from '../../../settings/api'

const AddBooks = (props) => {
    const [addBook, setAddBook] = useState({
        isbn: '',
        noOfCopies: 1,
        campus: 'rhill',
        location: 'idk'
    })
    const [file, setFile] = useState()
    const [msg, setMsg] = useState({
        message: ''
    })

    const handleOnChange = (e) => {
        setAddBook({
            ...addBook,
            [e.target.name]: e.target.value
        })
    }

    const handleFileOnChange = (e) => {
        setFile(e.target.files[0])
    }

    const handleFileSubmit = (e) => {
        e.preventDefault()
        const dataForm = new FormData()
        dataForm.append('csv', file)
        axios.post(`${url}/books/add`, dataForm, { withCredentials: true })
            .then(result => console.log(result))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (addBook.isbn.length !== 10 && addBook.isbn.length !== 13)
            setMsg({
                type: 'error',
                message: 'Invalid ISBN length.'
            })
        else {
            axios.post(`${url}/books/add_single`, addBook, { withCredentials: true })
                .then(result => {
                    if (result.data.error)
                        setMsg({
                            type: 'error',
                            message: result.data.error
                        })

                    else
                        setMsg({
                            type: 'success',
                            message: 'Book successfully added.'
                        })
                })
        }
    }

    return (
        <div className="add-books mb-5">
            <h3>Add book(s)</h3>
            {msg.type === "error" ? <div className="alert alert-warning" role="alert">
                {msg.message}
            </div> : null}
            {msg.type === "success" ? <div className="alert alert-success" role="alert">
                {msg.message}
            </div> : null}
            <div className="row">
                <div className="col">
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group col-md-6">
                                <label htmlFor="isbn">ISBN</label>
                                <input type="text" className="form-control" id="isbn" name="isbn" placeholder="ISBN" onChange={handleOnChange} />
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="noOfCopies">Number of copies</label>
                                <select className="form-control" id="noOfCopies" name="noOfCopies" defaultValue={addBook.noOfCopies} onChange={handleOnChange}>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group col-md-6">
                                <label htmlFor="campus">Campus</label>
                                <select className="form-control" id="campus" name="campus" defaultValue={addBook.campus} onChange={handleOnChange}>
                                    <option value="rhill">Rose-Hill Campus</option>
                                    <option value="pam">Swami Dayanand Campus</option>
                                </select>
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="location">Location</label>
                                <select className="form-control" id="location" name="location" defaultValue={addBook.location} onChange={handleOnChange}>
                                    <option value="idk">idk</option>
                                    <option value="embaplei">embaplei</option>
                                    <option value="embapond">embapond</option>
                                    <option value="dansloto">dansloto</option>
                                    <option value="danslab">danslab</option>
                                </select>
                            </div>
                        </div>
                        <button className="btn btn-primary" type="submit">Add Book</button>
                    </form>
                </div>
                <div className="col">
                    <form onSubmit={handleFileSubmit}>
                        <div className="form-group">
                            <div className="custom-file">
                                <label className="" htmlFor="csv">Choose CSV file</label>
                                <input type="file" className="form-control" id="csv" name="csv" onChange={handleFileOnChange} />
                            </div>
                        </div>
                        <button className="btn btn-primary" type="submit">Submit</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddBooks