import React, { useState, useEffect } from 'react'
import { useLocation, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import url from './settings/api'
import Cookies from 'js-cookie'
import { v4 as uuidv4 } from 'uuid'
import { analytics } from './functions/analytics'
import rtl from 'jss-rtl'
import { create } from 'jss'
import { getLocale } from './functions/getLocale'
import useInterval from './functions/useInternal'
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

function App() {
    const [user, setUser] = useState(Cookies.get('user') === undefined ? { isLoggedIn: false } : JSON.parse(Cookies.get('user')))
    const [darkMode, setDarkMode] = useState(Cookies.get('darkMode') === undefined ? false : Cookies.get('darkMode') === 'true')
    const [locale, setLocale] = useState(getLocale())
    const [snackbar, setSnackbar] = useState()
    const [open, setOpen] = useState(false)
    const [queue, setQueue] = useState([])
    const location = useLocation()
    const { t } = useTranslation()
    const jss = create({ plugins: [...jssPreset().plugins, rtl({ enabled: getLocale() === 'arEG' ? true : false })] })

    // Create theme
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

    // Toggle darktheme and set the value in a cookie
    const handleToggleTheme = () => {
        Cookies.set('darkMode', !darkMode, { sameSite: 'strict' })
        setDarkMode(!darkMode)
    }

    // Update locale
    const handleLocale = (lang) => {
        setLocale(lang)
    }

    // Open snackbar for feedbac
    const handleClick = () => {
        setOpen(true)
    }

    // Close snackbar
    const handleClose = () => {
        setOpen(false)
    }

    // Add to analytics queue on link update
    useEffect(() => {
        setQueue([
            ...queue,
            { type: 'view', info: location.pathname + location.search }
        ])

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location])

    // Verify if cookie is not expired or tempered with on page load
    useEffect(() => {
        const verifyLogin = () => {
            axios.get(`${url}/users/account`, { withCredentials: true })
                .then(user => {
                    if (user.data.userid)
                        setUser({
                            isLoggedIn: true,
                            userid: user.data.userid,
                            email: user.data.email,
                            memberType: user.data.memberType,
                            phone: user.data.phone,
                            temporaryPassword: user.data.temporaryPassword
                        })
                    else
                        setUser({
                            isLoggedIn: false
                        })
                })
        }

        verifyLogin()
    }, [])

    // Send analytics to the server from the queue
    useInterval(() => {
        if (queue.length > 0) {
            analytics(queue[0].type, queue[0].info)
            setQueue(queue.slice(1))
        }
    }, 1000)

    // Login and save users information in state
    // Change sessionid
    const handleLogin = (e) => {
        sessionStorage.removeItem('session_id')
        sessionStorage.setItem('session_id', uuidv4())
        analytics('action', 'login success')
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

    // Logout and change sessionid
    const handleLogout = (message) => {
        setUser({ isLoggedIn: false })
        Cookies.remove('user', { path: '', domain: '.udmlibrary.com' })
        sessionStorage.removeItem('session_id')
        sessionStorage.setItem('session_id', uuidv4())
        setSnackbar(t(message))
        handleClick()
    }

    // Change password and set temp password to false
    const handlePasswordChange = (parent) => {
        setUser({
            ...user,
            temporaryPassword: false
        })

        if (parent === 'forcePasswordChange') {
            setSnackbar(t('msgPasswordChangeSuccess'))
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
                            <Route path='/' element={<Home user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLocale={handleLocale} handleLogout={handleLogout} />} />
                            <Route path='/info' element={<Info user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLocale={handleLocale} handleLogout={handleLogout} />} />
                            <Route path='/blog' element={<Blog user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLocale={handleLocale} handleLogout={handleLogout} />} />
                            <Route path='/login' element={<LoginPage user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLocale={handleLocale} handleLogout={handleLogout} handleLogin={handleLogin} />} />
                            <Route path='/book/:id' element={<Book user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLocale={handleLocale} handleLogout={handleLogout} />} />
                            <Route path='/dashboard' element={<Dashboard user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLocale={handleLocale} handleLogout={handleLogout} />}>
                                <Route path='/' element={<MainDashboard user={user} locale={locale} />} />
                                <Route path='/managebooks' element={<ManageBooks user={user} locale={locale} />} />
                                <Route path='/managememberships' element={<ManageMembership user={user} />} />
                                <Route path='/settings' element={<Settings user={user} />} />
                                <Route path='/reports' element={<Reports user={user} locale={locale} />} />
                                <Route path='/mybooks' element={<MyBooks user={user} />} />
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
