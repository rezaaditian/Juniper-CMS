import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"

interface LoadingPageProps {
  title?: string
  showSpinner?: boolean
  skeletonRows?: number
}

export default function LoadingPage({ title = "Loading...", showSpinner = true, skeletonRows = 3 }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          {showSpinner && (
            <div className="flex justify-center mb-6">
              <Spinner size="lg" />
            </div>
          )}
          <h1 className="text-2xl font-light text-gray-600">{title}</h1>
        </div>

        <div className="space-y-6">
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
