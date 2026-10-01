const KEY="my_finance_tracker_v1";
let data=JSON.parse(localStorage.getItem(KEY)||'{"income":[],"expenses":[],"recurring":[]}');

const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(Number(n)||0);
const save=()=>{localStorage.setItem(KEY,JSON.stringify(data));render()};

function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function render(){
  const income=data.income.reduce((a,x)=>a+Number(x.amount),0);
  const expenses=data.expenses.reduce((a,x)=>a+Number(x.amount),0);
  const pending=data.expenses.filter(x=>!x.paid).reduce((a,x)=>a+Number(x.amount),0);
  $("incomeTotal").textContent=money(income);$("expenseTotal").textContent=money(expenses);
  $("pendingTotal").textContent=money(pending);$("balanceTotal").textContent=money(income-expenses);

  $("incomeTable").innerHTML=data.income.length?data.income.map((x,i)=>`<tr><td>${x.date}</td><td>${esc(x.concept)}</td><td>${money(x.amount)}</td><td><button class="delete" onclick="removeItem('income',${i})">Eliminar</button></td></tr>`).join(""):'<tr><td colspan="4" class="empty">Agrega tu primer ingreso.</td></tr>';

  $("expenseTable").innerHTML=data.expenses.length?data.expenses.map((x,i)=>`<tr><td>${esc(x.concept)}</td><td>${esc(x.category)}</td><td>${money(x.amount)}</td><td>${x.due}</td><td><label><input class="toggle" type="checkbox" ${x.paid?"checked":""} onchange="togglePaid(${i})"> ${x.paid?"Pagado":"Pendiente"}</label></td><td><button class="delete" onclick="removeItem('expenses',${i})">Eliminar</button></td></tr>`).join(""):'<tr><td colspan="6" class="empty">Agrega tus pagos.</td></tr>';

  $("recurringTable").innerHTML=data.recurring.length?data.recurring.map((x,i)=>`<tr><td>${esc(x.concept)}</td><td>${money(x.amount)}</td><td>${x.day}</td><td>${x.frequency}</td><td><input class="toggle" type="checkbox" ${x.active?"checked":""} onchange="toggleRecurring(${i})"></td><td><button class="delete" onclick="removeItem('recurring',${i})">Eliminar</button></td></tr>`).join(""):'<tr><td colspan="6" class="empty">Agrega tus pagos fijos.</td></tr>';

  const upcoming=data.expenses.filter(x=>!x.paid).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,8);
  $("upcoming").innerHTML=upcoming.length?upcoming.map(x=>`<div class="upcomingItem"><span><b>${esc(x.concept)}</b><br><small>${x.due} · ${esc(x.category)}</small></span><b>${money(x.amount)}</b></div>`).join(""):'<div class="empty">No tienes pagos pendientes registrados.</div>';
}
function removeItem(type,i){data[type].splice(i,1);save()}
function togglePaid(i){data.expenses[i].paid=!data.expenses[i].paid;save()}
function toggleRecurring(i){data.recurring[i].active=!data.recurring[i].active;save()}

$("incomeForm").onsubmit=e=>{e.preventDefault();data.income.push({date:$("incomeDate").value,concept:$("incomeConcept").value,amount:$("incomeAmount").value});e.target.reset();save()}
$("expenseForm").onsubmit=e=>{e.preventDefault();data.expenses.push({concept:$("expenseConcept").value,amount:$("expenseAmount").value,due:$("expenseDue").value,category:$("expenseCategory").value,paid:false});e.target.reset();save()}
$("recurringForm").onsubmit=e=>{e.preventDefault();data.recurring.push({concept:$("recurringConcept").value,amount:$("recurringAmount").value,day:$("recurringDay").value,frequency:$("recurringFrequency").value,active:true});e.target.reset();save()}

$("exportBtn").onclick=()=>{
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="finance-tracker-backup.json";a.click();URL.revokeObjectURL(a.href);
};
$("importFile").onchange=e=>{
 const f=e.target.files[0];if(!f)return;
 const r=new FileReader();r.onload=()=>{try{data=JSON.parse(r.result);save();alert("Respaldo restaurado correctamente.");}catch{alert("El archivo no es válido.");}};r.readAsText(f);
};
render();