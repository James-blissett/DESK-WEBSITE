export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-base-100">
      <div className="text-center">
        <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
        <p className="text-neutral/70 mt-4">Loading...</p>
      </div>
    </div>
  )
}
