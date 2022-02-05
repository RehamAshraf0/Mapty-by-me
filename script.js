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
    form.addEventListener("submit", this._newWorkout);
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

    this._renderWorkoutOnList();
    // render workout on map
    // remove form
  }
};

const app = new App();
