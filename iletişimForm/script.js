const validators = {
  fullName(value) {
    const cleaned = value.trim().replace(/\s+/g, " ");
    return /^[A-Za-zÇĞİÖŞÜçğıöşü]+(?:\s+[A-Za-zÇĞİÖŞÜçğıöşü]+)+$/.test(cleaned) && cleaned.length >= 3;
  },
  email(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
  },
  phone(value) {
    const digits = value.replace(/\D/g, "");
    return value.trim() === "" || (digits.length >= 10 && digits.length <= 11);
  },
  subject(value) {
    return value.trim() !== "";
  },
  message(value) {
    const length = value.trim().length;
    return length >= 20 && length <= 500;
  },
  consent() {
    return $("#consent").is(":checked");
  },
};

const fieldLabels = {
  fullName: "Ad soyad",
  email: "E-posta",
  phone: "Telefon",
  subject: "Konu",
  message: "Mesaj",
  consent: "Onay",
};

function validateField(fieldId) {
  const $field = $(`#${fieldId}`);
  const value = $field.is(":checkbox") ? $field.prop("checked") : $field.val();
  const isValid = validators[fieldId](value || "");

  $field.toggleClass("is-valid", isValid);
  $field.toggleClass("is-invalid", !isValid);

  return isValid;
}

function checkField(fieldId) {
  const $field = $(`#${fieldId}`);
  const value = $field.is(":checkbox") ? $field.prop("checked") : $field.val();

  return validators[fieldId](value || "");
}

function updateMessageCounter() {
  const length = $("#message").val().length;
  const $counter = $("#messageCount");

  $counter.text(`${length}/500`);
  $counter.toggleClass("is-warning", length >= 400 && length < 480);
  $counter.toggleClass("is-danger", length >= 480);
}

function collectInvalidFields() {
  return Object.keys(validators).filter((fieldId) => !validateField(fieldId));
}

function updateFormStatus(showSummary = false, paintFields = false) {
  updateMessageCounter();

  const invalidFields = paintFields
    ? collectInvalidFields()
    : Object.keys(validators).filter((fieldId) => !checkField(fieldId));
  const isFormValid = invalidFields.length === 0;
  const $status = $("#formStatus");

  $status
    .toggleClass("is-valid", isFormValid)
    .toggleClass("is-invalid", !isFormValid)
    .text(isFormValid ? "Hazır" : "Eksik");

  $("#sendButton").prop("disabled", !isFormValid);

  if (showSummary && !isFormValid) {
    const listItems = invalidFields.map((fieldId) => `<li>${fieldLabels[fieldId]}</li>`).join("");
    $("#errorSummary")
      .html(`<strong>Kontrol edilmesi gereken alanlar:</strong><ul class="mb-0 mt-2">${listItems}</ul>`)
      .removeClass("d-none")
      .trigger("focus");
  } else {
    $("#errorSummary").addClass("d-none").empty();
  }

  return isFormValid;
}

function formatPhoneOnInput(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 4) {
    return digits;
  }

  if (digits.length <= 7) {
    return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  }

  if (digits.length <= 9) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
}

$(function () {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  $("#phone").on("input", function () {
    const cursorAtEnd = this.selectionStart === this.value.length;
    this.value = formatPhoneOnInput(this.value);

    if (cursorAtEnd) {
      this.setSelectionRange(this.value.length, this.value.length);
    }
  });

  $("#contactForm input, #contactForm select, #contactForm textarea").on("input change blur", function () {
    validateField(this.id);
    updateFormStatus(false);
  });

  $("#contactForm").on("submit", function (event) {
    event.preventDefault();

    if (!updateFormStatus(true, true)) {
      return;
    }

    const toastElement = document.getElementById("successToast");
    const toast = bootstrap.Toast.getOrCreateInstance(toastElement, { delay: 3500 });

    toast.show();
    this.reset();
    $("#contactForm .is-valid, #contactForm .is-invalid").removeClass("is-valid is-invalid");
    updateFormStatus(false, false);
  });

  $("#contactForm").on("reset", function () {
    window.setTimeout(() => {
      $("#contactForm .is-valid, #contactForm .is-invalid").removeClass("is-valid is-invalid");
      $("#errorSummary").addClass("d-none").empty();
      updateFormStatus(false);
    }, 0);
  });

  updateFormStatus(false);
});
