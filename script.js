// ---------- 1. Categories (name, emoji, color) ----------
var categories = [
  { name: "Food", emoji: "🍛", color: "#ff8a3d" },
  { name: "Snacks", emoji: "🍟", color: "#f5b82e" },
  { name: "Books", emoji: "📚", color: "#3b6cf6" },
  { name: "Stationery", emoji: "✏️", color: "#8b5cf6" },
  { name: "Travel", emoji: "🚌", color: "#14b8c4" },
  { name: "Laundry", emoji: "👕", color: "#22b573" },
  { name: "Recharge", emoji: "📱", color: "#ec4899" },
  { name: "Fun", emoji: "🎮", color: "#ef4565" },
  { name: "Health", emoji: "💊", color: "#64748b" },
  { name: "Other", emoji: "📦", color: "#94a3b8" }
];

// ---------- 2. Get elements ----------
var budgetInput = document.getElementById("budgetInput");
var saveBudgetBtn = document.getElementById("saveBudgetBtn");
var budgetText = document.getElementById("budgetText");
var spentText = document.getElementById("spentText");
var leftText = document.getElementById("leftText");
var dailyLimitText = document.getElementById("dailyLimitText");
var dailyAvgText = document.getElementById("dailyAvgText");
var barFill = document.getElementById("barFill");
var message = document.getElementById("message");

var titleInput = document.getElementById("titleInput");
var amountInput = document.getElementById("amountInput");
var dateInput = document.getElementById("dateInput");
var splitInput = document.getElementById("splitInput");
var splitDetails = document.getElementById("splitDetails");
var peopleInput = document.getElementById("peopleInput");
var paidByInput = document.getElementById("paidByInput");
var sharePreview = document.getElementById("sharePreview");
var addBtn = document.getElementById("addBtn");
var errorText = document.getElementById("error");

var categoryChips = document.getElementById("categoryChips");
var filterChips = document.getElementById("filterChips");
var categoryList = document.getElementById("categoryList");
var expenseList = document.getElementById("expenseList");
var owedToMe = document.getElementById("owedToMe");
var iOwe = document.getElementById("iOwe");
var clearBtn = document.getElementById("clearBtn");

// ---------- 3. Data ----------
var budget = 0;
var expenses = [];
var selectedCategory = 0;   // index of the chosen category chip
var filter = "All";         // which category the list is showing

// ---------- 4. Save and load ----------
function saveData() {
  localStorage.setItem("budget", budget);
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function loadData() {
  var savedBudget = localStorage.getItem("budget");
  var savedExpenses = localStorage.getItem("expenses");
  if (savedBudget !== null) {
    budget = Number(savedBudget);
  }
  if (savedExpenses !== null) {
    expenses = JSON.parse(savedExpenses);
  }
}

// ---------- 5. Small helpers ----------
function money(x) {
  return Math.round(x * 100) / 100;
}

function getCategory(name) {
  for (var i = 0; i < categories.length; i++) {
    if (categories[i].name === name) {
      return categories[i];
    }
  }
  return categories[categories.length - 1];
}

function getTotalSpent() {
  var total = 0;
  for (var i = 0; i < expenses.length; i++) {
    total = total + expenses[i].share;
  }
  return money(total);
}

// ---------- 6. Category chips (add form) and filter chips ----------
function makeCategoryChips() {
  categoryChips.innerHTML = "";
  for (var i = 0; i < categories.length; i++) {
    var c = categories[i];
    var btn = document.createElement("button");
    btn.className = "chip";
    btn.textContent = c.emoji + " " + c.name;
    if (i === selectedCategory) {
      btn.className = "chip selected";
      btn.style.background = c.color;
      btn.style.borderColor = c.color;
    }
    btn.setAttribute("onclick", "chooseCategory(" + i + ")");
    categoryChips.appendChild(btn);
  }
}

function makeFilterChips() {
  filterChips.innerHTML = "";

  var allBtn = document.createElement("button");
  allBtn.className = "chip";
  allBtn.textContent = "All";
  if (filter === "All") {
    allBtn.className = "chip selected";
    allBtn.style.background = "#232a3b";
    allBtn.style.borderColor = "#232a3b";
  }
  allBtn.setAttribute("onclick", "chooseFilter('All')");
  filterChips.appendChild(allBtn);

  for (var i = 0; i < categories.length; i++) {
    var c = categories[i];
    var btn = document.createElement("button");
    btn.className = "chip";
    btn.textContent = c.emoji + " " + c.name;
    if (filter === c.name) {
      btn.className = "chip selected";
      btn.style.background = c.color;
      btn.style.borderColor = c.color;
    }
    btn.setAttribute("onclick", "chooseFilter('" + c.name + "')");
    filterChips.appendChild(btn);
  }
}

function chooseCategory(i) {
  selectedCategory = i;
  makeCategoryChips();
}

function chooseFilter(name) {
  filter = name;
  makeFilterChips();
  showExpenses();
}

// ---------- 7. Summary, daily figures, bar ----------
function showSummary() {
  var spent = getTotalSpent();
  var left = money(budget - spent);

  budgetText.textContent = "₹" + budget;
  spentText.textContent = "₹" + spent;
  leftText.textContent = "₹" + left;

  // days in this month, today's date, days remaining (including today)
  var today = new Date();
  var daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  var dayNumber = today.getDate();
  var daysLeft = daysInMonth - dayNumber + 1;

  var dailyLimit = 0;
  if (left > 0) {
    dailyLimit = money(left / daysLeft);
  }
  var dailyAvg = money(spent / dayNumber);

  dailyLimitText.textContent = "₹" + dailyLimit;

  if (budget === 0) {
    dailyAvgText.textContent = "";
  } else {
    dailyAvgText.textContent = "Your daily average so far is ₹" + dailyAvg +
      ". With " + daysLeft + " day(s) left this month, try to keep each day under ₹" + dailyLimit + ".";
  }

  // progress bar
  var percent = 0;
  if (budget > 0) {
    percent = (spent / budget) * 100;
  }
  if (percent > 100) {
    percent = 100;
  }
  barFill.style.width = percent + "%";

  message.className = "";
  if (budget === 0) {
    message.textContent = "Save a budget to get started.";
  } else if (spent > budget) {
    message.textContent = "Over budget by ₹" + money(spent - budget) + "!";
    message.className = "over";
    barFill.style.background = "#ef4565";
  } else if (percent >= 80) {
    message.textContent = "Careful, " + Math.round(percent) + "% of your budget is used.";
    message.className = "warn";
    barFill.style.background = "#f5b82e";
  } else {
    message.textContent = "You are on track. " + Math.round(percent) + "% used.";
    message.className = "ok";
    barFill.style.background = "#22b573";
  }
}

// ---------- 8. Who owes whom ----------
function showBalances() {
  var toMe = 0;
  var fromMe = 0;

  for (var i = 0; i < expenses.length; i++) {
    var e = expenses[i];
    if (e.people > 1 && e.settled === false) {
      if (e.paidBy === "me") {
        toMe = toMe + (e.amount - e.share);
      } else {
        fromMe = fromMe + e.share;
      }
    }
  }
  owedToMe.textContent = "₹" + money(toMe);
  iOwe.textContent = "₹" + money(fromMe);
}

// ---------- 9. Spending by category (colored bars) ----------
function showCategories() {
  categoryList.innerHTML = "";
  var spent = getTotalSpent();

  for (var i = 0; i < categories.length; i++) {
    var c = categories[i];
    var total = 0;
    for (var j = 0; j < expenses.length; j++) {
      if (expenses[j].category === c.name) {
        total = total + expenses[j].share;
      }
    }
    total = money(total);

    var percent = 0;
    if (spent > 0) {
      percent = (total / spent) * 100;
    }

    var row = document.createElement("div");
    row.className = "cat-row";
    row.innerHTML =
      "<div class='cat-top'><span>" + c.emoji + " " + c.name + "</span><strong>₹" + total + "</strong></div>" +
      "<div class='cat-bar'><div class='cat-fill' style='width:" + percent + "%; background:" + c.color + "'></div></div>";
    categoryList.appendChild(row);
  }
}

// ---------- 10. Expense list ----------
function showExpenses() {
  expenseList.innerHTML = "";
  var shown = 0;

  for (var i = 0; i < expenses.length; i++) {
    var e = expenses[i];
    if (filter !== "All" && e.category !== filter) {
      continue;
    }

    var c = getCategory(e.category);
    var li = document.createElement("li");
    li.style.borderLeftColor = c.color;
    if (e.settled === true) {
      li.className = "settled";
    }

    var info = e.title + "<small>" + c.emoji + " " + e.category + " · " + e.date;
    var right = "<span class='item-amount'>₹" + e.share + "</span>";

    if (e.people > 1) {
      info = info + " · split with " + e.splitWith + " (" + e.people + " people, paid ₹" + e.amount + ")";
      if (e.paidBy === "me") {
        info = info + " · " + (e.settled ? "settled" : "they owe you ₹" + money(e.amount - e.share));
      } else {
        info = info + " · " + (e.settled ? "settled" : "you owe ₹" + e.share);
      }
      if (e.settled === false) {
        right = right + "<button class='mini-btn settle-btn' onclick='settleExpense(" + i + ")'>Settle</button>";
      }
    }
    info = info + "</small>";

    right = right + "<button class='mini-btn delete-btn' onclick='deleteExpense(" + i + ")'>Delete</button>";
    li.innerHTML = "<div class='item-info'>" + info + "</div><div class='item-right'>" + right + "</div>";
    expenseList.appendChild(li);
    shown++;
  }

  if (shown === 0) {
    expenseList.innerHTML = "<li class='empty'>Nothing here yet. Add an expense above.</li>";
  }
}

function updateScreen() {
  showSummary();
  showBalances();
  showCategories();
  showExpenses();
}

// ---------- 11. Split preview ----------
function updateSplitForm() {
  if (splitInput.value === "Just me") {
    splitDetails.className = "hidden";
    return;
  }
  splitDetails.className = "";

  var amount = Number(amountInput.value);
  var people = Number(peopleInput.value);
  if (amount > 0 && people >= 2) {
    sharePreview.textContent = "Each person pays ₹" + money(amount / people) + ".";
  } else {
    sharePreview.textContent = "";
  }
}

// ---------- 12. Button actions ----------
function saveBudget() {
  var value = Number(budgetInput.value);
  if (value <= 0) {
    message.textContent = "Please enter a budget greater than 0.";
    return;
  }
  budget = value;
  budgetInput.value = "";
  saveData();
  updateScreen();
}

function addExpense() {
  var title = titleInput.value.trim();
  var amount = Number(amountInput.value);
  var date = dateInput.value;
  var splitWith = splitInput.value;
  var people = 1;
  var paidBy = "me";

  if (title === "") {
    errorText.textContent = "Please write what the expense was for.";
    return;
  }
  if (amount <= 0) {
    errorText.textContent = "Please enter an amount greater than 0.";
    return;
  }
  if (date === "") {
    errorText.textContent = "Please pick a date.";
    return;
  }

  if (splitWith !== "Just me") {
    people = Number(peopleInput.value);
    paidBy = paidByInput.value;
    if (people < 2) {
      errorText.textContent = "Splitting needs at least 2 people.";
      return;
    }
  }
  errorText.textContent = "";

  var newExpense = {
    title: title,
    amount: amount,
    share: money(amount / people),
    people: people,
    splitWith: splitWith,
    paidBy: paidBy,
    category: categories[selectedCategory].name,
    date: date,
    settled: false
  };
  expenses.push(newExpense);

  titleInput.value = "";
  amountInput.value = "";
  splitInput.value = "Just me";
  updateSplitForm();

  saveData();
  updateScreen();
}

function settleExpense(index) {
  expenses[index].settled = true;
  saveData();
  updateScreen();
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  saveData();
  updateScreen();
}

function clearAll() {
  var sure = confirm("Delete all expenses? This cannot be undone.");
  if (sure) {
    expenses = [];
    saveData();
    updateScreen();
  }
}

// ---------- 13. Connect buttons and inputs ----------
saveBudgetBtn.addEventListener("click", saveBudget);
addBtn.addEventListener("click", addExpense);
clearBtn.addEventListener("click", clearAll);
splitInput.addEventListener("change", updateSplitForm);
amountInput.addEventListener("input", updateSplitForm);
peopleInput.addEventListener("input", updateSplitForm);

// ---------- 14. Start ----------
dateInput.value = new Date().toISOString().split("T")[0];
loadData();
makeCategoryChips();
makeFilterChips();
updateScreen();
