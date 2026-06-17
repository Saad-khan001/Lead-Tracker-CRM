const nameInput = document.getElementById("client-name");
const emailInput = document.getElementById("client-email");
const companyInput = document.getElementById("company-name");
const statusInput = document.getElementById("status");

const form = document.querySelector(".form-container");
const tableBody = document.querySelector("tbody");
const searchInput = document.getElementById("searchInput");
const saveButton = document.getElementById("saveButton");
const cancelEdit = document.getElementById("cancelEdit");


const formModal = document.getElementById("formModal");
const addLeadBtn = document.getElementById("addLeadBtn");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalTitle = document.getElementById("modalTitle");


function openModal(title = "Add New Lead") {
    formModal.classList.add("active");
    modalTitle.textContent = title;
}

function closeModal() {
    formModal.classList.remove("active");
    resetForm();
}


addLeadBtn.addEventListener("click", function () {
    editId = null;
    form.reset();
    openModal("Add New Lead");
});

modalCloseBtn.addEventListener("click", closeModal);


formModal.addEventListener("click", function (e) {
    if (e.target === formModal) {
        closeModal();
    }
});


let leads = JSON.parse(localStorage.getItem("leads")) || [];
let editId = null;


leads = leads.map((lead, index) => {
    if (!lead.id) {
        lead.id = Date.now() + index;
    }
    return lead;
});


if (leads.some(lead => !lead.id)) {
    localStorage.setItem("leads", JSON.stringify(leads));
}


form.addEventListener("submit", function (e) {
    e.preventDefault();

    const newLead = {
        id: editId !== null ? editId : Date.now(),
        name: nameInput.value,
        email: emailInput.value,
        company: companyInput.value,
        status: statusInput.value
    };

    if (editId !== null) {
        const index = leads.findIndex(lead => lead.id === editId);
        if (index !== -1) leads[index] = newLead;
    } else {
        leads.push(newLead);
    }

    localStorage.setItem("leads", JSON.stringify(leads));

    renderTable();
    closeModal();
});

cancelEdit.addEventListener("click", function () {
    closeModal();
});

function resetForm() {
    form.reset();
    editId = null;
    saveButton.textContent = "Save Lead";
    cancelEdit.hidden = true;
}

function startEdit(id) {
    const lead = leads.find(lead => lead.id === id);
    if (!lead) return;

    nameInput.value = lead.name;
    emailInput.value = lead.email;
    companyInput.value = lead.company;
    statusInput.value = lead.status;

    editId = id;
    saveButton.textContent = "Update Lead";
    cancelEdit.hidden = false;

    openModal(`Edit Lead - ${lead.name}`);
    nameInput.focus();
}

function formatStatus(status) {
    switch (status) {
        case "contacted":
            return "Contacted";
        case "qualified":
            return "Qualified";
        case "in-discussion":
            return "In Discussion";
        case "proposal-sent":
            return "Proposal Sent";
        case "negotiation":
            return "Negotiation";
        case "closed-won":
            return "Closed Won";
        case "closed-lost":
            return "Closed Lost";
        case "on-hold":
            return "On Hold";
        case "disqualified":
            return "Disqualified";
        default:
            return "New Lead";
    }
}


function renderTable(data = leads) {

    tableBody.innerHTML = "";

    if (data.length === 0) {
        const emptyRow = document.createElement("tr");
        emptyRow.innerHTML = `<td colspan="5" class="empty-row">No leads found.</td>`;
        tableBody.appendChild(emptyRow);
        updateStats(data);
        return;
    }

    data.forEach(function (lead) {

        const row = document.createElement("tr");

        const originalIndex = leads.findIndex(item => item.id === lead.id);

        const statusLabel = formatStatus(lead.status);

        row.innerHTML = `
            <td>${lead.name}</td>
            <td>${lead.email}</td>
            <td>${lead.company}</td>

            <td>
                <span class="status ${lead.status}">
                    ${statusLabel}
                </span>
            </td>

            <td>
                <button type="button" class="edit-btn">Edit</button>
                <button type="button" class="delete-btn">Delete</button>
            </td>
        `;

        const editButton = row.querySelector(".edit-btn");
        const deleteButton = row.querySelector(".delete-btn");

        if (editButton) {
            editButton.addEventListener("click", function () {
                startEdit(lead.id);
            });
        }

        if (deleteButton) {
            deleteButton.addEventListener("click", function () {
                deleteLead(lead.id);
            });
        }

        tableBody.appendChild(row);
    });

    updateStats(data);
}


tableBody.addEventListener("click", function (e) {
    const button = e.target.closest("button[data-action]");
    if (!button) return;

    const id = parseInt(button.dataset.id, 10);
    if (Number.isNaN(id)) return;

    const action = button.dataset.action;
    if (action === "edit") {
        startEdit(id);
    } else if (action === "delete") {
        deleteLead(id);
    }
});


function deleteLead(id) {
    const index = leads.findIndex(lead => lead.id === id);
    if (index === -1) return;

    leads.splice(index, 1);
    localStorage.setItem("leads", JSON.stringify(leads));
    renderTable();

    if (editId === id) {
        resetForm();
    }
}


function updateStats(data = leads) {

    document.getElementById("total-leads").textContent =
        data.length;

    document.getElementById("qualified-leads").textContent =
        data.filter(
            lead => lead.status === "qualified" || 
                    lead.status === "in-discussion" || 
                    lead.status === "proposal-sent" || 
                    lead.status === "negotiation" ||
                    lead.status === "closed-won"
        ).length;

    document.getElementById("in-discussion-leads").textContent =
        data.filter(
            lead => lead.status === "in-discussion"
        ).length;

    document.getElementById("closed-won-leads").textContent =
        data.filter(
            lead => lead.status === "closed-won"
        ).length;
}



if (searchInput) {
    searchInput.addEventListener("input", function () {

        const searchValue = searchInput.value.toLowerCase();

        const filteredLeads = leads.filter(function (lead) {

            return (
                lead.name.toLowerCase().includes(searchValue) ||
                lead.email.toLowerCase().includes(searchValue) ||
                lead.company.toLowerCase().includes(searchValue) ||
                lead.status.toLowerCase().includes(searchValue)
            );

        });

        renderTable(filteredLeads);

    });
}


renderTable();