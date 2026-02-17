const navWrapper = document.querySelector(".nav-wrapper");
const navToggle = document.querySelector(".nav-toggle");
const navDrawer = document.querySelector(".nav-drawer");
const navLinks = document.querySelectorAll(".nav-drawer a");

const updateNavState = (isOpen) => {
  document.body.classList.toggle("nav-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  navDrawer.setAttribute("aria-hidden", String(!isOpen));
};

navToggle?.addEventListener("click", () => {
  const isOpen = document.body.classList.contains("nav-open");
  updateNavState(!isOpen);
});

const navClose = document.querySelector(".nav-close");
navClose?.addEventListener("click", () => updateNavState(false));

navLinks.forEach((link) => {
  link.addEventListener("click", () => updateNavState(false));
});

const onScroll = () => {
  if (!navWrapper) return;
  navWrapper.classList.toggle("scrolled", window.scrollY > 16);
};

window.addEventListener("scroll", onScroll);
onScroll();

/* Parallax: move bg layers at a fraction of scroll speed */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function updateParallax() {
  if (prefersReducedMotion) return;
  const y = window.scrollY;
  document.querySelectorAll("[data-parallax]").forEach((el) => {
    const rate = parseFloat(el.getAttribute("data-parallax")) || 0.5;
    const offset = y * rate * 0.5;
    el.style.transform = `translate3d(0, ${offset}px, 0)`;
  });
}

if (!prefersReducedMotion) {
  window.addEventListener("scroll", updateParallax, { passive: true });
  window.addEventListener("resize", updateParallax);
  updateParallax();
}

const prefersReducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

if (!prefersReducedMotionMedia.matches) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  document.querySelectorAll(".reveal").forEach((section) => observer.observe(section));
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
}

/* Stats count-up animation (Measurable wellness section) */
const statsSection = document.querySelector(".trust .stats");
const trustSection = document.querySelector(".trust");
const statNumbers = document.querySelectorAll(".stat-number");

function formatStatValue(value, prefix, suffix) {
  const formatted = value >= 1000 ? value.toLocaleString() : String(value);
  return prefix + formatted + suffix;
}

function animateValue(el, target, prefix, suffix, duration) {
  const start = 0;
  const startTime = performance.now();
  el.textContent = formatStatValue(0, prefix, suffix);

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 2);
    const current = Math.round(start + (target - start) * eased);
    el.textContent = formatStatValue(current, prefix, suffix);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = formatStatValue(target, prefix, suffix);
  }

  requestAnimationFrame(step);
}

function runStatsAnimation() {
  statNumbers.forEach((el) => {
    const value = parseInt(el.getAttribute("data-value"), 10);
    const prefix = el.getAttribute("data-prefix") || "";
    const suffix = el.getAttribute("data-suffix") || "";
    if (!Number.isNaN(value)) animateValue(el, value, prefix, suffix, 2600);
  });
}

if (statNumbers.length && !prefersReducedMotionMedia.matches) {
  const isMobile = () => window.innerWidth < 768;
  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        statsObserver.disconnect();
        runStatsAnimation();
      });
    },
    {
      threshold: isMobile() ? 0.15 : 0.4,
      rootMargin: isMobile() ? "0px 0px -5% 0px" : "0px 0px -15% 0px"
    }
  );
  const elementToObserve = isMobile() && trustSection ? trustSection : statsSection;
  if (elementToObserve) statsObserver.observe(elementToObserve);
} else if (statNumbers.length) {
  statNumbers.forEach((el) => {
    const value = parseInt(el.getAttribute("data-value"), 10);
    const prefix = el.getAttribute("data-prefix") || "";
    const suffix = el.getAttribute("data-suffix") || "";
    if (!Number.isNaN(value)) el.textContent = formatStatValue(value, prefix, suffix);
  });
}

/* Application form: character count for motivation field */
const motivationField = document.getElementById("motivation");
const motivationCountEl = document.getElementById("motivation-count");
if (motivationField && motivationCountEl) {
  const updateCount = () => {
    motivationCountEl.textContent = motivationField.value.length;
  };
  motivationField.addEventListener("input", updateCount);
  motivationField.addEventListener("paste", () => setTimeout(updateCount, 0));
  updateCount();
}

/* Application form: validation and submit */
const applicationForm = document.getElementById("fitcomm-application");
if (applicationForm) {
  const summaryEl = document.getElementById("form-errors-summary");
  const errorMessages = {
    "full-name": "Please enter your full name.",
    "email": "Please enter a valid email address.",
    "phone": "Please enter your phone number.",
    "financial": "Please select an option for financial commitment.",
    "program": "Please select whether you can commit to the program.",
    "transport": "Please select at least one transportation option.",
    "sessions": "Please select whether you can commit to mental health & nutrition sessions.",
    "scheduling": "Please provide your scheduling availability (or write \"None\" if fully available).",
    "motivation": "Please share your motivation for participating (at least a few sentences).",
    "activity": "Please select your current physical activity level.",
    "medical": "Please indicate any health conditions or physical limitations.",
    "clearance": "Please indicate whether you can provide medical clearance if required.",
    "ref-name": "Please provide your reference's full name.",
    "ref-phone": "Please provide your reference's phone number.",
  };

  function showError(id, message) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = message;
      el.classList.remove("hidden");
    }
  }

  function clearErrors() {
    applicationForm.querySelectorAll(".field-error").forEach((el) => {
      el.textContent = "";
      el.classList.add("hidden");
    });
    applicationForm.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    applicationForm.querySelectorAll(".form-block.has-error").forEach((el) => el.classList.remove("has-error"));
    if (summaryEl) {
      summaryEl.innerHTML = "";
      summaryEl.hidden = true;
    }
  }

  applicationForm.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();

    const form = e.target;
    const errors = [];

    if (!form.querySelector("#full-name")?.value?.trim()) {
      showError("full-name-error", errorMessages["full-name"]);
      errors.push({ id: "full-name", block: "contact-block" });
    }
    if (!form.querySelector("#email")?.value?.trim()) {
      showError("email-error", errorMessages["email"]);
      errors.push({ id: "email", block: "contact-block" });
    }
    if (!form.querySelector("#phone")?.value?.trim()) {
      showError("phone-error", errorMessages["phone"]);
      errors.push({ id: "phone", block: "contact-block" });
    }
    if (!form.querySelector("input[name=financial_barrier]:checked")) {
      showError("financial-error", errorMessages["financial"]);
      errors.push({ id: "field-financial", block: "field-financial" });
    }
    if (!form.querySelector("input[name=program_commitment]:checked")) {
      showError("program-error", errorMessages["program"]);
      errors.push({ id: "field-program", block: "field-program" });
    }
    const transportChecked = form.querySelectorAll("input[name=transport]:checked").length;
    if (!transportChecked) {
      showError("transport-error", errorMessages["transport"]);
      errors.push({ id: "field-transport", block: "field-transport" });
    }
    if (!form.querySelector("input[name=sessions_commitment]:checked")) {
      showError("sessions-error", errorMessages["sessions"]);
      errors.push({ id: "field-sessions", block: "field-sessions" });
    }
    if (!form.querySelector("#scheduling")?.value?.trim()) {
      showError("scheduling-error", errorMessages["scheduling"]);
      errors.push({ id: "scheduling", block: "field-scheduling" });
    }
    if (!form.querySelector("#motivation")?.value?.trim()) {
      showError("motivation-error", errorMessages["motivation"]);
      errors.push({ id: "motivation", block: "field-motivation" });
    }
    if (!form.querySelector("input[name=activity_level]:checked")) {
      showError("activity-error", errorMessages["activity"]);
      errors.push({ id: "field-activity", block: "field-activity" });
    }
    if (!form.querySelector("input[name=medical_conditions]:checked")) {
      showError("medical-error", errorMessages["medical"]);
      errors.push({ id: "field-medical", block: "field-medical" });
    }
    if (!form.querySelector("input[name=medical_clearance]:checked")) {
      showError("clearance-error", errorMessages["clearance"]);
      errors.push({ id: "field-clearance", block: "field-clearance" });
    }
    if (!form.querySelector("#ref-name")?.value?.trim()) {
      showError("ref-name-error", errorMessages["ref-name"]);
      errors.push({ id: "ref-name", block: "field-reference" });
    }
    if (!form.querySelector("#ref-phone")?.value?.trim()) {
      showError("ref-phone-error", errorMessages["ref-phone"]);
      errors.push({ id: "ref-phone", block: "field-reference" });
    }

    if (errors.length > 0) {
      if (summaryEl) {
        summaryEl.hidden = false;
        summaryEl.textContent =
          "Please complete all required fields before submitting. Check the messages below and fill in any missing information.";
        summaryEl.className = "form-errors-summary";
      }
      const firstBlockId = errors[0].block;
      const firstBlock = document.getElementById(firstBlockId) || applicationForm.querySelector("." + firstBlockId);
      if (firstBlock) {
        firstBlock.classList.add("has-error");
        const focusable = firstBlock.querySelector("input, textarea, select");
        if (focusable) focusable.focus();
        firstBlock.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      errors.forEach((err) => {
        const block = document.getElementById(err.block) || applicationForm.querySelector("." + err.block);
        if (block) block.classList.add("has-error");
      });
      return;
    }

    const btn = applicationForm.querySelector('button[type="submit"]');
    const actions = applicationForm.querySelector(".form-actions");
    btn.textContent = "Preparing Email…";
    btn.disabled = true;

    const formData = new FormData(applicationForm);
    const getValue = (name) => (formData.get(name) || "").toString().trim();
    const getValues = (name) =>
      formData
        .getAll(name)
        .map((v) => v.toString().trim())
        .filter(Boolean)
        .join(", ");

    const bodyLines = [
      "F.I.T.-COMM Challenge Application",
      `Submitted: ${new Date().toLocaleString()}`,
      "",
      "Contact Information",
      `Full Name: ${getValue("full_name")}`,
      `Email: ${getValue("email")}`,
      `Phone: ${getValue("phone")}`,
      "",
      "Application Responses",
      `Financial Barrier: ${getValue("financial_barrier")}`,
      `Program Commitment: ${getValue("program_commitment")}`,
      `Transportation: ${getValues("transport")}`,
      `Sessions Commitment: ${getValue("sessions_commitment")}`,
      `Scheduling Availability: ${getValue("scheduling")}`,
      `Motivation: ${getValue("motivation")}`,
      `Activity Level: ${getValue("activity_level")}`,
      `Medical Conditions / Limitations: ${getValue("medical_conditions")}`,
      `Medical Clearance: ${getValue("medical_clearance")}`,
      "",
      "Reference",
      `Reference Name: ${getValue("reference_name")}`,
      `Reference Phone: ${getValue("reference_phone")}`,
    ];

    const mailtoHref =
      "mailto:fitcommchallenge@gmail.com" +
      `?cc=${encodeURIComponent("x.thurman00@gmail.com")}` +
      `&subject=${encodeURIComponent("F.I.T.-COMM Challenge Application Submission")}` +
      `&body=${encodeURIComponent(bodyLines.join("\n"))}`;

    window.location.href = mailtoHref;

    btn.textContent = "Submit Application";
    btn.disabled = false;
    const existingNotice = applicationForm.querySelector(".form-success");
    if (existingNotice) existingNotice.remove();
    const notice = document.createElement("p");
    notice.className = "form-success";
    notice.setAttribute("role", "status");
    notice.textContent = "Your email app should open with your completed application. Please review and send it to fitcommchallenge@gmail.com.";
    applicationForm.insertBefore(notice, actions);
  });
}
