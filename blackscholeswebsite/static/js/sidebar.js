const assetPrice = document.getElementById("assetPrice");
const assetPriceFeedBackArea = document.querySelector(".assetPriceFeedback");

const strikePrice = document.getElementById("strikePrice");
const strikePriceFeedBackArea = document.querySelector(".strikePriceFeedback");


const time = document.getElementById("time");
const timeFeedbackArea = document.querySelector(".timeFeedback");


const volatility = document.getElementById("volatility");
const volatilityFeedBackArea = document.querySelector(".volatilityFeedback");


const rfiRate = document.getElementById("rfiRate");
const rfiRateFeedBackArea = document.querySelector(".rfiRateFeedback");

const variables = [{
    "value": assetPrice,
    "feedBackArea": assetPriceFeedBackArea
},{
    "value": strikePrice,
    "feedBackArea": strikePriceFeedBackArea
},{
    "value": time,
    "feedBackArea": timeFeedbackArea
},{
    "value": volatility,
    "feedBackArea": volatilityFeedBackArea
},{
    "value": rfiRate,
    "feedBackArea": rfiRateFeedBackArea
}]

variables.forEach(function(variable) {
    variable.value.addEventListener("change", function(){
        validateValue(variable.value, variable.feedBackArea)
    })
})

// FIXME: Bug where you can input any number of decimals and 0s.
function validateValue(value, feedBackArea) {
    const defaultValue = 0.00;
    var inputValue = value.value;

    value.classList.remove("is-invalid");
    feedBackArea.classList.remove("is-invalid");
    feedBackArea.style.display = "none";

    if (inputValue.length > 0 && Number(inputValue)) {
        if (inputValue < defaultValue) {
            fetch("/model/validate-value", {
                method: "POST",
                body: JSON.stringify({ value: inputValue })
            })
            .then((res) => res.json())
            .then((data) => {
                if (data.value_error) {
                    value.classList.add("is-invalid");
                    feedBackArea.style.display = "block";
                    feedBackArea.innerHTML = `<p>${data.value_error}</p>`;
                }
            });
            return;
        }

        const numOfDecimals = 2;
        value.value = parseFloat(inputValue).toFixed(numOfDecimals)
        updateModelValue(value.id, value.value);
        return;
    }

    fetch("/model/validate-value", {
        method: "POST",
        body: JSON.stringify({ value: inputValue })
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.value_error) {
            value.classList.add("is-invalid");
            feedBackArea.style.display = "block";
            feedBackArea.innerHTML = `<p>${data.value_error}</p>`;
        }
    });
}