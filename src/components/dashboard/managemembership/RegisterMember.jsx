import React, { useState } from 'react'
import axios from 'axios'
import url from '../../../settings/api'

const RegisterMember = () => {
    const [register, setRegister] = useState({
        email: ''
    })
    const [msg, setMsg] = useState({
        message: ''
    })

    const handleOnChange = (e) => {
        setRegister({
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (register.email === '')
            setMsg({
                'type': 'error',
                'message': 'Cannot submit empty form'
            })
        else {
            axios.post(`${url}/users/register`, register, { withCredentials: true })
                .then(result => {
                    setRegister({
                        email: ''
                    })
                    if (result.data.error)
                        setMsg({
                            'type': 'error',
                            'message': result.data.error
                        })
                    else {
                        setMsg({
                            'type': 'success',
                            'message': 'Account successfully created.'
                        })
                    }
                })
                .catch(err => {
                    // TODO
                })
        }
    }

    return (
        <div className="register">
            {msg.type === "error" ? <div className="alert alert-warning" role="alert">
                {msg.message}
            </div> : null}
            {msg.type === "success" ? <div className="alert alert-success" role="alert">
                {msg.message}
            </div> : null}
            <form onSubmit={handleSubmit}>
                Register<br />
                <label htmlFor="email">Email: </label>
                <input type="text" name="email" id="email" value={register.email} onChange={handleOnChange} /><br />
                <button type="submit">Register</button>
            </form>
        </div>
    )
}

export default RegisterMember