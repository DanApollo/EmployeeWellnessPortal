import { supabaseClient } from "../config/supabaseClient.js";
import { fetchNutritionData } from "../config/nutritionAPI.js"

const userName = document.getElementById("user-name")
const logoutButton = document.getElementById("logout-button")

let employee_id

supabaseClient.supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session) {
        // User is not logged in, redirect to the login page
        window.location.href = "/index.html";
    }
});

logoutButton.addEventListener("click", async () => {
    const res = await supabaseClient.handleLogout()
    if (res.ok) {
        window.location.href = "/index.html";
    }
})

supabaseClient.supabase.auth.getUser().then(data => {
    const id = data.data.user.id
    supabaseClient.read("employees", "user_id", id).then(
        user => {
            employee_id = user.data.id
            userName.innerText = `${user.data.first_name} ${user.data.last_name}`
        }
    )
})

// Get references to form elements
const workoutForm = document.getElementById("workoutForm");
const nutritionList = document.getElementById("nutritionList");
const activityList = document.getElementById("activityList");

// Event listeners for form submissions
workoutForm.addEventListener("submit", handleWorkoutSubmit);

// Function to handle workout form submission
async function handleWorkoutSubmit(event) {
    event.preventDefault();

    const name = document.getElementById("workoutName").value;
    const duration = parseInt(document.getElementById("workoutDuration").value);
    const intensity = document.getElementById("workoutIntensity").value;

    // Basic validation
    if (!name || isNaN(duration) || duration <= 0) {
        alert("Please enter valid workout name and duration.");
        return;
    }

    try {

        const today = new Date().toISOString().slice(0, 10); // Get today's date in YYYY-MM-DD format
        const response = await supabaseClient.create("workout_logs", { employee_id, name, duration, intensity });
        if (response.ok) {
            const { data, error } = await supabaseClient.supabase
                .from('challenges')
                .select('id') // Select only the challenge ID
                .gte('start_date', today)
                .lte('end_date', today)
                .limit(1) // In case multiple challenges overlap, get the first one
                .maybeSingle(); // Allow for no results

            if (error) {
                throw error;
            } else if (!data) {
                console.log("no challenge")
                // No ongoing challenge found
            } else {
                const challengeId = data.id

                const { data: existingParticipation, error: participationError } = await supabaseClient.supabase
                    .from('challenge_participation')
                    .select('id, points')
                    .eq('challenge_id', challengeId)
                    .eq('employee_id', employee_id)
                    .maybeSingle();

                if (participationError) {
                    throw participationError;
                }
                if (existingParticipation) {
                    // Update existing participation record
                    const newPoints = existingParticipation.points + duration;
                    console.log(newPoints)
                    const { error: updateError, data } = await supabaseClient.supabase
                        .from('challenge_participation')
                        .update({ points: newPoints })
                        .eq('id', existingParticipation.id);

                    if (updateError) {
                        throw updateError;
                    } else {

                        console.log("Points updated successfully!", data);
                    }
                } else {
                    // Create a new participation record
                    const { error: insertError } = await supabaseClient.supabase
                        .from('challenge_participation')
                        .insert([{
                            challenge_id: challengeId,
                            employee_id: employee_id,
                            points: duration
                        }]);

                    if (insertError) {
                        throw insertError;
                    } else {
                        console.log("New participation record created!");
                    }
                }
            }

        }
        updateRecentActivity(); // Refresh the activity list
        workoutForm.reset(); // Clear the form
    } catch (error) {
        console.error("Error adding workout:", error);
        alert("Failed to add workout. Please try again.");
    }
}

const nutritionForm = document.getElementById("nutrition-form")

nutritionForm.addEventListener("submit", searchFood)

async function searchFood(event) {
    event.preventDefault()

    const query = document.getElementById("foodQueryInput").value;

    if (query.trim() === "") return; // Basic validation

    const data = await fetchNutritionData(query);
    try {
        const promises = await data.foods.map(async item => {
            const response = await supabaseClient.create("nutrition_logs", { employee_id, name: item.food_name, calories: item.nf_calories });
            if (!response.ok) throw response.error
        })

        await Promise.all(promises)
        updateRecentActivity()
        nutritionForm.reset()
    } catch (error) {
        console.error(error)
    }

}

// Function to fetch and populate the list initially
async function populateList(table) {
    try {
        const response = await supabaseClient.readAll(table)
        if (response.ok) {
            if (response.data.length < 1) {
                return
            }
            const activityDiv = document.getElementById('recentNutrition')
            const title = document.createElement('h3')
            title.textContent = table
            activityDiv.appendChild(title)

            const list = document.createElement('ul')

            response.data.forEach(item => {
                const listItem = document.createElement('li');
                listItem.dataset.id = item.id;
                listItem.dataset.table = table;

                const valueSpan = document.createElement('span');
                valueSpan.id = "name"
                valueSpan.textContent = item.name;
                listItem.appendChild(valueSpan);

                if (item.calories) {
                    const caloriesSpan = document.createElement('span');
                    caloriesSpan.id = "calories"
                    caloriesSpan.textContent = item.calories;
                    listItem.appendChild(caloriesSpan);
                } else {
                    const durationSpan = document.createElement('span');
                    durationSpan.id = "duration"
                    durationSpan.textContent = item.duration;
                    listItem.appendChild(durationSpan);

                    const intensitySpan = document.createElement('span');
                    intensitySpan.id = "intensity"
                    intensitySpan.textContent = item.intensity;
                    listItem.appendChild(intensitySpan);
                }

                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.className = "edit-button"
                editButton.addEventListener('click', handleEdit);
                listItem.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.className = "delete-button"
                deleteButton.addEventListener('click', handleDelete);
                listItem.appendChild(deleteButton);

                list.appendChild(listItem);
            });
            activityDiv.appendChild(list)

        } else throw response.error
    } catch (error) {
        console.error(error)
    }
}

// Function to handle the edit button click
function handleEdit(event) {
    const listItem = event.target.parentNode;
    const itemId = listItem.dataset.id;
    const itemTable = listItem.dataset.table;
    const valueSpan = listItem.querySelector('#name')
    const originalValue = valueSpan.textContent;

    // Replace the value span with an input field
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = originalValue;
    listItem.replaceChild(inputField, valueSpan);

    // Change the edit button to a save button
    event.target.textContent = 'Save';
    event.target.removeEventListener('click', handleEdit);
    event.target.addEventListener('click', () => handleSave(itemId, itemTable, inputField));
}

// Function to handle the save button click
async function handleSave(itemId, itemTable, inputField) {
    const newValue = inputField.value;
    try {
        const response = await supabaseClient.update(itemTable, itemId, { name: newValue })
        if (response.ok) {
            // Update the UI
            const listItem = inputField.parentNode;
            const valueSpan = document.createElement('span');
            valueSpan.textContent = newValue;
            listItem.replaceChild(valueSpan, inputField);

            // Change the save button back to an edit button
            const editButton = listItem.querySelector('button');
            editButton.textContent = 'Edit';
            editButton.removeEventListener('click', handleSave);
            editButton.addEventListener('click', handleEdit);
        } else throw response.error
    } catch (error) {
        console.error(error)
    }
}

// Function to handle the delete button click
async function handleDelete(event) {
    const listItem = event.target.parentNode;
    const itemId = listItem.dataset.id;
    const itemTable = listItem.dataset.table;

    try {
        const response = await supabaseClient.delete(itemTable, itemId)
        if (response.ok) {
            // Remove the list item from the UI
            listItem.remove();
        } else throw response.error
    } catch (error) {
        console.error(error)
    }
}

// Initial list population
// Function to fetch and display recent activity
function updateRecentActivity() {
    const recentNutrition = document.getElementById('recentNutrition')
    recentNutrition.innerHTML = ''
    populateList("nutrition_logs", nutritionList)
    populateList("workout_logs", activityList)
}

// Initial call to populate the activity list on page load
updateRecentActivity()
