// PROJECT DETAILS HELPERS STARTED

const select = (selector, scope = document) => scope.querySelector(selector);
const selectAll = (selector, scope = document) =>
  Array.from(scope.querySelectorAll(selector));

const setModalState = (modal, isOpen) => {
  if (!modal) return;

  modal.classList.toggle("active", isOpen);
  modal.setAttribute("aria-hidden", String(!isOpen));

  document.body.classList.toggle(
    "modal-open",
    Boolean(document.querySelector(".modal.active")),
  );
};

// PROJECT DETAILS HELPERS ENDED

// PROJECT DETAILS HEADER STARTED

const header = select("[data-header]");
const navbar = select("[data-navbar]");
const navbarToggle = select("[data-nav-toggler]");

const updateHeaderState = () => {
  if (!header) return;

  header.classList.toggle("active", window.scrollY > 24);
};

navbarToggle?.addEventListener("click", () => {
  const isOpen = navbar?.classList.toggle("active") || false;

  navbarToggle.classList.toggle("active", isOpen);
  navbarToggle.setAttribute("aria-expanded", String(isOpen));
});

selectAll(".navbar-link").forEach((link) => {
  link.addEventListener("click", () => {
    navbar?.classList.remove("active");
    navbarToggle?.classList.remove("active");
    navbarToggle?.setAttribute("aria-expanded", "false");
  });
});

window.addEventListener("scroll", updateHeaderState, {
  passive: true,
});

updateHeaderState();

// PROJECT DETAILS HEADER ENDED

// ==================================================
// PROJECT DETAILS NAVBAR ACTIVE STATE STARTED
// ==================================================

const projectNavbarLinks = selectAll('.header .navbar-link[href^="#"]');

/* ==================================================
   NAVBAR SECTION IDS
================================================== */

const projectNavbarSectionIds = [
  "overview",
  "project-details",
  "gallery",
  "lifestyle-amenities",
  "floor-plans",
  "location",
];

/* ==================================================
   CLEAR ALL ACTIVE NAVBAR LINKS
================================================== */

const clearActiveProjectNavbarLink = () => {
  projectNavbarLinks.forEach((navbarLink) => {
    navbarLink.classList.remove("active");
    navbarLink.removeAttribute("aria-current");
  });
};

/* ==================================================
   SET ACTIVE NAVBAR LINK
================================================== */

const setActiveProjectNavbarLink = (sectionId) => {
  clearActiveProjectNavbarLink();

  const matchingLink = projectNavbarLinks.find(
    (navbarLink) => navbarLink.getAttribute("href") === `#${sectionId}`,
  );

  if (!matchingLink) return;

  matchingLink.classList.add("active");
  matchingLink.setAttribute("aria-current", "page");
};

/* ==================================================
   DETECT ACTUAL VISIBLE SECTION
================================================== */

const updateActiveProjectSection = () => {
  const headerHeight = header ? header.getBoundingClientRect().height : 72;

  /*
   * Detection line inside viewport,
   * just below sticky navbar.
   */
  const detectionY = headerHeight + 100;

  /*
   * Get EVERY actual page section with an ID.
   */
  const allPageSections = Array.from(document.querySelectorAll("section[id]"));

  let currentSection = null;

  /*
   * Find the section that actually contains
   * the detection line on screen.
   */
  for (const section of allPageSections) {
    const rect = section.getBoundingClientRect();

    if (rect.top <= detectionY && rect.bottom > detectionY) {
      currentSection = section;
      break;
    }
  }

  /* ==================================================
     NO SECTION AT DETECTION POINT
  ================================================== */

  if (!currentSection) {
    clearActiveProjectNavbarLink();
    return;
  }

  const currentSectionId = currentSection.id;

  /* ==================================================
     SECTION NOT PRESENT IN NAVBAR
  ================================================== */

  if (!projectNavbarSectionIds.includes(currentSectionId)) {
    clearActiveProjectNavbarLink();
    return;
  }

  /* ==================================================
     SECTION IS PRESENT IN NAVBAR
  ================================================== */

  setActiveProjectNavbarLink(currentSectionId);
};

/* ==================================================
   NAVBAR LINK CLICK
================================================== */

projectNavbarLinks.forEach((navbarLink) => {
  navbarLink.addEventListener("click", () => {
    const sectionId = navbarLink.getAttribute("href")?.replace("#", "");

    if (projectNavbarSectionIds.includes(sectionId)) {
      setActiveProjectNavbarLink(sectionId);
    }
  });
});

/* ==================================================
   UPDATE ACTIVE LINK ON SCROLL
================================================== */

let projectNavbarScrollFrame = null;

window.addEventListener(
  "scroll",
  () => {
    if (projectNavbarScrollFrame) {
      cancelAnimationFrame(projectNavbarScrollFrame);
    }

    projectNavbarScrollFrame = requestAnimationFrame(() => {
      updateActiveProjectSection();

      projectNavbarScrollFrame = null;
    });
  },
  {
    passive: true,
  },
);

/* ==================================================
   UPDATE ACTIVE LINK ON PAGE LOAD
================================================== */

window.addEventListener("load", updateActiveProjectSection);

/* ==================================================
   UPDATE ACTIVE LINK ON RESIZE
================================================== */

window.addEventListener("resize", updateActiveProjectSection);

updateActiveProjectSection();

// ==================================================
// PROJECT DETAILS NAVBAR ACTIVE STATE ENDED
// ==================================================

// PROJECT DETAILS SCROLL REVEAL STARTED

const revealElements = selectAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
    },
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("revealed");
  });
}

// PROJECT DETAILS SCROLL REVEAL ENDED

// PROJECT DETAILS COUNTERS STARTED

const counters = selectAll("[data-count]");

const animateCounter = (counter) => {
  const target = Number(counter.dataset.count || 0);
  const duration = 1200;
  const startTime = performance.now();

  const update = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    counter.textContent = `${Math.round(target * easedProgress)}${
      target >= 30 ? "+" : ""
    }`;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };

  requestAnimationFrame(update);
};

if ("IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.6,
    },
  );

  counters.forEach((counter) => {
    counterObserver.observe(counter);
  });
} else {
  counters.forEach(animateCounter);
}

// PROJECT DETAILS COUNTERS ENDED

// ==================================================
// PROJECT DETAILS FLOOR PLANS STARTED
// ==================================================

const floorTabs = document.querySelectorAll("[data-floor-tab]");
const floorPanels = document.querySelectorAll("[data-floor-panel]");
const floorThumbnails = document.querySelectorAll("[data-floor-thumbnail]");

const floorPreviousButtons = document.querySelectorAll("[data-floor-prev]");

const floorNextButtons = document.querySelectorAll("[data-floor-next]");

const floorCurrentNumber = document.querySelector("[data-floor-current]");

const floorViewerTitle = document.querySelector("[data-floor-viewer-title]");

const floorInformationTitle = document.querySelector("[data-floor-title]");

const floorDescription = document.querySelector("[data-floor-description]");

const floorConfiguration = document.querySelector("[data-floor-configuration]");

const floorCarpetArea = document.querySelector("[data-floor-carpet-area]");

const floorBuiltupArea = document.querySelector("[data-floor-builtup-area]");

const floorBedrooms = document.querySelector("[data-floor-bedrooms]");

const floorBathrooms = document.querySelector("[data-floor-bathrooms]");

const floorBalconies = document.querySelector("[data-floor-balconies]");

const floorStage = document.querySelector("[data-floor-stage]");

const floorHotspots = document.querySelector("[data-floor-hotspots]");

const floorDownloadButton = document.querySelector("[data-floor-download]");

const floorDownloadText = document.querySelector("[data-floor-download-text]");

const floorToast = document.querySelector("[data-floor-toast]");

const floorPrintButton = document.querySelector("[data-floor-print]");

const floorOpenLightboxButtons = document.querySelectorAll(
  "[data-floor-open-lightbox]",
);

const floorFullscreenButtons = document.querySelectorAll(
  "[data-floor-fullscreen]",
);

const floorLightbox = document.querySelector("[data-floor-lightbox]");

const floorLightboxCanvas = document.querySelector(
  "[data-floor-lightbox-canvas]",
);

const floorLightboxImage = document.querySelector(
  "[data-floor-lightbox-image]",
);

const floorLightboxTitle = document.querySelector(
  "[data-floor-lightbox-title]",
);

const floorLightboxHotspots = document.querySelector(
  "[data-floor-lightbox-hotspots]",
);

const floorLightboxClose = document.querySelector(
  "[data-floor-lightbox-close]",
);

const floorLightboxFullscreen = document.querySelector(
  "[data-floor-lightbox-fullscreen]",
);

const floorZoomInButton = document.querySelector("[data-floor-zoom-in]");

const floorZoomOutButton = document.querySelector("[data-floor-zoom-out]");

const floorZoomResetButton = document.querySelector("[data-floor-zoom-reset]");

const floorZoomValue = document.querySelector("[data-floor-zoom-value]");

// ==================================================
// CURRENT PROJECT PATH CONFIGURATION STARTED
// ==================================================

const currentProjectFile = window.location.pathname
  .split("/")
  .pop()
  .replace(".html", "");

const currentProjectSlug = currentProjectFile || "skyline-heights";

const getFloorPlanImagePath = (fileName) =>
  `../assets/images/project-details/${currentProjectSlug}/floor-plans/${fileName}`;

const getFloorPlanPdfPath = (fileName) =>
  `../assets/pdf/${currentProjectSlug}/${currentProjectSlug}-${fileName}`;

// ==================================================
// CURRENT PROJECT PATH CONFIGURATION ENDED
// ==================================================

/* Stores all floor-plan content and hotspot positions. */
const floorPlanData = {
  one: {
    number: "01",
    title: "1 BHK Residence",

    description:
      "Efficiently designed homes with comfortable living spaces, smart storage and a private balcony.",

    configuration: "1 BHK",
    carpetArea: "720 sq. ft.",
    builtupArea: "890 sq. ft.",
    bedrooms: "1",
    bathrooms: "1",
    balconies: "1",

    image: getFloorPlanImagePath("floor-plan-01-1bhk.webp"),

    download: getFloorPlanPdfPath("1bhk-floor-plan.pdf"),

    hotspots: [
      {
        label: "Bedroom",
        x: 72,
        y: 32,
      },
      {
        label: "Living Room",
        x: 45,
        y: 39,
      },
      {
        label: "Kitchen",
        x: 21,
        y: 68,
      },
      {
        label: "Dining Area",
        x: 47,
        y: 68,
      },
      {
        label: "Bathroom",
        x: 73,
        y: 72,
      },
      {
        label: "Balcony",
        x: 47,
        y: 14,
      },
    ],
  },

  two: {
    number: "02",
    title: "2 BHK Residence",

    description:
      "Efficiently planned homes with a spacious living area, two bedrooms, two bathrooms and practical storage zones.",

    configuration: "2 BHK",
    carpetArea: "1,150 sq. ft.",
    builtupArea: "1,285 sq. ft.",
    bedrooms: "2",
    bathrooms: "2",
    balconies: "1",

    image: getFloorPlanImagePath("floor-plan-02-2bhk.webp"),

    download: getFloorPlanPdfPath("2bhk-floor-plan.pdf"),

    hotspots: [
      {
        label: "Primary Bedroom",
        x: 73,
        y: 28,
      },
      {
        label: "Bedroom 2",
        x: 31,
        y: 28,
      },
      {
        label: "Living Room",
        x: 49,
        y: 37,
      },
      {
        label: "Dining Area",
        x: 51,
        y: 66,
      },
      {
        label: "Kitchen",
        x: 29,
        y: 79,
      },
      {
        label: "Bathroom",
        x: 75,
        y: 68,
      },
      {
        label: "Balcony",
        x: 50,
        y: 13,
      },
    ],
  },

  three: {
    number: "03",
    title: "3 BHK Residence",

    description:
      "Balanced family homes with generous bedrooms, expansive living spaces and premium balcony views.",

    configuration: "3 BHK",
    carpetArea: "1,650 sq. ft.",
    builtupArea: "1,890 sq. ft.",
    bedrooms: "3",
    bathrooms: "3",
    balconies: "2",

    image: getFloorPlanImagePath("floor-plan-03-3bhk.webp"),

    download: getFloorPlanPdfPath("3bhk-floor-plan.pdf"),

    hotspots: [
      {
        label: "Primary Bedroom",
        x: 74,
        y: 26,
      },
      {
        label: "Bedroom 2",
        x: 27,
        y: 26,
      },
      {
        label: "Bedroom 3",
        x: 74,
        y: 58,
      },
      {
        label: "Living Room",
        x: 49,
        y: 38,
      },
      {
        label: "Dining Area",
        x: 49,
        y: 65,
      },
      {
        label: "Kitchen",
        x: 28,
        y: 78,
      },
      {
        label: "Balcony",
        x: 50,
        y: 13,
      },
    ],
  },

  four: {
    number: "04",
    title: "4 BHK Residence",

    description:
      "Expansive signature homes with private bedroom zones, premium finishes and enhanced entertaining spaces.",

    configuration: "4 BHK",
    carpetArea: "2,200 sq. ft.",
    builtupArea: "2,520 sq. ft.",
    bedrooms: "4",
    bathrooms: "4",
    balconies: "2",

    image: getFloorPlanImagePath("floor-plan-04-4bhk.webp"),

    download: getFloorPlanPdfPath("4bhk-floor-plan.pdf"),

    hotspots: [
      {
        label: "Primary Bedroom",
        x: 74,
        y: 25,
      },
      {
        label: "Bedroom 2",
        x: 27,
        y: 25,
      },
      {
        label: "Bedroom 3",
        x: 27,
        y: 58,
      },
      {
        label: "Bedroom 4",
        x: 74,
        y: 58,
      },
      {
        label: "Living Room",
        x: 49,
        y: 38,
      },
      {
        label: "Dining Area",
        x: 50,
        y: 66,
      },
      {
        label: "Kitchen",
        x: 27,
        y: 79,
      },
      {
        label: "Balcony",
        x: 50,
        y: 13,
      },
    ],
  },
};

const floorPlanOrder = ["one", "two", "three", "four"];

/* The 1 BHK plan is selected when the page opens. */
let activeFloorPlan = "one";

/*
 * Lightbox zoom state.
 * Image dragging and translation are intentionally disabled.
 */
let floorZoomScale = 1;
let floorInitialPinchDistance = 0;
let floorInitialPinchScale = 1;

/* Returns the currently selected floor-plan information. */
const getActiveFloorData = () => {
  return floorPlanData[activeFloorPlan];
};

/* Shows hotspot markers for the selected floor plan. */
const renderFloorHotspots = (targetContainer, hotspots, lightbox = false) => {
  if (!targetContainer) {
    return;
  }

  targetContainer.innerHTML = "";

  hotspots.forEach((hotspot, index) => {
    const button = document.createElement("button");

    button.type = "button";

    button.className = lightbox
      ? "sh-floor-lightbox-hotspot"
      : "sh-floor-hotspot";

    button.style.left = `${hotspot.x}%`;
    button.style.top = `${hotspot.y}%`;

    button.dataset.label = hotspot.label;

    button.setAttribute("aria-label", hotspot.label);

    button.textContent = String(index + 1);

    button.addEventListener("click", (event) => {
      event.stopPropagation();

      targetContainer
        .querySelectorAll(".sh-floor-hotspot, .sh-floor-lightbox-hotspot")
        .forEach((item) => {
          item.classList.remove("active");
        });

      button.classList.add("active");
    });

    targetContainer.appendChild(button);
  });
};

/*
 * Zooms the image and hotspot layer together.
 * No translate or dragging is applied.
 */
const updateFloorLightboxTransform = () => {
  const zoomTransform = `scale(${floorZoomScale})`;

  if (floorLightboxImage) {
    floorLightboxImage.style.transform = zoomTransform;

    floorLightboxImage.style.transformOrigin = "center center";
  }

  if (floorLightboxHotspots) {
    floorLightboxHotspots.style.transform = zoomTransform;

    floorLightboxHotspots.style.transformOrigin = "center center";
  }

  if (floorZoomValue) {
    floorZoomValue.textContent = `${Math.round(floorZoomScale * 100)}%`;
  }
};

/* Resets both the floor-plan image and hotspot zoom. */
const resetFloorZoom = () => {
  floorZoomScale = 1;
  floorInitialPinchDistance = 0;
  floorInitialPinchScale = 1;

  updateFloorLightboxTransform();
};

/* Changes centered zoom within safe limits. */
const setFloorZoom = (newScale) => {
  floorZoomScale = Math.min(4, Math.max(0.7, newScale));

  updateFloorLightboxTransform();
};

/* Opens the enlarged floor-plan lightbox. */
const openFloorLightbox = () => {
  const selectedFloorData = getActiveFloorData();

  if (!floorLightbox || !selectedFloorData) {
    return;
  }

  if (floorLightboxImage) {
    floorLightboxImage.src = selectedFloorData.image;

    floorLightboxImage.alt = `${selectedFloorData.title} enlarged floor plan`;
  }

  if (floorLightboxTitle) {
    floorLightboxTitle.textContent = selectedFloorData.title;
  }

  renderFloorHotspots(floorLightboxHotspots, selectedFloorData.hotspots, true);

  resetFloorZoom();

  floorLightbox.classList.add("open");

  floorLightbox.setAttribute("aria-hidden", "false");

  document.body.classList.add("floor-lightbox-open");
};

/* Closes the enlarged floor-plan lightbox. */
const closeFloorLightbox = () => {
  if (!floorLightbox) {
    return;
  }

  floorLightbox.classList.remove("open");

  floorLightbox.setAttribute("aria-hidden", "true");

  document.body.classList.remove("floor-lightbox-open");

  /*
   * Exit browser fullscreen when the lightbox
   * is the current fullscreen element.
   */
  if (document.fullscreenElement === floorLightbox) {
    document.exitFullscreen?.().catch(() => {});
  }

  resetFloorZoom();
};

/* Updates tabs, images, details and hotspot markers. */
const updateFloorPlan = async (target) => {
  const selectedFloorData = floorPlanData[target];

  if (!selectedFloorData) {
    return;
  }

  activeFloorPlan = target;

  if (floorStage) {
    floorStage.classList.add("loading");
  }

  /* Updates configuration tabs. */
  floorTabs.forEach((tab) => {
    const isActive = tab.dataset.floorTab === target;

    tab.classList.toggle("active", isActive);

    tab.setAttribute("aria-selected", String(isActive));

    tab.tabIndex = isActive ? 0 : -1;
  });

  /* Updates large image panels. */
  floorPanels.forEach((panel) => {
    const isActive = panel.dataset.floorPanel === target;

    panel.classList.toggle("active", isActive);

    panel.setAttribute("aria-hidden", String(!isActive));
  });

  /* Updates floor-plan thumbnails. */
  floorThumbnails.forEach((thumbnail) => {
    const isActive = thumbnail.dataset.floorThumbnail === target;

    thumbnail.classList.toggle("active", isActive);

    thumbnail.setAttribute("aria-pressed", String(isActive));
  });

  /* Updates floor-plan counter. */
  if (floorCurrentNumber) {
    floorCurrentNumber.textContent = selectedFloorData.number;
  }

  /* Updates viewer title. */
  if (floorViewerTitle) {
    floorViewerTitle.textContent = selectedFloorData.title;
  }

  /* Updates information-card title. */
  if (floorInformationTitle) {
    floorInformationTitle.textContent = selectedFloorData.title;
  }

  /* Updates description. */
  if (floorDescription) {
    floorDescription.textContent = selectedFloorData.description;
  }

  /* Updates configuration. */
  if (floorConfiguration) {
    floorConfiguration.textContent = selectedFloorData.configuration;
  }

  /* Updates carpet area. */
  if (floorCarpetArea) {
    floorCarpetArea.textContent = selectedFloorData.carpetArea;
  }

  /* Updates built-up area. */
  if (floorBuiltupArea) {
    floorBuiltupArea.textContent = selectedFloorData.builtupArea;
  }

  /* Updates bedrooms. */
  if (floorBedrooms) {
    floorBedrooms.textContent = selectedFloorData.bedrooms;
  }

  /* Updates bathrooms. */
  if (floorBathrooms) {
    floorBathrooms.textContent = selectedFloorData.bathrooms;
  }

  /* Updates balconies. */
  if (floorBalconies) {
    floorBalconies.textContent = selectedFloorData.balconies;
  }

  /* Updates PDF download URL and filename. */
  if (floorDownloadButton) {
    floorDownloadButton.href = selectedFloorData.download;

    floorDownloadButton.setAttribute(
      "download",
      `${selectedFloorData.configuration
        .toLowerCase()
        .replaceAll(" ", "-")}-floor-plan.pdf`,
    );
  }

  /* Updates room hotspot markers. */
  renderFloorHotspots(floorHotspots, selectedFloorData.hotspots);

  const selectedPanel = document.querySelector(
    `[data-floor-panel="${target}"]`,
  );

  const selectedImage = selectedPanel?.querySelector("img");

  try {
    if (selectedImage && !selectedImage.complete) {
      await selectedImage.decode();
    }

    await new Promise((resolve) => {
      window.setTimeout(resolve, 320);
    });
  } catch (error) {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 320);
    });
  }

  if (floorStage) {
    floorStage.classList.remove("loading");
  }
};

/* Selects a plan from a configuration tab. */
floorTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    updateFloorPlan(tab.dataset.floorTab);
  });
});

/* Supports keyboard navigation between tabs. */
floorTabs.forEach((tab) => {
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();

    const currentIndex = floorPlanOrder.indexOf(activeFloorPlan);

    const newIndex =
      event.key === "ArrowRight"
        ? (currentIndex + 1) % floorPlanOrder.length
        : (currentIndex - 1 + floorPlanOrder.length) % floorPlanOrder.length;

    const newTarget = floorPlanOrder[newIndex];

    updateFloorPlan(newTarget);

    document.querySelector(`[data-floor-tab="${newTarget}"]`)?.focus();
  });
});

/* Selects a plan from a thumbnail. */
floorThumbnails.forEach((thumbnail) => {
  thumbnail.addEventListener("click", () => {
    updateFloorPlan(thumbnail.dataset.floorThumbnail);
  });
});

/* Displays the previous floor plan. */
floorPreviousButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const currentIndex = floorPlanOrder.indexOf(activeFloorPlan);

    const previousIndex =
      (currentIndex - 1 + floorPlanOrder.length) % floorPlanOrder.length;

    updateFloorPlan(floorPlanOrder[previousIndex]);
  });
});

/* Displays the next floor plan. */
floorNextButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const currentIndex = floorPlanOrder.indexOf(activeFloorPlan);

    const nextIndex = (currentIndex + 1) % floorPlanOrder.length;

    updateFloorPlan(floorPlanOrder[nextIndex]);
  });
});

/* Opens the lightbox from the zoom button. */
floorOpenLightboxButtons.forEach((button) => {
  button.addEventListener("click", openFloorLightbox);
});

/* Opens the lightbox when a large image is clicked. */
floorPanels.forEach((panel) => {
  panel.querySelector("img")?.addEventListener("click", openFloorLightbox);
});

/* Opens the lightbox in browser fullscreen mode. */
floorFullscreenButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    openFloorLightbox();

    try {
      await floorLightbox?.requestFullscreen?.();
    } catch (error) {
      /*
       * The normal lightbox remains open
       * when fullscreen is unavailable.
       */
    }
  });
});

/* Closes the lightbox. */
floorLightboxClose?.addEventListener("click", closeFloorLightbox);

/*
 * Closes the lightbox when the dark background
 * outside the canvas is clicked.
 */
floorLightbox?.addEventListener("click", (event) => {
  if (event.target === floorLightbox) {
    closeFloorLightbox();
  }
});

/* Zooms in using the toolbar button. */
floorZoomInButton?.addEventListener("click", () => {
  setFloorZoom(floorZoomScale + 0.2);
});

/* Zooms out using the toolbar button. */
floorZoomOutButton?.addEventListener("click", () => {
  setFloorZoom(floorZoomScale - 0.2);
});

/* Resets the lightbox zoom to 100%. */
floorZoomResetButton?.addEventListener("click", resetFloorZoom);

/* Enters or exits browser fullscreen mode. */
floorLightboxFullscreen?.addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) {
      await floorLightbox?.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  } catch (error) {
    /*
     * Fullscreen may be unavailable or
     * blocked by the browser.
     */
  }
});

/*
 * Mouse-wheel zoom.
 * The image remains centered and cannot be dragged.
 */
floorLightboxCanvas?.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();

    const zoomDirection = event.deltaY < 0 ? 0.15 : -0.15;

    setFloorZoom(floorZoomScale + zoomDirection);
  },
  {
    passive: false,
  },
);

/*
 * Prevents mouse or pointer dragging inside
 * the lightbox canvas.
 */
floorLightboxCanvas?.addEventListener("dragstart", (event) => {
  event.preventDefault();
});

floorLightboxImage?.addEventListener("pointerdown", (event) => {
  event.preventDefault();
});

/* Starts a two-finger pinch gesture. */
floorLightboxCanvas?.addEventListener(
  "touchstart",
  (event) => {
    if (event.touches.length !== 2) {
      return;
    }

    const firstTouch = event.touches[0];

    const secondTouch = event.touches[1];

    floorInitialPinchDistance = Math.hypot(
      secondTouch.clientX - firstTouch.clientX,

      secondTouch.clientY - firstTouch.clientY,
    );

    floorInitialPinchScale = floorZoomScale;
  },
  {
    passive: true,
  },
);

/*
 * Pinch-to-zoom support.
 * The image and markers zoom together.
 */
floorLightboxCanvas?.addEventListener(
  "touchmove",
  (event) => {
    if (event.touches.length !== 2 || !floorInitialPinchDistance) {
      return;
    }

    event.preventDefault();

    const firstTouch = event.touches[0];

    const secondTouch = event.touches[1];

    const currentDistance = Math.hypot(
      secondTouch.clientX - firstTouch.clientX,

      secondTouch.clientY - firstTouch.clientY,
    );

    const newScale =
      floorInitialPinchScale * (currentDistance / floorInitialPinchDistance);

    setFloorZoom(newScale);
  },
  {
    passive: false,
  },
);

/* Resets the stored pinch distance. */
floorLightboxCanvas?.addEventListener(
  "touchend",
  (event) => {
    if (event.touches.length < 2) {
      floorInitialPinchDistance = 0;
    }
  },
  {
    passive: true,
  },
);

floorLightboxCanvas?.addEventListener(
  "touchcancel",
  () => {
    floorInitialPinchDistance = 0;
  },
  {
    passive: true,
  },
);

/* Shows download progress and success feedback. */
floorDownloadButton?.addEventListener("click", () => {
  floorDownloadButton.classList.add("downloading");

  if (floorDownloadText) {
    floorDownloadText.textContent = "Preparing PDF...";
  }

  window.setTimeout(() => {
    floorDownloadButton.classList.remove("downloading");

    if (floorDownloadText) {
      floorDownloadText.textContent = "Download Floor Plan";
    }

    floorToast?.classList.add("show");

    window.setTimeout(() => {
      floorToast?.classList.remove("show");
    }, 2600);
  }, 850);
});

/* Prints the currently selected floor plan. */
floorPrintButton?.addEventListener("click", () => {
  const selectedFloorData = getActiveFloorData();

  if (!selectedFloorData) {
    return;
  }

  const printWindow = window.open("", "_blank", "width=1100,height=800");

  if (!printWindow) {
    return;
  }

  printWindow.document.write(`
      <!DOCTYPE html>

      <html lang="en">
        <head>
          <meta charset="UTF-8" />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />

<title>
  ${selectedFloorData.title} | ${currentProjectSlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")}
</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 30px;
              color: #07366f;
              font-family: Arial, sans-serif;
              text-align: center;
            }

            h1 {
              margin: 0 0 6px;
            }

            .details {
              margin: 0 0 20px;
              color: #687a90;
            }

            img {
              display: block;
              width: 100%;
              max-width: 1050px;
              max-height: 720px;
              margin: 0 auto;
              object-fit: contain;
            }

            .note {
              margin-top: 20px;
              color: #687a90;
              font-size: 12px;
            }

            @media print {
              body {
                padding: 10px;
              }
            }
          </style>
        </head>

        <body>
<h1>
  ${currentProjectSlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")} –
  ${selectedFloorData.title}
</h1>

          <p class="details">
            ${selectedFloorData.carpetArea}
            Carpet Area |

            ${selectedFloorData.builtupArea}
            Built-up Area
          </p>

          <img
            src="${selectedFloorData.image}"
            alt="${selectedFloorData.title}"
          />

          <p class="note">
            Floor plans and dimensions are
            indicative and subject to approvals.
          </p>

          <script>
            const image =
              document.querySelector("img");

            const printPage = () => {
              window.focus();
              window.print();
            };

            if (image.complete) {
              printPage();
            } else {
              image.addEventListener(
                "load",
                printPage,
                { once: true }
              );
            }
          <\/script>
        </body>
      </html>
    `);

  printWindow.document.close();
});

/* Keyboard controls. */
document.addEventListener("keydown", (event) => {
  /*
   * Keyboard controls used while the
   * lightbox is open.
   */
  if (floorLightbox?.classList.contains("open")) {
    if (event.key === "Escape") {
      closeFloorLightbox();
    }

    if (event.key === "+" || event.key === "=") {
      event.preventDefault();

      setFloorZoom(floorZoomScale + 0.2);
    }

    if (event.key === "-") {
      event.preventDefault();

      setFloorZoom(floorZoomScale - 0.2);
    }

    if (event.key === "0") {
      event.preventDefault();
      resetFloorZoom();
    }

    return;
  }

  const floorSection = document.querySelector("#floor-plans");

  if (!floorSection) {
    return;
  }

  const sectionPosition = floorSection.getBoundingClientRect();

  const sectionIsVisible =
    sectionPosition.top < window.innerHeight && sectionPosition.bottom > 0;

  if (!sectionIsVisible) {
    return;
  }

  const currentIndex = floorPlanOrder.indexOf(activeFloorPlan);

  if (event.key === "ArrowLeft") {
    const previousIndex =
      (currentIndex - 1 + floorPlanOrder.length) % floorPlanOrder.length;

    updateFloorPlan(floorPlanOrder[previousIndex]);
  }

  if (event.key === "ArrowRight") {
    const nextIndex = (currentIndex + 1) % floorPlanOrder.length;

    updateFloorPlan(floorPlanOrder[nextIndex]);
  }
});

/* Loads the default 1 BHK floor plan. */
updateFloorPlan(activeFloorPlan);

// ==================================================
// PROJECT DETAILS FLOOR PLANS ENDED
// ==================================================

// ==================================================
// SCHEDULE SITE VISIT MODAL STARTED
// ==================================================

const visitOpenButtons = document.querySelectorAll("[data-open-visit]");

const visitModal = document.querySelector("[data-visit-modal]");

const visitCloseButtons = document.querySelectorAll("[data-close-visit]");

const visitForm = document.querySelector("[data-visit-form]");

const visitFormContent = document.querySelector("[data-visit-form-content]");

const visitSuccess = document.querySelector("[data-visit-success]");

const visitFirstField = document.querySelector("[data-visit-first-field]");

const visitSubmitButton = document.querySelector("[data-visit-submit]");

const visitSubmitText = document.querySelector("[data-visit-submit-text]");

const visitConfiguration = document.querySelector("[data-visit-configuration]");

const visitSuccessSchedule = document.querySelector(
  "[data-visit-success-schedule]",
);

let visitLastFocusedElement = null;

/* Returns today's local date in YYYY-MM-DD format. */
const getVisitLocalDate = () => {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(today.getMonth() + 1).padStart(2, "0");

  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* Prevents users from selecting a past visit date. */
const setVisitMinimumDate = () => {
  const visitDateInput = visitForm?.elements.visitDate;

  if (visitDateInput) {
    visitDateInput.min = getVisitLocalDate();
  }
};

/* Removes one field validation error. */
const clearVisitFieldError = (field) => {
  if (!field) {
    return;
  }

  const fieldContainer = field.closest(".sh-visit-field");

  fieldContainer?.classList.remove("has-error");

  field.removeAttribute("aria-invalid");

  const errorElement = document.querySelector(
    `[data-error-for="${field.name}"]`,
  );

  if (errorElement) {
    errorElement.textContent = "";
  }
};

/* Displays one field validation error. */
const showVisitFieldError = (field, message) => {
  if (!field) {
    return;
  }

  const fieldContainer = field.closest(".sh-visit-field");

  fieldContainer?.classList.add("has-error");

  field.setAttribute("aria-invalid", "true");

  const errorElement = document.querySelector(
    `[data-error-for="${field.name}"]`,
  );

  if (errorElement) {
    errorElement.textContent = message;
  }
};

/* Clears all validation messages. */
const clearAllVisitErrors = () => {
  visitForm
    ?.querySelectorAll(".sh-visit-field.has-error")
    .forEach((fieldContainer) => {
      fieldContainer.classList.remove("has-error");
    });

  visitForm?.querySelectorAll("[aria-invalid='true']").forEach((field) => {
    field.removeAttribute("aria-invalid");
  });

  visitForm?.querySelectorAll(".sh-visit-error").forEach((error) => {
    error.textContent = "";
  });
};

/* Sets the modal to its default form state. */
const resetVisitModalState = () => {
  visitForm?.reset();

  clearAllVisitErrors();

  visitSubmitButton?.classList.remove("loading");

  if (visitSubmitButton) {
    visitSubmitButton.disabled = false;
  }

  if (visitSubmitText) {
    visitSubmitText.textContent = "Book Site Visit";
  }

  if (visitFormContent) {
    visitFormContent.style.display = "block";
  }

  visitSuccess?.classList.remove("show");

  visitSuccess?.setAttribute("aria-hidden", "true");

  setVisitMinimumDate();

  /*
   * Uses the currently selected floor plan
   * when the modal is opened.
   */
  const selectedFloorData =
    typeof getActiveFloorData === "function" ? getActiveFloorData() : null;

  if (visitConfiguration && selectedFloorData?.configuration) {
    visitConfiguration.value = selectedFloorData.configuration;
  }
};

/* OPENS THE SCHEDULE SITE VISIT MODAL */
const openVisitModal = () => {
  const currentVisitModal = document.querySelector("[data-visit-modal]");

  if (!currentVisitModal) {
    console.error("Schedule Site Visit modal not found.");
    return;
  }

  visitLastFocusedElement = document.activeElement;

  resetVisitModalState();

  currentVisitModal.style.display = "flex";

  currentVisitModal.classList.add("open");

  currentVisitModal.setAttribute("aria-hidden", "false");

  document.body.classList.add("sh-visit-modal-open");

  window.requestAnimationFrame(() => {
    currentVisitModal.classList.add("open");
  });

  window.setTimeout(() => {
    document.querySelector("[data-visit-first-field]")?.focus();
  }, 200);
};

/* CLOSES THE SCHEDULE SITE VISIT MODAL */
const closeVisitModal = () => {
  const currentVisitModal = document.querySelector("[data-visit-modal]");

  if (!currentVisitModal) {
    return;
  }

  currentVisitModal.classList.remove("open");

  currentVisitModal.setAttribute("aria-hidden", "true");

  document.body.classList.remove("sh-visit-modal-open");

  window.setTimeout(() => {
    currentVisitModal.style.display = "none";

    resetVisitModalState();
  }, 300);

  visitLastFocusedElement?.focus?.();
};

/* Validates the complete site visit form. */
const validateVisitForm = () => {
  if (!visitForm) {
    return false;
  }

  clearAllVisitErrors();

  let isValid = true;

  const fullName = visitForm.elements.fullName;

  const phone = visitForm.elements.phone;

  const email = visitForm.elements.email;

  const visitDate = visitForm.elements.visitDate;

  const visitTime = visitForm.elements.visitTime;

  const message = visitForm.elements.message;

  const consent = visitForm.elements.consent;

  const fullNameValue = fullName.value.trim();

  const phoneValue = phone.value.replace(/\D/g, "");

  const emailValue = email.value.trim();

  const messageValue = message.value.trim();

  if (fullNameValue.length < 3) {
    showVisitFieldError(fullName, "Please enter at least 3 characters.");

    isValid = false;
  }

  if (!/^[6-9]\d{9}$/.test(phoneValue)) {
    showVisitFieldError(phone, "Enter a valid 10-digit mobile number.");

    isValid = false;
  }

  if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    showVisitFieldError(email, "Enter a valid email address.");

    isValid = false;
  }

  if (!visitDate.value) {
    showVisitFieldError(visitDate, "Please select your preferred date.");

    isValid = false;
  } else if (visitDate.value < getVisitLocalDate()) {
    showVisitFieldError(visitDate, "Please select today or a future date.");

    isValid = false;
  }

  if (!visitTime.value) {
    showVisitFieldError(visitTime, "Please select your preferred time.");

    isValid = false;
  }

  if (messageValue.length > 400) {
    showVisitFieldError(message, "Message must be below 400 characters.");

    isValid = false;
  }

  if (!consent.checked) {
    const consentError = document.querySelector('[data-error-for="consent"]');

    if (consentError) {
      consentError.textContent = "Please accept the contact consent.";
    }

    isValid = false;
  }

  if (!isValid) {
    visitForm.querySelector("[aria-invalid='true']")?.focus();
  }

  return isValid;
};

/* Formats the submitted visit schedule. */
const formatVisitSchedule = (visitDate, visitTime) => {
  if (!visitDate) {
    return visitTime;
  }

  const parsedDate = new Date(`${visitDate}T00:00:00`);

  const formattedDate = parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `${formattedDate}, ${visitTime}`;
};

/* OPENS MODAL FROM EVERY SCHEDULE SITE VISIT BUTTON */
document.addEventListener("click", (event) => {
  const visitButton = event.target.closest("[data-open-visit]");

  if (!visitButton) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  openVisitModal();
});

/* Closes the modal from close buttons and backdrop. */
visitCloseButtons.forEach((button) => {
  button.addEventListener("click", closeVisitModal);
});

/* Allows numeric characters only in the mobile field. */
visitForm?.elements.phone?.addEventListener("input", (event) => {
  event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10);

  clearVisitFieldError(event.target);
});

/* Clears field errors when the visitor edits a value. */
visitForm?.querySelectorAll("input, select, textarea").forEach((field) => {
  field.addEventListener("input", () => {
    clearVisitFieldError(field);

    if (field.name === "consent") {
      const consentError = document.querySelector('[data-error-for="consent"]');

      if (consentError) {
        consentError.textContent = "";
      }
    }
  });

  field.addEventListener("change", () => {
    clearVisitFieldError(field);
  });
});

/* Handles site visit form submission. */
visitForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateVisitForm()) {
    return;
  }

  const formData = new FormData(visitForm);

  const visitData = Object.fromEntries(formData.entries());

  /*
   * This currently demonstrates the success flow.
   * Connect visitData to Google Apps Script or
   * your backend in the next step.
   */
  console.log("Site visit request:", visitData);

  visitSubmitButton?.classList.add("loading");

  if (visitSubmitButton) {
    visitSubmitButton.disabled = true;
  }

  if (visitSubmitText) {
    visitSubmitText.textContent = "Scheduling Visit...";
  }

  await new Promise((resolve) => {
    window.setTimeout(resolve, 1200);
  });

  if (visitSuccessSchedule) {
    visitSuccessSchedule.textContent = formatVisitSchedule(
      visitData.visitDate,
      visitData.visitTime,
    );
  }

  if (visitFormContent) {
    visitFormContent.style.display = "none";
  }

  visitSuccess?.classList.add("show");

  visitSuccess?.setAttribute("aria-hidden", "false");
});

/* Closes the modal with Escape. */
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && visitModal?.classList.contains("open")) {
    closeVisitModal();
  }
});

/* Sets the minimum date when the page loads. */
setVisitMinimumDate();

// ==================================================
// SCHEDULE SITE VISIT MODAL ENDED
// ==================================================

// LIFESTYLE AMENITIES SECTION STARTED

const lifestyleAmenitiesSection = select("#lifestyle-amenities");

if (lifestyleAmenitiesSection) {
  const amenitiesSlides = selectAll(
    "[data-amenities-slide]",
    lifestyleAmenitiesSection,
  );

  const amenitiesDots = selectAll(
    "[data-amenities-dot]",
    lifestyleAmenitiesSection,
  );

  const amenitiesPreviousButton = select(
    "[data-amenities-prev]",
    lifestyleAmenitiesSection,
  );

  const amenitiesNextButton = select(
    "[data-amenities-next]",
    lifestyleAmenitiesSection,
  );

  const amenitiesToggleButton = select(
    "[data-toggle-amenities]",
    lifestyleAmenitiesSection,
  );

  const additionalAmenities = select(
    "#additional-amenities",
    lifestyleAmenitiesSection,
  );

  let activeAmenitiesSlide = 0;

  const updateAmenitiesSlider = (index) => {
    if (!amenitiesSlides.length) return;

    activeAmenitiesSlide =
      (index + amenitiesSlides.length) % amenitiesSlides.length;

    amenitiesSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === activeAmenitiesSlide);
    });

    amenitiesDots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeAmenitiesSlide;

      dot.classList.toggle("active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  amenitiesDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      updateAmenitiesSlider(Number(dot.dataset.amenitiesDot));
    });
  });

  amenitiesPreviousButton?.addEventListener("click", () => {
    updateAmenitiesSlider(activeAmenitiesSlide - 1);
  });

  amenitiesNextButton?.addEventListener("click", () => {
    updateAmenitiesSlider(activeAmenitiesSlide + 1);
  });

  amenitiesToggleButton?.addEventListener("click", () => {
    const isExpanded = lifestyleAmenitiesSection.classList.toggle("expanded");

    amenitiesToggleButton.setAttribute("aria-expanded", String(isExpanded));

    additionalAmenities?.setAttribute("aria-hidden", String(!isExpanded));

    const buttonTitle = select(
      ".lifestyle-amenities-cta-content strong",
      amenitiesToggleButton,
    );

    const buttonText = select(
      ".lifestyle-amenities-cta-content > span",
      amenitiesToggleButton,
    );

    const buttonIcon = select(
      ".lifestyle-amenities-cta-arrow .material-symbols-rounded",
      amenitiesToggleButton,
    );

    if (buttonTitle) {
      buttonTitle.textContent = isExpanded
        ? "Show Fewer Amenities"
        : "View All Amenities";
    }

    if (buttonText) {
      buttonText.textContent = isExpanded
        ? "Hide the additional lifestyle features"
        : "Explore more lifestyle features";
    }

    if (buttonIcon) {
      buttonIcon.textContent = isExpanded ? "arrow_upward" : "arrow_forward";
    }
  });

  updateAmenitiesSlider(0);
}

// LIFESTYLE AMENITIES SECTION ENDED

// PROJECT DETAILS LOCATION TABS STARTED

const locationTabs = selectAll("[data-location-tab]");
const locationPanels = selectAll("[data-location-panel]");

locationTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.locationTab;

    locationTabs.forEach((item) => {
      item.classList.toggle("active", item === tab);
    });

    locationPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.locationPanel === target);
    });
  });
});

// PROJECT DETAILS LOCATION TABS ENDED

/* FAQ ACCORDION STARTED */

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
  const question = item.querySelector(".faq-question");

  question.addEventListener("click", () => {
    faqItems.forEach((otherItem) => {
      if (otherItem !== item) {
        otherItem.classList.remove("active");
      }
    });

    item.classList.toggle("active");
  });
});

/* FAQ ACCORDION ENDED */

// PROJECT DETAILS MODALS STARTED

const lightboxModal = select("#lightboxModal");
const floorModal = select("#floorModal");
const floorModalImage = select("#floorModalImage");

/*
 * The Schedule Site Visit modal is handled by the
 * premium [data-visit-modal] code above.
 */

select("[data-open-lightbox]")?.addEventListener("click", () => {
  updateGallery(activeGalleryIndex);
  setModalState(lightboxModal, true);
});

select("[data-close-lightbox]")?.addEventListener("click", () => {
  setModalState(lightboxModal, false);
});

selectAll("[data-open-floor-image]").forEach((button) => {
  button.addEventListener("click", () => {
    const image = select("img", button);

    if (image && floorModalImage) {
      floorModalImage.src = image.src;
      floorModalImage.alt = image.alt;

      setModalState(floorModal, true);
    }
  });
});

select("[data-close-floor]")?.addEventListener("click", () => {
  setModalState(floorModal, false);
});

[lightboxModal, floorModal].forEach((modal) => {
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      setModalState(modal, false);
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    selectAll(".modal.active").forEach((modal) => {
      setModalState(modal, false);
    });
  }

  if (lightboxModal?.classList.contains("active")) {
    if (event.key === "ArrowLeft") {
      updateGallery(activeGalleryIndex - 1);
    }

    if (event.key === "ArrowRight") {
      updateGallery(activeGalleryIndex + 1);
    }
  }
});

// PROJECT DETAILS MODALS ENDED

// PROJECT DETAILS FORMS STARTED

const handleForm = (formId, messageId) => {
  const form = document.getElementById(formId);
  const message = document.getElementById(messageId);

  if (!form || !message) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    message.classList.add("active");
    form.reset();

    window.setTimeout(() => {
      message.classList.remove("active");
    }, 2800);
  });
};

handleForm("enquiryForm", "formMessage");

// PROJECT DETAILS FORMS ENDED

// PROJECT DETAILS FLOATING ACTIONS STARTED

const floatingActions = select(".floating-actions");
const backToTop = select("[data-back-top]");

const updateFloatingActions = () => {
  const shouldShow = window.scrollY > window.innerHeight * 0.7;

  floatingActions?.classList.toggle("visible", shouldShow);

  backToTop?.classList.toggle("visible", window.scrollY > 700);
};

backToTop?.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

window.addEventListener("scroll", updateFloatingActions, {
  passive: true,
});

updateFloatingActions();

// PROJECT DETAILS FLOATING ACTIONS ENDED

// =========================================================
// PROJECT DETAILS GALLERY STARTED
// =========================================================

const galleryThumbs = Array.from(
  document.querySelectorAll("[data-gallery-thumb]"),
);

const galleryMainImage = document.querySelector("[data-gallery-main]");
const galleryMainTitle = document.querySelector("[data-gallery-main-title]");
const galleryMainDescription = document.querySelector(
  "[data-gallery-main-description]",
);
const galleryMainIcon = document.querySelector("[data-gallery-main-icon]");
const galleryCounter = document.querySelector("[data-gallery-counter]");

const galleryPreviousButton = document.querySelector("[data-gallery-prev]");
const galleryNextButton = document.querySelector("[data-gallery-next]");
const galleryOpenButton = document.querySelector("[data-open-lightbox]");

// FULLSCREEN GALLERY ELEMENTS STARTED

const galleryLightbox = document.querySelector("[data-gallery-lightbox]");
const galleryLightboxImage = document.querySelector("[data-lightbox-image]");
const galleryLightboxTitle = document.querySelector("[data-lightbox-title]");
const galleryLightboxDescription = document.querySelector(
  "[data-lightbox-description]",
);
const galleryLightboxIcon = document.querySelector("[data-lightbox-icon]");
const galleryLightboxCounter = document.querySelector(
  "[data-lightbox-counter]",
);
const galleryLightboxThumbnails = document.querySelector(
  "[data-lightbox-thumbnails]",
);
const galleryLightboxPreviousButton = document.querySelector(
  "[data-lightbox-prev]",
);
const galleryLightboxNextButton = document.querySelector(
  "[data-lightbox-next]",
);
const galleryLightboxViewer = document.querySelector("[data-lightbox-viewer]");
const galleryLightboxCloseButtons = document.querySelectorAll(
  "[data-close-lightbox]",
);

// FULLSCREEN GALLERY ELEMENTS ENDED

let currentGalleryIndex = 0;
let lightboxTouchStartX = 0;
let lightboxTouchEndX = 0;
let lightboxLastFocusedElement = null;

// CREATE GALLERY DATA STARTED

const galleryItems = galleryThumbs.map((thumb) => {
  const thumbImage = thumb.querySelector("img");

  return {
    image: thumb.dataset.galleryThumb,
    title: thumb.dataset.galleryTitle,
    description: thumb.dataset.galleryDescription,
    icon: thumb.dataset.galleryIcon,
    caption: thumb.dataset.galleryCaption,
    alt:
      thumbImage?.getAttribute("alt") ||
      thumb.dataset.galleryCaption ||
      thumb.dataset.galleryTitle,
  };
});

// CREATE GALLERY DATA ENDED

// FORMAT GALLERY NUMBER STARTED

const formatGalleryNumber = (number) => {
  return String(number).padStart(2, "0");
};

// FORMAT GALLERY NUMBER ENDED

// UPDATE MAIN GALLERY STARTED

const updateMainGallery = (index) => {
  if (!galleryItems.length) return;

  currentGalleryIndex = (index + galleryItems.length) % galleryItems.length;

  const activeItem = galleryItems[currentGalleryIndex];

  galleryThumbs.forEach((thumb, thumbIndex) => {
    const isActive = thumbIndex === currentGalleryIndex;

    thumb.classList.toggle("active", isActive);
    thumb.setAttribute("aria-pressed", String(isActive));
  });

  if (galleryMainImage) {
    galleryMainImage.classList.add("changing");

    window.setTimeout(() => {
      galleryMainImage.src = activeItem.image;
      galleryMainImage.alt = activeItem.alt;
      galleryMainImage.classList.remove("changing");
    }, 180);
  }

  if (galleryMainTitle) {
    galleryMainTitle.textContent = activeItem.title;
  }

  if (galleryMainDescription) {
    galleryMainDescription.textContent = activeItem.description;
  }

  if (galleryMainIcon) {
    galleryMainIcon.textContent = activeItem.icon;
  }

  if (galleryCounter) {
    galleryCounter.textContent = `${formatGalleryNumber(
      currentGalleryIndex + 1,
    )} / ${formatGalleryNumber(galleryItems.length)}`;
  }
};

// UPDATE MAIN GALLERY ENDED

// CREATE FULLSCREEN THUMBNAILS STARTED

const createLightboxThumbnails = () => {
  if (!galleryLightboxThumbnails) return;

  galleryLightboxThumbnails.innerHTML = "";

  galleryItems.forEach((item, index) => {
    const thumbnailButton = document.createElement("button");

    thumbnailButton.type = "button";
    thumbnailButton.className = "gallery-lightbox-thumbnail";
    thumbnailButton.dataset.lightboxThumbnail = String(index);
    thumbnailButton.setAttribute(
      "aria-label",
      `View ${item.title}, image ${index + 1} of ${galleryItems.length}`,
    );

    thumbnailButton.innerHTML = `
      <img src="${item.image}" alt="${item.alt}" />
      <span>${formatGalleryNumber(index + 1)}</span>
    `;

    thumbnailButton.addEventListener("click", () => {
      updateLightboxGallery(index);
    });

    galleryLightboxThumbnails.appendChild(thumbnailButton);
  });
};

// CREATE FULLSCREEN THUMBNAILS ENDED

// UPDATE FULLSCREEN GALLERY STARTED

const updateLightboxGallery = (index, animate = true) => {
  if (!galleryItems.length) return;

  currentGalleryIndex = (index + galleryItems.length) % galleryItems.length;

  const activeItem = galleryItems[currentGalleryIndex];

  const changeLightboxContent = () => {
    if (galleryLightboxImage) {
      galleryLightboxImage.src = activeItem.image;
      galleryLightboxImage.alt = activeItem.alt;
    }

    if (galleryLightboxTitle) {
      galleryLightboxTitle.textContent = activeItem.title;
    }

    if (galleryLightboxDescription) {
      galleryLightboxDescription.textContent = activeItem.description;
    }

    if (galleryLightboxIcon) {
      galleryLightboxIcon.textContent = activeItem.icon;
    }

    if (galleryLightboxCounter) {
      galleryLightboxCounter.textContent = `${formatGalleryNumber(
        currentGalleryIndex + 1,
      )} / ${formatGalleryNumber(galleryItems.length)}`;
    }

    const fullscreenThumbnails = document.querySelectorAll(
      "[data-lightbox-thumbnail]",
    );

    fullscreenThumbnails.forEach((thumbnail, thumbnailIndex) => {
      const isActive = thumbnailIndex === currentGalleryIndex;

      thumbnail.classList.toggle("active", isActive);
      thumbnail.setAttribute("aria-current", isActive ? "true" : "false");

      if (isActive) {
        thumbnail.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    });

    updateMainGallery(currentGalleryIndex);
  };

  if (animate && galleryLightboxImage) {
    galleryLightboxImage.classList.add("changing");

    window.setTimeout(() => {
      changeLightboxContent();
      galleryLightboxImage.classList.remove("changing");
    }, 180);
  } else {
    changeLightboxContent();
  }
};

// UPDATE FULLSCREEN GALLERY ENDED

// OPEN FULLSCREEN GALLERY STARTED

const openGalleryLightbox = () => {
  if (!galleryLightbox) return;

  lightboxLastFocusedElement = document.activeElement;

  updateLightboxGallery(currentGalleryIndex, false);

  galleryLightbox.classList.add("active");
  galleryLightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("gallery-lightbox-open");

  const closeButton = galleryLightbox.querySelector(".gallery-lightbox-close");

  window.setTimeout(() => {
    closeButton?.focus();
  }, 100);
};

// OPEN FULLSCREEN GALLERY ENDED

// CLOSE FULLSCREEN GALLERY STARTED

const closeGalleryLightbox = () => {
  if (!galleryLightbox) return;

  galleryLightbox.classList.remove("active");
  galleryLightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("gallery-lightbox-open");

  lightboxLastFocusedElement?.focus();
};

// CLOSE FULLSCREEN GALLERY ENDED

// MAIN GALLERY EVENTS STARTED

galleryThumbs.forEach((thumb, index) => {
  thumb.addEventListener("click", () => {
    updateMainGallery(index);
  });
});

galleryPreviousButton?.addEventListener("click", () => {
  updateMainGallery(currentGalleryIndex - 1);
});

galleryNextButton?.addEventListener("click", () => {
  updateMainGallery(currentGalleryIndex + 1);
});

galleryOpenButton?.addEventListener("click", openGalleryLightbox);

// MAIN GALLERY EVENTS ENDED

// FULLSCREEN GALLERY EVENTS STARTED

galleryLightboxPreviousButton?.addEventListener("click", () => {
  updateLightboxGallery(currentGalleryIndex - 1);
});

galleryLightboxNextButton?.addEventListener("click", () => {
  updateLightboxGallery(currentGalleryIndex + 1);
});

galleryLightboxCloseButtons.forEach((button) => {
  button.addEventListener("click", closeGalleryLightbox);
});

// FULLSCREEN GALLERY EVENTS ENDED

// FULLSCREEN GALLERY KEYBOARD NAVIGATION STARTED

document.addEventListener("keydown", (event) => {
  const isLightboxOpen = galleryLightbox?.classList.contains("active");

  if (!isLightboxOpen) return;

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    updateLightboxGallery(currentGalleryIndex - 1);
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    updateLightboxGallery(currentGalleryIndex + 1);
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeGalleryLightbox();
  }
});

// FULLSCREEN GALLERY KEYBOARD NAVIGATION ENDED

// FULLSCREEN GALLERY TOUCH SWIPE STARTED

galleryLightboxViewer?.addEventListener(
  "touchstart",
  (event) => {
    lightboxTouchStartX = event.changedTouches[0].clientX;
  },
  {
    passive: true,
  },
);

galleryLightboxViewer?.addEventListener(
  "touchend",
  (event) => {
    lightboxTouchEndX = event.changedTouches[0].clientX;

    const swipeDistance = lightboxTouchStartX - lightboxTouchEndX;
    const minimumSwipeDistance = 50;

    if (Math.abs(swipeDistance) < minimumSwipeDistance) return;

    if (swipeDistance > 0) {
      updateLightboxGallery(currentGalleryIndex + 1);
    } else {
      updateLightboxGallery(currentGalleryIndex - 1);
    }
  },
  {
    passive: true,
  },
);

// FULLSCREEN GALLERY TOUCH SWIPE ENDED

// INITIALIZE PROJECT GALLERY STARTED

if (galleryItems.length) {
  createLightboxThumbnails();
  updateMainGallery(0);
}

// INITIALIZE PROJECT GALLERY ENDED

// =========================================================
// PROJECT DETAILS GALLERY ENDED
// =========================================================

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

/* =====================================================
   SIMILAR PROJECTS SLIDER
===================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const similarSection = document.querySelector(".similar-projects-section");

  if (!similarSection) return;

  const track = similarSection.querySelector(".similar-projects-track");
  const cards = Array.from(
    similarSection.querySelectorAll(".similar-project-card"),
  );
  const previousButton = similarSection.querySelector(".similar-prev-btn");
  const nextButton = similarSection.querySelector(".similar-next-btn");
  const dotsContainer = similarSection.querySelector(".similar-projects-dots");
  const favouriteButtons = similarSection.querySelectorAll(
    ".similar-favourite-btn",
  );

  let currentSlide = 0;
  let cardsPerView = getCardsPerView();
  let totalSlides = getTotalSlides();

  /* Get Cards Visible According to Screen Size */
  function getCardsPerView() {
    if (window.innerWidth <= 767) return 1;
    if (window.innerWidth <= 991) return 2;
    if (window.innerWidth <= 1250) return 3;

    return 4;
  }

  /* Get Total Available Slider Positions */
  function getTotalSlides() {
    return Math.max(1, cards.length - cardsPerView + 1);
  }

  /* Create Slider Pagination Dots */
  function createDots() {
    dotsContainer.innerHTML = "";

    for (let index = 0; index < totalSlides; index++) {
      const dot = document.createElement("button");

      dot.type = "button";
      dot.className = "similar-project-dot";
      dot.setAttribute("aria-label", `Show project slide ${index + 1}`);

      dot.addEventListener("click", function () {
        currentSlide = index;
        updateSlider();
      });

      dotsContainer.appendChild(dot);
    }
  }

  /* Move Slider */
  function updateSlider() {
    const firstCard = cards[0];

    if (!firstCard) return;

    const trackStyles = window.getComputedStyle(track);
    const trackGap = parseFloat(trackStyles.columnGap || trackStyles.gap) || 0;
    const cardWidth = firstCard.getBoundingClientRect().width;
    const slideDistance = cardWidth + trackGap;

    track.style.transform = `translateX(-${currentSlide * slideDistance}px)`;

    const dots = dotsContainer.querySelectorAll(".similar-project-dot");

    dots.forEach(function (dot, index) {
      dot.classList.toggle("active", index === currentSlide);
    });

    previousButton.disabled = currentSlide === 0;
    nextButton.disabled = currentSlide >= totalSlides - 1;
  }

  /* Previous Button */
  previousButton.addEventListener("click", function () {
    if (currentSlide > 0) {
      currentSlide--;
      updateSlider();
    }
  });

  /* Next Button */
  nextButton.addEventListener("click", function () {
    if (currentSlide < totalSlides - 1) {
      currentSlide++;
      updateSlider();
    }
  });

  /* Favourite Heart Buttons */
  favouriteButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const heartIcon = button.querySelector("i");
      const isActive = button.classList.toggle("active");

      heartIcon.classList.toggle("fa-regular", !isActive);
      heartIcon.classList.toggle("fa-solid", isActive);

      button.setAttribute(
        "aria-label",
        isActive ? "Remove from favourites" : "Add to favourites",
      );
    });
  });

  /* Keyboard Navigation */
  similarSection.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      previousButton.click();
    }

    if (event.key === "ArrowRight") {
      nextButton.click();
    }
  });

  /* Update Slider After Window Resize */
  let resizeTimer;

  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(function () {
      const updatedCardsPerView = getCardsPerView();

      if (updatedCardsPerView !== cardsPerView) {
        cardsPerView = updatedCardsPerView;
        totalSlides = getTotalSlides();
        currentSlide = Math.min(currentSlide, totalSlides - 1);
        createDots();
      }

      updateSlider();
    }, 180);
  });

  /* Initial Slider Setup */
  createDots();
  updateSlider();
});

/* ==================================================
   LOCATION MAP ZOOM CONTROLS
================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const locationMap = document.querySelector(
    ".project-details-page .location-map",
  );

  const zoomInButton = document.querySelector("[data-map-zoom-in]");
  const zoomOutButton = document.querySelector("[data-map-zoom-out]");
  const resetButton = document.querySelector("[data-map-reset]");

  if (!locationMap || !zoomInButton || !zoomOutButton || !resetButton) {
    return;
  }

  const minimumZoom = 1;
  const maximumZoom = 1.4;
  const zoomStep = 0.1;

  let currentZoom = minimumZoom;

  const updateMapZoom = () => {
    locationMap.style.setProperty("--map-zoom", currentZoom.toFixed(2));

    zoomInButton.disabled = currentZoom >= maximumZoom;
    zoomOutButton.disabled = currentZoom <= minimumZoom;
  };

  zoomInButton.addEventListener("click", () => {
    currentZoom = Math.min(maximumZoom, currentZoom + zoomStep);

    updateMapZoom();
  });

  zoomOutButton.addEventListener("click", () => {
    currentZoom = Math.max(minimumZoom, currentZoom - zoomStep);

    updateMapZoom();
  });

  resetButton.addEventListener("click", () => {
    currentZoom = minimumZoom;
    updateMapZoom();

    locationMap.classList.add("location-map-resetting");

    window.setTimeout(() => {
      locationMap.classList.remove("location-map-resetting");
    }, 500);
  });

  updateMapZoom();
});

/* ==================================================
   PROJECT HIGHLIGHTS SCROLL REVEAL STARTED
================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const highlightRevealElements = document.querySelectorAll(
    "[data-highlight-reveal]",
  );

  if (!highlightRevealElements.length) {
    return;
  }

  const highlightsRevealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -60px 0px",
    },
  );

  highlightRevealElements.forEach((element) => {
    highlightsRevealObserver.observe(element);
  });
});

/* ==================================================
   PROJECT HIGHLIGHTS SCROLL REVEAL ENDED
================================================== */

// ==================================================
// SKYLINE HEIGHTS GET IN TOUCH FORM STARTED
// ==================================================

const skylineContactForm = document.getElementById("skylineReachUsForm");

const skylineContactStatus = document.getElementById("skylineFormStatus");

const skylineContactSubmitButton = skylineContactForm?.querySelector(
  "[data-skyline-contact-submit]",
);

const skylineContactSubmitText = skylineContactForm?.querySelector(
  "[data-skyline-contact-submit-text]",
);

/* CLEARS ONE FIELD ERROR */
const clearSkylineContactError = (field) => {
  if (!field) {
    return;
  }

  field.closest(".skyline-form-group")?.classList.remove("has-error");

  field.removeAttribute("aria-invalid");

  const errorElement = skylineContactForm?.querySelector(
    `[data-skyline-error="${field.name}"]`,
  );

  if (errorElement) {
    errorElement.textContent = "";
  }
};

/* DISPLAYS ONE FIELD ERROR */
const showSkylineContactError = (field, message) => {
  if (!field) {
    return;
  }

  field.closest(".skyline-form-group")?.classList.add("has-error");

  field.setAttribute("aria-invalid", "true");

  const errorElement = skylineContactForm?.querySelector(
    `[data-skyline-error="${field.name}"]`,
  );

  if (errorElement) {
    errorElement.textContent = message;
  }
};

/* CLEARS ALL CONTACT FORM ERRORS */
const clearAllSkylineContactErrors = () => {
  skylineContactForm
    ?.querySelectorAll(".skyline-form-group.has-error")
    .forEach((group) => {
      group.classList.remove("has-error");
    });

  skylineContactForm
    ?.querySelectorAll("[aria-invalid='true']")
    .forEach((field) => {
      field.removeAttribute("aria-invalid");
    });

  skylineContactForm
    ?.querySelectorAll(".skyline-field-error")
    .forEach((error) => {
      error.textContent = "";
    });
};

/* VALIDATES THE CONTACT FORM */
const validateSkylineContactForm = () => {
  if (!skylineContactForm) {
    return false;
  }

  clearAllSkylineContactErrors();

  let isValid = true;

  const fullName = skylineContactForm.elements.fullName;

  const phone = skylineContactForm.elements.phone;

  const email = skylineContactForm.elements.email;

  const purpose = skylineContactForm.elements.purpose;

  const message = skylineContactForm.elements.message;

  const fullNameValue = fullName.value.trim();

  const phoneValue = phone.value.replace(/\D/g, "");

  const emailValue = email.value.trim();

  const messageValue = message.value.trim();

  if (fullNameValue.length < 3) {
    showSkylineContactError(fullName, "Please enter at least 3 characters.");

    isValid = false;
  }

  if (!/^[6-9]\d{9}$/.test(phoneValue)) {
    showSkylineContactError(phone, "Enter a valid 10-digit mobile number.");

    isValid = false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    showSkylineContactError(email, "Enter a valid email address.");

    isValid = false;
  }

  if (!purpose.value) {
    showSkylineContactError(purpose, "Please select an enquiry purpose.");

    isValid = false;
  }

  if (messageValue.length < 5) {
    showSkylineContactError(message, "Please enter at least 5 characters.");

    isValid = false;
  }

  if (!isValid) {
    skylineContactForm.querySelector("[aria-invalid='true']")?.focus();
  }

  return isValid;
};

/* ALLOWS ONLY NUMBERS IN PHONE FIELD */
skylineContactForm?.elements.phone?.addEventListener("input", (event) => {
  event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10);

  clearSkylineContactError(event.target);
});

/* CLEARS FIELD ERROR WHILE EDITING */
skylineContactForm
  ?.querySelectorAll("input, select, textarea")
  .forEach((field) => {
    field.addEventListener("input", () => {
      clearSkylineContactError(field);

      if (skylineContactStatus) {
        skylineContactStatus.className = "skyline-form-status";

        skylineContactStatus.textContent = "";
      }
    });

    field.addEventListener("change", () => {
      clearSkylineContactError(field);
    });
  });

/* HANDLES CONTACT FORM SUBMISSION */
skylineContactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateSkylineContactForm()) {
    return;
  }

  skylineContactSubmitButton?.classList.add("loading");

  if (skylineContactSubmitButton) {
    skylineContactSubmitButton.disabled = true;
  }

  if (skylineContactSubmitText) {
    skylineContactSubmitText.textContent = "Sending Message...";
  }

  if (skylineContactStatus) {
    skylineContactStatus.className = "skyline-form-status";

    skylineContactStatus.textContent = "";
  }

  /*
   * Demonstration delay.
   * Replace this section with your Google Apps Script
   * or backend request when it is ready.
   */
  await new Promise((resolve) => {
    window.setTimeout(resolve, 1200);
  });

  skylineContactSubmitButton?.classList.remove("loading");

  if (skylineContactSubmitButton) {
    skylineContactSubmitButton.disabled = false;
  }

  if (skylineContactSubmitText) {
    skylineContactSubmitText.textContent = "Send Message";
  }

  if (skylineContactStatus) {
    skylineContactStatus.className = "skyline-form-status success";

    skylineContactStatus.textContent =
      "Thank you! Your enquiry has been received. Our advisor will contact you shortly.";
  }

  skylineContactForm.reset();

  window.setTimeout(() => {
    if (skylineContactStatus) {
      skylineContactStatus.className = "skyline-form-status";

      skylineContactStatus.textContent = "";
    }
  }, 6000);
});

// ==================================================
// SKYLINE HEIGHTS GET IN TOUCH FORM ENDED
// ==================================================

/* ==================================================
   OVERVIEW & GALLERY — EXACT NAVBAR SCROLL FIX
================================================== */

document.addEventListener("click", function (event) {
  const link = event.target.closest('a[href="#overview"], a[href="#gallery"]');

  if (!link) return;

  const targetId = link.getAttribute("href");
  const targetSection = document.querySelector(targetId);

  if (!targetSection) return;

  event.preventDefault();

  const navbarHeight = 72;

  const targetPosition =
    targetSection.getBoundingClientRect().top + window.scrollY - navbarHeight;

  window.scrollTo({
    top: targetPosition,
    behavior: "smooth",
  });

  history.replaceState(null, "", targetId);
});

/* ==================================================
   OVERVIEW & GALLERY — EXACT NAVBAR SCROLL FIX ENDED
================================================== */

/* ==================================================
   NAVBAR — ACTIVE LINK ON PAGE SCROLL
================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const navbarLinks = document.querySelectorAll(
    '.navbar-link[href^="#"], .navbar-dropdown-link[href^="#"]',
  );

  const dropdownToggle = document.querySelector(".navbar-dropdown-toggle");

  const sectionData = Array.from(navbarLinks)
    .map((link) => {
      const sectionId = link.getAttribute("href");
      const section = document.querySelector(sectionId);

      return section
        ? {
            link,
            section,
            id: sectionId,
          }
        : null;
    })
    .filter(Boolean);

  function removeActiveClasses() {
    navbarLinks.forEach((link) => {
      link.classList.remove("active");
    });

    if (dropdownToggle) {
      dropdownToggle.classList.remove("active");
    }
  }

  function updateActiveNavbarLink() {
    const navbar = document.querySelector(
      ".main-header, .header, [data-header]",
    );
    const navbarHeight = navbar ? navbar.offsetHeight : 72;

    const scrollPosition = window.scrollY + navbarHeight + 120;

    // Hero section: no menu should be active
    const overviewSection = document.querySelector("#overview");

    if (overviewSection && scrollPosition < overviewSection.offsetTop) {
      removeActiveClasses();
      return;
    }

    let currentSection = sectionData[0];

    sectionData.forEach((item) => {
      if (item.section.offsetTop <= scrollPosition) {
        currentSection = item;
      }
    });

    if (!currentSection) return;

    removeActiveClasses();

    currentSection.link.classList.add("active");

    const dropdownParent = currentSection.link.closest(".navbar-dropdown-menu");

    if (dropdownParent && dropdownToggle) {
      dropdownToggle.classList.add("active");
    }
  }

  window.addEventListener("scroll", updateActiveNavbarLink, {
    passive: true,
  });

  window.addEventListener("resize", updateActiveNavbarLink);

  updateActiveNavbarLink();
});

/* ==================================================
   NAVBAR — ACTIVE LINK ON PAGE SCROLL ENDED
================================================== */

/* ==================================================
   ALL TESTIMONIALS MODAL
================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const openButton = document.querySelector("#open-testimonials-modal");
  const modal = document.querySelector("#testimonials-modal");
  const closeButton = document.querySelector("#close-testimonials-modal");

  if (!openButton || !modal || !closeButton) return;

  const openModal = () => {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("testimonials-modal-open");

    closeButton.focus();
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("testimonials-modal-open");

    openButton.focus();
  };

  openButton.addEventListener("click", openModal);
  closeButton.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
});

// ==================================================
// EXCEL PROPERTY DATA INTEGRATION STARTED
// ==================================================

document.addEventListener("DOMContentLoaded", async () => {
  const projectHero = document.querySelector("[data-project-slug]");

  if (!projectHero) {
    return;
  }

  const projectSlug = projectHero.dataset.projectSlug;

  try {
    const response = await fetch("../assets/data/properties.json");

    if (!response.ok) {
      throw new Error(`Property data could not be loaded: ${response.status}`);
    }

    const propertyData = await response.json();

    const properties = Array.isArray(propertyData)
      ? propertyData
      : Array.isArray(propertyData.projects)
        ? propertyData.projects
        : [];

    const property = properties.find((item) => {
      const itemSlug =
        item.slug || item.Slug || item.projectSlug || item.ProjectSlug || "";

      return (
        String(itemSlug).trim().toLowerCase() ===
        String(projectSlug).trim().toLowerCase()
      );
    });

    if (!property) {
      console.warn(`Property not found for slug: ${projectSlug}`);
      return;
    }

    // ==================================================
    // GENERAL PROPERTY HELPERS STARTED
    // ==================================================

    const getValue = (...keys) => {
      for (const key of keys) {
        if (
          property[key] !== undefined &&
          property[key] !== null &&
          String(property[key]).trim() !== ""
        ) {
          return property[key];
        }
      }

      return "";
    };

    const setText = (selector, value) => {
      if (value === "" || value === null || value === undefined) {
        return;
      }

      document.querySelectorAll(selector).forEach((element) => {
        element.textContent = value;
      });
    };

    const setCounter = (selector, value) => {
      if (value === "" || value === null || value === undefined) {
        return;
      }

      document.querySelectorAll(selector).forEach((element) => {
        element.dataset.count = value;
        element.textContent = value;
      });
    };

    const staticProjectName =
      document.querySelector("[data-property-name]")?.textContent.trim() || "";

    const projectName = getValue("name", "Name", "projectName", "ProjectName");

    const normalizeFolderPath = (folder) => {
      const cleanFolder = String(folder || "")
        .trim()
        .replace(/^\/+|\/+$/g, "");

      return cleanFolder ? `../${cleanFolder}/` : "";
    };

    const normalizeAssetPath = (assetPath) => {
      const cleanPath = String(assetPath || "").trim();

      if (!cleanPath) {
        return "";
      }

      if (/^(?:https?:)?\/\//i.test(cleanPath)) {
        return cleanPath;
      }

      if (cleanPath.startsWith("../") || cleanPath.startsWith("./")) {
        return cleanPath;
      }

      return `../${cleanPath.replace(/^\/+/, "")}`;
    };

    // ==================================================
    // GENERAL PROPERTY HELPERS ENDED
    // ==================================================

    // ==================================================
    // PAGE META DATA STARTED
    // ==================================================

    const metaTitle = getValue("metaTitle", "Meta Title");

    const metaDescription = getValue("metaDescription", "Meta Description");

    if (metaTitle) {
      document.title = metaTitle;
    }

    if (metaDescription) {
      let metaDescriptionTag = document.querySelector(
        'meta[name="description"]',
      );

      if (!metaDescriptionTag) {
        metaDescriptionTag = document.createElement("meta");

        metaDescriptionTag.setAttribute("name", "description");

        document.head.appendChild(metaDescriptionTag);
      }

      metaDescriptionTag.setAttribute("content", metaDescription);
    }

    // ==================================================
    // PAGE META DATA ENDED
    // ==================================================

    // ==================================================
    // BASIC PROJECT DATA STARTED
    // ==================================================

    setText("[data-property-name]", projectName);

    setText("[data-property-badge]", getValue("badge", "Badge"));

    setText(
      "[data-property-category-label]",
      getValue("categoryLabel", "Category Label", "Card Category Label"),
    );

    const badgeTheme = String(getValue("badgeTheme", "Badge Theme"))
      .trim()
      .toLowerCase();

    const heroFloatingBadge = document.querySelector(".hero-floating-badge");

    if (heroFloatingBadge && badgeTheme) {
      heroFloatingBadge.classList.remove(
        "badge-theme-gold",
        "badge-theme-orange",
        "badge-theme-green",
        "badge-theme-blue",
        "badge-theme-purple",
      );

      heroFloatingBadge.classList.add(`badge-theme-${badgeTheme}`);
    }

    // ==================================================
    // BASIC PROJECT DATA ENDED
    // ==================================================

    // ==================================================
    // HERO IMAGE DATA STARTED
    // ==================================================

    const heroImage = getValue("heroImage", "Hero Image");

    if (heroImage) {
      projectHero.style.backgroundImage = `url("${normalizeAssetPath(heroImage)}")`;
    }

    // ==================================================
    // HERO IMAGE DATA ENDED
    // ==================================================

    // ==================================================
    // LISTING / PRICE DATA STARTED
    // ==================================================

    const activeListings = Array.isArray(property.listings)
      ? property.listings.filter((listing) => listing.active !== false)
      : [];

    const activePriceListings = activeListings.filter((listing) =>
      Number.isFinite(Number(listing.startingPrice)),
    );

    const lowestPriceListing = activePriceListings.reduce((lowest, listing) => {
      if (!lowest) {
        return listing;
      }

      return Number(listing.startingPrice) < Number(lowest.startingPrice)
        ? listing
        : lowest;
    }, null);

    const heroDisplayPrice =
      lowestPriceListing?.displayPrice ||
      getValue("price", "Price", "startingPrice", "StartingPrice");

    setText("[data-property-price]", heroDisplayPrice);

    const projectConfiguration = getValue(
      "configuration",
      "Configuration",
      "configurations",
      "Configurations",
    );

    setText("[data-property-configuration]", projectConfiguration);

    const projectArea = getValue(
      "area",
      "Area",
      "carpetArea",
      "CarpetArea",
      "areaRange",
      "AreaRange",
    );

    setText("[data-property-area]", projectArea);

    const projectPossession = getValue(
      "possession",
      "Possession",
      "possessionDate",
      "PossessionDate",
      "possessionDisplay",
      "Possession Display",
    );

    setText("[data-property-possession]", projectPossession);

    // ==================================================
    // LISTING / PRICE DATA ENDED
    // ==================================================

    // ==================================================
    // HERO TEXT DATA STARTED
    // ==================================================

    const propertyLocality = getValue("locality", "Locality");

    const propertyCity = getValue("city", "City");

    const propertyLocation =
      propertyLocality && propertyCity
        ? `${propertyLocality}, ${propertyCity}`
        : propertyLocality || propertyCity;

    if (projectConfiguration && propertyLocality) {
      setText(
        "[data-property-hero-description]",
        `Premium ${projectConfiguration} residences in ${propertyLocality} with elegant interiors, landscaped spaces, lifestyle amenities and excellent city connectivity.`,
      );
    }

    // ==================================================
    // HERO TEXT DATA ENDED
    // ==================================================

    // ==================================================
    // PROJECT OVERVIEW DATA STARTED
    // ==================================================

    const shortDescription = getValue("shortDescription", "Short Description");

    setText("[data-property-overview-description]", shortDescription);

    const overviewImage = getValue("overviewImage", "Overview Image");

    if (overviewImage) {
      document
        .querySelectorAll("[data-property-overview-image]")
        .forEach((image) => {
          image.src = normalizeAssetPath(overviewImage);

          image.alt = projectName
            ? `${projectName} premium residential project`
            : image.alt;
        });
    }

    setText("[data-property-location]", propertyLocation);

    setCounter("[data-property-towers]", getValue("towers", "Towers"));

    setCounter("[data-property-floors]", getValue("floors", "Floors"));

    setCounter(
      "[data-property-residences]",
      getValue("totalUnits", "TotalUnits", "Total Units"),
    );

    const reraNumber = getValue("reraNumber", "ReraNumber", "RERA Number");

    setText("[data-property-rera]", reraNumber ? `RERA No. ${reraNumber}` : "");

    const lastUpdated = getValue("lastUpdated", "Last Updated");

    if (lastUpdated) {
      const parsedLastUpdated = new Date(`${lastUpdated}T00:00:00`);

      const formattedLastUpdated = Number.isNaN(parsedLastUpdated.getTime())
        ? lastUpdated
        : parsedLastUpdated.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

      setText("[data-property-last-updated]", formattedLastUpdated);
    }

    const brochurePdf = getValue("brochurePdf", "Brochure PDF");

    if (brochurePdf) {
      document.querySelectorAll("[data-property-brochure]").forEach((link) => {
        link.href = normalizeAssetPath(brochurePdf);
      });
    }

    // ==================================================
    // CONFIGURATION PRICE LIST STARTED
    // ==================================================

    const configurationPricesContainer = document.querySelector(
      "[data-property-configuration-prices]",
    );

    if (configurationPricesContainer && activeListings.length) {
      const configurationMap = new Map();

      activeListings.forEach((listing) => {
        const configuration = String(listing.configuration || "").trim();

        const priceValue = Number(listing.startingPrice);

        if (!configuration || !Number.isFinite(priceValue)) {
          return;
        }

        const existing = configurationMap.get(configuration);

        if (!existing || priceValue < existing.startingPrice) {
          configurationMap.set(configuration, {
            configuration,
            startingPrice: priceValue,
            displayPrice: listing.displayPrice || "",
            bhkCount: Number(listing.bhkCount) || 999,
          });
        }
      });

      const configurationPrices = [...configurationMap.values()].sort(
        (a, b) => a.bhkCount - b.bhkCount,
      );

      const areaRangeItem = configurationPricesContainer
        .querySelector("[data-property-area]")
        ?.closest("li");

      configurationPricesContainer
        .querySelectorAll("[data-property-generated-price]")
        .forEach((item) => {
          item.remove();
        });

      configurationPrices
        .slice()
        .reverse()
        .forEach((item) => {
          const priceItem = document.createElement("li");

          priceItem.setAttribute("data-property-generated-price", "");

          priceItem.innerHTML = `
            <span>${item.configuration}</span>
            <strong>From ${item.displayPrice}</strong>
          `;

          if (areaRangeItem) {
            configurationPricesContainer.insertBefore(priceItem, areaRangeItem);
          } else {
            configurationPricesContainer.appendChild(priceItem);
          }
        });
    }

    // ==================================================
    // CONFIGURATION PRICE LIST ENDED
    // ==================================================

    // ==================================================
    // PROJECT OVERVIEW DATA ENDED
    // ==================================================

    // ==================================================
    // PROJECT DETAILS DATA STARTED
    // ==================================================

    setText(
      "[data-property-details-title]",
      projectName ? `Discover ${projectName} Today` : "",
    );

    if (projectName && projectConfiguration) {
      setText(
        "[data-property-details-description]",
        `${projectName} offers premium ${projectConfiguration} homes with modern amenities and excellent connectivity.`,
      );
    }

    const projectStatus =
      getValue(
        "constructionStatus",
        "Construction Status",
        "status",
        "Status",
      ) ||
      activeListings[0]?.constructionStatus ||
      activeListings[0]?.["Construction Status"] ||
      "";

    setText("[data-property-status]", projectStatus);

    setText("[data-property-details-configuration]", projectConfiguration);

    setText("[data-property-details-towers]", getValue("towers", "Towers"));

    setText("[data-property-details-floors]", getValue("floors", "Floors"));

    setText(
      "[data-property-details-units]",
      getValue("totalUnits", "TotalUnits", "Total Units"),
    );

    setText("[data-property-details-possession]", projectPossession);

    setText(
      "[data-property-details-developer]",
      getValue("developer", "Developer"),
    );

    setText("[data-property-details-rera]", reraNumber);

    setText(
      "[data-property-details-address]",
      getValue("location", "Full Address") || propertyLocation,
    );

    const projectDetailsImage = getValue(
      "projectDetailsImage",
      "Project Details Image",
    );

    if (projectDetailsImage) {
      document
        .querySelectorAll("[data-property-details-image]")
        .forEach((image) => {
          image.src = normalizeAssetPath(projectDetailsImage);

          image.alt = projectName
            ? `Luxury residential towers at ${projectName}`
            : image.alt;
        });
    }

    // ==================================================
    // PROJECT DETAILS DATA ENDED
    // ==================================================

    // ==================================================
    // PROJECT HIGHLIGHTS DATA STARTED
    // ==================================================

    const highlightsImage = getValue("highlightsImage", "Highlights Image");

    if (highlightsImage) {
      document
        .querySelectorAll("[data-property-highlights-image]")
        .forEach((image) => {
          image.src = normalizeAssetPath(highlightsImage);

          image.alt = projectName
            ? `${projectName} premium residential project`
            : image.alt;
        });
    }

    if (projectName) {
      setText(
        "[data-property-highlights-description]",
        `${projectName} brings together thoughtful planning, modern amenities and a prime location to create the lifestyle you deserve.`,
      );
    }

    if (projectPossession) {
      setText(
        "[data-property-highlights-possession]",
        `Possession for ${projectPossession} with milestone tracking.`,
      );
    }

    // ==================================================
    // PROJECT HIGHLIGHTS DATA ENDED
    // ==================================================

    // ==================================================
    // PROJECT GALLERY DATA STARTED
    // ==================================================

    const galleryFolder = getValue("galleryFolder", "Gallery Folder");

    setText(
      "[data-property-gallery-title]",
      projectName ? `Explore ${projectName} Through Stunning Views` : "",
    );

    if (projectName && staticProjectName) {
      document.querySelectorAll("[data-gallery-thumb]").forEach((thumb) => {
        ["data-gallery-description", "data-gallery-caption"].forEach(
          (attribute) => {
            const value = thumb.getAttribute(attribute);

            if (value) {
              thumb.setAttribute(
                attribute,
                value.replaceAll(staticProjectName, projectName),
              );
            }
          },
        );

        const image = thumb.querySelector("img");

        if (image?.alt) {
          image.alt = image.alt.replaceAll(staticProjectName, projectName);
        }
      });

      const galleryMainImage = document.querySelector("[data-gallery-main]");

      if (galleryMainImage?.alt) {
        galleryMainImage.alt = galleryMainImage.alt.replaceAll(
          staticProjectName,
          projectName,
        );
      }

      const lightboxImage = document.querySelector("[data-lightbox-image]");

      if (lightboxImage?.alt) {
        lightboxImage.alt = lightboxImage.alt.replaceAll(
          staticProjectName,
          projectName,
        );
      }

      const galleryLightbox = document.querySelector("[data-gallery-lightbox]");

      if (galleryLightbox) {
        galleryLightbox.setAttribute(
          "aria-label",
          `${projectName} project gallery`,
        );
      }
    }

    if (galleryFolder) {
      const galleryBasePath = normalizeFolderPath(galleryFolder);

      document.querySelectorAll("[data-gallery-thumb]").forEach((thumb) => {
        const currentPath = thumb.dataset.galleryThumb;

        if (!currentPath) {
          return;
        }

        const fileName = currentPath.split("/").pop();

        const newImagePath = `${galleryBasePath}${fileName}`;

        thumb.dataset.galleryThumb = newImagePath;

        const thumbnailImage = thumb.querySelector(".gallery-thumb-image img");

        if (thumbnailImage) {
          thumbnailImage.src = newImagePath;
        }
      });

      const firstGalleryThumb = document.querySelector("[data-gallery-thumb]");

      if (firstGalleryThumb) {
        const firstImage = firstGalleryThumb.dataset.galleryThumb;

        const galleryMainImage = document.querySelector("[data-gallery-main]");

        const lightboxImage = document.querySelector("[data-lightbox-image]");

        if (galleryMainImage && firstImage) {
          galleryMainImage.src = firstImage;
        }

        if (lightboxImage && firstImage) {
          lightboxImage.src = firstImage;
        }
      }
    }

    // ==================================================
    // PROJECT GALLERY DATA ENDED
    // ==================================================

    // ==================================================
    // LIFESTYLE AMENITIES DATA STARTED
    // ==================================================

    const amenitiesFolder = getValue("amenitiesFolder", "Amenities Folder");

    if (amenitiesFolder) {
      const amenitiesBasePath = normalizeFolderPath(amenitiesFolder);

      document
        .querySelectorAll("[data-property-amenity-image]")
        .forEach((image) => {
          const currentPath = image.getAttribute("src");

          if (!currentPath) {
            return;
          }

          const fileName = currentPath.split("/").pop();

          image.src = `${amenitiesBasePath}${fileName}`;
        });
    }

    // ==================================================
    // LIFESTYLE AMENITIES DATA ENDED
    // ==================================================

    // ==================================================
    // FLOOR PLANS DATA STARTED
    // ==================================================

    const floorPlansFolder = getValue("floorPlansFolder", "Floor Plans Folder");

    if (floorPlansFolder) {
      const floorPlansBasePath = normalizeFolderPath(floorPlansFolder);

      document
        .querySelectorAll("[data-property-floor-plan-image]")
        .forEach((image) => {
          const currentPath = image.getAttribute("src");

          if (!currentPath) {
            return;
          }

          const fileName = currentPath.split("/").pop();

          image.src = `${floorPlansBasePath}${fileName}`;
        });

      Object.values(floorPlanData).forEach((floorData) => {
        if (!floorData?.image) {
          return;
        }

        const fileName = floorData.image.split("/").pop();

        floorData.image = `${floorPlansBasePath}${fileName}`;
      });
    }

    if (activeListings.length) {
      const floorKeyByBhk = {
        1: "one",
        2: "two",
        3: "three",
        4: "four",
      };

      const listingsByBhk = new Map();

      activeListings.forEach((listing) => {
        const bhkCount = Number(listing.bhkCount);

        if (!floorKeyByBhk[bhkCount]) {
          return;
        }

        if (!listingsByBhk.has(bhkCount)) {
          listingsByBhk.set(bhkCount, []);
        }

        listingsByBhk.get(bhkCount).push(listing);
      });

      const availableFloorKeys = [];

      Object.entries(floorKeyByBhk).forEach(([bhkValue, floorKey]) => {
        const bhkCount = Number(bhkValue);

        const listings = listingsByBhk.get(bhkCount) || [];

        const floorData = floorPlanData[floorKey];

        if (!floorData) {
          return;
        }

        const isAvailable = listings.length > 0;

        document
          .querySelector(`[data-floor-tab="${floorKey}"]`)
          ?.toggleAttribute("hidden", !isAvailable);

        document
          .querySelector(`[data-floor-panel="${floorKey}"]`)
          ?.toggleAttribute("hidden", !isAvailable);

        document
          .querySelector(`[data-floor-thumbnail="${floorKey}"]`)
          ?.toggleAttribute("hidden", !isAvailable);

        if (!isAvailable) {
          return;
        }

        availableFloorKeys.push(floorKey);

        const configuration = listings[0].configuration || `${bhkCount} BHK`;

        const carpetAreas = listings
          .map((listing) => Number(listing.carpetAreaSqFt))
          .filter((value) => Number.isFinite(value) && value > 0);

        floorData.title = `${configuration} Residence`;

        floorData.configuration = configuration;

        floorData.bedrooms = String(bhkCount);

        if (carpetAreas.length) {
          const minimumArea = Math.min(...carpetAreas);

          const maximumArea = Math.max(...carpetAreas);

          floorData.carpetArea =
            minimumArea === maximumArea
              ? `${minimumArea.toLocaleString("en-IN")} sq. ft.`
              : `${minimumArea.toLocaleString("en-IN")}–${maximumArea.toLocaleString("en-IN")} sq. ft.`;
        }
      });

      if (availableFloorKeys.length) {
        floorPlanOrder.splice(0, floorPlanOrder.length, ...availableFloorKeys);

        activeFloorPlan = availableFloorKeys[0];

        updateFloorPlan(activeFloorPlan);
      }
    }

    // ==================================================
    // FLOOR PLANS DATA ENDED
    // ==================================================

    // ==================================================
    // LOCATION DATA STARTED
    // ==================================================

    const locationImage = getValue("locationImage", "Location Image");

    if (locationImage) {
      document
        .querySelectorAll("[data-property-location-image]")
        .forEach((image) => {
          image.src = normalizeAssetPath(locationImage);

          image.alt = projectName
            ? `${projectName} location and connectivity map`
            : image.alt;
        });
    }

    if (projectName && propertyLocality && propertyCity) {
      setText(
        "[data-property-location-description]",
        `${projectName} is strategically located in ${propertyLocality}, ${propertyCity}, offering convenient access to key city destinations, everyday essentials and major connectivity routes.`,
      );
    } else {
      setText("[data-property-location-description]", shortDescription);
    }

    // ==================================================
    // LOCATION DATA ENDED
    // ==================================================

    // ==================================================
    // WHY INVESTMENT DATA STARTED
    // ==================================================

    if (projectName && propertyLocality && propertyCity) {
      setText(
        "[data-property-investment-description]",
        `${projectName} combines strong connectivity, quality infrastructure and long-term value in ${propertyLocality}, ${propertyCity}.`,
      );
    } else {
      setText("[data-property-investment-description]", shortDescription);
    }

    const whyInvestmentFolder = getValue(
      "whyInvestmentFolder",
      "Why Investment Folder",
    );

    if (whyInvestmentFolder) {
      const investmentBasePath = normalizeFolderPath(whyInvestmentFolder);

      document
        .querySelectorAll("[data-property-investment-image]")
        .forEach((image) => {
          const currentPath = image.getAttribute("src");

          if (!currentPath) {
            return;
          }

          const fileName = currentPath.split("/").pop();

          image.src = `${investmentBasePath}${fileName}`;

          image.alt = projectName
            ? `${projectName} luxury residential towers`
            : image.alt;
        });
    }

    // ==================================================
    // WHY INVESTMENT DATA ENDED
    // ==================================================

    // ==================================================
    // FAQ DATA STARTED
    // ==================================================

    const faqImage = document.querySelector("[data-property-faq-image]");

    if (faqImage && galleryFolder) {
      faqImage.src = `${normalizeFolderPath(
        galleryFolder,
      )}gallery-tower-view.webp`;

      faqImage.alt = projectName || faqImage.alt;
    }

    if (projectName) {
      setText(
        "[data-property-faq-rera-question]",
        `Is ${projectName} RERA approved?`,
      );

      setText(
        "[data-property-faq-rera-answer]",
        reraNumber
          ? `Yes. ${projectName} is registered under RERA with registration number ${reraNumber}.`
          : `${projectName} project registration details are available from our property advisors.`,
      );
    }

    if (projectName && projectConfiguration) {
      setText(
        "[data-property-faq-configuration]",
        `${projectName} offers premium ${projectConfiguration} residences designed for modern urban living.`,
      );
    }

    if (heroDisplayPrice) {
      setText(
        "[data-property-faq-price]",
        `Homes start from ${heroDisplayPrice}. Contact our sales team for current availability, pricing and offers.`,
      );
    }

    if (projectPossession) {
      setText(
        "[data-property-faq-possession]",
        `The expected possession timeline is ${projectPossession}, subject to applicable approvals.`,
      );
    }

    // ==================================================
    // FAQ DATA ENDED
    // ==================================================

    // ==================================================
    // SIMILAR PROJECTS DATA STARTED
    // ==================================================

    const similarProjectsTrack = document.querySelector(
      "[data-property-similar-projects]",
    );

    const similarProjectSlugsValue = getValue(
      "similarProjectSlugs",
      "Similar Project Slugs",
    );

    const similarProjectSlugs = Array.isArray(similarProjectSlugsValue)
      ? similarProjectSlugsValue
      : String(similarProjectSlugsValue || "")
          .split(",")
          .map((slug) => slug.trim())
          .filter(Boolean);

    if (similarProjectsTrack && similarProjectSlugs.length) {
      const similarProjects = similarProjectSlugs
        .map((slug) =>
          properties.find((item) => {
            const itemSlug =
              item.slug ||
              item.id ||
              item.projectSlug ||
              item.ProjectSlug ||
              "";

            return (
              String(itemSlug).trim().toLowerCase() ===
              String(slug).trim().toLowerCase()
            );
          }),
        )
        .filter(Boolean);

      similarProjectsTrack.innerHTML = similarProjects
        .map((item) => {
          const itemListings = Array.isArray(item.listings)
            ? item.listings.filter((listing) => listing.active !== false)
            : [];

          const status =
            item.constructionStatus ||
            item.status ||
            itemListings[0]?.constructionStatus ||
            itemListings[0]?.["Construction Status"] ||
            item.badge ||
            "";

          const itemSlug =
            item.slug || item.id || item.projectSlug || item.ProjectSlug || "";

          const pageUrl = item.url
            ? item.url.split("/").pop()
            : `${itemSlug}.html`;

          const imagePath = normalizeAssetPath(item.heroImage || item.image);

          const itemLocation =
            item.locality && item.city
              ? `${item.locality}, ${item.city}`
              : item.locality || item.city || "";

          return `
              <article class="similar-project-card">
                <div class="similar-project-image">
                  <img
                    src="${imagePath}"
                    alt="${item.name || ""} residential project"
                    loading="lazy"
                  />

                  <span class="similar-project-badge badge-blue">
                    <i class="fa-solid fa-building"></i>
                    ${status}
                  </span>
                </div>

                <div class="similar-project-content">
                  <div class="similar-project-location">
                    <i class="fa-solid fa-location-dot"></i>
                    <span>${itemLocation}</span>
                  </div>

                  <h3>${item.name || ""}</h3>

                  <p class="similar-project-type">
                    ${item.shortDescription || ""}
                  </p>

                  <div class="similar-project-specifications">
                    <div class="similar-project-spec">
                      <i class="fa-solid fa-bed"></i>
                      <strong>${item.configuration || ""}</strong>
                      <span>Homes</span>
                    </div>

                    <div class="similar-project-spec">
                      <i class="fa-regular fa-building"></i>
                      <strong>${item.towers ?? ""}</strong>
                      <span>Towers</span>
                    </div>

                    <div class="similar-project-spec">
                      <i class="fa-solid fa-layer-group"></i>
                      <strong>${item.floors ?? ""}</strong>
                      <span>Floors</span>
                    </div>

                    <div class="similar-project-spec">
                      <i class="fa-regular fa-calendar-check"></i>
                      <strong>${item.possession || ""}</strong>
                      <span>Possession</span>
                    </div>
                  </div>
                </div>

                <div class="similar-project-footer">
                  <div class="similar-project-price price-blue">
                    <span>Project Status</span>
                    <strong>${status}</strong>
                  </div>

                  <a
                    href="${pageUrl}"
                    class="explore-project-btn"
                  >
                    <span>Explore Project</span>
                    <i class="fa-solid fa-arrow-right"></i>
                  </a>
                </div>
              </article>
            `;
        })
        .join("");
    }

    // ==================================================
    // SIMILAR PROJECTS DATA ENDED
    // ==================================================

    // ==================================================
    // PROJECT ENQUIRY DATA STARTED
    // ==================================================

    const contactImage = heroImage;

    if (contactImage) {
      document
        .querySelectorAll("[data-property-contact-image]")
        .forEach((image) => {
          image.src = normalizeAssetPath(contactImage);

          image.alt = projectName
            ? `${projectName} residential project`
            : image.alt;
        });
    }

    setText(
      "[data-property-contact-address]",
      getValue("location", "Full Address") || propertyLocation,
    );

    document
      .querySelectorAll("[data-property-form-project]")
      .forEach((input) => {
        input.value = projectName;
      });

    document
      .querySelectorAll("[data-property-visit-aria]")
      .forEach((button) => {
        if (projectName) {
          button.setAttribute(
            "aria-label",
            `Book a site visit for ${projectName}`,
          );
        }
      });

    const visitImage = document.querySelector("[data-property-visit-image]");

    if (visitImage && contactImage) {
      visitImage.src = normalizeAssetPath(contactImage);

      visitImage.alt = projectName
        ? `${projectName} residential project`
        : visitImage.alt;
    }

    setText(
      "[data-property-visit-title]",
      projectName ? `Experience ${projectName} in person` : "",
    );

    setText(
      "[data-property-visit-success-message]",
      projectName
        ? `Thank you for choosing ${projectName}. Our property advisor will contact you shortly to confirm your visit details.`
        : "",
    );

    const visitConfigurationSelect = document.querySelector(
      "[data-property-visit-configurations]",
    );

    if (visitConfigurationSelect && activeListings.length) {
      const configurations = [
        ...new Set(
          activeListings
            .map((listing) => String(listing.configuration || "").trim())
            .filter(Boolean),
        ),
      ];

      visitConfigurationSelect.innerHTML =
        `<option value="">Select configuration</option>` +
        configurations
          .map(
            (configuration) =>
              `<option value="${configuration}">${configuration}</option>`,
          )
          .join("");
    }

    // ==================================================
    // PROJECT ENQUIRY DATA ENDED
    // ==================================================

    // ==================================================
    // FOOTER PROJECT DATA STARTED
    // ==================================================

    document.querySelectorAll("[data-property-footer-home]").forEach((link) => {
      if (projectName) {
        link.setAttribute("aria-label", `${projectName} home`);
      }
    });

    // ==================================================
    // FOOTER PROJECT DATA ENDED
    // ==================================================

    console.log("DreamKey property loaded:", property);
  } catch (error) {
    console.error("DreamKey property data error:", error);
  }
});

// ==================================================
// EXCEL PROPERTY DATA INTEGRATION ENDED
// ==================================================

// Below code are from 30-July-2026
