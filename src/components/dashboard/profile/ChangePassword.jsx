import React, { useState } from 'react'
import axios from 'axios'
import url from '../../../settings/api'

const ChangePassword = (props) => {
    const [password, setPassword] = useState({
        oldpassword: '',
        newpassword: '',
        confirmpassword: ''
    })
    const [msg, setMsg] = useState({
        message: ''
    })

    const handleOnChange = (e) => {
        setPassword({
            ...password,
            [e.target.name]: e.target.value
        })
    }

    const onSubmit = (e) => {
        e.preventDefault()
        if (password.oldpassword === password.newpassword) {
            setMsg({
                type: 'error',
                message: 'Old password and new password cannot be the same.'
            })
        }
        else if (password.newpassword !== password.confirmpassword) {
            setMsg({
                type: 'error',
                message: 'New password and confirm password does not match.'
            })
        }
        else if (password.newpassword === password.confirmpassword) {
            axios.patch(`${url}/users`, { oldPassword: password.oldpassword, password: password.newpassword }, { withCredentials: true })
                .then(() => {
                    setMsg({
                        type: 'success',
                        message: 'Password successfully updated.'
                    })
                    props.handlePasswordChange()
                })
                .catch(err => {
                    console.log(err)
                })
        }

        setPassword({
            oldpassword: '',
            newpassword: '',
            confirmpassword: ''
        })
    }

    return (
        <div className="container">
            <form onSubmit={onSubmit}>
                {msg.type === "error" ? <div className="alert alert-warning" role="alert">
                    {msg.message}
                </div> : null}
                {msg.type === "success" ? <div className="alert alert-success" role="alert">
                    {msg.message}
                </div> : null}
                <div className="form-group row">
                    <div className="col-md">
                        <label htmlFor="oldpassword">Old Password</label>
                        <input type="password" name="oldpassword" className="form-control" id="oldpassword" placeholder="Old password" value={password.oldpassword} onChange={handleOnChange} />
                    </div>
                </div>
                <div className="form-group row">
                    <div className="col-md">
                        <label htmlFor="newpassword">New Password</label>
                        <input type="password" name="newpassword" className="form-control" id="newpassword" placeholder="New password" value={password.newpassword} onChange={handleOnChange} />
                    </div>
                    <div className="col-md">
                        <label htmlFor="confirmpassword">Confirm Password</label>
                        <input type="password" name="confirmpassword" className="form-control" id="confirmpassword" placeholder="Confirm password" value={password.confirmpassword} onChange={handleOnChange} />
                    </div>
                </div>
                <button className="btn btn-primary" type="submit">Update password</button>
            </form>
        </div>
    )
}

export default ChangePassword