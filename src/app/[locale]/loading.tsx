
export default function Loading() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    </div>
  );
}
