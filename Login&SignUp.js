import {
    initializeApp
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut,
    deleteUser,
    updatePassword,
    sendEmailVerification
} from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyBW5jAMQTZkKAOwA4SDB2VZejOmJVOdlQg",
    authDomain: "chatcraft-daa48.firebaseapp.com",
    projectId: "chatcraft-daa48",
    storageBucket: "chatcraft-daa48.appspot.com",
    messagingSenderId: "485631041952",
    appId: "1:485631041952:web:4fa5eba6bcacc15172c4c5",
    measurementId: "G-H0WG7MTFM5"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth();

const hide = el => el.style.display = "none";
const show = el => el.style.display = "block";

window.addEventListener('DOMContentLoaded', () => {
    const user = auth.currentUser;
    const cardFront = document.querySelector('.card-front .center-wrap');
    const mainContent = document.getElementById('mainContent');
    const forgotPasswordForm = document.getElementById("forgotPasswordForm");

    if (user) {
        hide(cardFront);
        show(mainContent);
        hide(forgotPasswordForm);
    } else {
        show(cardFront);
        hide(forgotPasswordForm);
        hide(mainContent);
    }

    // Hide forgot password form by default
    hide(forgotPasswordForm);
});

const signIn = () => {
    signInWithEmailAndPassword(auth, document.getElementById("logemail").value, document.getElementById("logpass").value)
        .then(userCredential => {
            // Show success message
            Swal.fire({
                icon: 'success',
                title: 'Login Successfully',
                text: `Welcome back, ${userCredential.user.email}!`,
                confirmButtonText: 'Continue',
                showClass: {
                    popup: 'animate__animated animate__bounceIn'
                },
                hideClass: {
                    popup: 'animate__animated animate__bounceOut'
                }
            }).then(() => window.location.href = "home.html");
        })
        .catch(error => {
            let errorMessage = 'An unknown error occurred. Please try again.';
            if (error.code === 'auth/wrong-password') errorMessage = 'Incorrect password. Please try again.';
            else if (error.code === 'auth/user-not-found') errorMessage = 'User not found. Please check your email or sign up.';
            else if (error.code === 'auth/too-many-requests') errorMessage = 'Too many unsuccessful login attempts. Please try again later.';
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: errorMessage,
                confirmButtonText: 'OK',
                showClass: {
                    popup: 'animate__animated animate__shakeX'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOut'
                }
            });
        });
};



const signUp = () => {
    createUserWithEmailAndPassword(auth, document.getElementById("regemail").value, document.getElementById("regpass").value).then(userCredential => {
        Swal.fire({
            icon: 'success',
            title: 'Registered Successfully',
            text: `Welcome, ${userCredential.user.email}!`,
            showClass: {
                popup: 'animate__animated animate__bounceIn'
            },
            hideClass: {
                popup: 'animate__animated animate__bounceOut'
            }
        }).then(() => location.href = "Login&SignUp.html");
    }).catch(error => {
        let errorMessage = 'An unknown error occurred. Please try again.';
        if (error.code === 'auth/email-already-in-use') errorMessage = 'The email address is already in use by another account.';
        else if (error.code === 'auth/weak-password') errorMessage = 'The password is too weak. Please choose a stronger password.';
        Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: errorMessage,
            showClass: {
                popup: 'animate__animated animate__shakeX'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOut'
            }
        });
    });
};

const forgotPassword = () => {
    hide(document.querySelector('.card-front .center-wrap'));
    show(document.getElementById("forgotPasswordForm"));
    const checkbox = document.getElementById("reg-log");
    hide(checkbox);
    checkbox.disabled = true;
};

const backToLogin = () => {
    show(document.querySelector('.card-front .center-wrap'));
    hide(document.getElementById("forgotPasswordForm"));
    const checkbox = document.getElementById("reg-log");
    show(checkbox);
    checkbox.disabled = false;
};

document.getElementById("submitBtn").addEventListener('click', signIn);
document.getElementById("register").addEventListener('click', signUp);
document.getElementById("forgotPassword").addEventListener("click", forgotPassword);
document.getElementById("backToLogin").addEventListener("click", backToLogin);

document.getElementById("sendResetLink").addEventListener("click", () => {
    const email = document.getElementById("forgotemail").value;
    sendPasswordResetEmail(auth, email).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Reset Email Sent',
            text: `An email has been sent to ${email} with instructions to reset your password.`,
            showClass: {
                popup: 'animate__animated animate__bounceIn'
            },
            hideClass: {
                popup: 'animate__animated animate__bounceOut'
            }
        }).then(() => location.href = "Login&SignUp.html");
    }).catch(error => {
        let errorMessage = 'An unknown error occurred. Please try again.';
        if (error.code === 'auth/user-not-found') errorMessage = 'No user found with this email address.';
        Swal.fire({
            icon: 'error',
            title: 'Reset Email Not Sent',
            text: errorMessage,
            showClass: {
                popup: 'animate__animated animate__shakeX'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOut'
            }
        });
    });
});