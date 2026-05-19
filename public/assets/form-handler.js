/* ============================================================
 * AJ Commercial Group · Momentum Build
 * Form handler with GoHighLevel webhook integration
 * ============================================================
 *
 * SETUP IN GOHIGHLEVEL:
 *   1. In GHL, create a Workflow → trigger: "Inbound Webhook"
 *   2. Copy the webhook URL it generates
 *   3. Paste it into GHL_WEBHOOK_URL below
 *   4. (Optional) Add hidden custom fields in your GHL CRM that
 *      match the form_type values below — that way every form
 *      can route to a different pipeline / tag / sequence.
 *
 * Forms post JSON with these keys:
 *   - form_type     (quick_valuation | buying | selling | exchange_1031 | contact)
 *   - first_name, last_name, email, phone
 *   - all named form fields
 *   - source        ("ajcommercialgroup.com")
 *   - submitted_at  (ISO timestamp)
 *   - utm_source, utm_medium, utm_campaign, utm_content (auto-captured from URL)
 *   - referrer      (document.referrer)
 *   - page_url
 * ============================================================ */

// Post to our own /api/lead serverless function instead of GHL directly.
// The serverless function (in /api/lead.js) relays to GHL server-to-server
// — that completely sidesteps CORS issues that block browser-to-GHL POSTs.
const GHL_WEBHOOK_URL = '/api/lead';

(function () {
  // Capture UTM params on page load
  const params = new URLSearchParams(window.location.search);
  const utm = {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || ''
  };

  function showStatus(form, message, isError) {
    let status = form.querySelector('.form-status');
    if (!status) {
      status = document.createElement('div');
      status.className = 'form-status';
      form.appendChild(status);
    }
    status.textContent = message;
    status.style.cssText = 'margin-top: 18px; padding: 14px 18px; border-radius: 6px; font-size: 14px; font-weight: 500; line-height: 1.5;' +
      (isError
        ? 'background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5;'
        : 'background: #DCFCE7; color: #14532D; border: 1px solid #86EFAC;');
  }

  function serializeForm(form) {
    const data = {};
    const fd = new FormData(form);
    // Grab single-value fields
    fd.forEach((value, key) => {
      if (data[key]) {
        // multi-value field (e.g. checkboxes with same name)
        if (Array.isArray(data[key])) data[key].push(value);
        else data[key] = [data[key], value];
      } else {
        data[key] = value;
      }
    });
    // Split single 'full_name' or 'name' field into first_name + last_name for GHL.
    // Forms collect a single name field, but GHL's Create Contact wants first/last separately.
    const rawName = (data.full_name || data.name || '').toString().trim();
    if (rawName) {
      const parts = rawName.split(/\s+/);
      data.first_name = parts.slice(0, -1).join(' ') || parts[0];
      data.last_name  = parts.length > 1 ? parts[parts.length - 1] : '';
      data.name = rawName;        // keep canonical 'name' for SMS/email templates
      data.full_name = rawName;
    }
    // Add metadata
    data.form_type = form.dataset.formType || 'unknown';
    data.source = 'ajcommercialgroup.com';
    data.submitted_at = new Date().toISOString();
    data.page_url = window.location.href;
    data.referrer = document.referrer || '';
    Object.assign(data, utm);
    return data;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"], .form-submit');
    const originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
    }

    const data = serializeForm(form);
    console.log('[AJCG form] Submitting to GHL:', data);

    // POST to GoHighLevel webhook using sendBeacon when possible.
    // sendBeacon is specifically designed for fire-and-forget POSTs to a different
    // origin — no CORS preflight, content-type is set via the Blob's mime type,
    // and the browser handles delivery reliably even on page unload. This is the
    // most reliable way to ship a JSON payload to a webhook from a browser form.
    // POST to our serverless relay function. Same-origin = no CORS. The function
    // then forwards to GHL server-side, where Content-Type: application/json works
    // cleanly without any preflight or browser restrictions.
    // Fire two POSTs in parallel:
    //   1. /api/lead       — relays to GoHighLevel (legacy CRM path)
    //   2. /api/inquiries  — writes a row into our Supabase `inquiries` table
    //                        so the admin dashboard can see leads.
    // Both are fire-and-forget; we always show the user a success message.
    const inquiryPayload = {
      name: data.full_name || data.name || ((data.first_name || '') + ' ' + (data.last_name || '')).trim(),
      email: data.email || '',
      phone: data.phone || '',
      message: data.notes || data.message || '',
      source: data.form_type || 'website',
      property_slug: data.property_slug || null,
      broker_slug: data.broker_slug || null,
    };

    Promise.allSettled([
      fetch(GHL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryPayload),
      }),
    ])
      .then((results) => {
        results.forEach((r, i) => {
          const label = i === 0 ? '/api/lead' : '/api/inquiries';
          if (r.status === 'fulfilled') console.log('[AJCG form] ' + label + ' response:', r.value.status);
          else console.warn('[AJCG form] ' + label + ' error:', r.reason);
        });
        showStatus(form, 'Thanks — we got it. A real broker will reach out within one business day.', false);
        form.reset();
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });
  }

  function init() {
    document.querySelectorAll('form[data-ghl="true"]').forEach((form) => {
      form.addEventListener('submit', handleSubmit);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
