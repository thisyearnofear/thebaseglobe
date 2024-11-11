import { aircraftManager } from "./AircraftManager";

export class SelectionManager {
  constructor() {
    this.pilotOptions = [
      { id: "human", emoji: "👨🏼‍🦰", name: "Human" },
      { id: "frog", emoji: "🎩", name: "Frog" },
      { id: "nouns", emoji: "😎", name: "Nouns", tokenRequired: "zora" },
    ];

    this.selectedPilot = null;
    this.selectedAircraft = null;

    this.startButton = null;
    this.startButtonTooltip = null;

    this.userAddress = null;
    this.hasToken = false;

    this.zoraAccess = false;

    document.addEventListener("DOMContentLoaded", () => {
      this.initSelectionScreen();
      this.setupInfoModal();
      this.startButton = document.getElementById("start-game");
      this.startButtonTooltip = document.getElementById("start-game-tooltip");
      this.startButton.addEventListener("click", () => this.handleStartClick());
      this.startButton.addEventListener("mouseenter", () => this.showTooltip());
      this.startButton.addEventListener("mouseleave", () => this.hideTooltip());
    });

    // Replace the wallet status change listener with the new zora access listener
    document.addEventListener("zoraAccessUpdated", (event) => {
      console.log("Zora access updated:", event.detail.hasAccess);
      this.zoraAccess = event.detail.hasAccess;
      this.updateZoraOptions();
    });

    // Check localStorage on init
    const savedWalletState = localStorage.getItem("walletState");
    if (savedWalletState) {
      const { userAddress, hasToken } = JSON.parse(savedWalletState);
      this.userAddress = userAddress;
      this.hasToken = hasToken;
    }
  }

  async initSelectionScreen() {
    const pilotOptionsContainer = document.getElementById("pilot-options");
    const aircraftOptionsContainer =
      document.getElementById("aircraft-options");

    if (!pilotOptionsContainer || !aircraftOptionsContainer) {
      console.error("Selection containers not found in the DOM");
      return;
    }

    this.userAddress = null;
    this.hasToken = false;

    this.pilotOptions.forEach((pilot) => {
      const option = this.createSelectionOption(pilot, "pilot");
      if (pilot.tokenRequired) {
        option.classList.toggle("hidden", !this.hasToken);
      }
      pilotOptionsContainer.appendChild(option);
    });

    aircraftManager.getAircraftOptions().forEach((aircraft) => {
      const option = this.createSelectionOption(aircraft, "aircraft");
      if (aircraft.tokenRequired) {
        option.classList.toggle("hidden", !this.hasToken);
      }
      aircraftOptionsContainer.appendChild(option);
    });

    this.updateStartButton();
  }

  createSelectionOption(item, type) {
    const option = document.createElement("div");
    option.classList.add("selection-option");
    option.dataset.id = item.id;
    option.dataset.type = type;

    const emoji = document.createElement("span");
    emoji.textContent = item.emoji;
    emoji.classList.add("selection-emoji");
    option.appendChild(emoji);

    const name = document.createElement("span");
    name.textContent = item.name;
    name.classList.add("selection-name");
    option.appendChild(name);

    option.addEventListener("click", () => this.selectOption(item.id, type));

    return option;
  }

  selectOption(id, type) {
    const options = document.querySelectorAll(
      `.selection-option[data-type="${type}"]`
    );
    options.forEach((option) => option.classList.remove("selected"));

    const selectedOption = document.querySelector(
      `.selection-option[data-id="${id}"][data-type="${type}"]`
    );
    if (selectedOption) {
      selectedOption.classList.add("selected");
      if (type === "pilot") {
        this.selectedPilot = id;
      } else if (type === "aircraft") {
        this.selectedAircraft = id;
        aircraftManager.setSelectedAircraft(id);
      }
    }

    this.updateStartButton();
  }

  updateStartButton() {
    if (!this.startButton) return;

    const isSelectionComplete = this.selectedPilot && this.selectedAircraft;

    if (isSelectionComplete) {
      this.startButton.classList.add("visible");
      this.startButton.disabled = false;
    } else {
      this.startButton.classList.remove("visible");
      this.startButton.disabled = true;
    }
  }

  handleStartClick() {
    if (this.startButton.disabled) {
      this.showTooltip();
      setTimeout(() => this.hideTooltip(), 2000); // Hide after 2 seconds
    } else {
      this.startMap();
    }
  }

  showTooltip() {
    if (this.startButton.disabled && this.startButtonTooltip) {
      this.startButtonTooltip.style.display = "block";
      this.startButtonTooltip.classList.add("visible");
      // Position the tooltip below the button
      const buttonRect = this.startButton.getBoundingClientRect();
      this.startButtonTooltip.style.top = `${buttonRect.bottom + 10}px`;
      this.startButtonTooltip.style.left = `${
        buttonRect.left + buttonRect.width / 2
      }px`;
      // Trigger reflow to ensure the transition works
      this.startButtonTooltip.offsetHeight;
      this.startButtonTooltip.style.opacity = "1";
    }
  }

  hideTooltip() {
    if (this.startButtonTooltip) {
      this.startButtonTooltip.style.opacity = "0";
      setTimeout(() => {
        this.startButtonTooltip.classList.remove("visible");
        this.startButtonTooltip.style.display = "none";
      }, 300); // Match this with the transition duration in CSS
    }
  }

  startMap() {
    if (!this.selectedPilot || !this.selectedAircraft) {
      console.log(
        "Please select both a pilot and an aircraft before starting the game"
      );
      return;
    }

    console.log(
      "Starting map with selected pilot:",
      this.selectedPilot,
      "and aircraft:",
      this.selectedAircraft
    );

    // Add 'hidden' class to intro-screen
    document.getElementById("intro-screen").classList.add("hidden");

    // Add 'game-started' class to header
    document.querySelector(".header").classList.add("game-started");

    // Show score wrapper
    const scoreWrapper = document.getElementById("score-wrapper");
    scoreWrapper.classList.remove("hidden");

    // Use a small delay to ensure the transition is visible
    setTimeout(() => {
      scoreWrapper.classList.add("visible");
    }, 50);

    const event = new CustomEvent("selectionComplete", {
      detail: {
        pilot: this.selectedPilot,
        aircraft: this.selectedAircraft,
      },
    });
    document.dispatchEvent(event);
    console.log("selectionComplete event dispatched");
  }

  getSelection() {
    return {
      pilot: this.selectedPilot,
      aircraft: this.selectedAircraft,
    };
  }

  async updateZoraOptions() {
    console.log("Updating Zora-gated options. Access:", this.zoraAccess);

    // Update pilot options visibility
    this.pilotOptions.forEach((pilot) => {
      const pilotElement = document.querySelector(
        `.selection-option[data-id="${pilot.id}"]`
      );
      if (pilotElement && pilot.tokenRequired === "zora") {
        console.log(`Updating visibility for ${pilot.id}:`, !this.zoraAccess);
        pilotElement.classList.toggle("hidden", !this.zoraAccess);
      }
    });

    // Update aircraft options visibility if needed
    aircraftManager.getAircraftOptions().forEach((aircraft) => {
      const aircraftElement = document.querySelector(
        `.selection-option[data-id="${aircraft.id}"]`
      );
      if (aircraftElement && aircraft.tokenRequired === "zora") {
        aircraftElement.classList.toggle("hidden", !this.zoraAccess);
      }
    });

    this.updateStartButton();
  }

  setupInfoModal() {
    const infoIcon = document.getElementById("selection-info");
    const infoModal = document.getElementById("info-modal");
    const closeInfo = document.querySelector(".close-info");

    if (!infoIcon || !infoModal || !closeInfo) {
      console.error("Info modal elements not found");
      return;
    }

    // Create a separate container for the modal
    const modalContainer = document.createElement("div");
    modalContainer.id = "info-modal-container";
    modalContainer.style.position = "absolute";
    modalContainer.style.zIndex = "1000";
    document.body.appendChild(modalContainer);
    modalContainer.appendChild(infoModal);

    infoIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      const iconRect = infoIcon.getBoundingClientRect();
      modalContainer.style.top = `${iconRect.bottom + 10}px`;
      modalContainer.style.left = `${iconRect.left}px`;
      infoModal.classList.remove("hidden");
    });

    closeInfo.addEventListener("click", (e) => {
      e.stopPropagation();
      infoModal.classList.add("hidden");
    });

    // Close on click outside of modal content
    document.addEventListener("click", (e) => {
      if (!infoModal.contains(e.target) && e.target !== infoIcon) {
        infoModal.classList.add("hidden");
      }
    });
  }
}

export const selectionManager = new SelectionManager();
