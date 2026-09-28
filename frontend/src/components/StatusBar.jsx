export default function StatusBar({ loading, error, hasResult }) {
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-xl border border-meet-line bg-meet-input p-3 text-center">
        <p className="text-sm font-medium text-meet-purpleLight">Processing audio... please wait.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-xl border border-red-500/40 bg-meet-input p-3 text-center">
        <p className="text-sm font-medium text-red-300">{error}</p>
      </div>
    );
  }

  if (hasResult) {
    return (
      <div className="mx-auto w-full max-w-3xl text-center">
        <p className="text-lg font-medium text-meet-purpleLight">✔ Completed ✔</p>
      </div>
    );
  }

  return null;
}
