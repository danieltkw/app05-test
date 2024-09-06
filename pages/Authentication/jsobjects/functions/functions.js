export default {
  defaultTab: 'Sign In',
  testMode: true,

  // Initialize function to set the default tab
  initialize() {
    console.log('Initializing with default tab set to Sign In');
    this.setDefaultTab('Sign In');  // Set the default tab to SignIn when the app loads
  },

  // Set the default tab to SignIn
  setDefaultTab(tabName) {
    if (tabName === 'Sign In') {
      this.defaultTab = tabName;
    } else {
      console.error('Invalid tab name:', tabName);
    }
  },

  // Sign-in function to authenticate user
  async signIn() {
    const email = inp_email.text;
    const password = inp_password.text;

    try {
      const result = await entry_form.run(); // Run the query to authenticate the user

      if (result.length > 0) {
        const user = result.find(row => row['Email address'] === email);

        if (user) {
          if (user['Senha desejada'] === password) {
            const userID = user['NIF/VAT']; // Extract user ID (VAT)
            await storeValue('userID', userID);  // Store VAT as user ID
            
            // Show alert with welcome message and the VAT (userID)
            showAlert(`Login Success! Welcome, ${userID}`, 'success');
            
            // Navigate to dashboard with user_id in the query params
            navigateTo('Dashboard', { user_id: userID }, 'SAME_WINDOW');
          } else {
            showAlert('Invalid password', 'error');
          }
        } else {
          showAlert('User not found', 'error');
        }
      } else {
        showAlert('No data available', 'error');
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
      showAlert('An error occurred during sign-in', 'error');
    }
  },

  // Navigate to the external sign-up form
  navigateToSignUpForm() {
    navigateTo(
      'https://docs.google.com/forms/d/e/1FAIpQLSea9NOGjFYhjPSYULcSrd_JemTH9CtChcq_xK6OcU87VhOmJQ/viewform?usp=sf_link', 
      {}, 
      'NEW_WINDOW'
    );
  }
};

// ------------------------------------------------------------
// Temporary Login page
// ------------------------------------------------------------
// Daniel T. K. W. - github.com/danieltkw - danielkopolo95@gmail.com
// ------------------------------------------------------------


