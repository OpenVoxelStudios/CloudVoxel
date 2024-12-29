export default function FileSkeletonLoader() {
    return (
        <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center space-x-4">
                <div className="bg-gray-700 p-2 rounded-lg w-10 h-10 animate-pulse"></div>
                <div>
                    <div className="h-4 bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
                    <div className="flex space-x-4">
                        <div className="h-3 bg-gray-700 rounded w-12 animate-pulse"></div>
                        <div className="h-3 bg-gray-700 rounded w-24 animate-pulse"></div>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-4 mr-2">
                <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
                <div className="h-8 bg-gray-700 rounded w-24 animate-pulse"></div>
            </div>
        </div>
    )
}
