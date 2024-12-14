// Hides the landing section when triggered, making it invisible.
function hideLandingSection() {
  document.getElementById('landing-section').style.display = 'none'; // Hides the landing section by changing its display property to 'none'.
}

// Hides the welcome section when triggered, making it invisible.
function hideWelcomeSection() {
  document.getElementById('welcome-section').style.display = 'none'; // Hides the welcome section by changing its display property to 'none'.
}

// Displays the flight form section for adding a flight and hides other sections.
function showAddFlightForm() {
  hideLandingSection(); // Hides the landing section to prevent it from being visible when adding a flight.
  hideWelcomeSection(); // Hides the welcome section to prevent it from being visible during the flight form.
  document.getElementById('register-form').style.display = 'none'; // Hides the register form, ensuring only the flight form is visible.
  document.getElementById('login-form').style.display = 'none'; // Hides the login form, ensuring only the flight form is visible.
  document.getElementById('flight-form').style.display = 'block'; // Displays the flight form section for adding a flight.
  document.getElementById('forms-section').style.display = 'block'; // Ensures that the forms section is visible to the user.
  document.getElementById('searchFlightForm').style.display = 'none'; // Hides the search flight form, as the focus is on adding a flight.
  document.getElementById('manageBookings').style.display = 'none'; // Hides the manage bookings section to make space for the flight form.
}

// Displays the register form section for user registration and hides other sections.
function showRegisterForm() {
  hideLandingSection(); // Hides the landing section to prevent it from being visible while the register form is displayed.
  hideWelcomeSection(); // Hides the welcome section to make room for the register form.
  document.getElementById('flight-form').style.display = 'none'; // Hides the flight form to avoid confusion with the registration form.
  document.getElementById('login-form').style.display = 'none'; // Hides the login form to make room for the register form.
  document.getElementById('register-form').style.display = 'block'; // Displays the register form section for user input.
  document.getElementById('forms-section').style.display = 'block'; // Ensures that the forms section is visible.
  document.getElementById('searchFlightForm').style.display = 'none'; // Hides the search flight form, as the focus is on registering the user.
  document.getElementById('manageBookings').style.display = 'none'; // Hides the manage bookings section to make room for the register form.
}

// Displays the login form section for user login and hides other sections.
function showLoginForm() {
  hideLandingSection(); // Hides the landing section to prevent it from being visible during login.
  hideWelcomeSection(); // Hides the welcome section to make room for the login form.
  document.getElementById('flight-form').style.display = 'none'; // Hides the flight form since the focus is on the login process.
  document.getElementById('register-form').style.display = 'none'; // Hides the register form to avoid any overlap with the login form.
  document.getElementById('login-form').style.display = 'block'; // Displays the login form section for the user to log in.
  document.getElementById('forms-section').style.display = 'block'; // Ensures that the forms section is visible during login.
  document.getElementById('searchFlightForm').style.display = 'none'; // Hides the search flight form as the user is logging in.
  document.getElementById('manageBookings').style.display = 'none'; // Hides the manage bookings section during the login process.
}

// Displays the landing page and hides all other sections, such as forms and content.
function showLandingPage() {
  document.getElementById('landing-section').style.display = 'block'; // Shows the landing section where the user can choose options.
  document.getElementById('welcome-section').style.display = 'none'; // Hides the welcome section, making the landing page the focus.
  document.getElementById('forms-section').style.display = 'none'; // Hides the forms section to show only the landing page.
  document.getElementById('register-form').style.display = 'none'; // Hides the register form to avoid any overlap with the landing page.
  document.getElementById('login-form').style.display = 'none'; // Hides the login form to focus on the landing page.
  document.getElementById('flight-form').style.display = 'none'; // Hides the flight form as it is not relevant during the landing page display.
  document.getElementById('searchFlightForm').style.display = 'none'; // Hides the search flight form to avoid confusion.
  document.getElementById('manageBookings').style.display = 'none'; // Hides the manage bookings section as it is not relevant during the landing page.
}

// Displays the search flights form section for users to search for flights and hides other sections.
function showSearchFlightsForm() {
  document.getElementById('welcome-section').style.display = 'none'; // Hides the welcome section, focusing on the search flight form.
  document.getElementById('landing-section').style.display = 'none'; // Hides the landing section to display the search flight form.
  document.getElementById('forms-section').style.display = 'block'; // Ensures that the forms section is visible.
  document.getElementById('register-form').style.display = 'none'; // Hides the register form as the focus is on flight search.
  document.getElementById('login-form').style.display = 'none'; // Hides the login form to avoid confusion with the search flight form.
  document.getElementById('flight-form').style.display = 'none'; // Hides the flight form to focus on searching for flights.
  document.getElementById('searchFlightForm').style.display = 'block'; // Displays the search flight form for the user to search flights.
  document.getElementById('manageBookings').style.display = 'none'; // Hides the manage bookings section during the flight search process.
}

// Displays the manage bookings section, where users can manage their bookings, and hides other sections.
function showManageBookings() {
  document.getElementById('welcome-section').style.display = 'none'; // Hides the welcome section to show the manage bookings section.
  document.getElementById('landing-section').style.display = 'none'; // Hides the landing section to make space for the manage bookings section.
  document.getElementById('forms-section').style.display = 'block'; // Ensures that the forms section is visible.
  document.getElementById('register-form').style.display = 'none'; // Hides the register form to avoid overlapping with manage bookings.
  document.getElementById('login-form').style.display = 'none'; // Hides the login form as the user is managing bookings.
  document.getElementById('flight-form').style.display = 'none'; // Hides the flight form as it is not relevant when managing bookings.
  document.getElementById('manageBookings').style.display = 'block'; // Displays the manage bookings section where the user can edit or view bookings.
  document.getElementById('searchFlightForm').style.display = 'none'; // Hides the search flight form as the focus is on managing bookings.
}








// ------------------------ Profile Menu ------------------------

/**
 * Toggle the visibility of the profile menu when the profile button is clicked.
 */
function showProfileMenu() {
  const profileMenu = document.getElementById('profile-menu');
  profileMenu.style.display = profileMenu.style.display === 'block' ? 'none' : 'block';
}


/**
 * Close the profile menu if a click occurs outside the profile button and menu.
 */

window.onclick = function (event) {
  const profileMenu = document.getElementById('profile-menu');
  if (event.target !== document.getElementById('profile-button') && !profileMenu.contains(event.target)) {
    profileMenu.style.display = 'none';
  }
};

// ------------------------ User Profile ------------------------

/**
 * Update the profile section with the user data.
 * 
 * @param {Object} user - The user object containing profile information.
 */
function updateProfile(user) {
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-email').textContent = user.email;
}



// ------------------------ Register Form ------------------------

/**
 * Handle the registration form submission and store user data in sessionStorage.
 *  Frontend JavaScript (app.js) - for UI handling, no backend code here
 */

document.getElementById('register').addEventListener('submit', function (e) {
  e.preventDefault();

  let firstName = document.getElementById('first_name').value;
  let lastName = document.getElementById('last_name').value;
  let email = document.getElementById('email').value;
  let phone = document.getElementById('phone').value;
  let password = document.getElementById('password').value;

  // Store user information in sessionStorage (no userRole since it's not part of the registration now)
  sessionStorage.setItem('userName', `${firstName} ${lastName}`);
  sessionStorage.setItem('userEmail', email);
  sessionStorage.setItem('userPhone', phone);

  // Show loading state (optional)
  const registerButton = document.querySelector('button[type="submit"]');
  registerButton.disabled = true;
  registerButton.textContent = 'Registering...';

  // Send registration request to the backend (without user_role)
  fetch('http://localhost:3000/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      password: password
    })
  })
    .then(response => response.json())  // Parse the response as JSON
    .then(data => {
      if (data.showLoginForm) {  // If the response contains 'showLoginForm' as true
        // Registration was successful, show the login form
        document.getElementById('register-form').style.display = 'none';  // Hide the registration form
        document.getElementById('login-form').style.display = 'block';    // Show the login form
        alert('Registration successful. Please log in.');
      } else {
        alert('Registration failed: ' + data.error);  // Show error if registration fails
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    })
    .finally(() => {
      // Reset the register button
      registerButton.disabled = false;
      registerButton.textContent = 'Register';
    });
});




// ------------------------ Login Form ------------------------

/**
 * Handle the login form submission by sending the entered credentials to the server.
 */
// document.getElementById('login').addEventListener('submit', function (e) {
//   e.preventDefault();
//   const email = document.getElementById('login_email').value;
//   const password = document.getElementById('login_password').value;

//   // Send login request to the server
//   fetch('http://localhost:3000/api/login', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ email, password }) // More concise version
//   })
//     .then(response => response.json())
//     .then(data => {
//       if (data.success) {
//         // Redirect based on the backend response
//         window.location.href = data.redirect; // Redirect to admin or customer dashboard
//       } else {
//         alert('Login failed: ' + data.error); // Show the error message from the backend
//       }
//     })
//     .catch(error => {
//       console.error('Error:', error);
//       alert('An error occurred. Please try again.');
//     });
// });


// Assuming you have a login form with ID 'loginForm'
// document.getElementById('loginForm').addEventListener('submit', function(e) {
//   e.preventDefault(); // Prevent form submission

//   const email = document.getElementById('email').value;
//   const password = document.getElementById('password').value;

//   // Send login request to backend
//   fetch('http://localhost:3000/api/login', {
//       method: 'POST',
//       headers: {
//           'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ email: email, password: password }),
//   })
//   .then(response => response.json())
//   .then(data => {
//       if (data.success) {
//           // Redirect to the appropriate dashboard
//           window.location.href = data.redirect;  // This will be '/customer-dashboard' or '/admin-dashboard'
//       } else {
//           console.error('Login failed:', data.error);
//           alert('Login failed: ' + data.error);
//       }
//   })
//   .catch(err => {
//       console.error('Error during login request:', err);
//       alert('An error occurred. Please try again later.');
//   });
// });












// ------------------------ Dashboard ------------------------

/**
 * Display the dashboard and update the available options based on the user role.
 * 
 * @param {string} role - The role of the user ('customer' or 'admin').
 */
function showDashboard(role) {
  document.getElementById('forms-section').style.display = 'none';
  document.getElementById('dashboard-section').style.display = 'block';
  document.getElementById('user_name').innerText = sessionStorage.getItem('userName');
  let dashboardOptions = document.getElementById('dashboard-options');

  // Customize the dashboard options based on user role
  if (role === 'customer') {
    dashboardOptions.innerHTML = `
      <p>As a customer, you can:</p>
      <ul>
        <li>Book a flight</li>
        <li>View your booking history</li>
        <li>Manage your profile</li>
      </ul>
    `;
  } else if (role === 'admin') {
    dashboardOptions.innerHTML = `
      <p>As an admin, you can:</p>
      <ul>
        <li>Add flights to the system</li>
        <li>Manage users</li>
        <li>View all bookings</li>
      </ul>
    `;
  }
}


// ------------------------ Logout ------------------------

/**
 * Log the user out by clearing sessionStorage and reloading the page.
 */
function logout() {
  sessionStorage.clear();
  window.location.reload();
}

// ------------------------ Manage Users ------------------------

/**
 * Fetch and display the list of users from the server.
 */
function showUsers() {
  fetch('http://localhost:3000/api/users')
    .then(response => response.json())
    .then(data => {
      const usersList = document.getElementById('users-list');
      usersList.innerHTML = ''; // Clear the list before adding new items
      data.forEach(user => {
        const li = document.createElement('li');
        li.textContent = `${user.first_name} ${user.last_name} - ${user.email}`;
        usersList.appendChild(li);
      });
    })
    .catch(error => {
      console.error('Error fetching users:', error);
    });

  // Show the users section and hide the forms section
  document.getElementById('user-section').style.display = 'block';
  document.getElementById('forms-section').style.display = 'none';
}

// ------------------------ Flight Form ------------------------

/**
 * Display the flight form.
 */
function showFlightForm() {
  document.getElementById('flight-form').style.display = 'block';
  document.getElementById('forms-section').style.display = 'none';
}

// ------------------------ Initial Page Load ------------------------

/**
 * On page load, display the welcome section and hide other sections.
 */
window.onload = function () {
  document.getElementById('welcome-section').style.display = 'block';
  document.getElementById('landing-section').style.display = 'none';
  document.getElementById('forms-section').style.display = 'none';
};
