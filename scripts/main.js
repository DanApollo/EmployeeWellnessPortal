// Import component creators from components.js file
import { 
    CreateHomePageComponent,
    CreateComponentFromTemplate,
    AddRowToTable
} from './components.js';
  
// Import Supabase client from supabaseClient.js file
import { client } from "./supabaseClient.js";

/* Get references to HTML elements */
const mainContent = document.querySelector('#main-content'); // Main content section
const workoutLogs = document.querySelector('#workout-logs'); // Workout logs button
const homePage = document.querySelector('#home'); // Home page button
const logoPic = document.querySelector('#logo'); // Logo Picture
const nutritionLogs = document.querySelector('#nutrition-logs'); // Nutrition logs button
const aboutPage = document.querySelector('#about'); // About page button
const contactPage = document.querySelector('#contact'); // Contact page button
/* Useful Variables */
let loggedInEmployee; // Current Logged in employee
let loggedInEmployeeName; // Current Logged in employee's name
let loggedInUser; // Current Logged in user

let activeTableIDs; // IDs of active table rows

/* Check if user is logged in by checking for Supabase access token in local storage */
const accessToken = localStorage.getItem('sb-baftlzcqbxzejxbowuxf-auth-token');
if (accessToken) {
    // If token exists, get user data from Supabase and redirect to login page if no user found
    const { data: { user } } = await client.supabase.auth.getUser();
    loggedInUser = user;
    const loggedInEmail = user.email;

    // Get employee data from 'employees' table using email
    loggedInEmployee = ((await client.readAll('employees'))
        .filter(employee => employee.contact_info === loggedInEmail) || [])[0];

    // Set logged in employee's name
    loggedInEmployeeName = loggedInEmployee.name;

    // Load home page component into main content section
    CreateHomePageComponent(loggedInEmployeeName);
    PlayMainContentFadeIn();
} else {
    // If no token exists, redirect to login page
    window.location.href = '../web/index.html';
}

/* Causing Animation to Replay */
function PlayMainContentFadeIn() {
    // removing the class
    mainContent.classList.remove("run-animation");
    // triggering reflow
    void mainContent.offsetWidth;
    // and re-adding the class
    mainContent.classList.add("run-animation");
}

async function DeleteFromTableByCheckboxes(htmlTableId, dbTableId, dbColumn) {
    const checkboxes = mainContent.querySelectorAll(`#${htmlTableId} input[type="checkbox"]`);
    const selectedRows = [];

    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            selectedRows.push(checkbox.closest('tr')); // get the parent row element
        }
    });

    // selectedRows now contains an array of selected row elements
    await Promise.all(selectedRows.map(async (row) => {
        const deleteId = row.querySelector('.id').innerHTML;
        // Delete row from DB
        await client.delete(dbTableId, dbColumn, deleteId);
    }));
}

function parseMacronutrients(macronutrientString) {
    const macronutrientObject = {};
    const keyValuePairs = macronutrientString.split('\n');
  
    for (let i = 0; i < keyValuePairs.length; i ++) {
        const keyValuePair = keyValuePairs[i].split(':');
        const value = parseFloat(keyValuePair[1].trim());
        macronutrientObject[keyValuePair[0].trim()] = value;
    }
  
    return macronutrientObject;
}

/*  ----------------------------------------------------------------------
                    MAIN PAGE AND OTHER EVENT LISTENERS 
    ---------------------------------------------------------------------- */
// Add event listener to navbar links to toggle active class for styling
document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelectorAll('.navbar a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
    });
});

/* Add event listeners to dynamically added elements (using jQuery) */
$("#main-content").on("click", '#view-progress', function () {
    // Immitate user click so that the active navbar item updates correctly
    workoutLogs.click();
});

/*  ----------------------------------------------------------------------
                            EXERCISE FORM BUTTONS 
    ---------------------------------------------------------------------- */
$("#main-content").on("click", '#add-exercise-btn', function () {
    const workoutEntryForm = mainContent.querySelector('#workout-entry-form');
    workoutEntryForm.hidden = false;
});

$("#main-content").on("click", '#delete-exercise-btn', async function () {
    await DeleteFromTableByCheckboxes('workout-table', 'workout_logs', 'workout_log_id');
    // Reload page
    workoutLogs.click();
});

$("#main-content").on("submit", '#workout-entry-form', async function (event) {
    /*  Hiding Form */
    event.preventDefault();
    const workoutEntryForm = mainContent.querySelector('#workout-entry-form');
    workoutEntryForm.hidden = true;
    /* Insert into DB */// Get form data
    const formData = new FormData(workoutEntryForm);
    const jsonData = {};
    // Parse all form data into JSON object
    formData.forEach((value, key) => {
        jsonData[key] = value;
    });
    // Insert
    let formattedJsonData = {
        employee_id: loggedInEmployee.employee_id,
        date: jsonData.date,
        exercise_type: jsonData.exerciseType,
        duration: jsonData.duration,
        intensity: jsonData.intensity
    }
    await client.create('workout_logs', formattedJsonData);
    workoutLogs.click(); // Reload page so that the nutrition_log_id is loaded into each row
});

$("#main-content").on("click", '#workout-entry-form .cancel', function () {
    /*  Hiding Form */
    const workoutEntryForm = mainContent.querySelector('#workout-entry-form');
    workoutEntryForm.hidden = true;
});

$("#main-content").on("click", '#workout-table .update-btn', function () {
    // Show the update form
    const workoutUpdateCard = document.querySelector('.workout-update');
    workoutUpdateCard.hidden = false;
    // Get the row data
    var rowData = $(this).closest("tr").find("td");
    var id = $(rowData[0]).text();
    var date = $(rowData[1]).text();
    var exerciseType = $(rowData[2]).text();
    var duration = $(rowData[3]).text();
    var intensity = $(rowData[4]).text();

    // Populate the form fields
    $("#workout-update-form input[name='id']").val(id);
    $("#workout-update-form input[name='date']").val(date);
    $("#workout-update-form input[name='exerciseType']").val(exerciseType);
    $("#workout-update-form input[name='duration']").val(duration);
    $("#workout-update-form select[name='intensity']").val(intensity);
});

$("#main-content").on("submit", '#workout-update-form', async function (event) {
    /*  Hiding Form */
    event.preventDefault();
    const workoutUpdateForm = mainContent.querySelector('#workout-update-form');
    workoutUpdateForm.hidden = true;
    /* Insert into DB */// Get form data
    const formData = new FormData(workoutUpdateForm);
    const jsonData = {};
    // Parse all form data into JSON object
    formData.forEach((value, key) => {
        jsonData[key] = value;
    });
    // Insert
    let formattedJsonData = {
        date: jsonData.date,
        exercise_type: jsonData.exerciseType,
        duration: jsonData.duration,
        intensity: jsonData.intensity
    }
    await client.update('workout_logs', 'workout_log_id', jsonData.id, formattedJsonData);
    workoutLogs.click(); // Reload page so that the nutrition_log_id is loaded into each row
});

$("#main-content").on("click", '#workout-update-form .cancel', function () {
    const workoutUpdateCard = document.querySelector('.workout-update');
    workoutUpdateCard.hidden = true;
});

/*  ----------------------------------------------------------------------
                            NUTRITION FORM BUTTONS 
    ---------------------------------------------------------------------- */
$("#main-content").on("click", '#add-food-btn', function () {
    const nutritionEntryForm = mainContent.querySelector('#nutrition-entry-form');
    nutritionEntryForm.hidden = false;
});

$("#main-content").on("click", '#delete-food-btn', async function () {
    await DeleteFromTableByCheckboxes('food-table', 'nutrition_logs', 'nutrition_log_id');
    // Reload page
    nutritionLogs.click();
});

$("#main-content").on("submit", '#nutrition-entry-form', async function (event) {
    /* Hiding Form */
    event.preventDefault();
    const nutritionEntryForm = mainContent.querySelector('#nutrition-entry-form');
    nutritionEntryForm.hidden = true;
    /* Insert into DB */
    // Get form data
    const formData = new FormData(nutritionEntryForm);
    const jsonData = {};
    // Parse all form data into JSON object
    formData.forEach((value, key) => {
        jsonData[key] = value;
    });
    // Format macronutrients sub-JSON
    const macronutrients = {
        carbs: jsonData.carbs,
        fat: jsonData.fat,
        protein: jsonData.protein,
    };
    // Remove duplicate data
    delete jsonData.carbs;
    delete jsonData.fat;
    delete jsonData.protein;
    // Initialize macronutrients sub-JSON
    jsonData.macronutrients = macronutrients;

    // Insert
    let formattedJsonData = {
        employee_id: loggedInEmployee.employee_id,
        date: jsonData.date,
        food_item: jsonData.foodItem,
        portion_size: jsonData.portionSize,
        calories: jsonData.calories,
        macronutrients: jsonData.macronutrients
    }
    await client.create('nutrition_logs', formattedJsonData);
    nutritionLogs.click(); // Reload page so that the nutrition_log_id is loaded into each row
});

$("#main-content").on("click", '#nutrition-entry-form .cancel', function () {
    const nutritionEntryForm = mainContent.querySelector('#nutrition-entry-form');
    nutritionEntryForm.hidden = true;
});

$("#main-content").on("click", '#food-table .update-btn', function () {
    // Show the update form
    const nutritionUpdateCard = document.querySelector('.nutrition-update');
    nutritionUpdateCard.hidden = false;
    // Get the row data
    var rowData = $(this).closest("tr").find("td");
    var id = $(rowData[0]).text();
    var date = $(rowData[1]).text();
    var foodItem = $(rowData[2]).text();
    var portionSize = $(rowData[3]).text();
    var calories = $(rowData[4]).text();
    var macros = parseMacronutrients($(rowData[5]).text());

    // Populate the form fields
    $("#nutrition-update-form input[name='id']").val(id);
    $("#nutrition-update-form input[name='date']").val(date);
    $("#nutrition-update-form input[name='foodItem']").val(foodItem);
    $("#nutrition-update-form select[name='portionSize']").val(portionSize);
    $("#nutrition-update-form input[name='calories']").val(calories);
    $("#nutrition-update-form input[name='carbs']").val(macros.carbs);
    $("#nutrition-update-form input[name='fat']").val(macros.fat);
    $("#nutrition-update-form input[name='protein']").val(macros.protein);
});

$("#main-content").on("submit", '#nutrition-update-form', async function (event) {
    /*  Hiding Form */
    event.preventDefault();
    const nutritionUpdateForm = mainContent.querySelector('#nutrition-update-form');
    nutritionUpdateForm.hidden = true;
    /* Insert into DB */// Get form data
    const formData = new FormData(nutritionUpdateForm);
    const jsonData = {};
    // Parse all form data into JSON object
    formData.forEach((value, key) => {
        jsonData[key] = value;
    });
    // Format macronutrients sub-JSON
    const macronutrients = {
        carbs: jsonData.carbs,
        fat: jsonData.fat,
        protein: jsonData.protein,
    };
    // Remove duplicate data
    delete jsonData.carbs;
    delete jsonData.fat;
    delete jsonData.protein;
    // Initialize macronutrients sub-JSON
    jsonData.macronutrients = macronutrients;
    // Insert
    let formattedJsonData = {
        date: jsonData.date,
        food_item: jsonData.foodItem,
        portion_size: jsonData.portionSize,
        calories: jsonData.calories,
        macronutrients: jsonData.macronutrients
    }
    await client.update('nutrition_logs', 'nutrition_log_id', jsonData.id, formattedJsonData);
    nutritionLogs.click(); // Reload page so that the nutrition_log_id is loaded into each row
});

/*  ----------------------------------------------------------------------
                    NAVIGATION BUTTONS EVENT LISTENERS 
    ---------------------------------------------------------------------- */
logoPic.addEventListener("click", function(event) {
    // Immitate user click so that the active navbar item updates correctly
    homePage.click();
});

homePage.addEventListener("click", function(event) {
    CreateHomePageComponent(loggedInEmployeeName);
    PlayMainContentFadeIn();
});

workoutLogs.addEventListener("click", async function(event) {
    // Retrieve data from DB (BIG SECURITY FLAW SINCE RLS IS OFF)
    const rows = await client.readAll('workout_logs')
    // Filtering
    const filteredRows = rows.filter(row => row.employee_id === loggedInEmployee.employee_id);
    const mappedRows = filteredRows.map(row => {
        const { employee_id, ...rest } = row;
        return rest;
    });
    CreateComponentFromTemplate('workout-logs-template', 'workout-logs-content');
    mappedRows.forEach((row) => AddRowToTable('workout-table', row, 'workout_log_id')); // Add rows to table
    PlayMainContentFadeIn();
});

nutritionLogs.addEventListener("click", async function(event) {
    // Retrieve data from DB (BIG SECURITY FLAW SINCE RLS IS OFF)
    const rows = await client.readAll('nutrition_logs')
    // Filtering
    const filteredRows = rows.filter(row => row.employee_id === loggedInEmployee.employee_id);
    const mappedRows = filteredRows.map(row => {
        const { employee_id, ...rest } = row;
        return rest;
    });
    CreateComponentFromTemplate('nutrition-logs-template', 'nutrition-logs-content'); // Create component
    mappedRows.forEach((row) => AddRowToTable('food-table', row, 'nutrition_log_id')); // Add rows to table
    PlayMainContentFadeIn(); // Play animation
});

aboutPage.addEventListener("click", function(event) {
    CreateComponentFromTemplate('about-page-template', 'about-page-content');
    PlayMainContentFadeIn();
});

contactPage.addEventListener("click", function(event) {
    CreateComponentFromTemplate('contact-page-template', 'contact-page-content');
    PlayMainContentFadeIn();
});