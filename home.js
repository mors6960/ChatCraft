const firebaseConfig = {
    apiKey: "AIzaSyBW5jAMQTZkKAOwA4SDB2VZejOmJVOdlQg",
    authDomain: "chatcraft-daa48.firebaseapp.com",
    projectId: "chatcraft-daa48",
    storageBucket: "chatcraft-daa48.appspot.com",
    messagingSenderId: "485631041952",
    appId: "1:485631041952:web:4fa5eba6bcacc15172c4c5",
    measurementId: "G-H0WG7MTFM5"
};
import {
    getStorage
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
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
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {
    getFirestore,
    addDoc,
    collection,
    onSnapshot,
    getDocs,
    query
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

document.addEventListener('DOMContentLoaded', function () {
    const optionLink = document.getElementById('optionLink');
    const cust = document.getElementById('cust');
    const customizeContent = document.getElementById('customizeContent');
    const uploadButton = document.getElementById('uploadDpButton');

    // Add event listener for the upload button
    uploadButton.addEventListener('click', uploadProfileImage);

    // Function to toggle customize content
    optionLink.addEventListener('click', toggleCustomizeContent);

    function toggleCustomizeContent() {
        var isCustomizeVisible = customizeContent.style.display === "block";
        customizeContent.style.display = isCustomizeVisible ? "none" : "block";
        cust.style.backgroundColor = isCustomizeVisible ? "#1F2029" : "#08080e6c";
        cust.classList.toggle("active");
    }

    // Function to upload profile image
    firebase.initializeApp(firebaseConfig);
    var storage = firebase.storage();

    function uploadProfileImage() {
        var fileinput = document.getElementById("newDpInput");
        var file = fileinput.files[0];

        var storageref = storage.ref('/profile/' + file.name);
        var task = storageref.put(file);

        task.on('state_changed',
            function progress(snapshot) {
                // Progress monitoring can be added here if needed
            },
            function error(error) {
                // Error handling
                console.error('Upload failed:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Upload Failed',
                    text: 'An error occurred while uploading the file. Please try again later.'
                });
            },
            async function complete() {
                console.log("File updated successfully");
                try {
                    const url = await storageref.getDownloadURL();
                    document.getElementById("rightNav-Profile").style.backgroundImage = 'url(' + url + ')';
                    document.getElementById("rightNav-Profile").style.backgroundSize = 'cover';
                    document.getElementById("rightNav-Profile").style.backgroundPosition = 'center';

                    Swal.fire({
                        icon: 'success',
                        title: 'Upload Successful',
                        text: 'Your profile picture has been updated successfully.'
                    }).then(() => {
                        changeDp.style.display = 'none';
                        newDpInput.value = '';
                        imagePreview.style.backgroundImage = 'none';
                    });
                } catch (error) {
                    console.error('Error getting download URL:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'An error occurred while getting download URL. Please try again later.'
                    });
                }
            }
        );
    }


    // Chat functionality
    const joinButton = document.getElementById("joinButton");
    const usernameInput = document.getElementById("usernameInput");
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const joinView = document.getElementById("joinView");
    const chatsView = document.getElementById("chatsView");
    let messages = [];
    let specifiedUsername = "";
    let userLoggedIn = false;

    (async () => {
        await loadAndWriteMessages();
        await subscribeToNewMessages();
    })();

    sendButton.addEventListener("click", async () => {
        const message = messageInput.value;
        messageInput.value = "";

        const docRef = await addDoc(collection(db, "messages"), {
            user: specifiedUsername,
            message: message,
            created: new Date(),
        });
        console.log(docRef);
    });

    function subscribeToNewMessages() {
        const q = query(collection(db, "messages"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const newMessages = [];
            querySnapshot.forEach((doc) => {
                newMessages.push({
                    id: doc.id,
                    ...doc.data(),
                });
            });

            let existingMessageHash = {};
            for (let message of messages) {
                existingMessageHash[message.id] = true;
            }

            for (let message of newMessages) {
                if (!existingMessageHash[message.id]) {
                    messages.push(message);
                }
            }

            loadAndWriteMessages(); // Update messages after new messages are received
        });
    }

    async function loadAndWriteMessages() {
        messages = [];
        const querySnapshot = await getDocs(collection(db, "messages"));
        querySnapshot.forEach((doc) => {
            messages.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        // Sort messages in ascending order by timestamp
        messages.sort((a, b) => a.created.seconds - b.created.seconds);
        messages.reverse();

        const messageList = document.getElementById("messageList");
        const shouldScrollToBottom = messageList.scrollTop === messageList.scrollHeight - messageList.clientHeight;

        const html = [];
        for (let message of messages) {
            html.push(messageTemplate(message.message, message.user, message.created));
        }
        document.getElementById("messageList").innerHTML = html.join("");

    }



    function messageTemplate(message, username, timestamp) {
        const isSentMessage = username === specifiedUsername; // Check if the message is sent by the current user
        const messageClass = isSentMessage ? 'sent-message' : 'received-message';
        return `
            <li class="message ${messageClass}">
                <div class="message-content">
                    <div class="username">${username}</div>
                    <div class="timestamp">${new Date(timestamp.seconds * 1000).toLocaleString()}</div>
                    <div class="message-text">${message}</div>
                </div>
            </li>
            <style>
            .message {
                list-style: none;
                margin: 0;
                padding: 0;
                clear: both;
                overflow: hidden;
                margin-bottom: 15px;
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.3s ease, transform 0.3s ease;
            }
            
            .sent-message {
                float: right;
                background-color: #DCF8C6;
                border-radius: 20px;
                max-width: 70%;
                word-break: break-all;
                padding: 10px 15px;
                margin-right: 10px;
                box-shadow: 2px 4px 8px #DCF8C6; /* Add a subtle shadow */
                animation: fadeInUp 0.5s ease forwards;
            }
            
            .received-message {
                float: left;
                background-color: #F0F0F0;
                border-radius: 20px;
                max-width: 70%;
                word-break: break-all;
                padding: 10px 15px;
                margin-left: 20px;
                box-shadow: 2px 4px 8px #F0F0F0; /* Add a subtle shadow */
                animation: fadeInUp 0.5s ease forwards;
            }
            
            .sent-message .username,
            .received-message .username {
                font-weight: bold;
                margin-bottom: 3px;
                color: #444; /* Username color */
            }
            
            .sent-message .timestamp,
            .received-message .timestamp {
                font-size: 12px;
                color: #888; /* Timestamp color */
            }
            
            .message-text {
                padding: 10px;
                font-size: 14px;
                color: #333333;
                font-weight: 500;
            }
            
            .message-content {
                margin-bottom: 5px;
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(120px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            </style>
        `;
    }
    // Sidebar functionality
    function toggleSidebarRight() {
        const side = document.getElementById("side");
        const slider = document.getElementById("slider");
        const sidebarRight = document.querySelector(".sidebar-right");
        const centercontent = document.getElementById("centercontent");

        sidebarRight.style.display = (sidebarRight.style.display === "none") ? "block" : "none";
        side.style.boxShadow = (sidebarRight.style.display === "none") ? "none" : "#";
        slider.style.boxShadow = "none";
    }

    document.getElementById("side").addEventListener("click", toggleSidebarRight);


    // Dropdown functionality
    document.addEventListener("DOMContentLoaded", function () {
        var dropdownToggles = document.querySelectorAll('.dropdown-toggle');

        dropdownToggles.forEach(function (toggle) {
            toggle.addEventListener('click', function () {
                var dropdown = this.nextElementSibling;

                if (dropdown.classList.contains('show')) {
                    dropdown.classList.remove('show');
                } else {
                    dropdown.classList.add('show');
                }
            });
        });
    });
    // Logout functionality
    document.getElementById('logOut').addEventListener('click', logOut);
    async function logOut(event) {
        event.preventDefault();
        await signOut(auth).then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Logout Successfully',
                confirmButtonText: 'Thanks for using our service \uD83D\uDE00'
            }).then(() => {
                window.location.href = "./Login&SignUp.html";
            });
        }).catch((error) => {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error.message
            });
        });
    }

    // Change password functionality
    const changePasswordLink = document.getElementById('changePassword');
    const changePassContainer = document.getElementById('changePass');
    const closeChangePassButton = document.getElementById('closeChangePass');
    const confirmChangeButton = document.getElementById('confirmChange');
    const backButton = document.getElementById('back');

    changePasswordLink.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default link behavior
        changePassContainer.classList.remove('hidden'); // Show the changePass container
    });

    closeChangePassButton.addEventListener('click', function () {
        changePassContainer.classList.add('hidden');
    });

    confirmChangeButton.addEventListener('click', async function () {
        const newPassword = document.getElementById('enterPass').value;
        const confirmPassword = document.getElementById('confirmPass').value;

        if (newPassword === confirmPassword) {
            // Matched passwords, proceed with changing the password in Firebase
            const user = auth.currentUser;
            await updatePassword(user, newPassword).then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Password Changed Successfully'
                });
                changePassContainer.classList.add('hidden'); // Hide the changePass container
            }).catch((error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: error.message
                });
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Passwords do not match. Please try again.'
            });
        }
    });


    // Change photo functionality
    backButton.addEventListener('click', function () {
        changePassContainer.classList.add('hidden');
    });

    const changePhotoLink = document.getElementById('changePhoto');
    const changeDp = document.querySelector('.changeDp');
    const closeChangeDp = document.getElementById('closeChangeDp');
    const newDpInput = document.getElementById('newDpInput');
    const imagePreview = document.getElementById('imagePreview');

    changePhotoLink.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent the default link behavior
        changeDp.style.display = 'block'; // Show the changeDp element
    });

    closeChangeDp.addEventListener('click', function () {
        changeDp.style.display = 'none'; // Hide the changeDp element when the close button is clicked
        newDpInput.value = ''; // Clear the file input value
        imagePreview.style.backgroundImage = 'none'; // Clear the background image
    });

    newDpInput.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function () {
                imagePreview.style.backgroundImage = `url('${reader.result}')`;
                imagePreview.style.backgroundPosition = 'center';
                imagePreview.style.backgroundRepeat = 'no-repeat';
                imagePreview.style.backgroundSize = 'contain';
            }
            reader.readAsDataURL(file);
        } else {
            imagePreview.style.backgroundImage = 'none';
        }
    });
    // });


    // Search functionality
    const searchIcon = document.getElementById("searchIcon");
    const searchBar = document.getElementById("searchBar");

    let searchBarVisible = false;

    searchIcon.addEventListener("click", function () {
        if (searchBarVisible) {
            searchBar.style.opacity = "0";
            setTimeout(() => {
                searchBar.style.display = "none";
            }, 300);
        } else {
            searchBar.style.display = "block";
            setTimeout(() => {
                searchBar.style.opacity = "1";
            }, 50);
        }
        searchBarVisible = !searchBarVisible;
    });

    const searchInput = document.getElementById("searchInput");
    const messageList = document.getElementById("messageList").getElementsByTagName("li");

    searchInput.addEventListener("input", function () {
        const searchTerm = this.value.toLowerCase();
        for (let message of messageList) {
            const messageText = message.textContent.toLowerCase();
            if (messageText.includes(searchTerm)) {
                message.style.display = "block";
            } else {
                message.style.display = "none";
            }
        }
    });


    messageInput.addEventListener("keypress", function (event) {
        if (event.keyCode === 13) {
            sendButton.click();
        }
    });


    ///VIDEO CALL WORKING WELL 
    const videoCallPopup = document.getElementById('videoCallPopup');
    const videoCallButton = document.querySelector('.fa-video');
    const senderVideo = document.getElementById('videoElement');
    const hangupButton = document.getElementById('hangup-button');
    const videoIcon = document.getElementById('video-icon');
    const microphoneIcon = document.getElementById('microphone-icon');
    const xmark = document.getElementById('xMark');
    const cameraWarning = document.getElementById('camera-warning');
    const microphoneWarning = document.getElementById('microphone-warning');
    const expandIcon = document.querySelector('.fa-expand');

    let localStream;
    let isVideoOn = true;
    let isMicrophoneOn = true;

    xmark.addEventListener('click', closeVideoCallPopup);
    videoCallButton.addEventListener('click', startVideoCall);
    hangupButton.addEventListener('click', endVideoCall);
    videoIcon.addEventListener('click', toggleVideo);
    microphoneIcon.addEventListener('click', toggleMicrophone);
    expandIcon.addEventListener('click', toggleFullScreen);

    async function startVideoCall() {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            senderVideo.srcObject = localStream;
            videoCallPopup.classList.remove('hidden');
            // Reset warnings and icons
            cameraWarning.style.display = 'none';
            microphoneWarning.style.display = 'none';
            toggleIcon(videoIcon, true);
            toggleIcon(microphoneIcon, true);
        } catch (error) {
            console.error("Error accessing the camera:", error);
        }
    }

    function closeVideoCallPopup() {
        videoCallPopup.classList.add('hidden');
        endVideoCall();
        exitFullScreen();
    }

    function endVideoCall() {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            senderVideo.srcObject = null;
            localStream = null;
        }
        console.log('Video call ended');
        videoCallPopup.classList.add('hidden');
        exitFullScreen();
    }

    function toggleIcon(iconElement, isActive) {
        iconElement.style.color = isActive ? "#333" : "red";
    }

    function toggleVideo() {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            isVideoOn = localStream.getVideoTracks()[0].enabled;
            toggleIcon(videoIcon, isVideoOn);
            cameraWarning.style.display = isVideoOn ? "none" : "block";
        }
    }

    function toggleMicrophone() {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            isMicrophoneOn = localStream.getAudioTracks()[0].enabled;
            toggleIcon(microphoneIcon, isMicrophoneOn);
            microphoneWarning.style.display = isMicrophoneOn ? "none" : "block";
        }
    }

    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            if (videoCallPopup.requestFullscreen) {
                videoCallPopup.requestFullscreen();
            } else if (videoCallPopup.webkitRequestFullscreen) {
                /* Safari */
                videoCallPopup.webkitRequestFullscreen();
            } else if (videoCallPopup.msRequestFullscreen) {
                /* IE11 */
                videoCallPopup.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                /* IE11 */
                document.msExitFullscreen();
            }
        }
    }

    function exitFullScreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            /* IE11 */
            document.msExitFullscreen();
        }
    }
});

///DARKMODE
const checkbox = document.getElementById('check-5');

checkbox.addEventListener('change', function () {
    const mainContent = document.querySelector('.main-content');
    const iconsToChangeColor = document.querySelectorAll('.list-item i');
    const iconsrightChangeColor = document.querySelectorAll('.right i')
    const navBar = document.querySelector('.header');
    const dropdownContent = document.querySelector('.dropdownuser-content');
    const dropdown1content = document.querySelector(".dropdown1-content");
    const sidebarLeft = document.querySelector('.sidebar-left');
    const sidebarHeading = document.querySelector('.sidebar-heading');
    const sidebarSearchInput = document.querySelector('.sidebar-search input');
    const sidebarContent = document.querySelector('.sidebar-content');
    const sidebarParagraphs = document.querySelectorAll('.sidebar-content p');
    const centerTopbar = document.querySelector('.centerTopbar');
    const bottominput = document.querySelector('.bottomInput');
    const bottominputIcon = document.querySelectorAll('.bottomInput i');
    const sidebarRight = document.querySelector('.sidebar-right');
    const sidebarRightOptions = document.querySelectorAll('.sidebarright-option i');
    const stacked = document.querySelector('.fa-boxes-stacked');
    const dropdownusersty = document.querySelector('.rightNav-Profile');

    if (this.checked) {
        // Light mode
        iconsToChangeColor.forEach(icon => {
            icon.style.color = '#9394a5';
            icon.style.backgroundColor = '#fafafa';
        });
        iconsrightChangeColor.forEach(icon => {
            icon.style.color = '#9394a5'
        })
        bottominputIcon.forEach(icon => {
            icon.style.color = '#9394a5';
        });
        sidebarParagraphs.forEach(paragraph => {
            paragraph.style.color = '#333333';
        });
        sidebarRightOptions.forEach(option => {
            option.style.color = '#9394a5';
        });

        navBar.style.backgroundColor = '#e4e5f1';
        navBar.style.color = '#9394a5';
        navBar.style.borderBottom = '2px solid black';
        mainContent.style.backgroundColor = '#e4e5f1';
        dropdownContent.style.backgroundColor = '#e4e5f1';
        dropdown1content.style.backgroundColor = '#e4e5f1';
        sidebarLeft.style.backgroundColor = '#e4e5f1';
        sidebarLeft.style.color = '#333333';
        sidebarLeft.style.borderRight = '2px solid black';
        sidebarHeading.style.color = '#333333';
        sidebarSearchInput.style.backgroundColor = '#ffffff';
        sidebarSearchInput.style.color = '#333333';
        sidebarContent.style.backgroundColor = '#E4E5F1';
        centerTopbar.style.backgroundColor = "#E4E5F1";
        centerTopbar.style.borderBottom = "2px solid black";
        bottominput.style.backgroundColor = "#e4e5f1";
        bottominput.style.borderTop = "2px solid black";
        sidebarRight.style.backgroundColor = '#e4e5f1';
        sidebarRight.style.borderLeft = '2px solid black';
        sidebarRight.style.color = "#333333";
        stacked.style.backgroundColor = '#fafafa';
        stacked.style.color = '#9394a5';
        dropdownusersty.style.backgroundColor = '#fafafa';
        dropdownusersty.style.color = '#9394a5';
        dropdownusersty.style.border = '1px solid black';

    } else {
        iconsToChangeColor.forEach(icon => {
            icon.style.color = '#BEC0CA';
            icon.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        });
        iconsrightChangeColor.forEach(icon => {
            icon.style.color = '#BEC0CA'
        })
        bottominputIcon.forEach(icon => {
            icon.style.color = '#BEC0CA';
        });
        sidebarParagraphs.forEach(paragraph => {
            paragraph.style.color = '#BEC0CA';
        });
        sidebarRightOptions.forEach(option => {
            option.style.color = '#BEC0CA';
        });
        navBar.style.backgroundColor = '#1F2029';
        navBar.style.color = '#BEC0CA';
        navBar.style.borderBottom = '2px solid #BEC0CA';
        mainContent.style.backgroundColor = '#2A2B38';
        dropdownContent.style.backgroundColor = '#2A2B38';
        dropdown1content.style.backgroundColor = '#2A2B38';
        sidebarLeft.style.backgroundColor = '#1F2029';
        sidebarLeft.style.color = '#BEC0CA';
        sidebarLeft.style.borderRight = '2px solid #BEC0CA';
        sidebarHeading.style.color = '#BEC0CA';
        sidebarSearchInput.style.backgroundColor = '#2A2B38';
        sidebarSearchInput.style.color = '#BEC0CA';
        sidebarContent.style.backgroundColor = '#1F2029';
        centerTopbar.style.backgroundColor = "#1F2029";
        centerTopbar.style.borderBottom = "none";
        bottominput.style.backgroundColor = "#1F2029"
        bottominput.style.borderTop = "none"
        sidebarRight.style.backgroundColor = '#1F2029';
        sidebarRight.style.borderLeft = '2px solid #BEC0CA';
        sidebarRight.style.color = "#BEC0CA";
        stacked.style.backgroundColor = '#2A2B38';
        stacked.style.color = '#8F909A';
        dropdownusersty.style.backgroundColor = '#2A2B38';
        dropdownusersty.style.color = '#8F909A';
        dropdownusersty.style.border = 'none';

    }
});