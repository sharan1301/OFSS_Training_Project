const apiBaseUrl = "http://localhost:8080/payees"; 
const accountId = 3;

// Fetch all payees for this account
async function fetchPayees() {

    const token = localStorage.getItem("jwtToken");
    const response = await fetch(`${apiBaseUrl}/account/${accountId}`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
});
    if (!response.ok) {
        console.error("Failed to fetch payees");
        return [];
    }
    
    return await response.json();
}

async function addPayeeApi(data) {
     const token = localStorage.getItem("jwtToken");
    const response = await fetch(`${apiBaseUrl}/${accountId}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
         },
        body: JSON.stringify({
            payeeName: data.beneficiaryName,
            payeeAccNo: data.beneficiaryAccountNum,
            ifscCode: data.ifscCode
        })
    });
    if (!response.ok) {
        alert("Error adding payee");
        return null;
    }
    return await response.json();
}



// async function deletePayee(payeeId) {
//     await fetch(`${apiBaseUrl}/${payeeId}`, { method: "DELETE" });
//     loadPayees();
// }


// Dummy payee data
const payees = [];

// Utility
function showError(input, message) {
    input.classList.add('input-error');
    input.parentElement.querySelector('.error-message').textContent = message;
}
function clearError(input) {
    input.classList.remove('input-error');
    input.parentElement.querySelector('.error-message').textContent = '';
}
// Validation function update
function validateAddPayee(data) {
    let valid = true;

    // Name check
    if (!data.beneficiaryName.trim()) {
        showError(document.getElementById('beneficiaryName'), "Name required.");
        valid = false;
    } else {
        clearError(document.getElementById('beneficiaryName'));
    }

    // Account number check
    if (!/^\d{9,18}$/.test(data.beneficiaryAccountNum)) {
        showError(document.getElementById('beneficiaryAccountNum'), "Enter valid account number (9-18 digits).");
        valid = false;
    } else {
        clearError(document.getElementById('beneficiaryAccountNum'));
    }
    if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(data.ifscCode)) {
        showError(document.getElementById('ifscCode'), "Enter a valid 11-character IFSC Code.");
        valid = false;
    } else {
        clearError(document.getElementById('ifscCode'));
    }

    return valid;
};

document.addEventListener('DOMContentLoaded', () => {
document.getElementById('addPayeeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        beneficiaryName: document.getElementById('beneficiaryName').value.trim(),
        beneficiaryAccountNum: document.getElementById('beneficiaryAccountNum').value.trim(),
        ifscCode: document.getElementById('ifscCode').value.trim()
    };
    if (validateAddPayee(data)) {
        const savedPayee = await addPayeeApi(data);
        if (savedPayee) {
            renderPayeeList(savedPayee.payeeId);
            showPayeeDetails(savedPayee);
            e.target.reset();
        }
    }
});
});

async function renderPayeeList(selectedId = null) {
    const payees = await fetchPayees();
    const ul = document.getElementById('payeeList');
    ul.innerHTML = '';

    payees.forEach(payee => {
        const li = document.createElement('li');
        li.textContent = payee.payeeName; 
        li.classList.toggle('selected', payee.payeeId === selectedId);
        li.addEventListener('click', () => {
            showPayeeDetails(payee);
            renderPayeeList(payee.payeeId);
        });
        ul.appendChild(li);
    });
}



// function showPayeeDetails(payee) {
//     const section = document.getElementById('payeeDetailSection');
//     const detailDiv = document.getElementById('payeeDetail');
//     detailDiv.innerHTML = `
//         <form class="payee-detail-form">
//             <div class="payee-row">
//                 <label for="updatePayeeName">Name:</label>
//                 <input type="text" id="updatePayeeName" value="${payee.payeeName}" />
//             </div>
//             <div class="payee-row">
//                 <label for="updatePayeeAccNo">Account Number:</label>
//                 <input type="text" id="updatePayeeAccNo" value="${payee.payeeAccNo}" readonly />
//             </div>
//             <div class="payee-row">
//                 <label for="updatePayeeIFSC">IFSC: </label>
//                 <input type="text" id="updatePayeeIFSC" value="${payee.ifscCode}" maxlength="11" />
//             </div>
//             <div class="payee-detail-actions">
//                 <button type="button" id="updatePayeeBtn" class="update-btn">Update Payee</button>
//                 <button type="button" id="deletePayeeBtn" class="delete-btn">Delete Payee</button>
//             </div>
//             <div id="updateMessage" class="message"></div>
//         </form>
//     `;
//     section.style.display = 'block';

//     // Confirmation dialogs and event handlers
//     document.getElementById('updatePayeeBtn').onclick = async () => {
//         if (!confirm("Are you sure you want to update this payee?")) return;
//         const updatedName = document.getElementById('updatePayeeName').value.trim();
//         const updatedIFSC = document.getElementById('updatePayeeIFSC').value.trim();

//         if (!updatedName) {
//             alert("Name cannot be empty.");
//             return;
//         }
//         if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(updatedIFSC)) {
//             alert("Enter a valid 11-character IFSC Code.");
//             return;
//         }

//         const updatedData = {
//             payeeId: payee.payeeId,
//             payeeName: updatedName,
//             payeeAccNo: payee.payeeAccNo,
//             ifscCode: updatedIFSC
//         };

//         const updateSuccess = await updatePayeeApi(updatedData);
//         if (updateSuccess) {
//             document.getElementById('updateMessage').textContent = "Payee updated successfully.";
//             renderPayeeList(payee.payeeId);
//         } else {
//             document.getElementById('updateMessage').textContent = "Failed to update payee.";
//         }
//     };

//     document.getElementById('deletePayeeBtn').onclick = async () => {
//         if (!confirm(`Are you sure you want to delete payee "${payee.payeeName}"?`)) return;
//         if (!confirm(`Are you sure you want to delete payee "${payee.payeeName}"?`)) {
//             return;
//         }
//         const deleteSuccess = await deletePayeeApi(payee.payeeId);
//         if (deleteSuccess) {
//             document.getElementById('updateMessage').textContent = "Payee deleted successfully.";
//             document.getElementById('payeeDetailSection').style.display = 'none';
//             renderPayeeList();
//         } else {
//             document.getElementById('updateMessage').textContent = "Failed to delete payee.";
//         }
//     };
// }


function showPayeeDetails(payee) {
    const section = document.getElementById('payeeDetailSection');
    const detailDiv = document.getElementById('payeeDetail');
    detailDiv.innerHTML = `
        <form class="payee-detail-form">
            <div class="payee-row">
                <label for="updatePayeeName"><strong>Name:</strong></label>
                <input type="text" id="updatePayeeName" value="${payee.payeeName}" />
            </div>
            <div class="payee-row">
                <label for="updatePayeeAccNo"><strong>Account Number:</strong></label>
                <input type="text" id="updatePayeeAccNo" value="${payee.payeeAccNo}"  />
            </div>
            <div class="payee-row">
                <label for="updatePayeeIFSC"><strong>IFSC:</strong></label>
                <input type="text" id="updatePayeeIFSC" value="${payee.ifscCode}" maxlength="11" />
            </div>
            <div class="payee-detail-actions">
                <button type="button" id="updatePayeeBtn" class="update-btn">Update Payee</button>
                <button type="button" id="deletePayeeBtn" class="delete-btn">Delete Payee</button>
            </div>
            <div id="updateMessage" class="message"></div>
        </form>

        <div id="confirmationDialog" class="confirmation-dialog" style="display:none;">
            <div class="dialog-content">
                <p id="confirmationMessage"></p>
                <div class="dialog-actions">
                    <button id="confirmBtn" class="confirm-btn">Confirm</button>
                    <button id="cancelBtn" class="cancel-btn">Cancel</button>
                </div>
            </div>
        </div>
    `;
    section.style.display = 'block';

    function showConfirmation(message, onConfirm) {
        const dialog = document.getElementById('confirmationDialog');
        const msg = document.getElementById('confirmationMessage');
        msg.textContent = message;
        dialog.style.display = 'flex';

        const confirmBtn = document.getElementById('confirmBtn');
        const cancelBtn = document.getElementById('cancelBtn');

        function cleanup() {
            dialog.style.display = 'none';
            confirmBtn.removeEventListener('click', onConfirmHandler);
            cancelBtn.removeEventListener('click', onCancelHandler);
        }

        function onConfirmHandler() {
            cleanup();
            onConfirm();
        }
        function onCancelHandler() {
            cleanup();
        }

        confirmBtn.addEventListener('click', onConfirmHandler);
        cancelBtn.addEventListener('click', onCancelHandler);
    }

    document.getElementById('updatePayeeBtn').onclick = () => {
        showConfirmation("Are you sure you want to update this payee?", async () => {
            const updatedName = document.getElementById('updatePayeeName').value.trim();
            const updatedIFSC = document.getElementById('updatePayeeIFSC').value.trim();
            if (!updatedName) {
                alert("Name cannot be empty.");
                return;
            }
            if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(updatedIFSC)) {
                alert("Enter a valid 11-character IFSC Code.");
                return;
            }
            const updatedData = {
                payeeId: payee.payeeId,
                payeeName: updatedName,
                payeeAccNo: payee.payeeAccNo,
                ifscCode: updatedIFSC
            };
            const success = await updatePayeeApi(updatedData);
            document.getElementById('updateMessage').textContent = success ? "Payee updated successfully." : "Failed to update payee.";
            if (success) renderPayeeList(payee.payeeId);
        });
    };

    document.getElementById('deletePayeeBtn').onclick = () => {
        showConfirmation(`Are you sure you want to delete payee "${payee.payeeName}"?`, async () => {
            const success = await deletePayeeApi(payee.payeeId);
            if (success) {
                document.getElementById('updateMessage').textContent = "Payee deleted successfully.";
                section.style.display = 'none';
                renderPayeeList();
            } else {
                document.getElementById('updateMessage').textContent = "Failed to delete payee.";
            }
        });
    };
}


async function updatePayeeApi(data) {
    const token = localStorage.getItem("jwtToken");
    const response = await fetch(`${apiBaseUrl}/update/${data.payeeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
         },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        console.error("Failed to update payee:", response.status, response.statusText);
        return false;
    }
    return true;
}



async function deletePayeeApi(payeeId) {
    const token = localStorage.getItem("jwtToken");
    const response = await fetch(`${apiBaseUrl}/${payeeId}`, {
        method: "DELETE",
         headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
    });

    if (response.status === 204) { // No Content, success delete
        return true;
    } else {
        console.error("Failed to delete payee:", response.status, response.statusText);
        return false;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    renderPayeeList();

    document.getElementById('addPayeeForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        beneficiaryName: document.getElementById('beneficiaryName').value.trim(),
        beneficiaryAccountNum: document.getElementById('beneficiaryAccountNum').value.trim(),
        ifscCode: document.getElementById('ifscCode').value.trim()
    };

    console.log("Form data submitted:", data); // <-- Add this line to log data

    if (validateAddPayee(data)) {
        const savedPayee = await addPayeeApi(data);
        if (savedPayee) {
            renderPayeeList(savedPayee.payeeId);
            showPayeeDetails(savedPayee);
            e.target.reset();
        }
    }
});

});

