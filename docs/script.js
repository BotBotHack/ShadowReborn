const API_URL = "https://api.shadowreborn.com/submit";

const yearElement = document.querySelector("#year");
const form = document.querySelector("#text-form");
const requestInput = document.querySelector("#request");
const sendButton = document.querySelector("#send-button");
const sendStatus = document.querySelector("#send-status");

let turnstileToken = "";

if (yearElement) {
  yearElement.textContent = String(new Date().getFullYear());
}

window.onTurnstileSuccess = function onTurnstileSuccess(token) {
  turnstileToken = token;

  if (sendButton) {
    sendButton.disabled = false;
  }

  if (sendStatus) {
    sendStatus.textContent = "";
  }
};

window.onTurnstileExpired = function onTurnstileExpired() {
  turnstileToken = "";

  if (sendButton) {
    sendButton.disabled = true;
  }

  if (sendStatus) {
    sendStatus.textContent = "Проверка истекла. Пройдите капчу снова.";
  }
};

window.onTurnstileError = function onTurnstileError(errorCode) {
  turnstileToken = "";

  if (sendButton) {
    sendButton.disabled = true;
  }

  if (sendStatus) {
    sendStatus.textContent = "Не удалось пройти проверку Cloudflare.";
  }

  console.error("Turnstile error:", errorCode);
};

function resetTurnstile() {
  turnstileToken = "";

  if (sendButton) {
    sendButton.disabled = true;
  }

  if (window.turnstile) {
    window.turnstile.reset();
  }
}

if (form && requestInput && sendButton && sendStatus) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const text = requestInput.value.trim();

    if (!text) {
      sendStatus.textContent = "Введите текст.";
      requestInput.focus();
      return;
    }

    if (!turnstileToken) {
      sendStatus.textContent = "Сначала пройдите проверку Cloudflare.";
      return;
    }

    sendButton.disabled = true;
    sendStatus.textContent = "Отправка...";

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          turnstileToken,
        }),
      });

      let result = null;

      try {
        result = await response.json();
      } catch {
        throw new Error(`Сервер вернул HTTP ${response.status}`);
      }

      if (!response.ok || result.ok !== true) {
        throw new Error(result.error || `Ошибка HTTP ${response.status}`);
      }

      requestInput.value = "";
      sendStatus.textContent = "Текст отправлен.";
    } catch (error) {
      console.error(error);
      sendStatus.textContent = `Ошибка: ${error.message}`;
    } finally {
      resetTurnstile();
    }
  });
}