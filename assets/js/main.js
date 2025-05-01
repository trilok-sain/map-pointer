// JavaScript for form validation, navigation, location permission, and map with filters


document.addEventListener('DOMContentLoaded', () => {
    // Change blue to greenish colors for UI
    const greenBorderClass = 'border-green-600';
    const greenTextClass = 'text-green-600';
    const greenBgClass = 'bg-green-600';
    const greenBgHoverClass = 'hover:bg-green-700';
  
  
    // Signup/Login tab toggle with green colors
    const signupTab = document.getElementById('signup-tab');
    const loginTab = document.getElementById('login-tab');
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
  
  
    if (signupTab && loginTab && signupForm && loginForm) {
      signupTab.addEventListener('click', () => {
        signupTab.classList.add(greenBorderClass, greenTextClass);
        loginTab.classList.remove(greenBorderClass, greenTextClass);
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
      });
  
  
      loginTab.addEventListener('click', () => {
        loginTab.classList.add(greenBorderClass, greenTextClass);
        signupTab.classList.remove(greenBorderClass, greenTextClass);
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
      });
    }
  
  
    // Validation helpers
    function showError(input, errorId, message) {
      const errorElem = document.getElementById(errorId);
      if (errorElem) {
        errorElem.textContent = message;
        errorElem.classList.remove('hidden');
      }
      input.classList.add('border-red-600');
    }
  
  
    function clearError(input, errorId) {
      const errorElem = document.getElementById(errorId);
      if (errorElem) {
        errorElem.classList.add('hidden');
      }
      input.classList.remove('border-red-600');
    }
  
  
    // Signup form validation
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;
  
  
        const username = signupForm['username'];
        if (!username.value || username.value.length < 3) {
          showError(username, 'signup-username-error', 'Please enter a valid username (min 3 characters).');
          valid = false;
        } else {
          clearError(username, 'signup-username-error');
        }
  
  
        const email = signupForm['email'];
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value || !emailPattern.test(email.value)) {
          showError(email, 'signup-email-error', 'Please enter a valid email address.');
          valid = false;
        } else {
          clearError(email, 'signup-email-error');
        }
  
  
        const gender = signupForm['gender'];
        if (!gender.value) {
          showError(gender, 'signup-gender-error', 'Please select your gender.');
          valid = false;
        } else {
          clearError(gender, 'signup-gender-error');
        }
  
  
        const password = signupForm['password'];
        if (!password.value || password.value.length < 6) {
          showError(password, 'signup-password-error', 'Password must be at least 6 characters.');
          valid = false;
        } else {
          clearError(password, 'signup-password-error');
        }
  
  
        const securityQuestion = signupForm['securityQuestion'];
        if (!securityQuestion.value || securityQuestion.value.length < 5) {
          showError(securityQuestion, 'signup-security-question-error', 'Please enter a security question answer (min 5 characters).');
          valid = false;
        } else {
          clearError(securityQuestion, 'signup-security-question-error');
        }
  
  
        if (valid) {
          alert('Sign up successful! Redirecting to location permission...');
          localStorage.setItem('userLoggedIn', 'true');
          window.location.href = 'location-permission.html';
        }
      });
    }
  
  
    // Login form validation
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;
  
  
        const username = loginForm['username'];
        if (!username.value) {
          showError(username, 'login-username-error', 'Please enter your username.');
          valid = false;
        } else {
          clearError(username, 'login-username-error');
        }
  
  
        const email = loginForm['email'];
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value || !emailPattern.test(email.value)) {
          showError(email, 'login-email-error', 'Please enter a valid email address.');
          valid = false;
        } else {
          clearError(email, 'login-email-error');
        }
  
  
        const password = loginForm['password'];
        if (!password.value) {
          showError(password, 'login-password-error', 'Please enter your password.');
          valid = false;
        } else {
          clearError(password, 'login-password-error');
        }
  
  
        if (valid) {
          alert('Login successful! Redirecting to location permission...');
          localStorage.setItem('userLoggedIn', 'true');
          window.location.href = 'location-permission.html';
        }
      });
    }
  
  
    // Forgot password form validation
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
      forgotPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;
  
  
        const username = forgotPasswordForm['username'];
        if (!username.value) {
          showError(username, 'fp-username-error', 'Please enter your username.');
          valid = false;
        } else {
          clearError(username, 'fp-username-error');
        }
  
  
        const email = forgotPasswordForm['email'];
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value || !emailPattern.test(email.value)) {
          showError(email, 'fp-email-error', 'Please enter a valid email address.');
          valid = false;
        } else {
          clearError(email, 'fp-email-error');
        }
  
  
        const securityQuestion = forgotPasswordForm['securityQuestion'];
        if (!securityQuestion.value || securityQuestion.value.length < 5) {
          showError(securityQuestion, 'fp-security-question-error', 'Please enter the answer to your security question (min 5 characters).');
          valid = false;
        } else {
          clearError(securityQuestion, 'fp-security-question-error');
        }
  
  
        const newPassword = forgotPasswordForm['newPassword'];
        if (!newPassword.value || newPassword.value.length < 6) {
          showError(newPassword, 'fp-new-password-error', 'New password must be at least 6 characters.');
          valid = false;
        } else {
          clearError(newPassword, 'fp-new-password-error');
        }
  
  
        if (valid) {
          alert('Password reset successful! Redirecting to login page...');
          window.location.href = 'signup.html';
        }
      });
    }
  
  
    // Main page map and filters
    if (document.getElementById('map')) {
      const map = L.map('map').setView([0, 0], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map);
  
  
      // Mock washroom data with gender and rainbow for all allowed
      const washrooms = [
        {
          id: 1,
          name: 'Central Park Washroom (Men)',
          lat: 40.785091,
          lng: -73.968285,
          accessibility: ['wheelchair'],
          type: 'free',
          rating: 4,
          gender: 'male',
          locationType: 'park',
          photos: [],
        },
        {
          id: 2,
          name: 'City Mall Restroom (Women)',
          lat: 40.758896,
          lng: -73.985130,
          accessibility: ['baby'],
          type: 'paid',
          rating: 3,
          gender: 'female',
          locationType: 'mall',
          photos: [],
        },
        {
          id: 3,
          name: 'Library Public Toilet (All)',
          lat: 40.753182,
          lng: -73.982253,
          accessibility: ['wheelchair', 'baby'],
          type: 'free',
          rating: 5,
          gender: 'all',
          locationType: 'library',
          photos: [],
        },
        {
          id: 4,
          name: 'Airport Restroom (All)',
          lat: 40.641311,
          lng: -73.778139,
          accessibility: ['wheelchair'],
          type: 'free',
          rating: 4,
          gender: 'all',
          locationType: 'airport',
          photos: [],
        },
      ];
  
  console.log({ washrooms });
      let markers = [];
  
  
      function addMarkers(filteredWashrooms) {
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
  
  
        filteredWashrooms.forEach(w => {
          let iconColorClass = 'text-pink-600'; // default pink for women
          if (w.gender === 'male') iconColorClass = 'text-blue-600';
          else if (w.gender === 'all') iconColorClass = 'text-pink-500 animate-pulse'; // rainbow effect substitute with pulse
  
  
          // Determine icon based on locationType
          let iconHtml = '<i class="fas fa-toilet fa-2x ' + iconColorClass + '"></i>';
          if (w.locationType === 'library') {
            iconHtml = '<img src="https://cdn-icons-png.flaticon.com/512/29/29302.png" alt="Library" class="w-8 h-8" />';
          } else if (w.locationType === 'airport') {
            iconHtml = '<img src="https://cdn-icons-png.flaticon.com/512/69/69524.png" alt="Airport" class="w-8 h-8" />';
          } else if (w.locationType === 'mall') {
            iconHtml = '<img src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png" alt="Mall" class="w-8 h-8" />';
          } else if (w.locationType === 'park') {
            iconHtml = '<img src="https://cdn-icons-png.flaticon.com/512/427/427735.png" alt="Park" class="w-8 h-8" />';
          }
  
  
          const icon = L.divIcon({
            className: 'custom-icon',
            html: iconHtml,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30],
          });
  
  
          const marker = L.marker([w.lat, w.lng], { icon }).addTo(map);
          marker.bindPopup(
            '<div class="font-semibold text-lg mb-1">' + w.name + '</div>' +
            '<div>Rating: ' + w.rating + ' ⭐</div>' +
            '<div>Type: ' + w.type.charAt(0).toUpperCase() + w.type.slice(1) + '</div>' +
            '<div>Accessibility: ' + (w.accessibility.join(', ') || 'None') + '</div>' +
            '<div><em>Photos will be displayed here once available.</em></div>'
          );
          markers.push(marker);
        });
      }
  
  
      function filterWashrooms() {
        const range = parseInt(document.getElementById('range').value) || 5;
        const accessibilityChecks = Array.from(document.querySelectorAll('input[name="accessibility"]:checked')).map(i => i.value);
        const typeChecks = Array.from(document.querySelectorAll('input[name="type"]:checked')).map(i => i.value);
        const rating = parseInt(document.getElementById('rating').value) || 0;
  
  
        // Filter washrooms by criteria
        let filtered = washrooms.filter(w => {
          // For demo, ignore actual distance calculation, assume all within range
          if (rating && w.rating < rating) return false;
          if (accessibilityChecks.length > 0 && !accessibilityChecks.some(a => w.accessibility.includes(a))) return false;
          if (typeChecks.length > 0 && !typeChecks.includes(w.type)) return false;
          return true;
        });
        
        console.log({ washrooms: filtered  });
  
        addMarkers(filtered);
      }
  
  
      // Get user location and set map view
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            map.setView([lat, lng], 13);
            L.marker([lat, lng]).addTo(map).bindPopup('You are here').openPopup();
            filterWashrooms();
          },
          () => {
            // Default location if geolocation fails
            map.setView([40.758896, -73.985130], 13);
            filterWashrooms();
          }
        );
      } else {
        map.setView([40.758896, -73.985130], 13);
        filterWashrooms();
      }
  
  
      // Filter form submit handler
      const filtersForm = document.getElementById('filters-form');
      if (filtersForm) {
        filtersForm.addEventListener('submit', (e) => {
          e.preventDefault();
          filterWashrooms();
        });
      }
    }
  
  
    // Redirect logic on app load
    if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html')) {
      // Check if user logged in
      const userLoggedIn = localStorage.getItem('userLoggedIn');
      if (!userLoggedIn) {
        window.location.href = 'signup.html';
      } else {
        // Check location permission
        const locationPermission = localStorage.getItem('locationPermission');
        if (locationPermission === 'granted') {
          window.location.href = 'main.html';
        } else {
          window.location.href = 'location-permission.html';
        }
      }
    }
  });
  
  
  
  