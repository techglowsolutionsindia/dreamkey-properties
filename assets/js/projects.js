"use strict";

/* ==================================================
   PROJECT DATA - LOADED FROM EXCEL EXPORT
================================================== */

let projectsData = [];

const loadProjectsData = async () => {
  const response = await fetch("./assets/data/properties.json", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Unable to load property data (${response.status} ${response.statusText}).`,
    );
  }

  const payload = await response.json();

  projectsData = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.projects)
      ? payload.projects
      : [];

  if (!projectsData.length) {
    throw new Error("No active projects were found in properties.json.");
  }
};

/* ==================================================
   CATEGORY CONTENT
================================================== */

const categoryContent = {
  featured: {
    breadcrumb: "Featured Projects",
    eyebrow: "Premium Residential Projects",
    title: "Featured Projects",
    description:
      "Explore DreamKey Properties’ promoted residential developments across Mumbai’s prime locations.",
    backText: "Back to Featured Projects",
    backUrl: "./index.html#featured-projects",
  },

  ongoing: {
    breadcrumb: "Ongoing Projects",
    eyebrow: "Under Construction Homes",
    title: "Ongoing Projects",
    description:
      "Discover well-planned residential developments currently under construction across Mumbai.",
    backText: "Back to Ongoing Projects",
    backUrl: "./index.html#ongoing-projects",
  },

  "ready-to-move": {
    breadcrumb: "Ready to Move",
    eyebrow: "Move In Without Waiting",
    title: "Ready-to-Move Projects",
    description:
      "Browse completed homes that are ready for possession and immediate occupancy.",
    backText: "Back to Ready to Move",
    backUrl: "./index.html#ready-to-move-projects",
  },

  "new-launches": {
    breadcrumb: "New Launches",
    eyebrow: "Fresh Residential Opportunities",
    title: "New Launches",
    description:
      "Explore newly introduced residential projects with early-buyer opportunities in promising locations.",
    backText: "Back to New Launches",
    backUrl: "./index.html#new-launches",
  },

  "luxury-homes": {
    breadcrumb: "Luxury Homes",
    eyebrow: "Premium Living",
    title: "Luxury Homes",
    description:
      "Discover exclusive residences offering larger layouts, refined amenities and premium positioning.",
    backText: "Back to Luxury Homes",
    backUrl: "./index.html#luxury-homes",
  },
};

/* ==================================================
   ACTIVE CATEGORY
================================================== */

const allowedCategories = Object.keys(categoryContent);

const urlParameters = new URLSearchParams(window.location.search);

const requestedCategory = urlParameters.get("category");

const activeCategory = allowedCategories.includes(requestedCategory)
  ? requestedCategory
  : "featured";

/* ==================================================
   HOMEPAGE HERO SEARCH PARAMETERS
================================================== */

const isHeroSearch = urlParameters.get("search") === "1";

const requestedLocation = urlParameters.get("location") || "";

const requestedBhk = urlParameters.get("bhk") || "";

const requestedBudget = urlParameters.get("budget") || "";

const requestedPossession = urlParameters.get("possession") || "";

/* ==================================================
   DOM ELEMENTS
================================================== */

const projectsGrid = document.querySelector("[data-projects-grid]");

const projectsEmpty = document.querySelector("[data-projects-empty]");

const projectSearch = document.querySelector("[data-project-search]");

const projectSort = document.querySelector("[data-project-sort]");

const projectCount = document.querySelector("[data-project-count]");

const projectCountLabel = document.querySelector("[data-project-count-label]");

const filterLocation = document.querySelector("[data-filter-location]");

const filterBhk = document.querySelector("[data-filter-bhk]");

const filterBudget = document.querySelector("[data-filter-budget]");

const filterPossession = document.querySelector("[data-filter-possession]");

const filterReset = document.querySelector("[data-filter-reset]");

const activeFilters = document.querySelector("[data-active-filters]");

const filterChips = document.querySelector("[data-filter-chips]");

const loadMoreButton = document.querySelector("[data-load-more]");

const loadMoreWrap = document.querySelector("[data-load-more-wrap]");

const loadMoreStatus = document.querySelector("[data-load-more-status]");

/* ==================================================
   FILTER AND PAGINATION STATE
================================================== */

const PROJECTS_PER_PAGE = Number.POSITIVE_INFINITY;

let currentSearch = "";

let currentSort = "default";

let currentLocation = requestedLocation || "all";

let currentBhk = requestedBhk || "all";

let currentBudget = requestedBudget || "all";

let currentPossession = requestedPossession || "all";

let visibleProjectLimit = PROJECTS_PER_PAGE;

/* ==================================================
   PROJECT SLIDER STATE
================================================== */

const PROJECTS_VISIBLE_DESKTOP = 4;

let currentProjectSlideIndex = 0;

const projectsPreviousButton = document.querySelector("[data-projects-prev]");

const projectsNextButton = document.querySelector("[data-projects-next]");

/* ==================================================
   HTML ESCAPING HELPER
================================================== */

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

/* ==================================================
   PROJECT CARD TEMPLATE
================================================== */

const createProjectCard = (project) => {
  const savedProjects = getSavedProjects();

  const isSaved = savedProjects.includes(String(project.id || ""));

  return `
    <article class="projects-card">
      <a
        href="./${escapeHtml(project.url || "#")}"
        class="projects-card-image"
        aria-label="View ${escapeHtml(project.name || "Property")} project details"
      >
        <img
          src="./${escapeHtml(project.image || "")}"
          alt="${escapeHtml(project.name || "Property")} residential project"
          loading="lazy"
        />

        <span
          class="projects-card-badge badge-theme-${escapeHtml(
            String(project.badgeTheme || "gold").toLowerCase(),
          )}"
        >
          ${escapeHtml(project.badge || "")}
        </span>

        <span class="projects-card-rera">
          <span
            class="material-symbols-rounded"
            aria-hidden="true"
          >
            verified
          </span>

          ${
            project.reraNumber
              ? `RERA: ${escapeHtml(project.reraNumber)}`
              : "RERA Approved"
          }
        </span>

        <p class="projects-card-location">
          <span
            class="material-symbols-rounded"
            aria-hidden="true"
          >
            location_on
          </span>

          <span>
            ${escapeHtml(project.location || "")}
          </span>
        </p>
      </a>

      <div class="projects-card-content">
        <span class="projects-card-category">
          ${escapeHtml(project.categoryLabel || "")}
        </span>

        <h2>${escapeHtml(project.name || "Property")}</h2>

        <button
          type="button"
          class="projects-card-save${isSaved ? " is-saved" : ""}"
          aria-label="${isSaved ? "Remove" : "Save"} ${escapeHtml(
            project.name || "Property",
          )}"
          aria-pressed="${String(isSaved)}"
          data-project-save
          data-project-id="${escapeHtml(project.id || "")}"
        >
          <span
            class="material-symbols-rounded"
            aria-hidden="true"
          >
            favorite
          </span>
        </button>

        <div class="projects-card-meta">
          <span>
            <span
              class="material-symbols-rounded"
              aria-hidden="true"
            >
              bed
            </span>

            ${escapeHtml(project.configuration || "")}
          </span>

          <span>
            <span
              class="material-symbols-rounded"
              aria-hidden="true"
            >
              square_foot
            </span>

            ${escapeHtml(project.area || "")}
          </span>
        </div>

        <div class="projects-card-footer">
          <div class="projects-card-price">
            <span>Starting From</span>

            <strong>
              ${escapeHtml(project.price || "")}
            </strong>

            <small>
              Possession: ${escapeHtml(project.possession || "")}
            </small>
          </div>

          <a
            href="./${escapeHtml(project.url || "#")}"
            class="projects-card-button"
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
   SAVED PROJECTS
================================================== */

const getSavedProjects = () => {
  try {
    const savedProjects = localStorage.getItem("dreamkey-saved-projects");

    const parsedProjects = savedProjects ? JSON.parse(savedProjects) : [];

    return Array.isArray(parsedProjects) ? parsedProjects : [];
  } catch (error) {
    console.error("Unable to read saved projects:", error);

    return [];
  }
};

const updateSavedProjects = (projectId, shouldSave) => {
  const savedProjects = getSavedProjects();

  const updatedProjects = shouldSave
    ? Array.from(new Set([...savedProjects, projectId]))
    : savedProjects.filter((savedId) => savedId !== projectId);

  try {
    localStorage.setItem(
      "dreamkey-saved-projects",
      JSON.stringify(updatedProjects),
    );
  } catch (error) {
    console.error("Unable to save project preference:", error);
  }
};

const initializeSaveButtons = () => {
  document.querySelectorAll("[data-project-save]").forEach((button) => {
    button.addEventListener("click", () => {
      const projectId = button.dataset.projectId;

      if (!projectId) return;

      const isSaved = button.getAttribute("aria-pressed") === "true";

      const nextSavedState = !isSaved;

      button.setAttribute("aria-pressed", String(nextSavedState));

      button.classList.toggle("is-saved", nextSavedState);

      const project = projectsData.find(
        (item) => String(item.id || "") === String(projectId || ""),
      );

      if (project) {
        button.setAttribute(
          "aria-label",
          `${nextSavedState ? "Remove" : "Save"} ${project.name || "Property"}`,
        );
      }

      updateSavedProjects(projectId, nextSavedState);
    });
  });
};

/* ==================================================
   FILTER HELPERS
================================================== */

const getLocationValue = (project) => {
  const location =
    `${project.locality || ""} ${project.location || ""}`.toLowerCase();

  if (location.includes("borivali")) return "borivali";

  if (location.includes("andheri")) return "andheri";

  if (location.includes("bhandup")) return "bhandup";

  if (location.includes("mulund")) return "mulund";

  if (location.includes("ghatkopar")) return "ghatkopar";

  return "other";
};

const getBhkValues = (project) => {
  const configuration = String(project.configuration || "").toLowerCase();

  const bhkValues = [];

  if (configuration.includes("1 bhk")) {
    bhkValues.push("1-bhk");
  }

  if (configuration.includes("2 bhk")) {
    bhkValues.push("2-bhk");
  }

  if (configuration.includes("3 bhk")) {
    bhkValues.push("3-bhk");
  }

  if (configuration.includes("4 bhk")) {
    bhkValues.push("4-bhk");
  }

  return bhkValues;
};

const matchesBudget = (project) => {
  const priceValue = Number(project.priceValue || 0);

  if (currentBudget === "all") {
    return true;
  }

  if (currentBudget === "under-1cr") {
    return priceValue < 10000000;
  }

  if (currentBudget === "1cr-1-25cr") {
    return priceValue >= 10000000 && priceValue <= 12500000;
  }

  if (currentBudget === "1-25cr-1-5cr") {
    return priceValue > 12500000 && priceValue <= 15000000;
  }

  if (currentBudget === "above-1-5cr") {
    return priceValue > 15000000;
  }

  return true;
};

const getPossessionYear = (project) => {
  const yearMatch = String(project.possession || "").match(/\b20\d{2}\b/);

  return yearMatch ? yearMatch[0] : "";
};

const matchesPossession = (project) => {
  if (currentPossession === "all") {
    return true;
  }

  const listings = Array.isArray(project.listings)
    ? project.listings.filter((listing) => listing.active !== false)
    : [];

  const possession = String(project.possession || "").toLowerCase();

  /* READY TO MOVE */
  if (currentPossession === "ready" || currentPossession === "ready-to-move") {
    return (
      possession.includes("ready to move") ||
      possession.includes("ready-to-move") ||
      listings.some(
        (listing) =>
          listing.isReadyToMove === true ||
          String(listing.constructionStatus || "")
            .toLowerCase()
            .includes("ready"),
      )
    );
  }

  /* UNDER CONSTRUCTION */
  if (currentPossession === "under-construction") {
    return listings.some((listing) =>
      String(listing.constructionStatus || "")
        .toLowerCase()
        .includes("under construction"),
    );
  }

  /* NEW LAUNCH */
  if (currentPossession === "new-launch") {
    return (
      Array.isArray(project.categories) &&
      project.categories.includes("new-launches")
    );
  }

  /* POSSESSION YEAR */
  return getPossessionYear(project) === currentPossession;
};

/* ==================================================
   FILTERED AND SORTED PROJECTS
================================================== */

const getFilteredProjects = () => {
  const normalizedSearch = currentSearch.trim().toLowerCase();

  const filteredProjects = projectsData.filter((project) => {
    const belongsToCategory =
      isHeroSearch ||
      (Array.isArray(project.categories) &&
        project.categories.includes(activeCategory));

    const listingSearchText = Array.isArray(project.listings)
      ? project.listings
          .filter((listing) => listing.active !== false)
          .map(
            (listing) => `
              ${listing.configuration || ""}
              ${listing.constructionStatus || ""}
              ${listing.possessionDisplay || ""}
              ${listing.displayPrice || ""}
            `,
          )
          .join(" ")
      : "";

    const searchableText = `
      ${project.name || ""}
      ${project.location || ""}
      ${project.city || ""}
      ${project.locality || ""}
      ${project.developer || ""}
      ${project.configuration || ""}
      ${project.categoryLabel || ""}
      ${project.badge || ""}
      ${project.shortDescription || ""}
      ${project.towers ? `${project.towers} towers` : ""}
      ${project.floors ? `${project.floors} floors` : ""}
      ${project.totalUnits ? `${project.totalUnits} units` : ""}
      ${project.landParcelAcres ? `${project.landParcelAcres} acres` : ""}
      ${project.possession || ""}
      ${project.reraNumber || ""}
      ${listingSearchText}
    `.toLowerCase();

    const matchesSearch =
      normalizedSearch === "" || searchableText.includes(normalizedSearch);

    const matchesLocation =
      currentLocation === "all" ||
      String(getLocationValue(project) || "").toLowerCase() ===
        String(currentLocation || "").toLowerCase();

    const projectBhkValues = getBhkValues(project);

    const matchesBhk =
      currentBhk === "all" ||
      (Array.isArray(projectBhkValues) &&
        projectBhkValues.includes(currentBhk));

    return (
      belongsToCategory &&
      matchesSearch &&
      matchesLocation &&
      matchesBhk &&
      matchesBudget(project) &&
      matchesPossession(project)
    );
  });

  return [...filteredProjects].sort((firstProject, secondProject) => {
    if (currentSort === "price-low") {
      return (
        Number(firstProject.priceValue || 0) -
        Number(secondProject.priceValue || 0)
      );
    }

    if (currentSort === "price-high") {
      return (
        Number(secondProject.priceValue || 0) -
        Number(firstProject.priceValue || 0)
      );
    }

    if (currentSort === "name") {
      return String(firstProject.name || "").localeCompare(
        String(secondProject.name || ""),
      );
    }

    /* Use Excel category order for Recommended sorting */
    const categoryOrderKey = {
      featured: "featured",
      ongoing: "ongoing",
      "ready-to-move": "readyToMove",
      "new-launches": "newLaunches",
      "luxury-homes": "luxuryHomes",
    }[activeCategory];

    const firstOrder =
      Number(firstProject.categoryOrder?.[categoryOrderKey]) || 9999;

    const secondOrder =
      Number(secondProject.categoryOrder?.[categoryOrderKey]) || 9999;

    return firstOrder - secondOrder;
  });
};

/* ==================================================
   PAGE HEADING
================================================== */

const updatePageHeading = () => {
  const breadcrumb = document.querySelector("[data-projects-breadcrumb]");
  const eyebrow = document.querySelector("[data-projects-eyebrow]");
  const title = document.querySelector("[data-projects-title]");
  const description = document.querySelector("[data-projects-description]");
  const backLink = document.querySelector("[data-projects-back-link]");
  const backText = document.querySelector("[data-projects-back-text]");

  /*
   * A homepage Hero search is different from a normal
   * category page. Keep the main "All Projects" heading
   * and show that the results came from a property search.
   */
  if (isHeroSearch) {
    if (breadcrumb) {
      breadcrumb.textContent = "Search Results";
    }

    if (eyebrow) {
      eyebrow.textContent = "Matching Residential Projects";
    }

    if (title) {
      title.textContent = "Search Results";
    }

    if (description) {
      description.textContent =
        "Explore residential projects matching your selected location, budget, configuration and possession preferences.";
    }

    if (backLink) {
      backLink.href = "./index.html#hero";
    }

    if (backText) {
      backText.textContent = "Back to Property Search";
    }

    return;
  }

  const content = categoryContent[activeCategory];

  if (!content) return;

  if (breadcrumb) {
    breadcrumb.textContent = content.breadcrumb;
  }

  if (eyebrow) {
    eyebrow.textContent = content.eyebrow;
  }

  if (title) {
    title.textContent = content.title;
  }

  if (description) {
    description.textContent = content.description;
  }

  if (backLink) {
    backLink.href = content.backUrl;
  }

  if (backText) {
    backText.textContent = content.backText;
  }
};

/* ==================================================
   CATEGORY TABS
================================================== */

const updateCategoryTabs = () => {
  document.querySelectorAll("[data-category-tab]").forEach((tab) => {
    const category = tab.dataset.categoryTab;

    /*
     * When the visitor arrives from the homepage Hero search,
     * none of the normal category tabs should appear selected.
     */
    const isActive = !isHeroSearch && category === activeCategory;

    tab.classList.toggle("active", isActive);

    if (isActive) {
      tab.setAttribute("aria-current", "page");
    } else {
      tab.removeAttribute("aria-current");
    }
  });
};

/* ==================================================
   HERO SEARCH FILTER LABEL HELPERS
================================================== */

const getLocationLabel = (value) => {
  const labels = {
    borivali: "Borivali East",
    andheri: "Andheri West",
    bhandup: "Bhandup East",
    mulund: "Mulund West",
    ghatkopar: "Ghatkopar West",
  };

  return labels[value] || value;
};

const getBhkLabel = (value) => {
  const labels = {
    "1-bhk": "1 BHK",
    "2-bhk": "2 BHK",
    "3-bhk": "3 BHK",
    "4-bhk": "4 BHK",
  };

  return labels[value] || value;
};

const getBudgetLabel = (value) => {
  const labels = {
    "under-1cr": "Under ₹1 Cr",
    "1cr-1-25cr": "₹1 Cr – ₹1.25 Cr",
    "1-25cr-1-5cr": "₹1.25 Cr – ₹1.5 Cr",
    "above-1-5cr": "Above ₹1.5 Cr",
  };

  return labels[value] || value;
};

const getPossessionLabel = (value) => {
  const labels = {
    ready: "Ready to Move",
    "ready-to-move": "Ready to Move",
    "under-construction": "Under Construction",
    "new-launch": "New Launch",
  };

  return labels[value] || value;
};

/* ==================================================
   FILTER CONTROL SYNCHRONISATION
================================================== */

const syncFilterControls = () => {
  if (filterLocation) {
    filterLocation.value = currentLocation;
  }

  if (filterBhk) {
    filterBhk.value = currentBhk;
  }

  if (filterBudget) {
    filterBudget.value = currentBudget;
  }

  if (filterPossession) {
    filterPossession.value = currentPossession;
  }
};

/* ==================================================
   ACTIVE FILTER CHIPS
================================================== */

const createFilterChip = (label, type) => `
  <button
    type="button"
    class="projects-filter-chip"
    data-remove-filter="${escapeHtml(type)}"
  >
    <span>${escapeHtml(label)}</span>

    <span
      class="material-symbols-rounded"
      aria-hidden="true"
    >
      close
    </span>
  </button>
`;

const renderActiveFilters = () => {
  if (!activeFilters || !filterChips) return;

  const chips = [];

  if (currentLocation !== "all") {
    chips.push(
      createFilterChip(
        `Location: ${getLocationLabel(currentLocation)}`,
        "location",
      ),
    );
  }

  if (currentBudget !== "all") {
    chips.push(
      createFilterChip(`Budget: ${getBudgetLabel(currentBudget)}`, "budget"),
    );
  }

  if (currentBhk !== "all") {
    chips.push(createFilterChip(`BHK: ${getBhkLabel(currentBhk)}`, "bhk"));
  }

  if (currentPossession !== "all") {
    chips.push(
      createFilterChip(
        `Possession: ${getPossessionLabel(currentPossession)}`,
        "possession",
      ),
    );
  }

  if (currentSearch.trim()) {
    chips.push(createFilterChip(`Search: ${currentSearch.trim()}`, "search"));
  }

  filterChips.innerHTML = chips.join("");

  activeFilters.hidden = chips.length === 0;

  initializeFilterChipButtons();
};

/* ==================================================
   REMOVE INDIVIDUAL FILTER
================================================== */

const initializeFilterChipButtons = () => {
  document.querySelectorAll("[data-remove-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const filterType = button.dataset.removeFilter;

      if (filterType === "location") {
        currentLocation = "all";
      }

      if (filterType === "budget") {
        currentBudget = "all";
      }

      if (filterType === "bhk") {
        currentBhk = "all";
      }

      if (filterType === "possession") {
        currentPossession = "all";
      }

      if (filterType === "search") {
        currentSearch = "";

        if (projectSearch) {
          projectSearch.value = "";
        }
      }

      visibleProjectLimit = PROJECTS_PER_PAGE;

      currentProjectSlideIndex = 0;

      syncFilterControls();

      updateSearchUrl();

      renderProjects();
    });
  });
};

/* ==================================================
   UPDATE URL AFTER FILTER CHANGES
================================================== */

const updateSearchUrl = () => {
  const parameters = new URLSearchParams(window.location.search);

  /*
   * If this page was opened from the homepage Hero search,
   * retain search=1 while the user adjusts the filters.
   */
  if (isHeroSearch) {
    parameters.set("search", "1");

    parameters.delete("category");
  } else {
    parameters.delete("search");

    parameters.set("category", activeCategory);
  }

  if (currentLocation !== "all") {
    parameters.set("location", currentLocation);
  } else {
    parameters.delete("location");
  }

  if (currentBudget !== "all") {
    parameters.set("budget", currentBudget);
  } else {
    parameters.delete("budget");
  }

  if (currentBhk !== "all") {
    parameters.set("bhk", currentBhk);
  } else {
    parameters.delete("bhk");
  }

  if (currentPossession !== "all") {
    parameters.set("possession", currentPossession);
  } else {
    parameters.delete("possession");
  }

  const newQueryString = parameters.toString();

  const newUrl = newQueryString
    ? `${window.location.pathname}?${newQueryString}`
    : window.location.pathname;

  window.history.replaceState({}, "", newUrl);
};

/* ==================================================
   RESULTS COUNT
================================================== */

const updateProjectCount = (count) => {
  if (projectCount) {
    projectCount.textContent = String(count);
  }

  if (projectCountLabel) {
    projectCountLabel.textContent =
      count === 1 ? "project found" : "projects found";
  }
};

/* ==================================================
   EMPTY STATE
================================================== */

const updateEmptyState = (projectTotal) => {
  if (!projectsEmpty) return;

  projectsEmpty.hidden = projectTotal !== 0;

  if (projectsGrid) {
    projectsGrid.hidden = projectTotal === 0;
  }
};

/* ==================================================
   LOAD MORE STATUS
================================================== */

const updateLoadMoreState = (totalProjects) => {
  if (!loadMoreWrap || !loadMoreButton) return;

  /*
   * Current project layout uses the horizontal navigation
   * controls instead of progressive "Load More" pagination.
   */
  if (!Number.isFinite(PROJECTS_PER_PAGE)) {
    loadMoreWrap.hidden = true;

    return;
  }

  const visibleCount = Math.min(visibleProjectLimit, totalProjects);

  const hasMoreProjects = visibleCount < totalProjects;

  loadMoreWrap.hidden = totalProjects === 0;

  loadMoreButton.hidden = !hasMoreProjects;

  if (loadMoreStatus) {
    loadMoreStatus.textContent =
      totalProjects === 0
        ? ""
        : `Showing ${visibleCount} of ${totalProjects} projects`;
  }
};

/* ==================================================
   PROJECT SLIDER HELPERS
================================================== */

const getVisibleProjectCount = () => {
  if (window.innerWidth <= 640) {
    return 1;
  }

  if (window.innerWidth <= 900) {
    return 2;
  }

  if (window.innerWidth <= 1200) {
    return 3;
  }

  return PROJECTS_VISIBLE_DESKTOP;
};

const updateProjectSliderButtons = (totalProjects) => {
  if (!projectsPreviousButton || !projectsNextButton) return;

  const visibleProjects = getVisibleProjectCount();

  const maximumSlideIndex = Math.max(0, totalProjects - visibleProjects);

  if (currentProjectSlideIndex > maximumSlideIndex) {
    currentProjectSlideIndex = maximumSlideIndex;
  }

  projectsPreviousButton.disabled = currentProjectSlideIndex <= 0;

  projectsNextButton.disabled =
    totalProjects <= visibleProjects ||
    currentProjectSlideIndex >= maximumSlideIndex;
};

/* ==================================================
   MOVE PROJECT SLIDER
================================================== */

const moveProjectSlider = (direction) => {
  const filteredProjects = getFilteredProjects();

  const visibleProjects = getVisibleProjectCount();

  const maximumSlideIndex = Math.max(
    0,
    filteredProjects.length - visibleProjects,
  );

  currentProjectSlideIndex += direction;

  currentProjectSlideIndex = Math.max(
    0,
    Math.min(currentProjectSlideIndex, maximumSlideIndex),
  );

  renderProjects();
};

/* ==================================================
   RENDER PROJECTS
================================================== */

const renderProjects = () => {
  if (!projectsGrid) return;

  const filteredProjects = getFilteredProjects();

  const totalProjects = filteredProjects.length;

  updateProjectCount(totalProjects);

  updateEmptyState(totalProjects);

  renderActiveFilters();

  updateLoadMoreState(totalProjects);

  if (totalProjects === 0) {
    projectsGrid.innerHTML = "";

    currentProjectSlideIndex = 0;

    updateProjectSliderButtons(0);

    return;
  }

  /*
   * The project cards are rendered as a moving window.
   * This preserves the existing previous/next navigation.
   */
  const visibleProjects = getVisibleProjectCount();

  const maximumSlideIndex = Math.max(0, totalProjects - visibleProjects);

  if (currentProjectSlideIndex > maximumSlideIndex) {
    currentProjectSlideIndex = maximumSlideIndex;
  }

  const projectsToRender = filteredProjects.slice(
    currentProjectSlideIndex,
    currentProjectSlideIndex + visibleProjects,
  );

  projectsGrid.innerHTML = projectsToRender.map(createProjectCard).join("");

  initializeSaveButtons();

  updateProjectSliderButtons(totalProjects);
};

/* ==================================================
   SEARCH INPUT
================================================== */

if (projectSearch) {
  projectSearch.addEventListener("input", (event) => {
    currentSearch = event.target.value;

    visibleProjectLimit = PROJECTS_PER_PAGE;

    currentProjectSlideIndex = 0;

    renderProjects();
  });
}

/* ==================================================
   SORT CONTROL
================================================== */

if (projectSort) {
  projectSort.addEventListener("change", (event) => {
    currentSort = event.target.value;

    currentProjectSlideIndex = 0;

    renderProjects();
  });
}

/* ==================================================
   LOCATION FILTER
================================================== */

if (filterLocation) {
  filterLocation.addEventListener("change", (event) => {
    currentLocation = event.target.value;

    visibleProjectLimit = PROJECTS_PER_PAGE;

    currentProjectSlideIndex = 0;

    updateSearchUrl();

    renderProjects();
  });
}

/* ==================================================
   BHK FILTER
================================================== */

if (filterBhk) {
  filterBhk.addEventListener("change", (event) => {
    currentBhk = event.target.value;

    visibleProjectLimit = PROJECTS_PER_PAGE;

    currentProjectSlideIndex = 0;

    updateSearchUrl();

    renderProjects();
  });
}

/* ==================================================
   BUDGET FILTER
================================================== */

if (filterBudget) {
  filterBudget.addEventListener("change", (event) => {
    currentBudget = event.target.value;

    visibleProjectLimit = PROJECTS_PER_PAGE;

    currentProjectSlideIndex = 0;

    updateSearchUrl();

    renderProjects();
  });
}

/* ==================================================
   POSSESSION FILTER
================================================== */

if (filterPossession) {
  filterPossession.addEventListener("change", (event) => {
    currentPossession = event.target.value;

    visibleProjectLimit = PROJECTS_PER_PAGE;

    currentProjectSlideIndex = 0;

    updateSearchUrl();

    renderProjects();
  });
}

/* ==================================================
   RESET FILTERS
================================================== */

if (filterReset) {
  filterReset.addEventListener("click", () => {
    currentSearch = "";

    currentLocation = "all";

    currentBhk = "all";

    currentBudget = "all";

    currentPossession = "all";

    visibleProjectLimit = PROJECTS_PER_PAGE;

    currentProjectSlideIndex = 0;

    if (projectSearch) {
      projectSearch.value = "";
    }

    syncFilterControls();

    updateSearchUrl();

    renderProjects();
  });
}

/* ==================================================
   LOAD MORE
================================================== */

if (loadMoreButton) {
  loadMoreButton.addEventListener("click", () => {
    visibleProjectLimit += PROJECTS_PER_PAGE;

    renderProjects();
  });
}

/* ==================================================
   PREVIOUS / NEXT PROJECT BUTTONS
================================================== */

if (projectsPreviousButton) {
  projectsPreviousButton.addEventListener("click", () => {
    moveProjectSlider(-1);
  });
}

if (projectsNextButton) {
  projectsNextButton.addEventListener("click", () => {
    moveProjectSlider(1);
  });
}

/* ==================================================
   WINDOW RESIZE
================================================== */

let projectsResizeTimer = null;

window.addEventListener("resize", () => {
  window.clearTimeout(projectsResizeTimer);

  projectsResizeTimer = window.setTimeout(() => {
    currentProjectSlideIndex = 0;

    renderProjects();
  }, 150);
});

/* ==================================================
   INITIALIZE PROJECTS PAGE
================================================== */

const initializeProjectsPage = async () => {
  /*
   * Do nothing if this JavaScript is accidentally loaded
   * on a page without the projects grid.
   */
  if (!projectsGrid) {
    return;
  }

  /*
   * Synchronise any URL-based Hero search values with
   * filter controls that may exist on projects.html.
   */
  syncFilterControls();

  /*
   * Update Hero/category heading before loading cards.
   */
  updatePageHeading();

  updateCategoryTabs();

  try {
    /*
     * Uses your existing Excel-generated JSON loader
     * from the beginning of this file.
     */
    await loadProjectsData();

    /*
     * Render cards using:
     * - Homepage Hero URL parameters
     * - Location
     * - Budget
     * - BHK
     * - Possession
     */
    renderProjects();
  } catch (error) {
    console.error("Unable to initialize project data:", error);

    if (projectsGrid) {
      projectsGrid.innerHTML = "";
      projectsGrid.hidden = true;
    }

    if (projectsEmpty) {
      projectsEmpty.hidden = false;
    }

    updateProjectCount(0);

    updateProjectSliderButtons(0);

    renderActiveFilters();
  }
};

/* ==================================================
   INITIALIZE
================================================== */

initializeProjectsPage();

/* ==================================================
   PROJECTS PAGE NAVBAR ACTIVE STATE STARTED
================================================== */

const projectsPageNavbarLinks = document.querySelectorAll(
  ".header .navbar-link",
);

const projectsPageSection = document.querySelector("#projects");

const whyDreamKeySection = document.querySelector("#why-us");

const propertyAssistanceSection = document.querySelector(
  "#property-assistance",
);

/* ==================================================
   CLEAR NAVBAR ACTIVE STATE
================================================== */

function clearProjectsPageActiveNav() {
  projectsPageNavbarLinks.forEach((link) => {
    link.classList.remove("active");

    link.removeAttribute("aria-current");
  });
}

/* ==================================================
   SET NAVBAR ACTIVE STATE
================================================== */

function setProjectsPageActiveNav(hash) {
  clearProjectsPageActiveNav();

  const activeLink = document.querySelector(
    `.header .navbar-link[href="${hash}"]`,
  );

  if (!activeLink) return;

  activeLink.classList.add("active");

  activeLink.setAttribute("aria-current", "page");
}

/* ==================================================
   DETECT CURRENT PROJECTS PAGE SECTION
================================================== */

function updateProjectsPageActiveNav() {
  const headerHeight =
    document.querySelector("[data-header]")?.getBoundingClientRect().height ||
    72;

  const detectionY = headerHeight + 100;

  const pageSections = [
    projectsPageSection,
    whyDreamKeySection,
    propertyAssistanceSection,
  ].filter(Boolean);

  let currentSection = null;

  pageSections.forEach((section) => {
    const rect = section.getBoundingClientRect();

    if (rect.top <= detectionY && rect.bottom > detectionY) {
      currentSection = section;
    }
  });

  /*
   * Hero or any section not represented
   * in navbar = no active menu link.
   */
  if (!currentSection) {
    clearProjectsPageActiveNav();

    return;
  }

  if (currentSection.id === "projects") {
    setProjectsPageActiveNav("#projects");

    return;
  }

  if (currentSection.id === "why-us") {
    setProjectsPageActiveNav("#why-us");

    return;
  }

  /*
   * Property Assistance uses the CTA,
   * so no standard navbar menu is activated.
   */
  clearProjectsPageActiveNav();
}

/* ==================================================
   UPDATE NAVBAR ON SCROLL / LOAD
================================================== */

window.addEventListener("scroll", updateProjectsPageActiveNav, {
  passive: true,
});

window.addEventListener("load", updateProjectsPageActiveNav);

window.addEventListener("resize", updateProjectsPageActiveNav);

updateProjectsPageActiveNav();

/* ==================================================
   PROJECTS PAGE NAVBAR ACTIVE STATE ENDED
================================================== */
