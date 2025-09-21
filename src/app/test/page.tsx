export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-900">
          Tailwind CSS Test
        </h1>
        <p className="mt-2 text-center text-gray-600">
          If you can see this, Tailwind CSS is working!
        </p>
        <div className="mt-6 space-y-4">
          <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Test Button
          </button>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">This is a test</span>
            <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Learn more →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
