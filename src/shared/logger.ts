const colors = {
  reset: '\x1b[0m',
  fg: {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m',
  },
  bg: {
    red: '\x1b[41m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
  },
};

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelConfig: Record<LogLevel, { label: string; fg: string; bg: string }> = {
  debug: { label: 'DEBUG', fg: colors.fg.gray, bg: '' },
  info: { label: 'INFO', fg: colors.fg.blue, bg: '' },
  warn: { label: 'WARN', fg: colors.fg.yellow, bg: colors.bg.yellow },
  error: { label: 'ERROR', fg: colors.fg.red, bg: colors.bg.red },
};

function timestamp(): string {
  return new Date().toISOString();
}

export class GuildHubLogger {
  private readonly context: string;

  constructor(context: string) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, ...optional: unknown[]) {
    const cfg = levelConfig[level];
    const ts = timestamp();
    const contextStyle = `${colors.fg.cyan}${this.context}${colors.reset}`;
    const levelStyle = `${cfg.bg}${cfg.fg}${cfg.label}${colors.reset}`;
    const prefix = `${colors.fg.gray}[${ts}]${colors.reset} [${levelStyle}] [${contextStyle}]`;
    const extra = optional.length > 0 ? ' ' + optional.map((o) => JSON.stringify(o)).join(' ') : '';
    console.log(`${prefix} ${message}${extra}`);
  }

  debug(message: string, ...optional: unknown[]) {
    this.log('debug', message, ...optional);
  }

  info(message: string, ...optional: unknown[]) {
    this.log('info', message, ...optional);
  }

  warn(message: string, ...optional: unknown[]) {
    this.log('warn', message, ...optional);
  }

  error(message: string, ...optional: unknown[]) {
    this.log('error', message, ...optional);
  }
}
