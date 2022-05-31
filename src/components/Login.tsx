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
import {Alert, Badge, InputAdornment} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import {useState} from "react";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import axios from "axios";

import {LoginApi} from '../Service/UserService';
import {useUserStore} from "../StateManagement/AuthMangement";
import {useNavigate} from "react-router-dom";
import NavigationBar from "../Fragments/NavigationBar";
const theme = createTheme();
const Login = () => {
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const handleMouseDownPassword = () => setShowPassword(!showPassword);

    const [errorFlag, setErrorFlag] = useState(false);
    const [errorMessage, setErrorMessage] = useState("")

    const navigate = useNavigate()

    const setUserAuth = useUserStore(state => state.setUser);

    React.useEffect(() => {
        let getUser: AuthenticationCookie = JSON.parse(localStorage.getItem("AuthenticationCookie") as string);
        getUser =  JSON.parse(localStorage.getItem("AuthenticationCookie") as string)
        if (getUser !== null) {
            if (getUser.token !== null || getUser.token !== '') {
                navigate('/');
            }
        }
    }, [])



    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const email = data.get('email');
        const password = data.get('password');

        if (email === null || password === null) {
            setErrorFlag(true);
            setErrorMessage("Required fields must be filled");
            return;
        }

        if (!((/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test((email.toString().toLowerCase())))){
            setErrorFlag(true)
            setErrorMessage("'Email' field has the wrong format")
            return;
        }

        if (password.toString().length < 6) {
            setErrorFlag(true)
            setErrorMessage("The password must be at least 6 characters in length.")
            return;
        }

        await LoginApi(email.toString(), password.toString())
            .then((response) => {
                if(response.status === 200) {
                    const userId = response.data.userId;
                    const token = response.data.token;
                    const authenticationCookie: AuthenticationCookie = {"userId": userId, "token": token};
                    setUserAuth(authenticationCookie)
                }
                navigate('/')
            }, (error) => {
                setErrorFlag(true);
                setErrorMessage(error.response.statusText);

            })
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
                        Log in
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
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
                            Log in
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="/register" variant="body2">
                                    New to Auction365? Register Here
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}
export default Login;