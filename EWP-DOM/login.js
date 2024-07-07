import {client} from "./supabaseClient.js";

/* Get the forms, input fields, and sections */
// Login
const loginForm = document.querySelector('#login-form');
const showLogin = document.querySelector('#show-login');
const loginSection = document.querySelector('#login-section-box');
const loginEmailInput = document.querySelector('#login-email');
const loginPasswordInput = document.querySelector('#login-password');
// Sign Up
const signupForm = document.querySelector('#signup-form');
const showSignup = document.querySelector('#show-signup');
const signupSection = document.querySelector('#signup-section-box');
const signupUsernameInput = document.querySelector('#signup-username');
const signupEmailInput = document.querySelector('#signup-email');
const signupPasswordInput = document.querySelector('#signup-password');
const signupConfirmPasswordInput = document.querySelector('#signup-confirm-password');

// Add event listeners to the forms
loginForm.addEventListener('submit', validateLogin);
signupForm.addEventListener('submit', validateSignup);

// Add event listeners for hiding and showing the login and signup sections
showSignup.addEventListener("click", function(event) {
    event.preventDefault();
    signupSection.hidden = false;
    loginSection.hidden = true;
});
showLogin.addEventListener("click", function(event) {
    event.preventDefault();
    loginSection.hidden = false;
    signupSection.hidden = true;
});

// Validates an email address and returns true if it's valid, false otherwise
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

// Validate login form
async function validateLogin(event) {
    event.preventDefault();
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value.trim();

    if (email === '' || password === '') {
        alert('Please fill in both email and password');
        return;
    }

    // Send request to login API endpoint (let Supabase do the validation)
    try {
        let { data, error } = await client.supabase.auth.signInWithPassword({
            email: email,
            password: password
        })
      
        if (error) {
            // If there's an error, log it to the console and alert the user
            console.error('Error signing in:', error.message)
            alert(`Error signing in: ${error.message}`)
        } else {
            // If the signin is successful, redirect to index, and log a success message to the console
            console.log('Signin successful!')
            window.location.replace('../web/main.html');
        }
    } catch (error) {
        // Catch any unexpected errors and log them to the console
        console.error('Unexpected error:', error.message)
        alert(`An unexpected error occurred: ${error.message}`)
    }
}

// Validate signup form
async function validateSignup(event) {
    event.preventDefault();
    const username = signupUsernameInput.value.trim();
    const email = signupEmailInput.value.trim();
    const password = signupPasswordInput.value.trim();
    const confirmPassword = signupConfirmPasswordInput.value.trim();

    if (username === '' || email === '' || password === '' || confirmPassword === '') {
        alert('Please fill in all fields');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    if (!validateEmail(email)) {
        alert('Email invalid');
        return;
    }

    /* Send request to signup API endpoint */
    try {
        // Send request
        let { data, error } = await client.supabase.auth.signUp({
            email: email,
            password: password
        })
      
        /* Error Handling */
        if (error) {
            // If there's an error, log it to the console and alert the user
            console.error('Error signing up:', error.message)
            alert(`Error signing up: ${error.message}`)
        } else {
            // If the signup is successful, create an 'employees' record, redirect to index, and log a success message to the console
            client.create('employees', {
                name: username,
                contact_info: email
            });
            console.log('Signup successful!')
        }
    } catch (error) {
        // Catch any unexpected errors and log them to the console
        console.error('Unexpected error:', error.message)
        alert(`An unexpected error occurred: ${error.message}`)
    }
}