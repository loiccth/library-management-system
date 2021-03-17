import React, { useState } from 'react'
import { Link, Outlet, Navigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import axios from 'axios'
import url from '../../settings/api'
import {
    AppBar,
    Drawer,
    Hidden,
    IconButton,
    List,
    ListItem,
    ListItemText,
    makeStyles,
    Menu,
    MenuItem,
    Toolbar,
    useTheme
} from '@material-ui/core'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import Brightness3Icon from '@material-ui/icons/Brightness3'
import BrightnessHighIcon from '@material-ui/icons/BrightnessHigh'
import HomeIcon from '@material-ui/icons/Home'
import MenuIcon from '@material-ui/icons/Menu'
import InfoIcon from '@material-ui/icons/Info'
import logo from '../../img/logo.png'
import whitelogo from '../../img/logo_white.png'

const drawerWidth = 240

const Dashboard = (props) => {
    const { window } = props
    const classes = useStyles()
    const theme = useTheme()
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    const [anchorEl, setAnchorEl] = useState(null)
    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const open = Boolean(anchorEl)

    const [sidebar] = useState([
        {
            sidebarMenu: 'Dashboard',
            link: '/dashboard'
        },
        {
            sidebarMenu: 'Manage Books',
            link: '/dashboard/managebooks',
            permission: 'Librarian'
        },
        {
            sidebarMenu: 'Settings',
            link: '/dashboard/settings',
            permission: 'Librarian'
        },
        {
            sidebarMenu: 'Manage Memberships',
            link: '/dashboard/managememberships',
            permission: 'Admin'
        },
        {
            sidebarMenu: 'Reports',
            link: '/dashboard/reports',
            permission: 'Librarian'
        },
        {
            sidebarMenu: 'Reports',
            link: '/dashboard/reports',
            permission: 'Admin'
        },
        {
            sidebarMenu: 'My Books',
            link: '/dashboard/mybooks',
            permission: 'staff'
        },
        {
            sidebarMenu: 'Profile',
            link: '/dashboard/profile'
        }
    ])

    const handleLogout = () => {
        axios.get(`${url}/users/logout`, { withCredentials: true })
            .then(() => {
                props.handleLogout()
            })
    }

    if (!props.user.isLoggedIn) {
        return <Navigate to='/login' />
    }
    else {
        const drawer = (
            <div>
                <List>
                    {sidebar.map(item => {
                        if (item.permission === props.user.memberType || item.permission === undefined)
                            return (
                                <ListItem button key={item.sidebarMenu} component={Link} to={item.link}>
                                    <ListItemText primary={item.sidebarMenu} />
                                </ListItem>
                            )
                        else if (item.permission === 'staff' && (props.user.memberType === 'Librarian' || props.user.memberType === 'Admin'))
                            return (
                                <ListItem button key={item.sidebarMenu} component={Link} to={item.link}>
                                    <ListItemText primary={item.sidebarMenu} />
                                </ListItem>
                            )
                        else return null
                    })}
                </List>
            </div>
        )

        const container =
            window !== undefined ? () => window().document.body : undefined

        return (
            <div>
                <AppBar position="fixed" className={classes.appBar}>
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            className={classes.menuButton}
                        >
                            <MenuIcon />
                        </IconButton>
                        <div className={classes.title}>
                            <Link to='/'>
                                <img src={props.darkMode ? whitelogo : logo} alt="udmlogo" style={{ maxHeight: '50px', maxWidth: 'auto' }} />
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
                        <IconButton aria-label="account of current user"
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
                            open={open}
                            onClose={handleClose}
                        >
                            <MenuItem component={Link} to="/dashboard" color="inherit">Dashboard</MenuItem>
                            <MenuItem color="inherit" onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>
                <nav className={classes.drawer} aria-label="mailbox folders">
                    <Hidden lgUp implementation="css">
                        <Drawer
                            container={container}
                            variant="temporary"
                            anchor={theme.direction === "rtl" ? "right" : "left"}
                            open={mobileOpen}
                            onClose={handleDrawerToggle}
                            classes={{
                                paper: classes.drawerPaper
                            }}
                            ModalProps={{
                                keepMounted: true
                            }}
                        >
                            {drawer}
                        </Drawer>
                    </Hidden>
                    <Hidden lgDown implementation="css">
                        <Drawer
                            classes={{
                                paper: classes.drawerPaper
                            }}
                            variant="permanent"
                            open
                        >
                            {drawer}
                        </Drawer>
                    </Hidden>
                </nav>
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    <Outlet />
                </main>
            </div>
        )
    }
}

const useStyles = makeStyles(theme => ({
    drawer: {
        [theme.breakpoints.up("lg")]: {
            width: drawerWidth,
            flexShrink: 0
        }
    },
    appBar: {
        [theme.breakpoints.up("lg")]: {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth
        }
    },
    menuButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.up("lg")]: {
            display: "none"
        }
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: drawerWidth
    },
    content: {
        [theme.breakpoints.up("lg")]: {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`
        }
    },

    title: {
        flexGrow: 1
    }
}))

Dashboard.propTypes = {
    window: PropTypes.func,
    user: PropTypes.object.isRequired,
    darkMode: PropTypes.bool.isRequired,
    handleToggleTheme: PropTypes.func.isRequired,
    handleLogout: PropTypes.func.isRequired
}

export default Dashboard