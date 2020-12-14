import React, { useState } from 'react'
import { Link, Outlet, Navigate } from 'react-router-dom';
import url from '../../settings/api'
import axios from 'axios'
import PropTypes from 'prop-types'
import AppBar from '@material-ui/core/AppBar'
import Drawer from '@material-ui/core/Drawer'
import Hidden from '@material-ui/core/Hidden'
import IconButton from '@material-ui/core/IconButton'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import MenuIcon from '@material-ui/icons/Menu'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import HomeIcon from '@material-ui/icons/Home'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import logo from '../../img/logo.png'

const drawerWidth = 240

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex"
    },
    drawer: {
        [theme.breakpoints.up("sm")]: {
            width: drawerWidth,
            flexShrink: 0
        }
    },
    appBar: {
        [theme.breakpoints.up("sm")]: {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: drawerWidth
        }
    },
    menuButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.up("sm")]: {
            display: "none"
        }
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: drawerWidth
    },
    content: {
        flexGrow: 1,
        paddingTop: theme.spacing(3),
        overflowX: 'auto'
    },

    title: {
        flexGrow: 1
    }
}))


const Dashboard = (props) => {
    const { window } = props
    const classes = useStyles()
    const theme = useTheme()
    const [mobileOpen, setMobileOpen] = React.useState(false)

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

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
            sidebarMenu: 'Profile',
            link: '/dashboard/profile'
        },
        {
            sidebarMenu: 'Book Reports',
            link: '/dashboard/bookreports',
            permission: 'Librarian'
        },
        {
            sidebarMenu: 'Member Reports',
            link: '/dashboard/memberreports',
            permission: 'Admin'
        },
        {
            sidebarMenu: 'Payment Reports',
            link: '/dashboard/paymentreports',
            permission: 'Librarian'
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
                        else return null
                    })}
                </List>
                {/* <Divider /> */}
            </div>
        )

        const container =
            window !== undefined ? () => window().document.body : undefined;

        return (
            <div className={classes.root}>
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
                                <img src={logo} alt="udmlogo" style={{ maxHeight: '50px', maxWidth: 'auto' }} />
                            </Link>
                        </div>
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
                    <Hidden smUp implementation="css">
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
                    <Hidden xsDown implementation="css">
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

Dashboard.propTypes = {
    window: PropTypes.func
}

export default Dashboard