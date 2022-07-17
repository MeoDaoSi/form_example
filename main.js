function Validator(options) {

    const selectorRules = {};

    function validate(inputElement, rule) {
        const formGroup = inputElement.closest(options.formGroup);
        const errorElement = formGroup.querySelector(options.errorSelector);
        // const errorMessage = rule.test(inputElement.value);
        const rules = selectorRules[rule.selector];

        for (let i = 0; i < rules.length; i++) {
            errorMessage = rules[i](inputElement.value)
            if (errorMessage)
                break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage
            inputElement.closest(options.formGroup).classList.add('invalid');
        }
        else {
            errorElement.innerText = '';
            inputElement.closest(options.formGroup).classList.remove('invalid');
        }

        return !errorMessage;
    }

    const formElement = $(options.form);

    if (formElement) {

        formElement.onsubmit = function (e) {

            let isFormValid = true;

            e.preventDefault();

            options.rules.forEach(rule => {
                const inputElement = $(rule.selector);
                let isValid = validate(inputElement, rule);
                if (!isValid)
                    isFormValid = false;
            })

            if (isFormValid)
                if (typeof options.onSubmit === 'function') {

                    let enableInputs = formElement.querySelectorAll('[name]:not([disable])')
                    let formValues = Array.from(enableInputs).reduce(function (values, input) {
                        console.log(values);
                        values[input.name] = input.value
                        return values;
                    }, {});

                    options.onSubmit(formValues);
                }
        }

        options.rules.forEach(rule => {

            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            const inputElement = $(rule.selector);
            const errorElement = inputElement.closest(options.formGroup).querySelector(options.errorSelector);
            if (inputElement) {
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                }
                inputElement.oninput = function () {
                    errorElement.innerText = '';
                    inputElement.closest(options.formGroup).classList.remove('invalid');
                }
            }
        });
    }
};
Validator.isRequired = function (selector, message) {
    return {
        selector,
        test(value) {
            return value.trim() ? undefined : message || "Please, typing!"
        }
    };
}
Validator.isEmail = function (selector) {
    return {
        selector,
        test(value) {
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : "Email is not correct!"
        }
    };
}
Validator.minLength = function (selector, min) {
    return {
        selector,
        test(value) {
            return value.length >= min ? undefined : "Weakness Length!"
        }
    };
}
Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector,
        test(value) {
            return value === getConfirmValue() ? undefined : message || "Value not match!"
        }
    };
}