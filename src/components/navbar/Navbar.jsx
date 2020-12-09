import React from 'react'
import axios from 'axios'
import url from '../../settings/api'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import HomeIcon from '@material-ui/icons/Home'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import IconButton from '@material-ui/core/IconButton'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import logo from '../../img/logo.png'

const Navbar = (props) => {
    const classes = useStyles()
    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    const handleLogout = () => {
        axios.get(`${url}/users/logout`, { withCredentials: true })
            .then(() => {
                props.handleLogout()
            })
    }

    return (
        <React.Fragment>
            <AppBar position="fixed">
                <Toolbar>
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
                    {props.user.isLoggedIn ?
                        <div>
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
                        </div> :
                        <Button component={Link} to="/login" color="inherit">Login</Button>
                    }
                </Toolbar>
            </AppBar>
            <Toolbar />
        </React.Fragment>
    );
}

const useStyles = makeStyles(() => ({
    title: {
        flexGrow: 1
    }
}))

Navbar.propTypes = {
    window: PropTypes.func
};

export default Navbar;
