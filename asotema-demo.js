const savings = document.querySelector("#asotema-savings");
const principal = document.querySelector("#asotema-principal");
const deposit = document.querySelector("#asotema-deposit");
const pay = document.querySelector("#asotema-pay");
const reset = document.querySelector("#asotema-reset");

const initialSavings = 100;
const contribution = 20;
const installmentPrincipal = 20;
const installmentInterest = 1;
const installments = 3;
const initialPrincipal = installments * installmentPrincipal;

let deposited = false;
let paid = 0;

function render() {
  const balance = initialSavings + (deposited ? contribution : 0);
  const outstanding = initialPrincipal - paid * installmentPrincipal;
  savings.textContent = "$" + balance;
  principal.textContent = "$" + outstanding;
  savings.parentElement.style.setProperty("--level", balance / (initialSavings + contribution));
  principal.parentElement.style.setProperty("--level", outstanding / initialPrincipal);
  deposit.setAttribute("aria-disabled", String(deposited));
  pay.setAttribute("aria-disabled", String(paid === installments));
  reset.setAttribute("aria-disabled", String(!deposited && paid === 0));
}

deposit.addEventListener("click", () => {
  if (deposited) return;
  deposited = true;
  render();
});

pay.addEventListener("click", () => {
  if (paid === installments) return;
  paid++;
  render();
});

reset.addEventListener("click", () => {
  deposited = false;
  paid = 0;
  render();
});

deposit.querySelector("strong").textContent = "$" + contribution;
pay.querySelector("strong").textContent = "$" + (installmentPrincipal + installmentInterest);
render();
for (const button of [deposit, pay, reset]) button.disabled = false;
