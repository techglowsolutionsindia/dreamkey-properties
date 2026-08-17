"use strict";

// ========================================
// ELEMENTS
// ========================================

const navbar = document.querySelector("[data-navbar]");
const navToggler = document.querySelector("[data-nav-toggler]");
const header = document.querySelector("[data-header]");
const navbarLinks = document.querySelectorAll(".navbar-link");
const favoriteButtons = document.querySelectorAll(".fav-btn");

// ========================================
// MOBILE NAVIGATION TOGGLE
// ========================================

if (navbar && navToggler) {
  navToggler.addEventListener("click", () => {
    navbar.classList.toggle("active");
    navToggler.classList.toggle("active");

    const isOpen = navbar.classList.contains("active");

    navToggler.setAttribute("aria-expanded", String(isOpen));

    navToggler.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu",
    );
  });
}

// ========================================
// NAVBAR LINK SELECTION
// ========================================

navbarLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navbarLinks.forEach((item) => {
      item.classList.remove("active");
      item.removeAttribute("aria-current");
    });

    link.classList.add("active");
    link.setAttribute("aria-current", "page");

    // Close mobile navigation after selecting a link
    if (navbar) {
      navbar.classList.remove("active");
    }

    if (navToggler) {
      navToggler.classList.remove("active");
      navToggler.setAttribute("aria-expanded", "false");
      navToggler.setAttribute("aria-label", "Open navigation menu");
    }
  });
});

// ========================================
// STICKY HEADER
// ========================================

window.addEventListener("scroll", () => {
  if (!header) return;

  header.classList.toggle("active", window.scrollY > 50);
});

// ========================================
// FAVORITE PROPERTY BUTTONS
// ========================================

favoriteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("active");

    const isFavorite = button.classList.contains("active");

    button.setAttribute(
      "aria-label",
      isFavorite ? "remove from favorites" : "add to favorites",
    );
  });
});

// PROPERTIES SECTION SLIDER STARTED

const propertySlider = document.querySelector("#properties .property-slider");

const propertyTrack = document.querySelector("#properties .property-list");

const propertyCards = Array.from(
  document.querySelectorAll("#properties .property-list > .card"),
);

const propertyPrevButton = document.querySelector("#properties .property-prev");

const propertyNextButton = document.querySelector("#properties .property-next");

const propertyDotsContainer = document.querySelector(
  "#properties .property-slider-dots",
);

if (
  propertySlider &&
  propertyTrack &&
  propertyCards.length &&
  propertyPrevButton &&
  propertyNextButton &&
  propertyDotsContainer
) {
  let currentIndex = 0;
  let visibleCards = 4;
  let maximumIndex = 4;

  const getVisibleCards = () => {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 991) return 2;

    return 4;
  };

  const updateSlider = () => {
    const cardWidth = propertyCards[0].getBoundingClientRect().width;
    const gap = 16;
    const moveDistance = currentIndex * (cardWidth + gap);

    propertyTrack.style.transform = `translate3d(-${moveDistance}px, 0, 0)`;

    propertyPrevButton.disabled = currentIndex === 0;
    propertyNextButton.disabled = currentIndex === maximumIndex;

    const dots = propertyDotsContainer.querySelectorAll(".property-slider-dot");

    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });
  };

  const createDots = () => {
    propertyDotsContainer.innerHTML = "";

    for (let index = 0; index <= maximumIndex; index += 1) {
      const dot = document.createElement("button");

      dot.type = "button";
      dot.className = "property-slider-dot";
      dot.setAttribute("aria-label", `Show property position ${index + 1}`);

      dot.addEventListener("click", () => {
        currentIndex = index;
        updateSlider();
      });

      propertyDotsContainer.appendChild(dot);
    }
  };

  const setSliderLayout = () => {
    visibleCards = getVisibleCards();
    maximumIndex = Math.max(0, propertyCards.length - visibleCards);

    currentIndex = Math.min(currentIndex, maximumIndex);

    createDots();

    window.requestAnimationFrame(updateSlider);
  };

  propertyNextButton.addEventListener("click", () => {
    if (currentIndex >= maximumIndex) return;

    currentIndex += 1;
    updateSlider();
  });

  propertyPrevButton.addEventListener("click", () => {
    if (currentIndex <= 0) return;

    currentIndex -= 1;
    updateSlider();
  });

  propertySlider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      propertyNextButton.click();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      propertyPrevButton.click();
    }
  });

  let resizeTimer;

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setSliderLayout, 150);
  });

  setSliderLayout();
}

// PROPERTIES SECTION SLIDER ENDED

// TESTIMONIAL SLIDER STARTED

const testimonialSlider = document.querySelector(".testimonials-slider");
const testimonialTrack = document.querySelector(
  ".testimonials-section .story-list",
);
const testimonialCards = Array.from(
  document.querySelectorAll(".testimonials-section .story-list > .story-card"),
);
const testimonialPrevButton = document.querySelector(".testimonial-prev");
const testimonialNextButton = document.querySelector(".testimonial-next");
const testimonialDotsContainer = document.querySelector(
  ".testimonial-slider-dots",
);

if (
  testimonialSlider &&
  testimonialTrack &&
  testimonialCards.length &&
  testimonialPrevButton &&
  testimonialNextButton &&
  testimonialDotsContainer
) {
  let testimonialCurrentIndex = 0;
  let testimonialVisibleCards = 3;
  let testimonialMaximumIndex = 3;

  const getTestimonialVisibleCards = () => {
    if (window.innerWidth <= 575) return 1;
    if (window.innerWidth <= 991) return 2;

    return 3;
  };

  const updateTestimonialSlider = () => {
    const cardWidth = testimonialCards[0].getBoundingClientRect().width;
    const gap = 26;
    const moveDistance = testimonialCurrentIndex * (cardWidth + gap);

    testimonialTrack.style.transform = `translate3d(-${moveDistance}px, 0, 0)`;

    testimonialPrevButton.disabled = testimonialCurrentIndex === 0;
    testimonialNextButton.disabled =
      testimonialCurrentIndex === testimonialMaximumIndex;

    const dots = testimonialDotsContainer.querySelectorAll(
      ".testimonial-slider-dot",
    );

    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === testimonialCurrentIndex);
    });
  };

  const createTestimonialDots = () => {
    testimonialDotsContainer.innerHTML = "";

    for (let index = 0; index <= testimonialMaximumIndex; index += 1) {
      const dot = document.createElement("button");

      dot.type = "button";
      dot.className = "testimonial-slider-dot";
      dot.setAttribute("aria-label", `Show testimonial position ${index + 1}`);

      dot.addEventListener("click", () => {
        testimonialCurrentIndex = index;
        updateTestimonialSlider();
      });

      testimonialDotsContainer.appendChild(dot);
    }
  };

  const setTestimonialSliderLayout = () => {
    testimonialVisibleCards = getTestimonialVisibleCards();

    testimonialMaximumIndex = Math.max(
      0,
      testimonialCards.length - testimonialVisibleCards,
    );

    testimonialCurrentIndex = Math.min(
      testimonialCurrentIndex,
      testimonialMaximumIndex,
    );

    createTestimonialDots();
    window.requestAnimationFrame(updateTestimonialSlider);
  };

  testimonialNextButton.addEventListener("click", () => {
    if (testimonialCurrentIndex >= testimonialMaximumIndex) return;

    testimonialCurrentIndex += 1;
    updateTestimonialSlider();
  });

  testimonialPrevButton.addEventListener("click", () => {
    if (testimonialCurrentIndex <= 0) return;

    testimonialCurrentIndex -= 1;
    updateTestimonialSlider();
  });

  testimonialSlider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      testimonialNextButton.click();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      testimonialPrevButton.click();
    }
  });

  let testimonialResizeTimer;

  window.addEventListener("resize", () => {
    clearTimeout(testimonialResizeTimer);
    testimonialResizeTimer = setTimeout(setTestimonialSliderLayout, 150);
  });

  setTestimonialSliderLayout();
}

// TESTIMONIAL SLIDER ENDED

// CONTACT FORM FIELD VALIDATION STARTED

const contactForm = document.querySelector("#contact-form");
const contactFormMessage = document.querySelector("#contact-form-message");

if (contactForm) {
  const setFieldError = (fieldName, message) => {
    const field = contactForm.elements[fieldName];
    const error = contactForm.querySelector(`[data-error-for="${fieldName}"]`);

    if (!field || !error) return;

    field.classList.toggle("is-invalid", Boolean(message));
    error.textContent = message;
  };

  const clearFieldErrors = () => {
    ["name", "phone", "email", "purpose", "message"].forEach((fieldName) => {
      setFieldError(fieldName, "");
    });

    if (contactFormMessage) {
      contactFormMessage.className = "contact-form-message";
      contactFormMessage.textContent = "";
    }
  };

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    clearFieldErrors();

    const name = contactForm.elements["name"].value.trim();
    const phone = contactForm.elements["phone"].value.trim();
    const email = contactForm.elements["email"].value.trim();
    const purpose = contactForm.elements["purpose"].value;
    const message = contactForm.elements["message"].value.trim();

    const namePattern = /^[A-Za-z\s]{2,}$/;
    const phonePattern = /^[0-9]{10}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let isValid = true;

    if (!name) {
      setFieldError("name", "Full name is required.");
      isValid = false;
    } else if (!namePattern.test(name)) {
      setFieldError("name", "Enter a valid name using letters only.");
      isValid = false;
    }

    if (!phone) {
      setFieldError("phone", "Phone number is required.");
      isValid = false;
    } else if (!phonePattern.test(phone)) {
      setFieldError("phone", "Enter a valid 10 digit phone number.");
      isValid = false;
    }

    if (!email) {
      setFieldError("email", "Email address is required.");
      isValid = false;
    } else if (!emailPattern.test(email)) {
      setFieldError("email", "Enter a valid email address.");
      isValid = false;
    }

    if (!purpose) {
      setFieldError("purpose", "Please select a purpose.");
      isValid = false;
    }

    if (message && message.length < 10) {
      setFieldError("message", "Message must be at least 10 characters.");
      isValid = false;
    }

    if (!isValid) return;

    if (contactFormMessage) {
      contactFormMessage.textContent =
        "Thank you! Your message has been received. Our team will contact you soon.";
      contactFormMessage.classList.add("success");
    }

    contactForm.reset();
  });
}

// CONTACT FORM FIELD VALIDATION ENDED

// CONTACT FORM INPUT RESTRICTIONS STARTED

const contactNameInput = document.querySelector(
  '#contact-form input[name="name"]',
);
const contactPhoneInput = document.querySelector(
  '#contact-form input[name="phone"]',
);

if (contactNameInput) {
  contactNameInput.addEventListener("input", () => {
    contactNameInput.value = contactNameInput.value.replace(/[^A-Za-z\s]/g, "");
  });
}

if (contactPhoneInput) {
  contactPhoneInput.addEventListener("input", () => {
    contactPhoneInput.value = contactPhoneInput.value.replace(/[^0-9]/g, "");
  });
}

/* ==================================================
   INDEX NAVBAR ACTIVE LINK ON SCROLL
================================================== */

const indexNavLinks = document.querySelectorAll(
  ".navbar-list > li > .navbar-link",
);

const indexProjectToggle = document.querySelector(".navbar-dropdown-toggle");

const indexProjectDropdownLinks = document.querySelectorAll(
  ".navbar-dropdown-link",
);

/* ==================================================
   SECTIONS USED BY CURRENT INDEX NAVBAR
================================================== */

const indexNavSections = [
  {
    id: "about",
    nav: "#about",
  },

  {
    id: "why-us",
    nav: "#why-us",
  },

  {
    id: "featured-projects",
    nav: "projects",
  },

  {
    id: "ongoing-projects",
    nav: "projects",
  },

  {
    id: "ready-to-move-projects",
    nav: "projects",
  },

  {
    id: "new-launches",
    nav: "projects",
  },

  {
    id: "luxury-homes",
    nav: "projects",
  },

  {
    id: "our-services",
    nav: "#our-services",
  },

  {
    id: "buying-process",
    nav: "#buying-process",
  },
];

/* ==================================================
   REMOVE CURRENT ACTIVE NAVBAR STATE
================================================== */

function clearIndexActiveNav() {
  indexNavLinks.forEach((link) => {
    link.classList.remove("active");
    link.removeAttribute("aria-current");
  });

  indexProjectDropdownLinks.forEach((link) => {
    link.classList.remove("active");
    link.removeAttribute("aria-current");
  });
}

/* ==================================================
   SET CURRENT ACTIVE NAVBAR LINK
================================================== */

function setIndexActiveNav(navTarget, sectionId = "") {
  clearIndexActiveNav();

  /* PROJECTS DROPDOWN */
  if (navTarget === "projects") {
    if (indexProjectToggle) {
      indexProjectToggle.classList.add("active");
      indexProjectToggle.setAttribute("aria-current", "page");
    }

    const activeProjectLink = document.querySelector(
      `.navbar-dropdown-link[href="#${sectionId}"]`,
    );

    if (activeProjectLink) {
      activeProjectLink.classList.add("active");
      activeProjectLink.setAttribute("aria-current", "page");
    }

    return;
  }

  /* NORMAL NAVBAR LINKS */
  const activeLink = document.querySelector(
    `.navbar-link[href="${navTarget}"]`,
  );

  if (activeLink) {
    activeLink.classList.add("active");
    activeLink.setAttribute("aria-current", "page");
  }
}

/* ==================================================
   DETECT CURRENT SECTION WHILE SCROLLING
================================================== */

function updateIndexActiveNavOnScroll() {
  const headerHeight = header ? header.getBoundingClientRect().height : 72;

  const detectionPoint = window.scrollY + headerHeight + 120;

  /*
   * Find the actual section currently crossing
   * the detection point.
   */
  const allPageSections = document.querySelectorAll("main section, section");

  let visibleSectionId = null;

  allPageSections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (detectionPoint >= sectionTop && detectionPoint < sectionBottom) {
      visibleSectionId = section.id;
    }
  });

  /*
   * If current section has no ID,
   * keep navbar completely inactive.
   */
  if (!visibleSectionId) {
    clearIndexActiveNav();
    return;
  }

  /*
   * Check whether current section belongs
   * to one of the navbar menu items.
   */
  const matchingNavSection = indexNavSections.find(
    (sectionData) => sectionData.id === visibleSectionId,
  );

  /*
   * Current section is NOT represented
   * in navbar -> remove all active states.
   *
   * Examples:
   * FAQ
   * Contact
   * other homepage sections
   */
  if (!matchingNavSection) {
    clearIndexActiveNav();
    return;
  }

  /*
   * Current section has a navbar link.
   */
  setIndexActiveNav(matchingNavSection.nav, matchingNavSection.id);
}

/* ==================================================
   UPDATE ACTIVE NAV ON SCROLL
================================================== */

window.addEventListener("scroll", updateIndexActiveNavOnScroll, {
  passive: true,
});

/* ==================================================
   UPDATE ACTIVE NAV ON PAGE LOAD
================================================== */

window.addEventListener("load", updateIndexActiveNavOnScroll);

/* ==================================================
   UPDATE AFTER WINDOW RESIZE
================================================== */

window.addEventListener("resize", updateIndexActiveNavOnScroll);

// PROPERTIES FOR SALE FAVOURITE BUTTON STARTED

const propertyFavouriteButtons = document.querySelectorAll(
  ".property-favourite-button",
);

propertyFavouriteButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    button.classList.toggle("is-favourite");

    const isFavourite = button.classList.contains("is-favourite");

    button.setAttribute(
      "aria-label",
      isFavourite
        ? "Remove property from favourites"
        : "Add property to favourites",
    );
  });
});

// PROPERTIES FOR SALE FAVOURITE BUTTON ENDED

/* ==================================================
   HOMEPAGE FEATURED PROJECTS
   LOAD DATA FROM EXCEL GENERATED JSON
================================================== */

const homepageFeaturedSection = document.querySelector("#featured-projects");

const homepageFeaturedTrack = document.querySelector(
  "[data-homepage-featured-track]",
);

/* ==================================================
   CREATE HOMEPAGE PROJECT CARD
================================================== */

const createHomepageFeaturedCard = (project) => {
  return `
    <article class="featured-project-card">
      <div class="featured-project-image-wrap">
        <a
          href="./${project.url}"
          class="featured-project-image"
          aria-label="View ${project.name} project details"
        >
          <img
            src="./${project.image}"
            alt="${project.name} residential project"
            loading="lazy"
          />

          <span class="featured-project-badge">
            ${project.badge || "Featured"}
          </span>

          <span class="featured-project-rera">
            <span
              class="material-symbols-rounded"
              aria-hidden="true"
            >
              verified
            </span>

            RERA Approved
          </span>
        </a>
      </div>

      <div class="featured-project-content">
        <span class="featured-project-category">
          ${project.categoryLabel || "Residential Project"}
        </span>

        <h3>${project.name}</h3>

        <button
          type="button"
          class="featured-project-save"
          aria-label="Save ${project.name}"
          aria-pressed="false"
        >
          <span
            class="material-symbols-rounded"
            aria-hidden="true"
          >
            favorite
          </span>
        </button>

        <p class="featured-project-location">
          <span
            class="material-symbols-rounded"
            aria-hidden="true"
          >
            location_on
          </span>

          ${project.location}
        </p>

        <div class="featured-project-details">
          <span>
            <span
              class="material-symbols-rounded"
              aria-hidden="true"
            >
              bed
            </span>

            ${project.configuration}
          </span>

          <span>
            <span
              class="material-symbols-rounded"
              aria-hidden="true"
            >
              square_foot
            </span>

            ${project.area}
          </span>
        </div>

        <div class="featured-project-footer">
          <div class="featured-project-price">
            <span>Starting From</span>

            <strong>${project.price}</strong>

            <small>
              Possession: ${project.possession}
            </small>
          </div>

          <a
            href="./${project.url}"
            class="featured-project-button"
          >
            <span>View Project</span>

            <span
              class="material-symbols-rounded"
              aria-hidden="true"
            >
              arrow_outward
            </span>
          </a>
        </div>
      </div>
    </article>
  `;
};

/* ==================================================
   INITIALIZE FEATURED PROJECTS CAROUSEL
================================================== */

const initializeHomepageFeaturedCarousel = () => {
  if (!homepageFeaturedSection || !homepageFeaturedTrack) return;

  const slider = homepageFeaturedSection.querySelector(
    "[data-project-carousel-slider]",
  );

  const cards = Array.from(
    homepageFeaturedTrack.querySelectorAll(".featured-project-card"),
  );

  const previousButton = homepageFeaturedSection.querySelector(
    "[data-project-carousel-prev]",
  );

  const nextButton = homepageFeaturedSection.querySelector(
    "[data-project-carousel-next]",
  );

  const dotsContainer = homepageFeaturedSection.querySelector(
    "[data-project-carousel-dots]",
  );

  const currentCounter = homepageFeaturedSection.querySelector(
    "[data-project-carousel-current]",
  );

  const totalCounter = homepageFeaturedSection.querySelector(
    "[data-project-carousel-total]",
  );

  const progress = homepageFeaturedSection.querySelector(
    "[data-project-carousel-progress]",
  );

  if (!slider || !cards.length) return;

  let currentIndex = 0;
  let visibleCards = 4;
  let maximumIndex = 0;
  let touchStartX = 0;
  let resizeTimer;

  /* ==================================================
     GET NUMBER OF VISIBLE CARDS
  ================================================== */

  const getVisibleCards = () => {
    if (window.innerWidth <= 767) return 1;

    if (window.innerWidth <= 991) return 2;

    if (window.innerWidth <= 1199) return 3;

    return 4;
  };

  /* ==================================================
     FORMAT SLIDER COUNTER
  ================================================== */

  const formatCounter = (value) => {
    return String(value).padStart(2, "0");
  };

  /* ==================================================
     GET CARD SLIDE DISTANCE
  ================================================== */

  const getSlideDistance = () => {
    const firstCard = cards[0];

    if (!firstCard) return 0;

    const trackStyles = window.getComputedStyle(homepageFeaturedTrack);

    const gap =
      Number.parseFloat(trackStyles.columnGap) ||
      Number.parseFloat(trackStyles.gap) ||
      0;

    return firstCard.getBoundingClientRect().width + gap;
  };

  /* ==================================================
     CREATE SLIDER DOTS
  ================================================== */

  const createDots = () => {
    if (!dotsContainer) return;

    dotsContainer.innerHTML = "";

    for (let index = 0; index <= maximumIndex; index += 1) {
      const dot = document.createElement("button");

      dot.type = "button";
      dot.className = "featured-projects-slider-dot";

      dot.setAttribute(
        "aria-label",
        `View featured project slide ${index + 1}`,
      );

      dot.addEventListener("click", () => {
        currentIndex = index;

        updateCarousel();
      });

      dotsContainer.appendChild(dot);
    }
  };

  /* ==================================================
     UPDATE FEATURED PROJECTS CAROUSEL
  ================================================== */

  const updateCarousel = () => {
    maximumIndex = Math.max(0, cards.length - visibleCards);

    currentIndex = Math.min(Math.max(currentIndex, 0), maximumIndex);

    const moveDistance = currentIndex * getSlideDistance();

    homepageFeaturedTrack.style.transform = `translate3d(-${moveDistance}px, 0, 0)`;

    if (previousButton) {
      previousButton.disabled = currentIndex === 0;
    }

    if (nextButton) {
      nextButton.disabled = currentIndex >= maximumIndex;
    }

    const pageCount = maximumIndex + 1;

    if (currentCounter) {
      currentCounter.textContent = formatCounter(
        Math.min(currentIndex + 1, pageCount),
      );
    }

    if (totalCounter) {
      totalCounter.textContent = formatCounter(pageCount);
    }

    if (progress) {
      const progressValue =
        maximumIndex === 0 ? 100 : ((currentIndex + 1) / pageCount) * 100;

      progress.style.width = `${progressValue}%`;
    }

    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll(
        ".featured-projects-slider-dot",
      );

      dots.forEach((dot, index) => {
        const isActive = index === currentIndex;

        dot.classList.toggle("active", isActive);

        if (isActive) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    }
  };

  /* ==================================================
     SET FEATURED CAROUSEL LAYOUT
  ================================================== */

  const setLayout = () => {
    visibleCards = getVisibleCards();

    maximumIndex = Math.max(0, cards.length - visibleCards);

    currentIndex = Math.min(currentIndex, maximumIndex);

    createDots();

    window.requestAnimationFrame(updateCarousel);
  };

  /* ==================================================
     NEXT / PREVIOUS BUTTONS
  ================================================== */

  nextButton?.addEventListener("click", () => {
    if (currentIndex >= maximumIndex) return;

    currentIndex += 1;

    updateCarousel();
  });

  previousButton?.addEventListener("click", () => {
    if (currentIndex <= 0) return;

    currentIndex -= 1;

    updateCarousel();
  });

  /* ==================================================
     KEYBOARD NAVIGATION
  ================================================== */

  slider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();

      nextButton?.click();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();

      previousButton?.click();
    }
  });

  /* ==================================================
     TOUCH / SWIPE NAVIGATION
  ================================================== */

  slider.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.touches[0].clientX;
    },
    {
      passive: true,
    },
  );

  slider.addEventListener(
    "touchend",
    (event) => {
      const touchEndX = event.changedTouches[0].clientX;

      const swipeDistance = touchEndX - touchStartX;

      if (Math.abs(swipeDistance) < 45) {
        return;
      }

      if (swipeDistance < 0) {
        nextButton?.click();
      } else {
        previousButton?.click();
      }
    },
    {
      passive: true,
    },
  );

  /* ==================================================
     SAVE / FAVOURITE BUTTONS
  ================================================== */

  cards.forEach((card) => {
    const saveButton = card.querySelector(".featured-project-save");

    if (!saveButton) return;

    saveButton.addEventListener("click", () => {
      const isSaved = saveButton.getAttribute("aria-pressed") === "true";

      saveButton.setAttribute("aria-pressed", String(!isSaved));

      saveButton.classList.toggle("is-saved", !isSaved);
    });
  });

  /* ==================================================
     WINDOW RESIZE
  ================================================== */

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(setLayout, 150);
  });

  setLayout();
};

/* ==================================================
   LOAD FEATURED PROJECTS FROM PROPERTIES.JSON
================================================== */

const loadHomepageFeaturedProjects = async () => {
  if (!homepageFeaturedTrack) return;

  try {
    const response = await fetch("./assets/data/properties.json", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Unable to load properties.json: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data.projects)) {
      throw new Error("Invalid properties.json format.");
    }

    /* ==================================================
   FILTER + SORT HOMEPAGE FEATURED PROJECTS
================================================== */

    const featuredProjects = data.projects
      .filter((project) => {
        return (
          project.showOnHomepage === true &&
          Array.isArray(project.categories) &&
          project.categories.includes("featured")
        );
      })
      .sort((a, b) => {
        const orderA = Number(a.categoryOrder?.featured ?? 9999);
        const orderB = Number(b.categoryOrder?.featured ?? 9999);

        return orderA - orderB;
      });

    /* ==================================================
   TEMPORARY FEATURED ORDER TEST
================================================== */

    console.table(
      featuredProjects.map((project) => ({
        project: project.name,
        featuredOrder: project.categoryOrder?.featured,
      })),
    );

    homepageFeaturedTrack.innerHTML = featuredProjects
      .map(createHomepageFeaturedCard)
      .join("");

    initializeHomepageFeaturedCarousel();

    console.log(
      `DreamKey homepage: ${featuredProjects.length} featured projects loaded from Excel data.`,
    );
  } catch (error) {
    console.error("Unable to load homepage Featured Projects:", error);

    homepageFeaturedTrack.innerHTML = "";
  }
};

/* ==================================================
   START HOMEPAGE FEATURED PROJECTS
================================================== */

loadHomepageFeaturedProjects();

/* ==================================================
   HOMEPAGE PROJECT CATEGORY CONFIGURATION
================================================== */

const homepageDynamicProjectSections = [
  {
    sectionId: "ongoing-projects",
    category: "ongoing",
    orderKey: "ongoing",
    badgeText: "Ongoing",
    hasCarousel: true,
  },

  {
    sectionId: "ready-to-move-projects",
    category: "ready-to-move",
    orderKey: "readyToMove",
    badgeText: "Ready to Move",
    hasCarousel: false,
  },

  {
    sectionId: "new-launches",
    category: "new-launches",
    orderKey: "newLaunches",
    badgeText: "New Launch",
    hasCarousel: false,
  },

  {
    sectionId: "luxury-homes",
    category: "luxury-homes",
    orderKey: "luxuryHomes",
    badgeText: "Luxury",
    hasCarousel: false,
  },
];

/* ==================================================
   CREATE PROJECT CARD FOR HOMEPAGE CATEGORY
================================================== */

const createHomepageCategoryCard = (project, badgeText) => {
  return `
    <article class="featured-project-card">
      <div class="featured-project-image-wrap">
        <a
          href="./${project.url}"
          class="featured-project-image"
          aria-label="View ${project.name} project details"
        >
          <img
            src="./${project.image}"
            alt="${project.name} residential project"
            loading="lazy"
          />

          <span class="featured-project-badge">
            ${badgeText}
          </span>

          <span class="featured-project-rera">
            <span
              class="material-symbols-rounded"
              aria-hidden="true"
            >
              verified
            </span>

            RERA Approved
          </span>
        </a>
      </div>

      <div class="featured-project-content">
        <span class="featured-project-category">
          ${project.categoryLabel || "Residential Project"}
        </span>

        <h3>${project.name}</h3>

        <button
          type="button"
          class="featured-project-save"
          aria-label="Save ${project.name}"
          aria-pressed="false"
        >
          <span
            class="material-symbols-rounded"
            aria-hidden="true"
          >
            favorite
          </span>
        </button>

        <p class="featured-project-location">
          <span
            class="material-symbols-rounded"
            aria-hidden="true"
          >
            location_on
          </span>

          ${project.location}
        </p>

        <div class="featured-project-details">
          <span>
            <span
              class="material-symbols-rounded"
              aria-hidden="true"
            >
              bed
            </span>

            ${project.configuration}
          </span>

          <span>
            <span
              class="material-symbols-rounded"
              aria-hidden="true"
            >
              square_foot
            </span>

            ${project.area}
          </span>
        </div>

        <div class="featured-project-footer">
          <div class="featured-project-price">
            <span>Starting From</span>

            <strong>${project.price}</strong>

            <small>
              Possession: ${project.possession}
            </small>
          </div>

          <a
            href="./${project.url}"
            class="featured-project-button"
          >
            <span>View Project</span>

            <span
              class="material-symbols-rounded"
              aria-hidden="true"
            >
              arrow_outward
            </span>
          </a>
        </div>
      </div>
    </article>
  `;
};

/* ==================================================
   ACTIVATE SAVE BUTTONS ON DYNAMIC CARDS
================================================== */

const initializeHomepageDynamicSaveButtons = (container) => {
  container.querySelectorAll(".featured-project-save").forEach((saveButton) => {
    saveButton.addEventListener("click", () => {
      const isSaved = saveButton.getAttribute("aria-pressed") === "true";

      saveButton.setAttribute("aria-pressed", String(!isSaved));

      saveButton.classList.toggle("is-saved", !isSaved);
    });
  });
};

/* ==================================================
   INITIALIZE DYNAMIC ONGOING CAROUSEL
================================================== */

const initializeHomepageOngoingCarousel = () => {
  const section = document.querySelector("#ongoing-projects");

  if (!section) return;

  const slider = section.querySelector("[data-project-carousel-slider]");

  const track = section.querySelector(
    '[data-homepage-project-track="ongoing"]',
  );

  const cards = Array.from(
    track?.querySelectorAll(".featured-project-card") || [],
  );

  const previousButton = section.querySelector("[data-project-carousel-prev]");

  const nextButton = section.querySelector("[data-project-carousel-next]");

  const dotsContainer = section.querySelector("[data-project-carousel-dots]");

  const currentCounter = section.querySelector(
    "[data-project-carousel-current]",
  );

  const totalCounter = section.querySelector("[data-project-carousel-total]");

  const progress = section.querySelector("[data-project-carousel-progress]");

  if (!slider || !track || !cards.length) {
    return;
  }

  let currentIndex = 0;
  let visibleCards = 4;
  let maximumIndex = 0;
  let touchStartX = 0;
  let resizeTimer;

  /* ==================================================
     GET VISIBLE CARD COUNT
  ================================================== */

  const getVisibleCards = () => {
    if (window.innerWidth <= 767) return 1;

    if (window.innerWidth <= 991) return 2;

    if (window.innerWidth <= 1199) return 3;

    return 4;
  };

  /* ==================================================
     FORMAT COUNTER
  ================================================== */

  const formatCounter = (value) => String(value).padStart(2, "0");

  /* ==================================================
     GET SLIDE DISTANCE
  ================================================== */

  const getSlideDistance = () => {
    const firstCard = cards[0];

    if (!firstCard) return 0;

    const trackStyles = window.getComputedStyle(track);

    const gap =
      Number.parseFloat(trackStyles.columnGap) ||
      Number.parseFloat(trackStyles.gap) ||
      0;

    return firstCard.getBoundingClientRect().width + gap;
  };

  /* ==================================================
     CREATE DOTS
  ================================================== */

  const createDots = () => {
    if (!dotsContainer) return;

    dotsContainer.innerHTML = "";

    for (let index = 0; index <= maximumIndex; index += 1) {
      const dot = document.createElement("button");

      dot.type = "button";

      dot.className = "featured-projects-slider-dot";

      dot.setAttribute("aria-label", `View ongoing project slide ${index + 1}`);

      dot.addEventListener("click", () => {
        currentIndex = index;

        updateCarousel();
      });

      dotsContainer.appendChild(dot);
    }
  };

  /* ==================================================
     UPDATE ONGOING CAROUSEL
  ================================================== */

  const updateCarousel = () => {
    maximumIndex = Math.max(0, cards.length - visibleCards);

    currentIndex = Math.min(Math.max(currentIndex, 0), maximumIndex);

    track.style.transform = `translate3d(-${
      currentIndex * getSlideDistance()
    }px, 0, 0)`;

    if (previousButton) {
      previousButton.disabled = currentIndex === 0;
    }

    if (nextButton) {
      nextButton.disabled = currentIndex >= maximumIndex;
    }

    const pageCount = maximumIndex + 1;

    if (currentCounter) {
      currentCounter.textContent = formatCounter(
        Math.min(currentIndex + 1, pageCount),
      );
    }

    if (totalCounter) {
      totalCounter.textContent = formatCounter(pageCount);
    }

    if (progress) {
      const progressValue =
        maximumIndex === 0 ? 100 : ((currentIndex + 1) / pageCount) * 100;

      progress.style.width = `${progressValue}%`;
    }

    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll(
        ".featured-projects-slider-dot",
      );

      dots.forEach((dot, index) => {
        const isActive = index === currentIndex;

        dot.classList.toggle("active", isActive);

        if (isActive) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    }
  };

  /* ==================================================
     SET CAROUSEL LAYOUT
  ================================================== */

  const setLayout = () => {
    visibleCards = getVisibleCards();

    maximumIndex = Math.max(0, cards.length - visibleCards);

    currentIndex = Math.min(currentIndex, maximumIndex);

    createDots();

    window.requestAnimationFrame(updateCarousel);
  };

  /* ==================================================
     CAROUSEL BUTTONS
  ================================================== */

  nextButton?.addEventListener("click", () => {
    if (currentIndex >= maximumIndex) {
      return;
    }

    currentIndex += 1;

    updateCarousel();
  });

  previousButton?.addEventListener("click", () => {
    if (currentIndex <= 0) return;

    currentIndex -= 1;

    updateCarousel();
  });

  /* ==================================================
     KEYBOARD
  ================================================== */

  slider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();

      nextButton?.click();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();

      previousButton?.click();
    }
  });

  /* ==================================================
     TOUCH
  ================================================== */

  slider.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.touches[0].clientX;
    },
    {
      passive: true,
    },
  );

  slider.addEventListener(
    "touchend",
    (event) => {
      const touchEndX = event.changedTouches[0].clientX;

      const swipeDistance = touchEndX - touchStartX;

      if (Math.abs(swipeDistance) < 45) {
        return;
      }

      if (swipeDistance < 0) {
        nextButton?.click();
      } else {
        previousButton?.click();
      }
    },
    {
      passive: true,
    },
  );

  /* ==================================================
     RESIZE
  ================================================== */

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(setLayout, 150);
  });

  setLayout();
};

/* ==================================================
   LOAD REMAINING HOMEPAGE PROJECT SECTIONS
================================================== */

const loadRemainingHomepageProjects = async () => {
  try {
    const response = await fetch("./assets/data/properties.json", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Unable to load properties.json: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data.projects)) {
      throw new Error("Invalid properties.json format.");
    }

    /* ==================================================
         GENERATE EACH CATEGORY
      ================================================== */

    homepageDynamicProjectSections.forEach((sectionConfig) => {
      const track = document.querySelector(
        `[data-homepage-project-track="${sectionConfig.category}"]`,
      );

      if (!track) return;

      /* ==================================================
   FILTER + SORT HOMEPAGE CATEGORY PROJECTS
================================================== */

      const categoryProjects = data.projects
        .filter((project) => {
          return (
            project.showOnHomepage === true &&
            Array.isArray(project.categories) &&
            project.categories.includes(sectionConfig.category)
          );
        })
        .sort((a, b) => {
          const orderA = Number(
            a.categoryOrder?.[sectionConfig.orderKey] ?? 9999,
          );

          const orderB = Number(
            b.categoryOrder?.[sectionConfig.orderKey] ?? 9999,
          );

          return orderA - orderB;
        });

      const cardsHtml = categoryProjects
        .map((project) =>
          createHomepageCategoryCard(project, sectionConfig.badgeText),
        )
        .join("");

      /*
       * Ready-to-Move and Luxury Homes
       * contain a permanent promotional banner.
       * Insert project cards before that banner.
       */

      const staticBanner = track.querySelector(
        ".ready-to-move-banner, .luxury-homes-banner",
      );

      if (staticBanner) {
        track
          .querySelectorAll(".featured-project-card")
          .forEach((card) => card.remove());

        staticBanner.insertAdjacentHTML("beforebegin", cardsHtml);
      } else {
        track.innerHTML = cardsHtml;
      }

      initializeHomepageDynamicSaveButtons(track);

      console.log(
        `DreamKey homepage: ${categoryProjects.length} ${
          sectionConfig.category
        } projects loaded from Excel.`,
      );
    });

    /* ==================================================
         START ONGOING CAROUSEL AFTER CARDS EXIST
      ================================================== */

    initializeHomepageOngoingCarousel();
  } catch (error) {
    console.error("Unable to load remaining homepage projects:", error);
  }
};

/* ==================================================
   START REMAINING HOMEPAGE PROJECT SECTIONS
================================================== */

loadRemainingHomepageProjects();

// PROJECT CAROUSELS STARTED

const projectCarouselSections = document.querySelectorAll(
  "[data-project-carousel]",
);

projectCarouselSections.forEach((projectCarouselSection) => {
  const projectCarouselSlider = projectCarouselSection.querySelector(
    "[data-project-carousel-slider]",
  );

  const projectCarouselTrack = projectCarouselSection.querySelector(
    ".featured-projects-slider-track",
  );

  const projectCarouselCards = Array.from(
    projectCarouselSection.querySelectorAll(".featured-project-card"),
  );

  const projectCarouselPreviousButton = projectCarouselSection.querySelector(
    "[data-project-carousel-prev]",
  );

  const projectCarouselNextButton = projectCarouselSection.querySelector(
    "[data-project-carousel-next]",
  );

  const projectCarouselDotsContainer = projectCarouselSection.querySelector(
    "[data-project-carousel-dots]",
  );

  const projectCarouselCurrentCounter = projectCarouselSection.querySelector(
    "[data-project-carousel-current]",
  );

  const projectCarouselTotalCounter = projectCarouselSection.querySelector(
    "[data-project-carousel-total]",
  );

  const projectCarouselProgress = projectCarouselSection.querySelector(
    "[data-project-carousel-progress]",
  );

  if (
    !projectCarouselSlider ||
    !projectCarouselTrack ||
    !projectCarouselCards.length
  ) {
    return;
  }

  let currentIndex = 0;
  let visibleCards = 4;
  let maximumIndex = 0;
  let touchStartX = 0;
  let resizeTimer;

  const getVisibleCards = () => {
    if (window.innerWidth <= 767) return 1;
    if (window.innerWidth <= 991) return 2;
    if (window.innerWidth <= 1199) return 3;

    return 4;
  };

  const formatCounter = (value) => {
    return String(value).padStart(2, "0");
  };

  const getSlideDistance = () => {
    const firstCard = projectCarouselCards[0];

    if (!firstCard) return 0;

    const trackStyles = window.getComputedStyle(projectCarouselTrack);

    const trackGap =
      Number.parseFloat(trackStyles.columnGap) ||
      Number.parseFloat(trackStyles.gap) ||
      0;

    return firstCard.getBoundingClientRect().width + trackGap;
  };

  const createDots = () => {
    if (!projectCarouselDotsContainer) return;

    projectCarouselDotsContainer.innerHTML = "";

    for (let index = 0; index <= maximumIndex; index += 1) {
      const dotButton = document.createElement("button");

      dotButton.type = "button";
      dotButton.className = "featured-projects-slider-dot";

      dotButton.setAttribute("aria-label", `View project slide ${index + 1}`);

      dotButton.addEventListener("click", () => {
        currentIndex = index;
        updateCarousel();
      });

      projectCarouselDotsContainer.appendChild(dotButton);
    }
  };

  const updateCarousel = () => {
    maximumIndex = Math.max(0, projectCarouselCards.length - visibleCards);

    currentIndex = Math.min(Math.max(currentIndex, 0), maximumIndex);

    const moveDistance = currentIndex * getSlideDistance();

    projectCarouselTrack.style.transform = `translate3d(-${moveDistance}px, 0, 0)`;

    if (projectCarouselPreviousButton) {
      projectCarouselPreviousButton.disabled = currentIndex === 0;
    }

    if (projectCarouselNextButton) {
      projectCarouselNextButton.disabled = currentIndex >= maximumIndex;
    }

    const pageCount = maximumIndex + 1;

    if (projectCarouselCurrentCounter) {
      projectCarouselCurrentCounter.textContent = formatCounter(
        Math.min(currentIndex + 1, pageCount),
      );
    }

    if (projectCarouselTotalCounter) {
      projectCarouselTotalCounter.textContent = formatCounter(pageCount);
    }

    if (projectCarouselProgress) {
      const progressValue =
        maximumIndex === 0 ? 100 : ((currentIndex + 1) / pageCount) * 100;

      projectCarouselProgress.style.width = `${progressValue}%`;
    }

    if (projectCarouselDotsContainer) {
      const dots = projectCarouselDotsContainer.querySelectorAll(
        ".featured-projects-slider-dot",
      );

      dots.forEach((dot, index) => {
        const isActive = index === currentIndex;

        dot.classList.toggle("active", isActive);

        if (isActive) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    }
  };

  const setLayout = () => {
    visibleCards = getVisibleCards();

    maximumIndex = Math.max(0, projectCarouselCards.length - visibleCards);

    currentIndex = Math.min(currentIndex, maximumIndex);

    createDots();

    window.requestAnimationFrame(updateCarousel);
  };

  if (projectCarouselNextButton) {
    projectCarouselNextButton.addEventListener("click", () => {
      if (currentIndex >= maximumIndex) return;

      currentIndex += 1;

      updateCarousel();
    });
  }

  if (projectCarouselPreviousButton) {
    projectCarouselPreviousButton.addEventListener("click", () => {
      if (currentIndex <= 0) return;

      currentIndex -= 1;

      updateCarousel();
    });
  }

  projectCarouselSlider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();

      projectCarouselNextButton?.click();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();

      projectCarouselPreviousButton?.click();
    }
  });

  projectCarouselSlider.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.touches[0].clientX;
    },
    { passive: true },
  );

  projectCarouselSlider.addEventListener(
    "touchend",
    (event) => {
      const touchEndX = event.changedTouches[0].clientX;
      const swipeDistance = touchEndX - touchStartX;

      if (Math.abs(swipeDistance) < 45) return;

      if (swipeDistance < 0) {
        projectCarouselNextButton?.click();
      } else {
        projectCarouselPreviousButton?.click();
      }
    },
    { passive: true },
  );

  projectCarouselSection
    .querySelectorAll(".featured-project-save")
    .forEach((saveButton) => {
      saveButton.addEventListener("click", () => {
        const isSaved = saveButton.getAttribute("aria-pressed") === "true";

        saveButton.setAttribute("aria-pressed", String(!isSaved));

        saveButton.classList.toggle("is-saved", !isSaved);
      });
    });

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(setLayout, 150);
  });

  setLayout();
});

// PROJECT CAROUSELS ENDED

// NAVBAR PROPERTY DROPDOWN STARTED

const navbarDropdown = document.querySelector(".navbar-dropdown");
const navbarDropdownToggle = document.querySelector(".navbar-dropdown-toggle");
const navbarDropdownLinks = document.querySelectorAll(".navbar-dropdown-link");

if (navbarDropdown && navbarDropdownToggle) {
  navbarDropdownToggle.addEventListener("click", (event) => {
    event.stopPropagation();

    const isOpen = navbarDropdown.classList.toggle("active");

    navbarDropdownToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navbarDropdownLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navbarDropdown.classList.remove("active");
      navbarDropdownToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", (event) => {
    if (!navbarDropdown.contains(event.target)) {
      navbarDropdown.classList.remove("active");
      navbarDropdownToggle.setAttribute("aria-expanded", "false");
    }
  });
}

// NAVBAR PROPERTY DROPDOWN ENDED

// SCROLL TO TOP BUTTON STARTED

const scrollTopBtn = document.querySelector(".scroll-top-btn");

if (scrollTopBtn) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 150) {
      scrollTopBtn.classList.add("active");
    } else {
      scrollTopBtn.classList.remove("active");
    }
  });

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// SCROLL TO TOP BUTTON ENDED

/* ==================================================
   HERO AUTO PROJECT SLIDER
================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector("#home.hero-slider");

  if (!hero) return;

  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const indicators = Array.from(hero.querySelectorAll("[data-hero-indicator]"));

  if (slides.length < 2 || indicators.length !== slides.length) return;

  const slideDuration = 5000;
  let currentIndex = 0;
  let autoPlayTimer = null;

  const showSlide = (newIndex) => {
    const normalizedIndex = (newIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      const isActive = index === normalizedIndex;

      slide.classList.toggle("active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    indicators.forEach((indicator, index) => {
      const isActive = index === normalizedIndex;

      indicator.classList.toggle("active", isActive);
      indicator.setAttribute("aria-selected", String(isActive));

      /*
       * Restart the active indicator progress animation.
       */
      if (isActive) {
        indicator.style.animation = "none";
        indicator.offsetHeight;
        indicator.style.animation = "";
      }
    });

    currentIndex = normalizedIndex;
  };

  const showNextSlide = () => {
    showSlide(currentIndex + 1);
  };

  const stopAutoPlay = () => {
    if (autoPlayTimer) {
      window.clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  };

  const startAutoPlay = () => {
    stopAutoPlay();

    autoPlayTimer = window.setInterval(showNextSlide, slideDuration);
  };

  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      showSlide(index);
      startAutoPlay();
    });
  });

  /*
   * Pause while users interact with Hero content.
   */
  hero.addEventListener("mouseenter", stopAutoPlay);
  hero.addEventListener("mouseleave", startAutoPlay);

  hero.addEventListener("focusin", stopAutoPlay);
  hero.addEventListener("focusout", (event) => {
    if (!hero.contains(event.relatedTarget)) {
      startAutoPlay();
    }
  });

  /*
   * Pause when the browser tab is not visible.
   */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  });

  showSlide(0);
  startAutoPlay();
});

// Abovw Okay 7th August 2026

/* ==================================================
   OUR SERVICES MODAL DATA
================================================== */

const ourServicesData = {
  consultation: {
    title: "Property Consultation",

    icon: "apartment",

    description:
      "Receive personalised guidance based on your property preferences, location requirements and budget.",

    points: [
      "Understand your property requirements",
      "Discuss preferred locations",
      "Review budget and configuration needs",
      "Explore suitable DreamKey property options",
      "Get clear project and pricing information",
      "Receive personalised property guidance",
    ],

    cta: "Get Property Assistance",
  },

  selection: {
    title: "Project Selection",

    icon: "domain",

    description:
      "Explore carefully selected projects with clear details to help you compare options and make an informed decision.",

    points: [
      "Curated project recommendations",
      "Location and connectivity information",
      "Configuration and floor plan guidance",
      "Amenities and project highlights",
      "Pricing and availability details",
      "Simple project comparison support",
    ],

    cta: "Explore Properties",
  },

  visit: {
    title: "Site Visit Assistance",

    icon: "location_on",

    description:
      "Experience your shortlisted properties personally with organised site visits and guidance from our team.",

    points: [
      "Convenient site visit scheduling",
      "Project walkthrough assistance",
      "Apartment and layout guidance",
      "Amenities and facilities overview",
      "Location and neighbourhood guidance",
      "Answers to project-related questions",
    ],

    cta: "Book a Site Visit",
  },

  purchase: {
    title: "Purchase Support",

    icon: "assignment_turned_in",

    description:
      "Get clear guidance and coordination throughout the important stages of your property purchase.",

    points: [
      "Pricing and offer clarification",
      "Booking process assistance",
      "Documentation guidance",
      "Developer coordination support",
      "Payment milestone information",
      "Smooth purchase journey assistance",
    ],

    cta: "Get Purchase Assistance",
  },
};

/* ==================================================
   ELEMENTS
================================================== */

const ourServicesModal = document.querySelector("[data-services-modal]");

const ourServicesModalClose = document.querySelector(
  "[data-services-modal-close]",
);

const ourServicesModalTitle = document.querySelector(
  "[data-services-modal-title]",
);

const ourServicesModalDescription = document.querySelector(
  "[data-services-modal-description]",
);

const ourServicesModalIcon = document.querySelector(
  "[data-services-modal-icon]",
);

const ourServicesModalList = document.querySelector(
  "[data-services-modal-list]",
);

const ourServicesModalCtaText = document.querySelector(
  "[data-services-modal-cta-text]",
);

const ourServicesModalCta = document.querySelector("[data-services-modal-cta]");

const ourServicesButtons = document.querySelectorAll(".our-service-learn-more");

let lastOurServicesTrigger = null;

/* ==================================================
   OPEN MODAL
================================================== */

function openOurServicesModal(serviceKey, trigger) {
  const service = ourServicesData[serviceKey];

  if (!service) return;

  lastOurServicesTrigger = trigger;

  /* UPDATE CONTENT */

  ourServicesModalTitle.textContent = service.title;

  ourServicesModalDescription.textContent = service.description;

  ourServicesModalIcon.textContent = service.icon;

  ourServicesModalCtaText.textContent = service.cta;

  /* CREATE LIST */

  ourServicesModalList.innerHTML = "";

  service.points.forEach((point) => {
    const listItem = document.createElement("li");

    listItem.textContent = point;

    ourServicesModalList.appendChild(listItem);
  });

  /* SHOW MODAL */

  ourServicesModal.classList.add("active");

  ourServicesModal.setAttribute("aria-hidden", "false");

  document.body.classList.add("our-services-modal-open");

  /* FOCUS CLOSE BUTTON */

  setTimeout(() => {
    ourServicesModalClose.focus();
  }, 100);
}

/* ==================================================
   CLOSE MODAL
================================================== */

function closeOurServicesModal() {
  ourServicesModal.classList.remove("active");

  ourServicesModal.setAttribute("aria-hidden", "true");

  document.body.classList.remove("our-services-modal-open");

  /* RETURN FOCUS */

  if (lastOurServicesTrigger) {
    lastOurServicesTrigger.focus();
  }
}

/* ==================================================
   OPEN FROM LEARN MORE
================================================== */

ourServicesButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const serviceKey = button.dataset.service;

    openOurServicesModal(serviceKey, button);
  });
});

/* ==================================================
   CLOSE BUTTON
================================================== */

ourServicesModalClose.addEventListener("click", closeOurServicesModal);

/* ==================================================
   CLICK OUTSIDE MODAL
================================================== */

ourServicesModal.addEventListener("click", (event) => {
  if (event.target === ourServicesModal) {
    closeOurServicesModal();
  }
});

/* ==================================================
   ESCAPE KEY
================================================== */

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    ourServicesModal?.classList.contains("active")
  ) {
    closeOurServicesModal();
  }
});

/* ==================================================
   MODAL CTA
================================================== */

ourServicesModalCta?.addEventListener("click", () => {
  closeOurServicesModal();
});
