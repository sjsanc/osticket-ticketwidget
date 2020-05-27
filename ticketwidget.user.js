// ==UserScript==
// @name        osticket-ticketwidget 
// @namespace   Violentmonkey Scripts
// @match       http://gbuk-ticketsystem/osticket/scp/*
// @grant       none
// @version     1.0
// @author      sjs
// @require     https://kit.fontawesome.com/2c7fa631b5.js
// @description A little dashboard widget for all your queues to relax in. Neat!
// ==/UserScript==

let style = document.createElement('style');
style.innerHTML = `
* {
    padding: 0;
    margin: 0;
}

.w-container {
    position: absolute;
    top: 90px;
    left: 20px; 
    
    width: 260px;
    border: 4px solid #dbdbdb;
    border-radius: 8px;
    background-color: white;
    
    display: flex;
    flex-direction: column;
}

.w-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    
    background-color: #F7f7f7;
    padding: 5px;
    border-radius: 8px 8px 0 0;
    border-bottom: 2px dashed #dbdbdb;
    
    position: relative;
}
.w-header h1 {
    font-size: 1.5rem;
    color: #EB8C24;
}
.w-header p {
    font-size: 1.1rem;
    font-weight: bold;  
    opacity: 0.2;
    position: absolute;
    top: 6px;
    left: 145px;
}
.w-header i {
    color: #bdbdbd;
    font-size: 0.9rem;
    padding-top: 5px;
    width: 25px;
    height: 20px;
    text-align: center;
}
.w-header i:hover {
    color: #0088CC
}

.w-new-queue {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 3px;
    border-bottom: 2px dashed #dbdbdb;
    height: 30px;
}
.w-new-queue input {
    height: 26px;
    padding: 0;
    border: 0;
    background-color: #F7f7f7;
    padding-left: 5px;
    border: 1px solid white;
    cursor: pointer;

}
.w-new-queue input:focus {
    border: 1px solid #0088CC;
}
.w-new-queue input:first-of-type {
    width: 25px;
    -moz-appearance: textfield;
    -webkit-appearance: textfield;
}

.w-new-queue input:last-of-type {
    width: 140px;
}

.w-new-queue button {
    width: 65px;
    height: 27px;
    border: 0;
    padding: 5px;
    font-weight: bold;
    color: #EB8C24;
    background-color: #F7f7f7;
    border-radius: 4px;    
    cursor: pointer;
}
.w-new-queue button:hover, button:focus {
    background-color: #0088CC;
    color: white;
}
.w-new-queue button:active {
    background-color: #006395
   
}
.w-queue {
    display: flex;
    justify-content: space-between;
    height: 18px;
    padding: 7px;
    align-items: center;
    color: #484848;
}
.w-queue:last-of-type {
    border-radius: 0 0 5px 5px;
}
.w-queue div:first-of-type {
    display: flex; 
}
.w-amount {
    color: #EB8C24;
    font-weight: bold;
}
.w-queue:hover {
    cursor: pointer;    
    background-color: #0088CC;
    text-decoration: none;

}
.w-queue a {
    color: #484848;
    width: 200px;
}
.w-queue:hover a {
    color: white;
}

.w-queue i {
    display: none;
}
.w-queue:hover i {
    display: inline;
    font-size: 0.8rem;
    padding: 3px;
    color: white;
}
.w-queue i:hover {
    cursor: pointer;
    color: #004b71
}

.w-info-div {
    width: 120px;
    position: absolute;
    top: -4px;
    right: -145px;
    border: 4px solid #dbdbdb;
    border-radius: 8px;
    background-color: white;
    padding: 5px;
    opacity: 0;
}
.shown {
    opacity: 1;
}
.w-info-div p {
    font-size: 0.8rem;
    color: #484848;
}
.w-info-div a {
    color: #EB8C24;
}
.w-info-div a:hover {
    color: #0088CC;
}

.hackiestClassEver:hover {
    text-decoration: none;
}

`
document.body.appendChild(style);
 
let queues = [] // array of queue objects

const setStorage = () => {
  localStorage.data = JSON.stringify(queues);
}

const getStorage = () => {
  queues = JSON.parse(localStorage.data);
}

getStorage();

const Queue = function(name, queueId) {
  this.name=name; 
  this.queueId="q"+queueId;
  this.ticketCount= "-";
  this.id=queues.length;
  queues.push(this);
}

async function userData() {
  let response = await fetch('http://gbuk-ticketsystem/osticket/scp/ajax.php/queue/counts');
  let data = await response.json();
  return data;
}

const getData = function() {
  // update queue objects with latest ticket amount;
  userData().then(data => {
  queues.forEach(queue => {
    queue.ticketCount = data[queue.queueId]
    updateTickets();
  })
  console.log(queues);
 });
};

const deleteQueue = function() {
  const q = event.target.parentNode.parentNode //
  const qId = q.id;
  
  q.parentNode.removeChild(q)
  queues.splice(q.id,1);
  setStorage();
}

const createQueue = function(){
  const queueId = Number(document.getElementById('queueId').value);
  const name = document.getElementById('queueName').value;
  new Queue(name, queueId);
  console.log("Queue created! id: "+ queueId + " Name: " + name);
  renderQueues()
  setStorage();
}

const editQueue = function() {
  const editInput = prompt("New queue name: ");
  if(editInput == "") alert("Can't be empty. D'oh!")
  
  const text = event.target.parentNode.childNodes[2];
  text.innerText = editInput;
  
  setStorage();
}

const renderWidget = function(){
  const widgetDiv = document.createElement('div')
  const widgetDivContent = `

    <div class="w-container" id="wContainer">
      <div class="w-header">
        <h1>Ticket Widget</h1>
        <p>2</p>
        <i class="fas fa-info" id="infoIcon"></i>
      </div>

      <div class="w-new-queue">
        <input type="number" placeholder="id" id="queueId" max-length="4">
        <input type="text" placeholder="queue" id="queueName">
        <button id="submitQueue">Create</button>
      </div>

      <div class="w-queue-body" id="wQueueBody">

      </div>
    </div>
  `
  widgetDiv.innerHTML = widgetDivContent;
  document.body.appendChild(widgetDiv);
  
  // add listeners because userscripts suck
  document.getElementById('submitQueue').addEventListener('click', createQueue);
}; renderWidget();

const renderQueues = function(){
  const qBody = document.getElementById('wQueueBody');
  
  // empty out queuelist to prevent concatenation
  while(qBody.firstChild) qBody.removeChild(qBody.firstChild);

  // generate element for each queue
  queues.forEach(queue => {
    const qDiv = document.createElement('div')
    qDiv.id = queue.id
    qDiv.classList = "w-queue";
    const q = `
        <div><i class="fas fa-times w-delete"></i><i class="fas fa-edit w-edit"></i><a class="hackiestClassEver" href="http://gbuk-ticketsystem/osticket/scp/tickets.php?queue=${queue.id}">${queue.name}</a></div>
        <div id=${queue.queueId} class="w-amount">0</div>
        `
    qDiv.innerHTML = q;
    qBody.appendChild(qDiv);
    
    // add event listeners, because userscripts suck
    const deletes = document.getElementsByClassName('w-delete');
    for(let i = 0; i < deletes.length; i++) deletes[i].addEventListener('click', deleteQueue);
    const edits = document.getElementsByClassName('w-edit');
    for(let i = 0; i < edits.length; i++) edits[i].addEventListener('click', editQueue);
 }) 
};
renderQueues();

const renderInfoBox = function() {
  const infoDiv = document.createElement('div');
  infoDiv.id = "infoDiv"
  infoDiv.classList = "w-info-div"

  const info = `
  <p>To add a queue, find the queue id by hovering over its entry in the dropdown menues above, then look at the address that shows up at the bottom of your browser</p>
  `
  infoDiv.innerHTML = info
  document.getElementById('wContainer').appendChild(infoDiv);
};renderInfoBox(); 

const showInfo = function() {
  infoDiv = document.getElementById('infoDiv')
  infoDiv.classList.toggle('shown');
  console.log("something is happenign!!")
}

document.getElementById('infoIcon').addEventListener('mouseenter', showInfo);
document.getElementById('infoIcon').addEventListener('mouseout', showInfo);

const updateTickets = function() {
  // update DOM with ticket values
  queues.forEach(queue => {
    const q = document.getElementById(queue.queueId);
    q.innerText = queue.ticketCount;
    console.log("Updated DOM");
  })
}; 

getData(); // get data on page load

setInterval(getData, 30000);// refresh ticket values every 30s


