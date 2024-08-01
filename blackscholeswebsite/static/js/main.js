function updateModelValue(elementID, updatedValue) {
    const modelElement = "model".concat(elementID.charAt(0).toUpperCase() + elementID.slice(1))
    var existingValue = document.getElementById(modelElement)
    existingValue.innerHTML = updatedValue
}