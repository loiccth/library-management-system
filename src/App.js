import React, { useState, useEffect } from 'react'
import { useLocation, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from './settings/api'
import Cookies from 'js-cookie'
import { deviceDetect, deviceType } from 'react-device-detect'
import { v4 as uuidv4 } from 'uuid'
import rtl from 'jss-rtl'
import { create } from 'jss'
import { getLocale } from './functions/getLocale'
import {
    Alert,
    createMuiTheme,
    CssBaseline,
    jssPreset,
    Snackbar,
    StylesProvider,
    ThemeProvider
} from '@material-ui/core'
import * as locales from '@material-ui/core/locale'
import Home from './components/home/Home'
import Blog from './components/blog'
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

import './App.css'

function App() {
    const [user, setUser] = useState(Cookies.get('user') === undefined ? { isLoggedIn: false } : JSON.parse(Cookies.get('user')))
    const [darkMode, setDarkMode] = useState(Cookies.get('darkMode') === undefined ? false : Cookies.get('darkMode') === 'true')
    const [locale, setLocale] = useState(getLocale())
    const [snackbar, setSnackbar] = useState()
    const [open, setOpen] = useState(false)
    const location = useLocation()
    const { t } = useTranslation()
    const jss = create({ plugins: [...jssPreset().plugins, rtl({ enabled: getLocale() === 'arEG' ? true : false })] })

    const theme = createMuiTheme({
        palette: {
            custom: {
                main: darkMode ? '#454545' : '#d7eef5',
                contrastText: darkMode ? '#ffffff' : '#000000',
            },
            mode: darkMode ? 'dark' : 'light'
        },
        direction: getLocale() === 'arEG' ? 'rtl' : 'ltr'
    }, locales[locale])

    const handleToggleTheme = () => {
        Cookies.set('darkMode', !darkMode, { sameSite: 'strict' })
        setDarkMode(!darkMode)
    }

    const handleLocale = (lang) => {
        setLocale(lang)
    }

    const handleClick = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
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
        const { message, userid, email, memberType, phone, temporaryPassword } = e
        setUser({
            isLoggedIn: true,
            userid,
            email,
            memberType,
            phone,
            temporaryPassword
        })
        setSnackbar(t(message))
        handleClick()
    }

    const handleLogout = (message) => {
        setUser({ isLoggedIn: false })
        Cookies.remove('user', { path: '', domain: '.udmlibrary.com' })
        sessionStorage.removeItem('session_id')
        sessionStorage.setItem('session_id', uuidv4())
        setSnackbar(t(message))
        handleClick()
    }

    const handlePasswordChange = (parent) => {
        setUser({
            ...user,
            temporaryPassword: false
        })

        if (parent === 'forcePasswordChange') {
            setSnackbar('msgPasswordChangeSuccess')
            handleClick()
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <StylesProvider jss={jss}>
                <CssBaseline />
                <div className="App" dir={getLocale() === 'arEG' ? 'rtl' : 'ltr'}>
                    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                        <Alert elevation={6} severity="success" onClose={handleClose}>
                            {snackbar}
                        </Alert>
                    </Snackbar>
                    {user.temporaryPassword && user.isLoggedIn ?
                        <ForcePasswordChange user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLocale={handleLocale} handleLogout={handleLogout} handlePasswordChange={handlePasswordChange} />
                        :
                        <Routes>
                            <Route path='/' element={<Home user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLocale={handleLocale} handleLogout={handleLogout} locale={locale} />} />
                            <Route path='/info' element={<Info user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLocale={handleLocale} handleLogout={handleLogout} />} />
                            <Route path='/blog' element={<Blog user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLocale={handleLocale} handleLogout={handleLogout} locale={locale} />} />
                            <Route path='/login' element={<LoginPage user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLocale={handleLocale} handleLogout={handleLogout} handleLogin={handleLogin} />} />
                            <Route path='/book/:id' element={<Book user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLocale={handleLocale} handleLogout={handleLogout} />} />
                            <Route path='/dashboard' element={<Dashboard user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLocale={handleLocale} handleLogout={handleLogout} />}>
                                <Route path='/' element={<MainDashboard user={user} locale={locale} />} />
                                <Route path='/managebooks' element={<ManageBooks user={user} locale={locale} />} />
                                <Route path='/managememberships' element={<ManageMembership user={user} />} />
                                <Route path='/settings' element={<Settings user={user} />} />
                                <Route path='/reports' element={<Reports user={user} locale={locale} />} />
                                <Route path='/mybooks' element={<MyBooks />} />
                                <Route path='/profile' element={<Profile user={user} handlePasswordChange={handlePasswordChange} />} />
                            </Route>
                            <Route path='/*' element={<NotFound darkMode={darkMode} />} />
                        </Routes>
                    }
                </div >
            </StylesProvider>
        </ThemeProvider>
    )
}

export default App;
