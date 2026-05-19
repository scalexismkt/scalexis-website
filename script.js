const root = document.documentElement;
const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const mainNavigation = document.querySelector(".main-nav");
const consultationModal = document.querySelector(".consultation-modal");
const consultationTriggers = document.querySelectorAll("[data-consultation-trigger]");
const consultationCloseButtons = document.querySelectorAll("[data-consultation-close]");
const consultationForms = document.querySelectorAll(".consultation-form");
const LEAD_CAPTURE_ENDPOINT = "";
const consultationFirstField = consultationModal?.querySelector(
  '.consultation-form input:not([type="hidden"])'
);

document.querySelectorAll(".reveal").forEach((element) => {
  const delay = element.getAttribute("data-delay") || "0";
  element.style.setProperty("--delay", `${delay}ms`);
});

document.querySelectorAll(".text-hover-line").forEach((element) => {
  const tokens = [...element.textContent.matchAll(/(\S+)(\s*)/g)];
  element.textContent = "";

  tokens.forEach((token) => {
    const word = document.createElement("span");
    word.className = "text-word";
    word.textContent = token[1];
    element.appendChild(word);

    if (token[2]) {
      element.appendChild(document.createTextNode(token[2]));
    }
  });
});

const closeMenu = () => {
  root.classList.remove("nav-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Open navigation menu");
};

const toggleMenu = () => {
  const isOpen = root.classList.toggle("nav-open");
  menuToggle?.setAttribute("aria-expanded", String(isOpen));
  menuToggle?.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu"
  );
};

menuToggle?.addEventListener("click", toggleMenu);

const openConsultationModal = () => {
  if (!consultationModal) return;

  consultationModal.hidden = false;
  root.classList.add("modal-open");
  closeMenu();
  requestAnimationFrame(() => consultationFirstField?.focus());
};

const closeConsultationModal = () => {
  if (!consultationModal) return;

  consultationModal.hidden = true;
  root.classList.remove("modal-open");
};

consultationTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    openConsultationModal();
  });
});

consultationCloseButtons.forEach((button) => {
  button.addEventListener("click", closeConsultationModal);
});

consultationForms.forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    if (!LEAD_CAPTURE_ENDPOINT) {
      alert(
        "The form is almost ready. Please connect the Google Apps Script URL first."
      );
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton?.textContent;
    const formData = new FormData(form);

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }

    try {
      await fetch(LEAD_CAPTURE_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      window.location.href = new URL("thank-you.html", window.location.href).href;
    } catch (error) {
      alert(
        "Sorry, the form could not be submitted right now. Please try again in a moment."
      );

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
});

mainNavigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("click", (event) => {
  if (!root.classList.contains("nav-open")) return;
  if (siteHeader?.contains(event.target)) return;
  closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    clearActiveService();
    closeConsultationModal();
  }
});

document.querySelectorAll(".text-word").forEach((word) => {
  word.addEventListener("pointerdown", () => {
    const parent = word.closest(".text-hover-line");
    parent?.querySelectorAll(".text-word.is-active").forEach((activeWord) => {
      activeWord.classList.remove("is-active");
    });
    word.classList.add("is-active");
  });
});

const servicesSection = document.querySelector(".services-section");
const serviceItems = document.querySelectorAll(".service-item");
const servicePanels = document.querySelectorAll(".service-detail-panel");
const serviceCardClose = document.querySelector(".service-card-close");
const faqItems = document.querySelectorAll(".faq-item");
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
const isMobileLayout = () => window.innerWidth <= 760;
const workSection = document.querySelector(".work-section");
const workPoints = document.querySelectorAll(".work-point");
let targetWorkProgress = 0;
let renderedWorkProgress = 0;

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

const setActiveService = (serviceKey) => {
  if (!servicesSection || !serviceKey) return;

  servicesSection.classList.add("has-active");
  serviceItems.forEach((item) => {
    item.classList.toggle("is-active", item.dataset.service === serviceKey);
  });
  servicePanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.panel === serviceKey);
  });
};

const clearActiveService = () => {
  servicesSection?.classList.remove("has-active");
  serviceItems.forEach((item) => item.classList.remove("is-active"));
  servicePanels.forEach((panel) => panel.classList.remove("is-active"));
};

serviceCardClose?.addEventListener("click", clearActiveService);

const openFaqItem = (targetItem) => {
  faqItems.forEach((item) => {
    const isTarget = item === targetItem;
    const answer = item.querySelector(".faq-answer");
    const button = item.querySelector(".faq-question");

    item.classList.toggle("is-open", isTarget);
    button?.setAttribute("aria-expanded", String(isTarget));

    if (answer) {
      answer.hidden = !isTarget;
    }
  });
};

faqItems.forEach((item) => {
  item.querySelector(".faq-question")?.addEventListener("click", () => {
    openFaqItem(item.classList.contains("is-open") ? null : item);
  });
});

serviceItems.forEach((item) => {
  item.addEventListener("pointerenter", () => {
    if (canHover.matches && !isMobileLayout()) setActiveService(item.dataset.service);
  });

  item.addEventListener("pointerleave", () => {
    if (canHover.matches && !isMobileLayout()) clearActiveService();
  });

  item.addEventListener("focus", () => {
    if (!isMobileLayout()) setActiveService(item.dataset.service);
  });

  item.addEventListener("blur", () => {
    if (canHover.matches && !isMobileLayout()) clearActiveService();
  });

  item.addEventListener("click", () => {
    if (canHover.matches && !isMobileLayout()) return;

    setActiveService(item.dataset.service);
  });
});

document.addEventListener("pointerdown", (event) => {
  if (canHover.matches && !isMobileLayout()) return;
  if (!servicesSection?.classList.contains("has-active")) return;
  if (servicesSection.contains(event.target)) return;
  clearActiveService();
});

const calculateWorkProgress = () => {
  if (!workSection) return 0;
  const rect = workSection.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const scrollable = Math.max(rect.height - viewportHeight, viewportHeight * 0.8);

  return clamp((viewportHeight * 0.72 - rect.top) / scrollable);
};

const applyWorkProgress = (progress) => {
  if (!workSection) return;

  workSection.style.setProperty("--work-progress", progress.toFixed(4));
  workSection.classList.toggle("is-complete", progress > 0.96);

  if (isMobileLayout()) {
    workPoints.forEach((point) => {
      point.classList.add("is-visible");
      point.classList.remove("is-active");
    });
    return;
  }

  const revealPoints = [0.1, 0.27, 0.46, 0.66, 0.84];
  workPoints.forEach((point, index) => {
    point.classList.toggle("is-visible", progress >= revealPoints[index]);
    point.classList.remove("is-active");
  });
};

const syncWorkSection = () => {
  targetWorkProgress = calculateWorkProgress();
};

const animateWorkProgress = () => {
  renderedWorkProgress += (targetWorkProgress - renderedWorkProgress) * 0.16;

  if (Math.abs(targetWorkProgress - renderedWorkProgress) < 0.001) {
    renderedWorkProgress = targetWorkProgress;
  }

  applyWorkProgress(renderedWorkProgress);
  requestAnimationFrame(animateWorkProgress);
};

requestAnimationFrame(() => {
  root.classList.add("is-ready");
  syncWorkSection();
  renderedWorkProgress = targetWorkProgress;
  applyWorkProgress(renderedWorkProgress);
  animateWorkProgress();
});

const syncHeader = () => {
  root.classList.toggle("is-scrolled", window.scrollY > 8);
};

const syncScrollEffects = () => {
  syncHeader();
  syncWorkSection();
  if (window.innerWidth <= 760 && root.classList.contains("nav-open")) {
    closeMenu();
  }
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.28 }
);

document.querySelectorAll(".section-reveal").forEach((element) => {
  sectionObserver.observe(element);
});

syncScrollEffects();
window.addEventListener("scroll", syncScrollEffects, { passive: true });
window.addEventListener("resize", syncScrollEffects);
