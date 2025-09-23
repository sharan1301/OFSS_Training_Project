window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('accountRequestForm');
    const submitBtn = form.querySelector('.submit-btn');

    const fields = {
        firstName: form.firstName,
        lastName: form.lastName,
        aadhaarNumber: form.aadhaarNumber,
        accountType: form.accountType,
        annualIncome: form.annualIncome,
        phone: form.phone,
        panNumber: form.panNumber,
        email: form.email,
        occupation: form.occupation,
        consents: [form.querySelectorAll('input[type="checkbox"]')[0], form.querySelectorAll('input[type="checkbox"]')[1]]
    };

    submitBtn.disabled = true;

    function showError(field, message) {
        const errorDiv = field.parentElement.querySelector('.error-message');
        if (errorDiv) errorDiv.textContent = message;
        field.classList.add('input-error');
    }

    function clearError(field) {
        const errorDiv = field.parentElement.querySelector('.error-message');
        if (errorDiv) errorDiv.textContent = '';
        field.classList.remove('input-error');
    }

    function validateAadhaar(value) { return /^\d{12}$/.test(value); }
    function validatePAN(value) { return /^[A-Z]{5}\d{4}[A-Z]{1}$/.test(value); }
    function validatePhone(value) { return /^\d{10}$/.test(value); }
    function validateEmail(value) { return /\S+@\S+\.\S+/.test(value); }

    function validateField(fieldName) {
        const value = fields[fieldName]?.value?.trim();
        switch(fieldName) {
            case 'firstName':
                if (!value || value.length < 2) showError(fields.firstName, 'First name must be at least 2 characters');
                else clearError(fields.firstName);
                break;
            case 'lastName':
                if (!value || value.length < 2) showError(fields.lastName, 'Last name must be at least 2 characters');
                else clearError(fields.lastName);
                break;
            case 'aadhaarNumber':
                if (!validateAadhaar(value)) showError(fields.aadhaarNumber, 'Aadhaar must be 12 digits'); 
                else clearError(fields.aadhaarNumber);
                break;
            case 'accountType':
                if (!fields.accountType.value) showError(fields.accountType, 'Select account type'); 
                else clearError(fields.accountType);
                break;
            case 'phone':
                if (!validatePhone(value)) showError(fields.phone, 'Phone must be exactly 10 digits'); 
                else clearError(fields.phone);
                break;
            case 'panNumber':
                if (!validatePAN(value)) showError(fields.panNumber, 'PAN must be valid (e.g. ABCDE1234F)'); 
                else clearError(fields.panNumber);
                break;
            case 'email':
                if (!validateEmail(value)) showError(fields.email, 'Invalid email'); 
                else clearError(fields.email);
                break;
            case 'consents':
                fields.consents.forEach(cb => {
                    if (!cb.checked) showError(cb, 'Consent required'); 
                    else clearError(cb);
                });
                break;
        }
    }

    function checkFormValidity() {
        const valid =
            fields.firstName.value.trim().length >= 2 &&
            fields.lastName.value.trim().length >= 2 &&
            validateAadhaar(fields.aadhaarNumber.value) &&
            fields.accountType.value &&
            validatePhone(fields.phone.value) &&
            validatePAN(fields.panNumber.value) &&
            validateEmail(fields.email.value) &&
            fields.consents.every(cb => cb.checked);

        submitBtn.disabled = !valid;
    }

    ['firstName','lastName','aadhaarNumber','accountType','phone','panNumber','email'].forEach(key => {
        fields[key].addEventListener('input', () => { validateField(key); checkFormValidity(); });
    });

    fields.consents.forEach(cb => {
        cb.addEventListener('change', () => { validateField('consents'); checkFormValidity(); });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        ['firstName','lastName','aadhaarNumber','accountType','phone','panNumber','email','consents'].forEach(validateField);
        checkFormValidity();
        if (submitBtn.disabled) return;

        const formData = {
            firstName: fields.firstName.value.trim(),
            lastName: fields.lastName.value.trim(),
            aadhaarNumber: fields.aadhaarNumber.value.trim(),
            accountType: fields.accountType.value,
            annualIncome: fields.annualIncome.value ? parseFloat(fields.annualIncome.value) : null,
            phone: fields.phone.value.trim(),
            email: fields.email.value.trim(),
            occupation: fields.occupation.value.trim() || null,
            panNumber: fields.panNumber.value.trim()
        };

        try {
            const response = await fetch('http://localhost:8080/user-requests/create', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Account request submitted successfully!');
                form.reset();
                submitBtn.disabled = true;
                window.location.href = '/landingPage.html'
            } else {
                const errorMsg = await response.text();
                alert('Error: ' + errorMsg);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to submit account request.');
        }
    });
});
