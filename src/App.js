import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Cookies from 'js-cookie'
import url from './settings/api'
import { ThemeProvider, createMuiTheme } from '@material-ui/core'
import CssBaseline from "@material-ui/core/CssBaseline"
import Navbar from './components/navbar/Navbar'
import Home from './components/home/Home'
import Book from './components/home/Book'
import LoginPage from './components/login'
import Dashboard from './components/dashboard'
import MainDashboard from './components/dashboard/main'
import ManageBooks from './components/dashboard/managebooks'
import Settings from './components/dashboard/settings'
import Profile from './components/dashboard/profile'
import ManageMembership from './components/dashboard/managemembership'
import ChangePassword from './components/dashboard/profile/ChangePassword'

import NotFound from './components/NotFound'

import './App.css';

function App() {
    const [user, setUser] = useState(Cookies.get('user') === undefined ? { isLoggedIn: false } : JSON.parse(Cookies.get('user')))
    const [darkMode, setDarkMode] = useState(Cookies.get('darkMode') === undefined ? false : Cookies.get('darkMode') === 'true')

    const theme = createMuiTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light'
        }
    })

    const handleToggleTheme = () => {
        Cookies.set('darkMode', !darkMode)
        setDarkMode(!darkMode)
    }

    useEffect(() => {
        isLoggedIn()
    }, [])

    const isLoggedIn = () => {
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

    const handleLogin = (e) => {
        const { userid, email, memberType, phone, temporaryPassword } = e
        setUser({
            isLoggedIn: true,
            userid,
            email,
            memberType,
            phone,
            temporaryPassword
        })
    }

    const handleLogout = () => {
        setUser({ isLoggedIn: false })
        Cookies.remove('user', { path: '', domain: '.udmlibrary.com' })
    }

    const handlePasswordChange = () => {
        setUser({
            ...user,
            temporaryPassword: false
        })
    }

    if (user.temporaryPassword && user.isLoggedIn) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <div className="App">
                    <Router>
                        <Navbar user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLogout={handleLogout} />
                        <ChangePassword handlePasswordChange={handlePasswordChange} />
                    </Router>
                </div>
            </ThemeProvider>
        )
    }
    else {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <div className="App">
                    <Router>
                        <Routes>
                            <Route path='/' element={<Home user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLogout={handleLogout} />} />
                            <Route path='/login' element={<LoginPage user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLogout={handleLogout} handleLogin={handleLogin} />} />
                            <Route path='/book/:id' element={<Book user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLogout={handleLogout} />} />
                            <Route path='/dashboard' element={<Dashboard user={user} darkMode={darkMode} handleToggleTheme={handleToggleTheme} handleLogout={handleLogout} />}>
                                <Route path='/' element={<MainDashboard user={user} />} />
                                <Route path='/managebooks' element={<ManageBooks user={user} />} />
                                <Route path='/settings' element={<Settings user={user} />} />
                                <Route path='/profile' element={<Profile user={user} handlePasswordChange={handlePasswordChange} />} />
                                <Route path='/managememberships' element={<ManageMembership user={user} />} />
                            </Route>
                            <Route path='/*' element={<NotFound />} />
                        </Routes>
                    </Router>
                </div >
            </ThemeProvider>
        )
    }
}

export default App;
