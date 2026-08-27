import './style.css';
import {
  CronConverterU2Q,
  CronDescriberU2Q,
  CronValidatorU2Q,
  getNextRuns,
} from 'cron-converter-u2q';

const RUN_COUNT = 3;
const DEBOUNCE_MS = 150;
const THEME_STORAGE_KEY = 'cron-u2q-theme';

const UNIX_EXAMPLES = ['*/15 * * * *', '0 9 * * 1-5', '5 4 * * SUN', '@daily'];
const QUARTZ_EXAMPLES = ['0 0 12 * * ?', '0 15 10 ? * MON-FRI', '0 0 0 L * ?', '0 0 12 ? * 6#3'];

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

type Theme = 'dark' | 'light';
type Source = 'unix' | 'quartz';

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element: #${id}`);
  return el as T;
}

const unixInput = byId<HTMLInputElement>('unix-input');
const quartzInput = byId<HTMLInputElement>('quartz-input');
const unixCard = byId<HTMLElement>('unix-card');
const quartzCard = byId<HTMLElement>('quartz-card');
const unixError = byId<HTMLParagraphElement>('unix-error');
const quartzError = byId<HTMLParagraphElement>('quartz-error');
const description = byId<HTMLParagraphElement>('description');
const nextRuns = byId<HTMLOListElement>('next-runs');
const timezoneLabel = byId<HTMLSpanElement>('timezone');
const activeBadge = byId<HTMLSpanElement>('active-badge');
const output = byId<HTMLElement>('output');
const swap = byId<HTMLElement>('swap');
const themeToggle = byId<HTMLButtonElement>('theme-toggle');

const relativeFormat = new Intl.RelativeTimeFormat(undefined, { numeric: 'always' });

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/* ---------- theme ---------- */

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'light' ? '#f4f5fa' : '#0a0b10');
}

themeToggle.addEventListener('click', () => {
  const next: Theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Storage unavailable (e.g. private mode) — theme still applies for this page view.
  }
  applyTheme(next);
});

/* ---------- clipboard ---------- */

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    const ok = document.execCommand('copy');
    helper.remove();
    return ok;
  }
}

function wireCopy(buttonId: string, source: HTMLInputElement): void {
  const button = byId<HTMLButtonElement>(buttonId);
  button.addEventListener('click', async () => {
    const value = source.value.trim();
    if (value === '' || button.classList.contains('copied')) return;
    if (!(await copyText(value))) return;
    button.classList.add('copied');
    window.setTimeout(() => button.classList.remove('copied'), 1400);
  });
}

/* ---------- rendering ---------- */

function showError(el: HTMLParagraphElement, input: HTMLInputElement, message: string | null): void {
  if (message === null) {
    el.textContent = '';
    el.hidden = true;
    input.classList.remove('invalid');
  } else {
    el.textContent = message;
    el.hidden = false;
    input.classList.add('invalid');
  }
}

function markActive(source: Source): void {
  swap.dataset.direction = source;
  unixCard.classList.toggle('is-editing', source === 'unix');
  quartzCard.classList.toggle('is-editing', source === 'quartz');
}

function formatRun(date: Date, withSeconds: boolean): string {
  return date.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(withSeconds ? { second: '2-digit' as const } : {}),
  });
}

function relativeFromNow(date: Date): string {
  const diff = date.getTime() - Date.now();
  const magnitude = Math.abs(diff);
  if (magnitude < HOUR_MS) return relativeFormat.format(Math.round(diff / MINUTE_MS), 'minute');
  if (magnitude < DAY_MS) return relativeFormat.format(Math.round(diff / HOUR_MS), 'hour');
  return relativeFormat.format(Math.round(diff / DAY_MS), 'day');
}

function renderNextRuns(expression: string, withSeconds: boolean): void {
  nextRuns.replaceChildren();
  let runs: Date[] = [];
  try {
    runs = getNextRuns(expression, RUN_COUNT);
  } catch {
    // The expression was validated upstream; this guards exotic edge cases.
  }
  if (runs.length === 0) {
    const li = document.createElement('li');
    li.className = 'run-empty';
    li.textContent = 'No upcoming runs found within the search window.';
    nextRuns.appendChild(li);
    return;
  }
  runs.forEach((run, index) => {
    const li = document.createElement('li');

    const marker = document.createElement('span');
    marker.className = 'run-index';
    marker.textContent = String(index + 1);

    const time = document.createElement('span');
    time.className = 'run-time';
    time.textContent = formatRun(run, withSeconds);

    const relative = document.createElement('span');
    relative.className = 'run-relative';
    relative.textContent = relativeFromNow(run);

    li.append(marker, time, relative);
    nextRuns.appendChild(li);
  });
}

function renderOutputs(kind: 'Unix' | 'Quartz', text: string, expression: string, withSeconds: boolean): void {
  activeBadge.textContent = kind;
  activeBadge.hidden = false;
  description.textContent = text;
  renderNextRuns(expression, withSeconds);
  output.classList.remove('stale');
}

function resetOutputs(): void {
  activeBadge.hidden = true;
  description.textContent = 'Type a cron expression above.';
  nextRuns.replaceChildren();
  output.classList.remove('stale');
  unixCard.classList.remove('is-editing');
  quartzCard.classList.remove('is-editing');
}

/* ---------- handlers ---------- */

function handleUnix(): void {
  const expr = unixInput.value.trim();
  if (expr === '') {
    showError(unixError, unixInput, null);
    resetOutputs();
    return;
  }
  try {
    CronValidatorU2Q.validateUnix(expr);
  } catch (err) {
    showError(unixError, unixInput, messageOf(err));
    output.classList.add('stale');
    return;
  }
  showError(unixError, unixInput, null);
  markActive('unix');

  try {
    quartzInput.value = CronConverterU2Q.unixToQuartz(expr);
    showError(quartzError, quartzInput, null);
  } catch (err) {
    showError(quartzError, quartzInput, `Not convertible — ${messageOf(err)}`);
  }

  renderOutputs('Unix', CronDescriberU2Q.describeUnix(expr), expr, false);
}

function handleQuartz(): void {
  const expr = quartzInput.value.trim();
  if (expr === '') {
    showError(quartzError, quartzInput, null);
    resetOutputs();
    return;
  }
  try {
    CronValidatorU2Q.validateQuartz(expr);
  } catch (err) {
    showError(quartzError, quartzInput, messageOf(err));
    output.classList.add('stale');
    return;
  }
  showError(quartzError, quartzInput, null);
  markActive('quartz');

  try {
    unixInput.value = CronConverterU2Q.quartzToUnix(expr);
    showError(unixError, unixInput, null);
  } catch (err) {
    showError(unixError, unixInput, `Not convertible — ${messageOf(err)}`);
  }

  const withSeconds = expr.split(/\s+/)[0] !== '0';
  renderOutputs('Quartz', CronDescriberU2Q.describeQuartz(expr), expr, withSeconds);
}

function fillExamples(containerId: string, examples: readonly string[], input: HTMLInputElement, handler: () => void): void {
  const container = byId<HTMLDivElement>(containerId);
  for (const example of examples) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip';
    button.textContent = example;
    button.addEventListener('click', () => {
      input.value = example;
      handler();
    });
    container.appendChild(button);
  }
}

let timer: number | undefined;
function debounce(handler: () => void): void {
  window.clearTimeout(timer);
  timer = window.setTimeout(handler, DEBOUNCE_MS);
}

unixInput.addEventListener('input', () => debounce(handleUnix));
quartzInput.addEventListener('input', () => debounce(handleQuartz));

fillExamples('unix-examples', UNIX_EXAMPLES, unixInput, handleUnix);
fillExamples('quartz-examples', QUARTZ_EXAMPLES, quartzInput, handleQuartz);

wireCopy('copy-unix', unixInput);
wireCopy('copy-quartz', quartzInput);

timezoneLabel.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
unixInput.value = '0 9 * * 1-5';
handleUnix();
