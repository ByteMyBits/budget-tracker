let db;
const request = indexedDB.open("Transactions", 1);


request.onupgradeneeded = (e) => {
    const db = e.target.result;
    db.createObjectStore("Transactions", { autoIncrement: true });
};

request.onerror = (e) => {
    console.log("There was an error");
};

function checkDB() {
    const transaction = db.transaction(["Transactions"], "readwrite");
    const store = transaction.objectStore("Transactions");
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                },
            })
                .then((response) => response.json())
                .then(() => {
                    transaction = db.transaction(["Transactions"], "readwrite");
                    const store = transaction.objectStore("Transactions");
                    store.clear();
                });
        }
    };
}

request.onsuccess = (e) => {
    db = e.target.result;
    if (navigator.onLine) {
        checkDB();
    }
};

const saveRecord = (record) => {
    const transaction = db.transaction(["Transactions"], "readwrite");
    const store = transaction.objectStore("Transactions");
    store.add(record);
};

window.addEventListener("online", checkDB);