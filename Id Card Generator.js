/* ------------------ 1️⃣ FORMATTERS ------------------ */

function formatAdmissionYear(input) {
  let v = input.value.replace(/[^0-9]/g, "");
  if (v.length >= 4) {
    input.value = v.substring(0, 4) + "-" + v.substring(4, 6);
  } else {
    input.value = v;
  }
}

function formatUID(input) {
  let v = input.value.replace(/\D/g, "").substring(0, 12);
  input.value = v.match(/.{1,4}/g)?.join(" ") || "";
  input.classList.toggle("is-valid", v.length === 12);
  input.classList.toggle("is-invalid", v.length !== 12);
}

function formatMobile(input) {
  let v = input.value.replace(/\D/g, "").substring(0, 10);
  input.value = v.replace(/(\d{5})(\d+)/, "$1 $2");
  input.classList.toggle("is-valid", v.length === 10);
  input.classList.toggle("is-invalid", v.length !== 10);
}

/* ------------------ 2️⃣ DOB + AGE CHECK ------------------ */

(function setDobMax() {
  const dob = document.getElementById("dob");
  if (!dob) return;
  const today = new Date();
  const yyyy = today.getFullYear() - 17;
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  dob.max = `${yyyy}-${mm}-${dd}`;
})();

function isAtLeastAge(dateString, minAge = 17) {
  const dob = new Date(dateString);
  if (!dateString || isNaN(dob)) return false;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();

  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;

  return age >= minAge;
}

function validateAge(input) {
  const valid = isAtLeastAge(input.value, 17);
  input.classList.toggle("is-valid", valid);
  input.classList.toggle("is-invalid", !valid);
}

/* ------------------ 3️⃣ BLOOD GROUP + EMAIL ------------------ */

function isValidBloodGroup(v) {
  const valid = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  return valid.includes(v);
}

function isValidEmail(v) {
  const emailRe = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
  return emailRe.test(v);
}

/* ------------------ 4️⃣ MAIN LOGIC ------------------ */

document.addEventListener("DOMContentLoaded", () => {
  /* INPUTS & OUTPUTS */
  const inputs = {
    studentName: document.getElementById("studentName"),
    branch: document.getElementById("branch"),
    enrollmentNo: document.getElementById("enrollmentNo"),
    admissionYear: document.getElementById("admissionYear"),
    address: document.getElementById("address"),
    uid: document.getElementById("uid"),
    dob: document.getElementById("dob"),
    bloodGroup: document.getElementById("bloodGroup"),
    mobileStudent: document.getElementById("mobileStudent"),
    mobileParent: document.getElementById("mobileParent"),
    email: document.getElementById("email"),
  };

  const outputs = {
    studentName: document.getElementById("outName"),
    branch: document.getElementById("outBranch"),
    enrollmentNo: document.getElementById("outEnroll"),
    admissionYear: document.getElementById("outYear"),
    address: document.getElementById("outAddress"),
    uid: document.getElementById("outUid"),
    dob: document.getElementById("outDob"),
    bloodGroup: document.getElementById("outBlood"),
    mobileStudent: document.getElementById("outMobileS"),
    mobileParent: document.getElementById("outMobileP"),
    email: document.getElementById("outEmail"),
  };

  /* REAL TIME SYNC */
  Object.keys(inputs).forEach((key) => {
    inputs[key].addEventListener("input", () => {
      outputs[key].textContent = inputs[key].value || "-";
    });
  });

  /* BLOOD GROUP VALIDATION */
  inputs.bloodGroup.addEventListener("input", () => {
    let v = inputs.bloodGroup.value.toUpperCase();
    inputs.bloodGroup.value = v;
    const ok = isValidBloodGroup(v);
    inputs.bloodGroup.classList.toggle("is-valid", ok);
    inputs.bloodGroup.classList.toggle("is-invalid", !ok);
    outputs.bloodGroup.textContent = v || "-";
  });

  /* EMAIL VALIDATION */
  inputs.email.addEventListener("input", () => {
    const ok = isValidEmail(inputs.email.value);
    inputs.email.classList.toggle("is-valid", ok);
    inputs.email.classList.toggle("is-invalid", !ok);
    outputs.email.textContent = inputs.email.value || "-";
  });

  /* ------------------ FLIP CARD ------------------ */
  const flipBtn = document.getElementById("flipBtn");
  const wrapper = document.querySelector(".id-card-wrapper");
  const toggleFlip = () => wrapper.classList.toggle("flipped");

  document.getElementById("frontSide").addEventListener("click", toggleFlip);
  document.getElementById("backSide").addEventListener("click", toggleFlip);
  flipBtn.addEventListener("click", toggleFlip);

  // /* ------------------ PROFILE PICTURE ------------------ */
  const profileInp = document.getElementById("profilePic");
  const profileOut = document.querySelector(".profile-picture");

  /* ------------------ PROFILE PIC CROPPER ------------------ */

  let cropper;
  const cropModal = new bootstrap.Modal(document.getElementById("cropModal"));
  const cropImage = document.getElementById("cropImage");
  const rotateLeft = document.getElementById("rotateLeft");
  const rotateRight = document.getElementById("rotateRight");
  const cropDone = document.getElementById("cropDone");

  profileInp.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      cropImage.src = reader.result;

      cropModal.show();

      // Wait for image to load
      cropImage.onload = () => {
        if (cropper) cropper.destroy();

        cropper = new Cropper(cropImage, {
          aspectRatio: 1, // perfect square
          viewMode: 1,
          dragMode: "move",
          responsive: true,
          autoCropArea: 1,
          background: false,
          zoomOnTouch: true,
          zoomOnWheel: true,
        });
      };
    };
    reader.readAsDataURL(file);
  });

  // ROTATE
  rotateLeft.addEventListener("click", () => {
    if (cropper) cropper.rotate(-90);
  });
  rotateRight.addEventListener("click", () => {
    if (cropper) cropper.rotate(90);
  });

  // DONE BUTTON
  cropDone.addEventListener("click", () => {
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({
      width: 500,
      height: 500,
      fillColor: "#fff",
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    });

    profileOut.src = canvas.toDataURL("image/png");

    cropModal.hide();
  });

  /* ------------------ DISABLE DOWNLOAD UNTIL READY ------------------ */
  const downloadBtn = document.getElementById("downloadBtn");

  function checkInputs() {
    downloadBtn.disabled = !(inputs.studentName.value && profileInp.value);
  }

  inputs.studentName.addEventListener("input", checkInputs);
  profileInp.addEventListener("change", checkInputs);
  checkInputs();
});

/* ------------------ SIMPLE PDF EXPORT ------------------ */
async function enableDownload() {
  downloadBtn.textContent = "Preparing...";
  downloadBtn.disabled = true;

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF("p", "mm", "a4");

  // FRONT CAPTURE
  const front = await html2canvas(document.getElementById("frontSide"), {
    scale: 3,
    useCORS: true,
  });

  // FIX: temporarily unflip the back side
  const backSideEl = document.getElementById("backSide");
  const originalTransform = backSideEl.style.transform;
  // REMOVE flip so it captures normally
  backSideEl.style.transform = "rotateY(0deg)";
  // small pause so browser reflows
  await new Promise((res) => setTimeout(res, 50));
  // capture back side normally
  const back = await html2canvas(backSideEl, {
    scale: 3,
    useCORS: true,
  });
  // restore flip animation
  backSideEl.style.transform = originalTransform;

  const frontImg = front.toDataURL("image/png");
  const backImg = back.toDataURL("image/png");

  const w = 54,
    h = 84; // card size (simple version)
  const gap = 10;
  const startX = (210 - (w * 2 + gap)) / 2;
  const startY = 40;

  pdf.addImage(frontImg, "PNG", startX, startY, w, h);
  pdf.addImage(backImg, "PNG", startX + w + gap, startY, w, h);

  pdf.save(`${inputs.studentName.value || "ID_Card"}.pdf`);

  downloadBtn.textContent = "Download";
  downloadBtn.disabled = false;
}

/* ------------------ FIREBASE AUTH ------------------ */
const firebaseConfig = {
  apiKey: "AIzaSyBCbM-zQRLynlQ_Im73idNO-4UH2e28T7Q",
  authDomain: "id-card-app-cfbce.firebaseapp.com",
  projectId: "id-card-app-cfbce",
  storageBucket: "id-card-app-cfbce.firebasestorage.app",
  messagingSenderId: "355945691586",
  appId: "1:355945691586:web:92dd4af9044a80aa7afe5b",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

function updateNavbarUser(user) {
  const signInBtn = document.getElementById("signInBtn");
  const userBadge = document.getElementById("userBadge");
  const userEmail = document.getElementById("userEmail");

  if (!signInBtn || !userBadge || !userEmail) return;

  if (user) {
    signInBtn.classList.add("d-none");
    userBadge.classList.remove("d-none");
    userBadge.classList.add("d-flex");
    userEmail.textContent = user.email || "Logged in";
  } else {
    signInBtn.classList.remove("d-none");
    userBadge.classList.add("d-none");
    userBadge.classList.remove("d-flex");
    userEmail.textContent = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const signInBtn = document.getElementById("signInBtn");
  if (signInBtn) {
    signInBtn.addEventListener("click", loginWithGoogle);
  }

  auth.onAuthStateChanged((user) => {
    updateNavbarUser(user);
    window.currentUser = user || null;

    if (user) {
      // ✅ Redirect logic here
      if (sessionStorage.getItem("redirectAfterLogin")) {
        const target = sessionStorage.getItem("redirectAfterLogin");
        sessionStorage.removeItem("redirectAfterLogin");

        if (target === "download") {
          enableDownload(); // resume action
        }
      }
    }
  });
});

function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();

  firebase
    .auth()
    .signInWithPopup(provider)
    .then((result) => {
      const user = result.user;

      alert("Logged in as: " + user.email);

      // Save user globally
      window.currentUser = user;
    })
    .catch((error) => {
      console.error(error);
    });
}

function showError(message) {
  const errorDiv = document.getElementById("errorMsg");
  errorDiv.innerText = message;
  errorDiv.style.display = "block";

  setTimeout(() => {
    errorDiv.style.display = "none";
  }, 3000); // 3 seconds
}

function handleDownload() {
  if (!window.currentUser) {
    sessionStorage.setItem("redirectAfterLogin", "download"); // remember intent
    showError("Please login before downloading!");
    loginWithGoogle(); // trigger login
    return;
  }

  enableDownload();
}

/* ------------------ LOGOUT ------------------ */
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", logoutUser);
}

function logoutUser() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // ✅ Clear stored session data
      sessionStorage.clear();
      localStorage.clear();

      // Optional: reset user
      window.currentUser = null;

      alert("Logged out successfully!");

      // Optional UI reset
      location.reload(); // clean reset
    })
    .catch((error) => {
      console.error("Logout Error:", error);
    });
}
