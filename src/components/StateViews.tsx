import { nl } from '../i18n/nl';

/** Gedeelde lege/laad-/foutweergaven met consistente Nederlandse teksten. */

export function LoadingView({ label }: { label?: string }) {
  return (
    <div className="state-view">
      <div className="spinner" aria-hidden />
      {label ? <p className="state-text">{label}</p> : null}
    </div>
  );
}

export function EmptyView({
  title,
  hint,
  emoji = '🔭',
}: {
  title: string;
  hint?: string;
  emoji?: string;
}) {
  return (
    <div className="state-view">
      <div className="state-emoji">{emoji}</div>
      <h3 className="state-title">{title}</h3>
      {hint ? <p className="state-text">{hint}</p> : null}
    </div>
  );
}

export function ErrorView({
  message,
  hint,
  onRetry,
}: {
  message?: string;
  hint?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="state-view">
      <div className="state-emoji">⚠️</div>
      <h3 className="state-title">{message ?? nl.errors.generic}</h3>
      <p className="state-text">{hint ?? nl.errors.genericHint}</p>
      {onRetry ? (
        <button className="btn-primary" onClick={onRetry}>
          {nl.errors.retry}
        </button>
      ) : null}
    </div>
  );
}
