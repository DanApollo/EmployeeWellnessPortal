import { supabaseClient } from "./config/supabaseClient.js"

// Get references to login form elements
const loginContainer = document.getElementById("loginContainer")
const loginForm = document.getElementById("loginForm")
const loginEmailInput = document.getElementById("loginEmail")
const loginPasswordInput = document.getElementById("loginPassword")

// Get references to sign up form elements
const signupContainer = document.getElementById("signupContainer")
const signupForm = document.getElementById("signupForm")
const signupFirstNameInput = document.getElementById("signupFirstName")
const signupLastNameInput = document.getElementById("signupLastName")
const signupDepartmentInput = document.getElementById("signupDepartment")
const signupEmailInput = document.getElementById("signupEmail")
const signupPasswordInput = document.getElementById("signupPassword")

const errorDiv = document.getElementById("error")
const loginToggle = document.querySelectorAll(".change-login")

loginToggle.forEach((item) => {
    // Toggles the login and sign up containers
    item.addEventListener("click", () => {
        let current = loginContainer
        current.style.display = "none"
        current = (current === loginContainer) ? signupContainer : loginContainer
        current.style.display = "block"
    })
})

supabaseClient.supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
        // User is logged in, redirect to the dashboard
        window.location.href = "/dashboard/dashboard.html";
    }
});

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    try {
        const response = await supabaseClient.signIn(
            email,
            password
        );
        if (response.ok) {
            window.location.href = "/dashboard/dashboard.html"
        } else {
            errorDiv.textContent = response.error.message;
        }
    } catch (error) {
        console.error("Unexpected login error:", error);
    }
});

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    const firstName = signupFirstNameInput.value;
    const lastName = signupLastNameInput.value;
    const department = signupDepartmentInput.value;
    const email = signupEmailInput.value;
    const password = signupPasswordInput.value;

    try {
        const response = await supabaseClient.signUp(
            email,
            password
        );

        if (response.ok) {
            const responseUser = await supabaseClient.create("employees", {
                first_name: firstName,
                last_name: lastName,
                department: department
            })
            if (responseUser.ok) {
                window.location.href = "/dashboard/dashboard.html"
            } else {
                throw responseUser.error
            }
        } else {
            throw response.error
        }
    } catch (error) {
        console.error("Unexpected signup error:", error);
        errorDiv.textContent = "An unexpected error occurred.";
    }
});
