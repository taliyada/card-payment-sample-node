const mercadoPagoPublicKey = document.getElementById("mercado-pago-public-key").value;
const mercadopago = new MercadoPago(mercadoPagoPublicKey);

function loadCardForm() {
    const productCost = document.getElementById('amount').value;
    const productDescription = document.getElementById('product-description').innerText;
    const payButton = document.getElementById("form-checkout__submit");
    const validationErrorMessages= document.getElementById('validation-error-messages');

    const form = document.getElementById('form-checkout');
    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const phoneNumber = document.getElementById('form-checkout__phoneNumberYape').value;
        const otp = document.getElementById('form-checkout__otpYape').value;
        const email = document.getElementById("form-checkout__cardholderEmail").value;

        //get token
        const yape = mercadopago.yape({
            otp, 
            phoneNumber
        });
        const token = await yape.create();

        //post in payments
        fetch("/process_payment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: token.id,
                paymentMethodId: 'yape',
                transactionAmount: Number(productCost),
                installments: 1,
                description: productDescription,
                payer: {
                    email
                },
            })
        })
        .then(response => {
            return response.json();
        })
        .then(result => {
            if(!result.hasOwnProperty("error_message")) {
                document.getElementById("success-response").style.display = "block";
                document.getElementById("payment-id").innerText = result.id;
                document.getElementById("payment-status").innerText = result.status;
                document.getElementById("payment-detail").innerText = result.detail;
            } else {
                document.getElementById("error-message").textContent = result.error_message;
                document.getElementById("fail-response").style.display = "block";
            }
            
            $('.container__payment').fadeOut(500);
            setTimeout(() => { $('.container__result').show(500).fadeIn(); }, 500);
        })
        .catch(error => {
            alert("Unexpected error\n"+JSON.stringify(error));
        });
    });
};

function removeFieldErrorMessages(input, validationErrorMessages) {
    Array.from(validationErrorMessages.children).forEach(child => {
        const shouldRemoveChild = child.id.includes(input.id);
        if (shouldRemoveChild) {
            validationErrorMessages.removeChild(child);
        }
    });
}

function addFieldErrorMessages(input, validationErrorMessages, error) {
    if (error) {
        input.classList.add('validation-error');
        error.forEach((e, index) => {
            const p = document.createElement('p');
            p.id = `${input.id}-${index}`;
            p.innerText = e.message;
            validationErrorMessages.appendChild(p);
        });
    } else {
        input.classList.remove('validation-error');
    }
}

function enableOrDisablePayButton(validationErrorMessages, payButton) {
    if (validationErrorMessages.children.length > 0) {
        payButton.setAttribute('disabled', true);
    } else {
        payButton.removeAttribute('disabled');
    }
}

// Handle transitions
document.getElementById('checkout-btn').addEventListener('click', function(){
    $('.container__cart').fadeOut(500);
    setTimeout(() => {
        loadCardForm();
        $('.container__payment').show(500).fadeIn();
    }, 500);
});

document.getElementById('go-back').addEventListener('click', function(){
    $('.container__payment').fadeOut(500);
    setTimeout(() => { $('.container__cart').show(500).fadeIn(); }, 500);
});

// Handle price update
function updatePrice(){
    let quantity = document.getElementById('quantity').value;
    let unitPrice = document.getElementById('unit-price').innerText;
    let amount = parseInt(unitPrice) * parseInt(quantity);

    document.getElementById('cart-total').innerText = '$ ' + amount;
    document.getElementById('summary-price').innerText = '$ ' + unitPrice;
    document.getElementById('summary-quantity').innerText = quantity;
    document.getElementById('summary-total').innerText = '$ ' + amount;
    document.getElementById('amount').value = amount;
};

document.getElementById('quantity').addEventListener('change', updatePrice);
updatePrice();
