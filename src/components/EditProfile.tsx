import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {Alert, ButtonBase, InputAdornment} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import {useState} from "react";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {
    getUserByIdApi,
    getProfilePictureId,
    DeleteProfileImageApi, LogOutApi, UploadPictureApi, patchUserInformationApi
} from '../Service/UserService';
import {useUserStore} from "../StateManagement/AuthMangement";
import {useNavigate} from "react-router-dom";
import NavigationBar from "../Fragments/NavigationBar";
import navigationBar from "../Fragments/NavigationBar";
import Toolbar from "@mui/material/Toolbar";
import StoreIcon from "@mui/icons-material/Store";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import AppBar from "@mui/material/AppBar";


const theme = createTheme();
const mimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif']

const EditProfile = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordNew, setShowPasswordNew] = useState(false);

    const [imageSource, setImageSource] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [originalPicture, setOriginalPicture] = useState('');

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")


    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const handleMouseDownPassword = () => setShowPassword(!showPassword);

    const handleClickShowPasswordNew = () => setShowPasswordNew(!showPasswordNew);
    const handleMouseDownPasswordNew = () => setShowPasswordNew(!showPasswordNew);

    const [errorFlag, setErrorFlag] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate()

    const [anchorElUserEdit, setAnchorElUserEdit] = React.useState<null | HTMLElement>(null);

    const handleOpenUserMenuEdit = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUserEdit(event.currentTarget);
    };


    const handleCloseUserMenuEdit = async (navigateToPage: string) => {
        let getUser: AuthenticationCookie;
        getUser = JSON.parse(localStorage.getItem("AuthenticationCookie") as string)
        setAnchorElUserEdit(null);
        if (navigateToPage === "Home") { navigate('/') }
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

    React.useEffect(() => {
        let getUser: AuthenticationCookie;
        getUser = JSON.parse(localStorage.getItem("AuthenticationCookie") as string)

        if (getUser === null) {
            navigate('/');
            return;
        } else {
            if (getUser.token === null || getUser.token === '') {
                navigate('/auctions');
                return;
            }
        }
        getUserByIdApi(getUser.userId, getUser.token)
            .then((response) => {
                setFirstName(response.data.firstName)
                setLastName(response.data.lastName)
                setEmail(response.data.email)
            }, (error) => {
            })

        getProfilePictureId(getUser.userId)
            .then((response) => {
                const userImage = "http://localhost:4941/api/v1/users/" + getUser.userId +"/image"
                setOriginalPicture(userImage)
                setImageSource(userImage)
            }, (error) => {

            })

    }, [])


    const updateDisplayPicture = async (event: any) => {
        const uploadPicture = event.target.files[0]
        setProfilePicture(uploadPicture)
        if (uploadPicture === undefined) {
            setImageSource(originalPicture);
            return;
        }
        if (!mimeTypes.includes(uploadPicture.type)) {
            setImageSource(originalPicture);
            return;
        }
        const imageSource = URL.createObjectURL(uploadPicture)
        setImageSource(imageSource)
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const firstName = data.get('firstName');
        const lastName = data.get('lastName');
        const newPassword = data.get('newPassword')
        const email = data.get('email');
        const password = data.get('currentPassword');

        if (firstName === null || lastName === null || email === null || password === null || newPassword === null) {
            setErrorFlag(true);
            setErrorMessage("Required fields must be filled");
            return;
        }
        if (!((/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test((email.toString().toLowerCase())))){
            setErrorFlag(true)
            setErrorMessage("'Email' field has the wrong format")
            return;
        }
        if (/^\s+$/ .test(firstName.toString())) {
            setErrorFlag(true)
            setErrorMessage("'First Name' field can't must not contain a white space")
            return;
        }
        if (/^\s+$/ .test(lastName.toString())) {
            setErrorFlag(true)
            setErrorMessage("'Last Name' field can't must not contain a white space")
            return;
        }
        if (password !== "" ) {
            if (newPassword === "") {
                setErrorFlag(true)
                setErrorMessage("Please provide both current and new passwords")
                return;
            }
        }
        if (newPassword !== "") {
            if (password === "") {
                setErrorFlag(true)
                setErrorMessage("Please provide both current and new passwords")
                return;
            }
        }
        if ((password.toString().length < 6  && password.toString().length > 0) || (newPassword.toString().length < 6  && newPassword.toString().length > 0)) {
            setErrorFlag(true)
            setErrorMessage("The password must be at least 6 characters in length.")
            return;
        }

        let getUser: AuthenticationCookie;
        getUser = JSON.parse(localStorage.getItem("AuthenticationCookie") as string)

        if (profilePicture !== null && profilePicture !== undefined) {
            UploadPictureApi(getUser.userId, profilePicture, getUser.token)
                .then((response) => {
                    alert("Changes Successful!")
                    navigate('/account')
                })
                .catch((error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.response.statusText)
                })
        }
        let use = false;
        let userInfo = {"firstName":firstName.toString(), "lastName": lastName.toString(), "email": email.toString()};
        let userInfoWithPassword;

        if(password.toString().length > 0 && newPassword.toString().length > 0) {
            userInfoWithPassword = {
                "firstName": firstName.toString(),
                "lastName": lastName.toString(),
                "email": email.toString(),
                "password": newPassword.toString(),
                "currentPassword": password.toString()
            };
            use = true;
        }
        if (use) {
            await patchUserInformationApi(userInfoWithPassword, getUser.userId, getUser.token)
                .then((response) => {
                    navigate('/account')

                }, (error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.response.statusText);
                })
        } else {
            await patchUserInformationApi(userInfo, getUser.userId, getUser.token)
                .then((response) => {
                    navigate('/account')

                }, (error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.response.statusText);
                })
        }
    };

    const deleteImage = async () => {
        let getUser: AuthenticationCookie;
        getUser = JSON.parse(localStorage.getItem("AuthenticationCookie") as string)
        if (originalPicture.length > 0) {
            await DeleteProfileImageApi(getUser.userId, getUser.token)
                .then((response) => {
                    setImageSource("")
                    setOriginalPicture("")
                    setErrorFlag(true)
                    setErrorMessage("Image has been deleted")

                }, (error) => {
                    setErrorFlag(true);
                    setErrorMessage(error.response.statusText);
                })
        } else {
            setErrorFlag(true)
            setErrorMessage("Profile does not have a photo to remove")
        }
    }

    const navigateToAccountPage = () => {
        navigate("/account")
    }
    return (
            <ThemeProvider theme={theme}>

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
                                    <IconButton onClick={handleOpenUserMenuEdit} sx={{ p: 0 }}>
                                        {profilePicture===""?<Avatar />:<Avatar src={originalPicture} />}

                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    id="menu-appbar"
                                    anchorEl={anchorElUserEdit}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElUserEdit)}
                                    onClose={handleCloseUserMenuEdit}
                                >
                                    {['Home', 'Account', 'My Auction Page', 'Logout'].map((setting) => (
                                        <MenuItem key={setting} onClick={async () => await handleCloseUserMenuEdit(setting)}>
                                            <Typography textAlign="center">{setting}</Typography>
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </Box>
                        </Toolbar>
                    </Container>
                </AppBar>


                <Container component="main" maxWidth="xs" style={{paddingBottom:50}}>
                    <CssBaseline />
                    <Box
                        sx={{
                        marginTop: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        {errorFlag ? <Alert onClose={() => {setErrorFlag(false)}} severity={'error'}>  {errorMessage}</Alert> : <></>}
                        <Typography component="h1" variant="h4" sx ={{paddingTop: 2, paddingBottom: 2}}>
                            Edit Page
                        </Typography>
                        <Grid >
                            <label htmlFor="contained-button-file">
                                <Avatar sx={{ m: 2, bgcolor: 'grey', height: 150, width: 150}} alt={""} src={imageSource} />
                            </label>
                            <input
                                accept=".jpg,.jpeg,.png,.gif"
                                id='fileInput'
                                multiple
                                type="file"
                                onChange={async (event) => await updateDisplayPicture(event)}
                            />
                        </Grid>


                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                            <Grid container spacing={2}>
                                <Grid container justifyContent={'center'} paddingTop={1}>
                                <Button
                                    variant="contained"
                                    color={"error"}
                                    onClick={async () => await deleteImage()}
                                > Delete Profile Photo </Button>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        autoComplete="given-name"
                                        name="firstName"
                                        fullWidth
                                        id="firstName"
                                        label="Edit First Name"
                                        value={firstName}
                                        onChange={(e)=> setFirstName(e.target.value)}

                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        id="lastName"
                                        label="Edit Last Name"
                                        name="lastName"
                                        autoComplete="family-name"
                                        value={lastName}
                                        onChange={(e)=> setLastName(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        type="email"
                                        id="email"
                                        label="Edit Email Address"
                                        name="email"
                                        value={email}
                                        onChange={(e)=> setEmail(e.target.value)}
                                        autoComplete="email"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="currentPassword"
                                        label="Current Password"
                                        type={showPassword ? "text" : "password"}
                                        id="currentPassword"
                                        autoComplete="new-password"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                                >
                                                {showPassword ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="newPassword"
                                        label="New Password"
                                        type={showPasswordNew ? "text" : "password"}
                                        id="newPassword"
                                        autoComplete="new-password"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowPasswordNew}
                                                        onMouseDown={handleMouseDownPasswordNew}
                                                    >
                                                        {showPasswordNew ? <Visibility /> : <VisibilityOff />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Grid>

                            </Grid>
                            <Button
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                type={"submit"}
                            >
                                Submit Changes
                            </Button>
                            <Button
                                fullWidth
                                variant="contained"
                                color={"error"}
                                onClick={() => navigateToAccountPage()}
                            >
                                Cancel
                            </Button>

                        </Box>
                    </Box>
                </Container>
            </ThemeProvider>
    );
}
export default EditProfile;