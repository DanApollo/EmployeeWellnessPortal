import { supabaseClient } from "../config/supabaseClient.js";

const userName = document.getElementById("user-name")
const logoutButton = document.getElementById("logout-button")

logoutButton.addEventListener("click", async () => {
  const res = await supabaseClient.handleLogout()
  if (res.ok) {
    window.location.href = "/index.html";
  }
})

supabaseClient.supabase.auth.getUser().then(data => {
  let id = data.data.user.id
  supabaseClient.read("employees", "user_id", id).then(
    user => {
      employee_id = user.data.id
      userName.innerText = `${user.data.first_name} ${user.data.last_name}`
    }
  )
})

async function getLeaderboardDataForOngoingChallenge() {
  try {
    const today = new Date().toISOString().slice(0, 10); // Get today's date in YYYY-MM-DD format

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
      return [];
    }

    // Fetch leaderboard data for the ongoing challenge
    const challengeId = data.id;
    const { data: leaderboardData, error: leaderboardError } = await supabaseClient.supabase
      .from('challenge_participation')
      .select(`
          points,
          employee_id (first_name, last_name)
        `)
      .eq('challenge_id', challengeId)
      .order('points', { ascending: false });

    if (leaderboardError) {
      throw leaderboardError;
    }

    loadLeaderboard(leaderboardData)
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
  }
}


function loadLeaderboard(list) {
  try {
    // Display the data in the table
    const leaderboardBody = document.getElementById("leaderboardBody");
    leaderboardBody.innerHTML = ''; // Clear existing data

    list.forEach((entry, index) => {
      const row = leaderboardBody.insertRow();
      const rankCell = row.insertCell();
      const nameCell = row.insertCell();
      const pointsCell = row.insertCell();

      rankCell.textContent = index + 1;
      nameCell.textContent = entry.employee_id.first_name + " " + entry.employee_id.last_name;
      pointsCell.textContent = entry.points;
    });

  } catch (error) {
    console.error('Error loading leaderboard:', error);
  }
}

// Load the leaderboard when the page loads
//   window.onload = loadLeaderboard;

getLeaderboardDataForOngoingChallenge()
