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
import {Alert, InputAdornment} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import {useState} from "react";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {RegisterApi, LoginApi, UploadPictureApi} from '../Service/UserService';
import {useUserStore} from "../StateManagement/AuthMangement";
import {useNavigate} from "react-router-dom";
import NavigationBar from "../Fragments/NavigationBar";


const theme = createTheme();
const mimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif']

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);

    const [imageSource, setImageSource] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);

    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const handleMouseDownPassword = () => setShowPassword(!showPassword);

    const [errorFlag, setErrorFlag] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const setUserAuth = useUserStore(state => state.setUser);

    const navigate = useNavigate()

    React.useEffect(() => {
        let getUser: AuthenticationCookie;
        getUser =  JSON.parse(localStorage.getItem("AuthenticationCookie") as string)

        if (getUser !== null) {
            if (getUser.token !== null || getUser.token !== '') {
                navigate('/');
            }
        }
    }, [])


    const updateDisplayPicture = async (event: any) => {
        const uploadPicture = event.target.files[0]
        setProfilePicture(uploadPicture)
        if (uploadPicture === undefined) {
            setImageSource("");
            return;
        }
        if (!mimeTypes.includes(uploadPicture.type)) {
            setImageSource("");
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
        const email = data.get('email');
        const password = data.get('password');
        let registerSuccess = false;

        if (firstName === null || lastName === null || email === null || password === null) {
            setErrorFlag(true);
            setErrorMessage("Required fields must be filled");
            return;
        }
        if (!((/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test((email.toString().toLowerCase())))){
            setErrorFlag(true)
            setErrorMessage("'Email' field has the wrong format")
            return;
        }
        if (/^\s+$/.test(firstName.toString())) {
            setErrorFlag(true)
            setErrorMessage("'First Name' field can't must not contain a white space")
            return;
        }
        if (/^\s+$/.test(lastName.toString())) {
            setErrorFlag(true)
            setErrorMessage("'Last Name' field can't must not contain a white space")
            return;
        }

        if (password.toString().length < 6) {
            setErrorFlag(true)
            setErrorMessage("The password must be at least 6 characters in length.")
            return;
        }

        await RegisterApi(firstName.toString(), lastName.toString(), email.toString(), password.toString())
            .then((response) => {
                if (response.status === 201) {
                    registerSuccess = true;
                } else {
                    setErrorFlag(true);
                    setErrorMessage(response.statusText);
                }

            }, (error) => {
                setErrorFlag(true);
                setErrorMessage(error.response.statusText);
            })

        if (registerSuccess) {
            await LoginApi(email.toString(), password.toString())
                .then((response) => {
                    if (response.status === 200) {
                        const userId = response.data.userId;
                        const token = response.data.token;
                        const authenticationCookie: AuthenticationCookie = {"userId": userId, "token": token};
                        setUserAuth(authenticationCookie)
                        if (profilePicture !== null && profilePicture !== undefined) {
                            UploadPictureApi(userId, profilePicture, token)
                                .then((response) => {
                                    return response.status;
                                })
                                .catch((error) => {
                                    return error.response.status;
                                })
                        }
                        navigate('/')
                    } else {
                        setErrorFlag(true);
                        setErrorMessage(response.statusText);
                    }
                }, (error) => {
                    setErrorFlag(true);
                setErrorMessage(error.response.statusText);
            })
        }
    };


    return (
        <ThemeProvider theme={theme}>
            <NavigationBar/>
            <Container component="main" maxWidth="xs">
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
                        Register
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
                            <Grid item xs={12}>
                                <TextField
                                    autoComplete="given-name"
                                    name="firstName"
                                    fullWidth
                                    id="firstName"
                                    label="First Name"
                                    autoFocus
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="lastName"
                                    label="Last Name"
                                    name="lastName"
                                    autoComplete="family-name"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    type="email"
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    id="password"
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
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign Up
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="/login" variant="body2">
                                    Already have an account? Sign in
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}
export default Register;