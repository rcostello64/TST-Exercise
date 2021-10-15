let app = (function() {
  let state = {};

  let init = () => {
    console.log(getState());
    state = getState();
    popFields(state);
    events();
  };

  let events = () => {
    document.querySelector("#submit").addEventListener("click", collectData);

    document.querySelectorAll("input").forEach(input => {
      input.addEventListener("keyup", e => {
        console.log(e.target.value);
        state[e.target.id] = e.target.value;
        setState(state);
      });
    });
  };

  let collectData = () => {
    if (validateForm()) {
      submitData(formatData());
    }
  };

  let validateForm = () => {
    let username = valUserNameField("username");
    invalidField(username, "userNameField");

    let password = validatePwField("password");
    invalidField(password, "passwordField");

    let confirmPassword = validatePwField("confirmPassword");
    invalidField(confirmPassword, "confirmPasswordField");

    let pwMatch = checkPwMatch("password", "confirmPassword");
    invalidPwField(pwMatch, "pwMatch");

    return username && password && confirmPassword && pwMatch;
  };

  let valUserNameField = field => {
    const pattern = /^([a-zA-Z0-9]){8,12}$/,
      username = document.querySelector(`#${field}`).value;

    return pattern.test(username);
  };

  let validatePwField = field => {
    const pattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,12}/,
      pw = document.querySelector(`#${field}`).value;
    return pattern.test(pw);
  };

  let checkPwMatch = (field1, field2) => {
    const pw1 = document.querySelector(`#${field1}`).value;
    const pw2 = document.querySelector(`#${field2}`).value;

    return pw1 === pw2;
  };

  let invalidField = (isValid, id) => {
    let invalid = document.querySelector(`#${id} .invalid`);
    let valid = document.querySelector(`#${id} .valid`);

    if (isValid) {
      valid.style.display = "inline";
      invalid.style.display = "none";
    } else {
      valid.style.display = "none";
      invalid.style.display = "inline";
    }
  };

  let invalidPwField = (isValid, elem) => {
    let pwMatch = document.querySelector(`.${elem}`);

    if (isValid) {
      pwMatch.style.display = "none";
    } else {
      pwMatch.style.display = "block";
    }
  };

  const formatData = () => {
    return {
      username: document.querySelector("#username").value,
      password: document.querySelector("#password").value
    };
  };

  const submitData = data => {
    //make call to submit data
    console.log(JSON.stringify(data));
  };

  const setState = state => {
    localStorage.setItem("formData", JSON.stringify(state));
  };

  const getState = () => {
    let saved = localStorage.getItem("formData");
    return saved ? JSON.parse(saved) : {};
  };

  const popFields = state => {
    for (const key in state) {
      if (state.hasOwnProperty(key)) {
        document.querySelector(`#${key}`).value = state[key];
      }
    }
  };

  return { init: init };
})();
