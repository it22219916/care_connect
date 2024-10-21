class Config {
  constructor() {
    if (Config.instance) {
      return Config.instance;
    }

    this.settings = {
      getAppointments: `http://localhost:3001/appointments/`,
      getDoctors: `http://localhost:3001/doctors`,
      getPatients: `http://localhost:3001/patients`,
      getDepartments: `http://localhost:3001/departments`,
      getPrescriptions: `http://localhost:3001/prescriptions`,
      getMedicines: `http://localhost:3001/medicines`,
      getUsers: `http://localhost:3001/users`,
      postLogin: `http://localhost:3001/login`,
      postSignUp: `http://localhost:3001/signUp`,
      postAppointments: `http://localhost:3001/appointments/add`,
      countUsers: `http://localhost:3001/count/users`,
      countAppointments: `http://localhost:3001/count/appointments`,
      countPatientsTreated: `http://localhost:3001/count/patients/treated`,
      paypalClientId:
        "AUUc1QZinPQRjUl0qfWm1x4Rnx3nK29ah1LEz0NV4hRULbrjCWUqthKnu8uRxPQ1PNcqNZ6fThvZ0t1v",
    };

    Config.instance = this;
  }

  get(key) {
    return this.settings[key];
  }

  set(key, value) {
    this.settings[key] = value;
  }
}

const instance = new Config();
Object.freeze(instance);

export default instance;
