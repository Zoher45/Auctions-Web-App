import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import StoreIcon from '@mui/icons-material/Store';
import MenuIcon from '@mui/icons-material/Menu';
import {useUserStore} from "../StateManagement/AuthMangement";
import {useNavigate} from "react-router-dom";
import {getProfilePictureId, LogOutApi} from "../Service/UserService";
import {ButtonBase} from "@mui/material";


const NavigationBar = () => {
        const [settings, setSettings] = React.useState(['Home', 'Register', 'Login']);
        const [profilePicture, setProfilePicture] = React.useState("")
        const navigate = useNavigate()
        let getUser: AuthenticationCookie = JSON.parse(localStorage.getItem("AuthenticationCookie") as string);

        React.useEffect(() => {
            getUser =  JSON.parse(localStorage.getItem("AuthenticationCookie") as string)
            if (getUser !== null) {
                if (getUser.token !== '') {
                    setSettings(['Home', 'Account', 'My Auction Page', 'Logout'])
                    getProfilePictureId(getUser.userId)
                        .then((response) => {
                            const userImage = "http://localhost:4941/api/v1/users/" + getUser.userId +"/image"
                            setProfilePicture(userImage)
                        }, (error) => {
                        })
                }
            }

        }, [])

        const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

        const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
            setAnchorElUser(event.currentTarget);
        };


        const handleCloseUserMenu = async (navigateToPage: string) => {
            setAnchorElUser(null);
            if (navigateToPage === "Home") { navigate('/') }
            if (navigateToPage === "Register") { navigate('/register') }
            if (navigateToPage === "Login") { navigate('/Login') }
            if (navigateToPage === "Account") {navigate('/account')}
            if (navigateToPage === "My Auction Page") {navigate('/myAuction')}
            if(navigateToPage === "Logout") {
                await LogOutApi(getUser.token)
                    .then((response) => {
                        localStorage.clear();
                        navigate('/login')
                    }, (error) => {
                    })
            }
        };

        return (
            <AppBar position="static">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <ButtonBase onClick={() => navigate('/')}>
                            <StoreIcon fontSize={"large"} sx={{ display: { xs: 'none', md: 'flex'}, mr: 1 }} />
                            <Typography
                                variant="h6"
                                noWrap
                                sx={{
                                    mr: 2,
                                    display: { xs: 'none', md: 'flex' },
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    letterSpacing: '.3rem',
                                    color: 'inherit',
                                    textDecoration: 'none',
                                }}
                            >
                                Auction365
                            </Typography>
                        </ButtonBase>


                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>

                        </Box>

                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="Open Menu">
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    {profilePicture===""?<Avatar />:<Avatar src={profilePicture} />}

                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                {settings.map((setting) => (
                                    <MenuItem key={setting} onClick={async () => await handleCloseUserMenu(setting)}>
                                        <Typography textAlign="center">{setting}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        );

}

export default NavigationBar;