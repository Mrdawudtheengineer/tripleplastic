import { supabase } from './supabase.js';

/* =========================
   AUTH STATE CHECK
========================= */
const authLinkInNav = document.getElementById('auth-link');

export async function checkUser() {
  const { data: { user } } = await supabase.auth.getUser();

  if (authLinkInNav) {
    if (user) {
      // Check if user is admin based on profile data
      let isAdmin = false;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', user.id)
          .single();
        
        if (data?.is_admin) isAdmin = true;
      } catch (err) {
        console.error('Error fetching admin status:', err);
      }

      // Update Navigation
      authLinkInNav.innerHTML = `
        ${isAdmin ? '<a href="admin.html">Admin Portal</a>' : ''}
        <a href="#" id="signOutBtn" style="margin-left: 10px;">Sign Out</a>
      `;

      // Attach Sign Out Listener
      const signOutBtn = document.getElementById('signOutBtn');
      if(signOutBtn) {
          signOutBtn.onclick = async (e) => {
            e.preventDefault();
            await supabase.auth.signOut();
            window.location.href = 'index.html';
          };
      }
    } else {
      // User is logged out
      authLinkInNav.innerText = 'Sign In';
      authLinkInNav.href = 'auth.html';
    }
  }
  return user;
}

/* =========================
   UI ELEMENTS
========================= */
const messageEl = document.getElementById('message');
const signInBtn = document.getElementById('signInBtn');
const signUpBtn = document.getElementById('signUpBtn');
const sendResetBtn = document.getElementById('sendResetBtn');

// Toggle Buttons
const showSignUpBtn = document.getElementById('showSignUpBtn');
const showLogin = document.getElementById('showLogin');
const showForgot = document.getElementById('showForgot');
const showLoginFromForgot = document.getElementById('showLoginFromForgot');

// Views
const loginView = document.getElementById('login-view');
const signupView = document.getElementById('signup-view');
const forgotView = document.getElementById('forgot-view');

/* =========================
   VIEW LOGIC
========================= */
function switchView(viewName) {
    if(messageEl) messageEl.innerText = '';
    if (loginView) loginView.style.display = viewName === 'login' ? 'block' : 'none';
    if (signupView) signupView.style.display = viewName === 'signup' ? 'block' : 'none';
    if (forgotView) forgotView.style.display = viewName === 'forgot' ? 'block' : 'none';
}

if (showSignUpBtn) showSignUpBtn.onclick = () => switchView('signup');
if (showLogin) showLogin.onclick = () => switchView('login');
if (showLoginFromForgot) showLoginFromForgot.onclick = () => switchView('login');
if (showForgot) {
    showForgot.onclick = (e) => {
        e.preventDefault();
        switchView('forgot');
    };
}

/* =========================
   SIGN IN
========================= */
if (signInBtn) {
  signInBtn.onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      messageEl.innerText = 'Please enter both email and password.';
      return;
    }

    signInBtn.disabled = true;
    signInBtn.innerText = 'Signing in...';

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      messageEl.style.color = '#ff3b30';
      messageEl.innerText = error.message;
      signInBtn.disabled = false;
      signInBtn.innerText = 'Sign In';
      return;
    }

    await checkUser();
    window.location.href = 'products.html'; // Redirect after login
  };
}

/* =========================
   SIGN UP (FIXED)
========================= */
if (signUpBtn) {
  signUpBtn.onclick = async () => {
    const fullName = document.getElementById('signup-name').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    if (!fullName || !email || !password) {
      messageEl.innerText = 'Name, email, and password are required.';
      return;
    }

    signUpBtn.disabled = true;
    signUpBtn.innerText = 'Creating account...';

    // We pass the profile data inside 'options.data'. 
    // The SQL Trigger we created will handle the rest!
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone
        }
      }
    });

    if (error) {
      messageEl.style.color = '#ff3b30';
      messageEl.innerText = error.message;
      signUpBtn.disabled = false;
      signUpBtn.innerText = 'Create Business Account';
      return;
    }

    messageEl.style.color = '#0071e3'; // Standard Blue
    messageEl.innerText = 'Account created! Please check your email to confirm.';
    signUpBtn.innerText = 'Account Created';
  };
}

/* =========================
   PASSWORD RESET
========================= */
if (sendResetBtn) {
  sendResetBtn.onclick = async () => {
    const email = document.getElementById('forgot-email').value.trim();

    if (!email) {
      messageEl.innerText = 'Please enter your email address.';
      return;
    }

    sendResetBtn.disabled = true;
    sendResetBtn.innerText = 'Sending...';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password.html`
    });

    if (error) {
      messageEl.style.color = '#ff3b30';
      messageEl.innerText = error.message;
      sendResetBtn.disabled = false;
      sendResetBtn.innerText = 'Send Reset Link';
      return;
    }

    messageEl.style.color = '#0071e3';
    messageEl.innerText = 'Recovery link sent. Please check your email.';
    sendResetBtn.innerText = 'Link Sent';
  };
}

/* =========================
   INIT
========================= */
checkUser();
