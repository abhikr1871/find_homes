import submissionData from '../../submission.json';

export default function Insights() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">API Insights & Discoveries</h1>
      </div>

      <div className="bg-white p-8 rounded-lg shadow space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">10 Graded Answers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Object.entries(submissionData.answers).map(([key, value]) => {
              let displayValue = String(value);
              if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                  displayValue = `[${value.length} items]`;
                } else {
                  displayValue = JSON.stringify(value);
                }
              }
              
              return (
                <div key={key} className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500 font-mono mb-1">{key}</div>
                  <div className="text-lg font-bold text-blue-600 truncate">{displayValue}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4 text-red-600">Discovered API Lies</h2>
          <div className="space-y-6">
            {submissionData.findings.map((finding: any, idx: number) => (
              <div key={idx} className="border border-red-200 bg-red-50 p-6 rounded-md">
                <h3 className="font-bold text-lg text-red-800 mb-2">{finding.category.toUpperCase()}: {finding.endpoint}</h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-bold text-red-900">What Docs Say: </span>
                    <span className="text-red-700">{finding.documented}</span>
                  </div>
                  <div>
                    <span className="font-bold text-green-900">The Actual Truth: </span>
                    <span className="text-green-700">{finding.actual}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-900">Impact on Frontend: </span>
                    <span className="text-gray-700">{finding.impact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
