//Initialize the amount for the first currency

function initializeAmount() {  
  document.getElementById('amount-one').addEventListener('input', refreshAmount); 
}

//Initialize the Swap trigger already existing in DOM

function initializeSwap() {    
  swap.addEventListener('click', () => {      
    
    const [selectOne, selectTwo] = document.querySelectorAll('.custom-select');
    const amountOne = document.getElementById('amount-one');
    const amountTwo = document.getElementById('amount-two');
     
    const [valueOne, valueTwo] = [selectOne, selectTwo].map(
        select => select.querySelector('.custom-select__option--select').dataset.value
      );
    
// Dirty trick to avoid problems when swapping currencies on the 2 DDs
// by finding the currencies not chosen by the two dropdowns
// and first selecting a third currency on the first dropdown
// before doing the actual swap

    const availableCurrencies = [];
    const chosenCurrencies = [valueOne, valueTwo];
    selectOne.querySelectorAll('.custom-select__list .custom-select__option-name').forEach((option)=>{
      availableCurrencies.push( option.innerText );
    });
    const notChosenCurrencies = availableCurrencies.filter(chosen => !chosenCurrencies.includes(chosen));
    amountOne.value = amountTwo.value
    selectOne.querySelector(`[data-value="${notChosenCurrencies[0]}"]`).click();
    selectTwo.querySelector(`[data-value="${valueOne}"]`).click();
    selectOne.querySelector(`[data-value="${valueTwo}"]`).click();  
    refreshConversionRatesAndAmount();
  });
}

//Initialize the Currency Dropdowns already defined in the DOM 

function initializeCurrencyDropdowns() {
//given the array of all .custom-select
  [...document.querySelectorAll(".custom-select")]
//map()
    .map(select => {
//inits dropdown options
      let selected = select.querySelector(".custom-select__option--select");
      if (selected) {
        select.dataset.value = selected.dataset.value;
        const placeholder = select.querySelector(".custom-select__placeholder");
        placeholder.innerHTML = "";
        const placeholderClone = selected.cloneNode(true);
        placeholderClone.classList.remove("custom-select__option--select");
        placeholder.appendChild(placeholderClone);
      }
      
//adds click event listener to the list of options
      select.querySelector(".custom-select__list").addEventListener("click", e => {               
// Logic to hide from the other DD the selected currency in this DD
//fetches information about the currently selected dropdown
        const thisDD = e.target.closest('.custom-select');
        const currencyCurrentlySelected = e.target.closest('.custom-select__option').dataset.value;    
       

//fetches information about the other dropdown
        const otherDD_id = ((thisDD.id == 'curr-one' ? 'curr-two' : 'curr-one'));
        const otherDD = document.getElementById(otherDD_id);

//removes the display-none class to all the options in the other dropdown
        otherDD.querySelectorAll('.custom-select__option').forEach((option)=>{
          option.classList.remove('display-none');
        });   
//adds the class display-none to the currently selected currency in the second dropdown    
        otherDD.querySelector(`.custom-select__option[data-value="${currencyCurrentlySelected}"]`).classList.add('display-none');       
        //-------------------------------------------------------------------------- 
      
        let target = e.target.closest(".custom-select__option");
        if (target) {
          let parent = target.closest(".custom-select");
          parent.querySelector(".custom-select__option--select").classList.remove("custom-select__option--select");
          target.classList.add("custom-select__option--select");
          let selected = parent.querySelector(".custom-select__option--select");
          parent.dataset.value = selected.dataset.value;
          const placeholder = parent.querySelector(".custom-select__placeholder");
          placeholder.innerHTML = "";
          const placeholderClone = selected.cloneNode(true);
          placeholderClone.classList.remove("custom-select__option--select");
          placeholder.appendChild(placeholderClone);
          target.closest(".custom-select").classList.remove("custom-select--drop");
        }
        
        //-------------------------------------------------------------------------- 
        
        refreshConversionRatesAndAmount();
      });  
      
//adds click event listener to the placeholder
      select.querySelector(".custom-select__placeholder").addEventListener("click", e => {
        let target = e.target.closest(".custom-select__placeholder");
        if (target) {
          target.closest(".custom-select").classList.toggle("custom-select--drop");
        }
      });
    });      
}

//Refresh the conversion rates and converted amount (and metadata)
//displayed in the respective labels

async function refreshConversionRatesAndAmount() {

  const rates = await fetchConversionRates();
  
  const currencyOne = getSelectedCurrencyOne();
  const currencyTwo = getSelectedCurrencyTwo();
  
  const rateOne = rates[currencyOne];
  const rateTwo = rates[currencyTwo];
  
  const amountOne = document.getElementById('amount-one');
  const amountTwo = document.getElementById('amount-two');
  
  const rateLabel = document.getElementById('rate');
  const ratio = (1 * rateOne.rate / rateTwo.rate).toFixed(4);
  
  function symbol(str) {
    switch (str) {
      case 'EUR':
        return '€';
      case 'USD':
        return '$';
      case 'GBP':
        return '£';
      case 'UAH':
        return '₴';
      default:
        return '?';
    }
  }
  rateLabel.innerText =  `1 ` + symbol(`${currencyOne}`) + ` = ` + `${ratio} ` + symbol(`${currencyTwo}`);
  
  amountTwo.ratio = ratio;
  const newAmount = (amountOne.value * amountTwo.ratio).toFixed(2);
  amountTwo.value = (amountOne.value !== '') ? newAmount : '';     
    
}

//Refresh the amount only 

function refreshAmount() {
  const amountOne = document.getElementById('amount-one');
  const amountTwo = document.getElementById('amount-two');  
  const newAmount = (amountOne.value * amountTwo.ratio).toFixed(2);
  amountTwo.value = (amountOne.value !== '') ? newAmount : '';      
}

//Fetch and return the conversion rates from a static url

async function fetchConversionRates() {
  const url = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';
  const response = await fetch(url);   
  const data = await response.json();  
  data.unshift({
    "txt": "Українська гривня",
    "rate": 1,
    "cc": "UAH"
  });
  const conversionRates = Object.assign({}, ...data.map((rate) => ({[rate.cc]: rate})));
  return conversionRates; 
}

//Returns the Currency code selected on the first currency dropdown

function getSelectedCurrencyOne() {
  const curr_oneDD = document.querySelector('#curr-one.custom-select');
  return curr_oneDD.textContent.trim().slice(0, 3);
}

//Returns the Currency code selected on the second currency dropdown

function getSelectedCurrencyTwo() {
  const curr_twoDD = document.querySelector('#curr-two.custom-select');
  return curr_twoDD.textContent.trim().slice(0, 3);
}

initializeAmount();
initializeSwap();
initializeCurrencyDropdowns();
refreshConversionRatesAndAmount();