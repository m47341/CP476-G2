let menuOpen = true;
let checkIn = false;
let checkOut = false;

// wip... open/close menu on click - need to fix css
function menuClick() {
    console.log('clicked', menuOpen);
    menuOpen = !menuOpen;
    document.getElementById('openMenu').hidden = menuOpen;
}

function changePage(element) {
    if (element.id == 'catalogLink') {
        window.location.href = 'catalog.html';
    } else if (element.id == 'checkInLink') {
        // not very optimized way of doing it
        document.getElementById('checkOutForm').hidden = true;
        document.getElementById('checkInForm').hidden = false;
    } else if (element.id == 'checkOutLink') {
        document.getElementById('checkInForm').hidden = true;
        document.getElementById('checkOutForm').hidden = false;
    } else if (element.id == 'newPatronLink') {
        window.location.href = 'new-patron.html';
    } else if (element.id == 'updatePatronLink') {
        window.location.href = 'update-patron.html';
    }
}

function checkInSubmit(e) {
    const bookValue = document.querySelector("input[name='cInBookCode']").value;
    const patronValue = document.querySelector("input[name='cInPatron']").value;

    console.log(bookValue, patronValue);

    if (bookValue == "" || patronValue == "") {
        checkIn = false;
        e.preventDefault();
        alert("Please enter data in all fields.");
    } else {
        checkIn = true;
        alert("Save successful!");
        // this is a stupid, not optimized and impermanent solution
        /* document.getElementById('checkInForm').hidden = true;
        document.getElementById('onCheckInSubmit').hidden = false;
        document.getElementById('bookCode').innerHTML = "Book code: " + bookValue;
        document.getElementById('patron').innerHTML = "Patron: " + patronValue; */
    }
}

function checkOutSubmit(e) {
    const bookValue = document.querySelector("input[name='cOutBookCode']").value;
    const patronValue = document.querySelector("input[name='cOutPatron']").value;

    if (bookValue == "" || patronValue == "") {
        checkOut = false;
        e.preventDefault();
        alert("Please enter data in all fields.");
    } else {
        checkOut = true;
        alert("Save successful!");
    }
}