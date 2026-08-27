import './style.css';
import {
  CronConverterU2Q,
  CronDescriberU2Q,
  CronValidatorU2Q,
  getNextRuns,
} from 'cron-converter-u2q';

const RUN_COUNT = 3;
const DEBOUNCE_MS = 150;

const UNIX_EXAMPLES = ['*/15 * * * *', '0 9 * * 1-5', '5 4 * * SUN', '@daily'];
const QUARTZ_EXAMPLES = ['0 0 12 * * ?', '0 15 10 ? * MON-FRI', '0 0 0 L * ?', '0 0 12 ? * 6#3'];

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element: #${id}`);
  return el as T;
}

const unixInput = byId<HTMLInputElement>('unix-input');
const quartzInput = byId<HTMLInputElement>('quartz-input');
const unixError = byId<HTMLParagraphElement>('unix-error');
const quartzError = byId<HTMLParagraphElement>('quartz-error');
const description = byId<HTMLParagraphElement>('description');
const nextRuns = byId<HTMLOListElement>('next-runs');
const timezoneLabel = byId<HTMLSpanElement>('timezone');
const activeBadge = byId<HTMLSpanElement>('active-badge');
const output = byId<HTMLElement>('output');

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

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
    li.textContent = 'No upcoming runs found within the search window.';
    nextRuns.appendChild(li);
    return;
  }
  for (const run of runs) {
    const li = document.createElement('li');
    li.textContent = formatRun(run, withSeconds);
    nextRuns.appendChild(li);
  }
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
}

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

timezoneLabel.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
unixInput.value = '0 9 * * 1-5';
handleUnix();
