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

  constructor(distance, duration) {
    this.distance = distance;
    this.duration = duration;
  }
};

class Running extends Workout {
  type = "running";
  constructor(distance, duration, cadence) {
    super(distance, duration);
    this.cadence = cadence;

    this._calcPace();
  }

  _calcPace() {
    this.pace = this.duration / this.distance;
  }
}

class Cycling extends Workout {
  type = "cycling";
  constructor(distance, duration, elevGain) {
    super(distance, duration);
    this.elevGain = elevGain;

    this._calcSpeed();
  }

  _calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
  }
}

const App = class {
  constructor() {
    this._findLocation();
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

    const map = L.map("map").setView(coords, zoomLevel);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.marker(coords).addTo(map).bindPopup("Loulou.").openPopup();

    map.on("click", this._renderForm.bind(this));
  }

  _renderForm() {
    form.classList.remove("hidden");

    inputType.addEventListener("change", this._toggleElevField);
    form.addEventListener("submit", this._newWorkout.bind(this));
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

    let workout;

    if (type === "running") {
      const cadence = +inputCadence.value;
      workout = new Running(distance, duration, cadence);
    }

    if (type === "cycling") {
      const elevGain = +inputElevation.value;
      workout = new Cycling(distance, duration, elevGain);
    }
    // render workout on list

    this._renderWorkoutOnList(workout);
    // render workout on map

    this._renderWorkoutOnMap();
    // remove form
  }

  _renderWorkoutOnList(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
              <h2 class="workout__title">${workout.type[0].toUpperCase()}${workout.type.slice(
      1
    )} on ${workout.date.getDate()} ${months[workout.date.getDate()]}</h2>
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
                <span class="workout__value">${workout.pace}</span>
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
            <span class="workout__value">${workout.speed}</span>
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

  // _renderWorkoutOnMap(workout) {
  //   L.marker(coords).addTo(map).bindPopup("Loulou.").openPopup();
  //// }
};

const app = new App();
