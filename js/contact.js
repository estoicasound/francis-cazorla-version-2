/* Shared by the real form and its executable tests. No requests, storage or tracking. */
(function (root) {
  'use strict';
  const eventTypes = ['Boda', 'Preboda', 'Postboda', 'Otro reportaje'];
  function formatDate(value) {
    if (!value) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) throw new Error('Revisad la fecha del evento.');
    const [, year, month, day] = match;
    const date = new Date(0);
    date.setUTCFullYear(Number(year), Number(month) - 1, Number(day));
    if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() !== Number(month) - 1 || date.getUTCDate() !== Number(day)) {
      throw new Error('Revisad la fecha del evento.');
    }
    return `${day}/${month}/${year}`;
  }
  function buildMessage(data) {
    const name = String(data.nombre || '').trim();
    if (!name) throw new Error('Escribid vuestros nombres para preparar la consulta.');
    const type = eventTypes.includes(data.tipo) ? data.tipo : 'Otro reportaje';
    const lines = ['Hola Francis, me gustaría consultar disponibilidad.', '', `Nombres: ${name}`, `Reportaje: ${type}`];
    const date = formatDate(data.fecha);
    if (date) lines.push(`Fecha: ${date}`);
    if (String(data.lugar || '').trim()) lines.push(`Lugar: ${data.lugar.trim()}`);
    if (String(data.mensaje || '').trim()) lines.push('', data.mensaje.trim());
    return lines.join('\n');
  }
  function buildUrl(data) {
    return 'https://wa.me/34722460059?text=' + encodeURIComponent(buildMessage(data));
  }
  function connectForm(form, browser) {
    const status = form.querySelector('#form-status');
    const name = form.elements.namedItem('nombre');
    const nameError = form.querySelector('#name-error');
    name.addEventListener('input', function () {
      name.removeAttribute('aria-invalid');
      nameError.textContent = '';
      status.textContent = '';
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      status.textContent = '';
      nameError.textContent = '';
      name.removeAttribute('aria-invalid');
      if (!name.value.trim()) {
        nameError.textContent = 'Escribid vuestros nombres para continuar.';
        name.setAttribute('aria-invalid', 'true');
        name.focus();
        return;
      }
      if (!form.reportValidity()) return;
      const data = {};
      ['nombre', 'tipo', 'fecha', 'lugar', 'mensaje'].forEach(key => { data[key] = form.elements.namedItem(key).value; });
      let url;
      try { url = buildUrl(data); }
      catch (error) { status.textContent = error.message; form.elements.namedItem('fecha').focus(); return; }
      // A synchronous, user-triggered opening works on both desktop and mobile.
      // Unlike window.open(..., 'noopener'), this lets us reliably detect a blocked popup.
      let popup = null;
      try { popup = browser.open('about:blank', '_blank'); } catch (_) { /* Same-tab fallback below. */ }
      if (popup) {
        popup.opener = null;
        popup.location.replace(url);
      } else {
        browser.location.assign(url);
      }
      status.textContent = 'WhatsApp está preparado. Solo falta pulsar «Enviar» en la conversación.';
    });
  }
  const api = { buildMessage, buildUrl, formatDate, connectForm };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FrancisContact = api;
})(typeof window !== 'undefined' ? window : globalThis);
