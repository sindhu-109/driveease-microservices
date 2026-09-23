export default function Loading({ message = 'Loading…' }) {
  return (
    <div className="loading-wrapper">
      <div className="spinner" aria-label="Loading" />
      <p className="loading-text">{message}</p>
    </div>
  );
}
