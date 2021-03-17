import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useLocation, Routes, Route } from 'react-router-dom'
import Cookies from 'js-cookie'
import { deviceDetect, deviceType } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import url from './settings/api'
import { ThemeProvider, createMuiTheme, Snackbar, Alert } from '@material-ui/core'
import CssBaseline from "@material-ui/core/CssBaseline"
import Home from './components/home/Home'
import Info from './components/info'
import Book from './components/home/Book'
import LoginPage from './components/login'
import Dashboard from './components/dashboard'
import MainDashboard from './components/dashboard/main'
import ManageBooks from './components/dashboard/managebooks'
import ManageMembership from './components/dashboard/managemembership'
import Settings from './components/dashboard/settings'
import Reports from './components/dashboard/reports'
import MyBooks from './components/dashboard/mybooks'
import Profile from './components/dashboard/profile'
import ForcePasswordChange from './components/others/ForcePasswordChange'

import NotFound from './components/NotFound'

import './App.css';

function App() {
    const [user, setUser] = useState(Cookies.get('user') === undefined ? { isLoggedIn: false } : JSON.parse(Cookies.get('user')))
    const [darkMode, setDarkMode] = useState(Cookies.get('darkMode') === undefined ? false : Cookies.get('darkMode') === 'true')
    const [snackbar, setSnackbar] = useState()
    const [open, setOpen] = useState(false)
    const location = useLocation()

    const theme = createMuiTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light'
        }
    })

    const handleToggleTheme = () => {
        Cookies.set('darkMode', !darkMode)
        setDarkMode(!darkMode)
    }

    const handleClick = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    useEffect(() => {
        if (!sessionStorage.getItem('session_id')) {
            sessionStorage.setItem('session_id', uuidv4())
        }

        const { userAgent, ua } = deviceDetect()

        const data = {
            sessionid: sessionStorage.getItem('session_id'),
            device: deviceType,
            userAgent: userAgent === undefined ? ua : userAgent,
            events: {
                type: 'view',
                path: location.pathname
            }
        }

        axios.post(`${url}/analytics`, data, { withCredentials: true })
            .catch(err => {
                console.log(err.message)
            })
    }, [location])

    useEffect(() => {
        const verifyLogin = () => {
            axios.get(`${url}/users/account`, { withCredentials: true })
                .then(user => {
                    if (user.data.success && !user.isLoggedIn) {
                        setUser({
                            isLoggedIn: true,
                            userid: user.data.userid,
                            email: user.data.email,
                            memberType: user.data.memberType,
                            phone: user.data.phone,
                            temporaryPassword: user.data.temporaryPassword
                        })
                    }
                    else if (!user.data.success && user.isLoggedIn) {
                        setUser({
                            isLoggedIn: false
                        })
                    }
                })
                .catch(err => {
                    console.log(err.message)
                })
        }

        verifyLogin()
    }, [])

    const handleLogin = (e) => {
        sessionStorage.removeItem('session_id')
        sessionStorage.setItem('session_id', uuidv4())
        const { userid, email, memberType, phone, temporaryPassword } = e
        setUser({
            isLoggedIn: true,
            userid,
            email,
            memberType,
            phone,
            temporaryPassword
        })
        setSnackbar('Successfully logged in.')
        handleClick()
    }

    const handleLogout = () => {
        sessionStorage.removeItem('session_id')
        sessionStorage.setItem('session_id', uuidv4())
        setUser({ isLoggedIn: false })
        Cookies.remove('user', { path: '', domain: '.udmlibrary.com' })
        sessionStorage.removeItem('session_id')
        sessionStorage.setItem('session_id', uuidv4())
        setSnackbar('Successfully logged out.')
        handleClick()
    }

    const handlePasswordChange = (parent) => {
        console.log(parent)
        setUser({
            ...user,
            temporaryPassword: false
        })

        if (parent === 'forcePasswordChange') {
            setSnackbar('Password successfully updated.')
            handleClick()
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div className="App">
                <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                    <Alert elevation={6} severity="success" onClose={handleClose}>
                        {snackbar}
                    </Alert>
                </Snackbar>
                {user.temporaryPassword && user.isLoggedIn ?
                    <ForcePasswordChange user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLogout={handleLogout} handlePasswordChange={handlePasswordChange} />
                    :
                    <Routes>
                        <Route path='/' element={<Home user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLogout={handleLogout} />} />
                        <Route path='/info' element={<Info user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLogout={handleLogout} />} />
                        <Route path='/login' element={<LoginPage user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLogout={handleLogout} handleLogin={handleLogin} />} />
                        <Route path='/book/:id' element={<Book user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLogout={handleLogout} />} />
                        <Route path='/dashboard' element={<Dashboard user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLogout={handleLogout} />}>
                            <Route path='/' element={<MainDashboard user={user} />} />
                            <Route path='/managebooks' element={<ManageBooks user={user} />} />
                            <Route path='/managememberships' element={<ManageMembership user={user} />} />
                            <Route path='/settings' element={<Settings user={user} />} />
                            <Route path='/reports' element={<Reports user={user} />} />
                            <Route path='/mybooks' element={<MyBooks />} />
                            <Route path='/profile' element={<Profile user={user} handlePasswordChange={handlePasswordChange} />} />
                        </Route>
                        <Route path='/*' element={<NotFound />} />
                    </Routes>
                }
            </div >
        </ThemeProvider>
    )
    // }
}

export default App;
