// src/SkeletonClaimCard.jsx
export default function SkeletonClaimCard() {
  return (
    <div className="bg-white rounded-xl border border-blue-100 p-5 shadow-sm animate-pulse">
      <div className="h-4 w-2/3 bg-blue-100 rounded mb-3" />
      <div className="h-3 w-full bg-blue-50 rounded mb-2" />
      <div className="h-3 w-5/6 bg-blue-50 rounded mb-4" />
      <div className="h-3 w-24 bg-blue-100 rounded" />
    </div>
  );
}
