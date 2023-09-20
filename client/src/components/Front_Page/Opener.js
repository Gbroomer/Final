import { useHistory } from 'react-router-dom';
import React, { useState, useContext } from 'react'
import { MyContext } from "../Context"
import * as yup from "yup"
import { useFormik } from 'formik'


function Opener() {
    const history = useHistory()
    const { login,} = useContext(MyContext)
    const [signUp, setSignUp] = useState(false)
    const [loggingIn, setLoggingIn] = useState(false)

    const formSchema = yup.object().shape({
        username: yup.string().required("Username is required").max(100),
        password: yup.string().required("Password is required").max(100),
    })

    const formik = useFormik({
        initialValues: {
            username: "",
            password: "",
        },
        validationSchema: formSchema,
        onSubmit: async (values) => {
            const response = await fetch("http://127.0.0.1:5555/users")
            const users = await response.json()
            console.log(users)
            const userNameExists = users.find(
                (user) => user.username.toLowerCase() === values.username.toLowerCase()
            )
            //Logging in with an existing Save
            if (loggingIn) {
                if (userNameExists) {
                    if (userNameExists.password === values.password) {
                        const response = await fetch(`http://127.0.0.1:5555/users/${userNameExists.id}`)
                        const user = await response.json()
                        console.log(user)
                        login(user)
                        // Change Page to Main Page
                        history.push("/Main")
                    }
                    else {
                        alert('Incorrect Password')
                    }
                }
                else {
                    alert("Incorrect Username")
                }
            }
            //Creating Account
            else {
                if (userNameExists) {
                    alert('A User with that username already exists')
                }
                else {
                    const user = {
                        "password": values.password,
                        "username": values.username,
                    }
                    login(user)
                    console.log(user)
                    history.push("/characters")
                }
            }
        }
    })

    return (
        <div className='rpg-box rpg-nav'>
            {signUp ? (
                <div>
                    <form onSubmit={formik.handleSubmit}>
                        <label className='rpg-c-accent'>Username</label>
                        <input className = 'rpg-textbox' type="text" placeholder='Username' name='username' onChange={formik.handleChange} value={formik.values.username}></input>
                        <p className = 'rpg-c-dark'>{formik.errors.username}</p>
                        <label className='rpg-c-accent'>Password</label>
                        <input className = 'rpg-textbox' type="password" placeholder='Password' name='password' onChange={formik.handleChange} value={formik.values.password}></input>
                        <p className = 'rpg-c-dark'>{formik.errors.password}</p>
                        <button className = 'rpg-button' type='submit'>Submit</button>
                    </form>
                </div>
            ) : (
                <>
                    <ul>
                        <button className='rpg-nav-item rpg-button' onClick={() => {setSignUp(true)}}>New Game</button>
                        <button className='rpg-nav-item rpg-button' onClick={() => {
                            setSignUp(true)
                            setLoggingIn(true)
                            } }>Load Save</button>
                    </ul>
                </>
            )}
        </div>
    )
}

export default Opener