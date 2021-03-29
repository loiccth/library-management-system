import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import i18n from '../../translations/i18n'
import axios from 'axios'
import url from '../../settings/api'
import {
    AppBar,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Toolbar
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import Brightness3Icon from '@material-ui/icons/Brightness3'
import BrightnessHighIcon from '@material-ui/icons/BrightnessHigh'
import HomeIcon from '@material-ui/icons/Home'
import InfoIcon from '@material-ui/icons/Info'
import TranslateIcon from '@material-ui/icons/Translate'
import logo from '../../img/logo.png'
import whitelogo from '../../img/logo_white.png'

const Navbar = (props) => {
    const classes = useStyles()
    const [anchorEl, setAnchorEl] = useState(null)
    const [anchorE2, setAnchorE2] = useState(null)
    const { t } = useTranslation()

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleLanguage = (event) => {
        setAnchorE2(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleCloseLanguage = () => {
        setAnchorE2(null)
    }

    const handleMenuItemClick = (lang) => {
        let temp = ''
        if (lang === 'en')
            temp = 'enUS'
        else if (lang === 'fr')
            temp = 'frFR'
        else if (lang === 'zh')
            temp = 'zhCN'
        else if (lang === 'ar')
            temp = 'arEG'

        setAnchorE2(null)
        i18n.changeLanguage(lang)
        props.handleLocale(temp)
    }

    const handleLogout = () => {
        axios.get(`${url}/users/logout`, { withCredentials: true })
            .then(result => {
                props.handleLogout(result.data.message)
            })
    }

    return (
        <React.Fragment>
            <AppBar position="fixed" className={classes.appBar}>
                <Toolbar>
                    <div className={classes.title}>
                        <Link to='/'>
                            <img src={props.darkMode ? whitelogo : logo} alt="udmlogo" style={{ maxHeight: '50px', maxWidth: 'auto' }} />
                            <img src={props.darkMode ? logo : whitelogo} alt="udmlogo" style={{ display: 'none' }} />
                        </Link>
                    </div>
                    {props.darkMode ?
                        <IconButton
                            aria-haspopup="false"
                            color="inherit"
                            onClick={() => props.handleToggleTheme()}
                        >
                            <BrightnessHighIcon />
                        </IconButton>
                        :
                        <IconButton
                            aria-haspopup="false"
                            color="inherit"
                            onClick={() => props.handleToggleTheme()}
                        >
                            <Brightness3Icon />
                        </IconButton>
                    }
                    <IconButton
                        aria-label="change language"
                        aria-controls="menu-language"
                        aria-haspopup="true"
                        onClick={handleLanguage}
                        color="inherit"
                    >
                        <TranslateIcon />
                    </IconButton>
                    <Menu
                        id="menu-language"
                        anchorEl={anchorE2}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorE2)}
                        onClose={handleCloseLanguage}
                    >
                        <MenuItem
                            onClick={(() => handleMenuItemClick('en'))}
                        >
                            English
                            </MenuItem>
                        <MenuItem
                            onClick={(() => handleMenuItemClick('fr'))}
                        >
                            Français
                        </MenuItem>
                        <MenuItem
                            onClick={(() => handleMenuItemClick('zh'))}
                        >
                            中文
                        </MenuItem>
                        <MenuItem
                            onClick={(() => handleMenuItemClick('ar'))}
                        >
                            عربي
                        </MenuItem>
                    </Menu>
                    <IconButton
                        aria-haspopup="false"
                        color="inherit"
                        component={Link}
                        to="/info"
                    >
                        <InfoIcon />
                    </IconButton>
                    <IconButton
                        aria-haspopup="false"
                        color="inherit"
                        component={Link}
                        to="/"
                    >
                        <HomeIcon />
                    </IconButton>
                    {props.user.isLoggedIn ?
                        <div>
                            <IconButton
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleMenu}
                                color="inherit"
                            >
                                <AccountCircleIcon />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem component={Link} to="/dashboard" color="inherit">{t('dashboard')}</MenuItem>
                                <MenuItem color="inherit" onClick={handleLogout}>{t('logout')}</MenuItem>
                            </Menu>
                        </div> :
                        <Button component={Link} to="/login" color="inherit">{t('login')}</Button>
                    }
                </Toolbar>
            </AppBar>
            <Toolbar />
        </React.Fragment>
    )
}

const useStyles = makeStyles(theme => ({
    appBar: {
        backgroundColor: theme.palette.custom.main,
        color: theme.palette.custom.contrastText
    },
    title: {
        flexGrow: 1
    }
}))

Navbar.propTypes = {
    user: PropTypes.object.isRequired,
    darkMode: PropTypes.bool.isRequired,
    handleToggleTheme: PropTypes.func.isRequired,
    handleLocale: PropTypes.func.isRequired,
    handleLogout: PropTypes.func.isRequired,
}

export default Navbar
