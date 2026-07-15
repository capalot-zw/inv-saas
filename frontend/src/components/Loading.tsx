interface LoadingProps {
  text?: string;
}

export default function Loading({ text = 'Loading...' }: LoadingProps) {
  return (
    <div className="loading-wrap">
      <div className="spinner" />
      <span className="loading-text">{text}</span>
    </div>
  );
}