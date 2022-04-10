let db;
const request = indexedDB.open('budget-tracker', 1);

//following module 18

//this event will emit if the database version changes
request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore('new_transaction', { autoIncrement: true });
};

//if request is successful
request.onsuccess = function(event) {
  //when db is successfully created with its object store
  db = event.target.result;

  //check if app is online, if yes run
  if (navigator.onLine) {
    uploadTransaction();
  }
};

request.onerror = function(event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(['new_transaction'], 'readwrite');

  const budgetObjectStore = transaction.objectStore('new_transaction');

  // add record to your store with add method.
  budgetObjectStore.add(record);
}


function uploadTransaction() {
  const transaction = db.transaction(['new_transaction'],'readwrite')

  const budgetObjectStore = transaction.objectStore('new_transaction');

  const getAll = budgetObjectStore.getAll();
  

  getAll.onsuccess = function() {
    if(getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(serverResponse => {
        if (serverResponse.message) {
          throw new Error(serverResponse);
        }
        const transaction = db.transaction(['new_transaction'], 'readwrite');
          const budgetObjectStore = transaction.objectStore('new_transaction');
          // clear all items in your store
          budgetObjectStore.clear();
        })
        .catch(err => {
          // set reference to redirect back here
          console.log(err);
    });
  }
};
}

window.addEventListener('online', uploadTransaction);
