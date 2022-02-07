"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

const Workout = class {
  date = new Date();
  id = Date.now();
  coords;

  description;

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }

  _setDesciption() {
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(
      1
    )} on ${this.date.getDate()} ${months[this.date.getMonth()]}`;
  }
};

class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;

    this._calcPace();

    this._setDesciption();
  }

  _calcPace() {
    this.pace = this.duration / this.distance;
  }
}

class Cycling extends Workout {
  type = "cycling";
  constructor(coords, distance, duration, elevGain) {
    super(coords, distance, duration);
    this.elevGain = elevGain;

    this._calcSpeed();

    this._setDesciption();
  }

  _calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
  }
}

const App = class {
  #mapEvent;
  map;
  #workouts = [];

  constructor() {
    this._findLocation();

    inputType.addEventListener("change", this._toggleElevField);
    form.addEventListener("submit", this._newWorkout.bind(this));

    this._getLocalStorage();
  }

  _findLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this._renderMap.bind(this), () =>
        alert(`Couldn't get your location!`)
      );
    }
  }

  _renderMap(position) {
    const { latitude: lat, longitude: lng } = position.coords;
    const coords = [lat, lng];
    const zoomLevel = 13;

    this.map = L.map("map").setView(coords, zoomLevel);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    L.marker(coords).addTo(this.map).bindPopup("Loulou.").openPopup();

    this.map.on("click", this._renderForm.bind(this));

    this.#workouts.forEach((work) => {
      this._renderWorkoutOnMap(work);
    });
  }

  _renderForm(e) {
    this.#mapEvent = e;

    form.classList.remove("hidden");
  }

  _toggleElevField() {
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    e.preventDefault();

    // get data & use it to create new workout object
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    const { lat, lng } = this.#mapEvent.latlng;
    const coords = [lat, lng];

    const isNumber = (...inputs) => inputs.every((inp) => Number.isFinite(inp));
    const isPositive = (...inputs) => inputs.every((inp) => inp > 0);

    let workout;

    if (type === "running") {
      const cadence = +inputCadence.value;

      if (
        !isNumber(distance, duration, cadence) ||
        !isPositive(distance, duration, cadence)
      )
        return alert("inputs should be positive numbers!");

      workout = new Running(coords, distance, duration, cadence);
    }

    if (type === "cycling") {
      const elevGain = +inputElevation.value;

      if (
        !isNumber(distance, duration, elevGain) ||
        !isPositive(distance, duration)
      )
        return alert("inputs should be numbers!");

      workout = new Cycling(coords, distance, duration, elevGain);
    }

    this.#workouts.push(workout);
    // render workout on list
    this._renderWorkoutOnList(workout);

    // render workout on map
    this._renderWorkoutOnMap(workout);

    // clear form
    this._clearForm();

    // remove form
    this._removeForm();

    // set local storage
    this._storeLocalStorage();
  }

  _renderWorkoutOnList(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
              <h2 class="workout__title">${workout.description}</h2>
              <div class="workout__details">
                <span class="workout__icon">${
                  workout.type === "running" ? "🏃‍♂️" : "🚴"
                }</span>
                <span class="workout__value">${workout.distance}</span>
                <span class="workout__unit">km</span>
              </div>
              <div class="workout__details">
                <span class="workout__icon">⏱</span>
                <span class="workout__value">${workout.duration}</span>
                <span class="workout__unit">min</span>
              </div>`;

    if (workout.type === "running") {
      html += `
              <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.pace.toFixed(2)}</span>
                <span class="workout__unit">min/km</span>
              </div>
              <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workout.cadence}</span>
                <span class="workout__unit">spm</span>
              </div>
            </li>`;
    }

    if (workout.type === "cycling") {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(2)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li> `;
    }

    form.insertAdjacentHTML("afterend", html);
  }

  _renderWorkoutOnMap(workout) {
    L.marker(workout.coords)
      .addTo(this.map)
      .bindPopup(
        `${workout.type === "running" ? "🏃‍♂️" : "🚴"} ${workout.description}`,
        {
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        }
      )
      .openPopup();
  }

  _removeForm() {
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => {
      form.style.display = "grid";
    }, 1000);
  }

  _storeLocalStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  }

  _clearForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        0;
  }

  _getLocalStorage() {
    // JSON.stringify() converts JavaScript syntax to a string
    // JSON.parse() converts strings to JavaScript syntax
    const data = JSON.parse(localStorage.getItem("workouts"));

    if (!data) return;
    this.#workouts = data;

    this.#workouts.forEach((work) => {
      this._renderWorkoutOnList(work);
    });
  }
};

const app = new App();
