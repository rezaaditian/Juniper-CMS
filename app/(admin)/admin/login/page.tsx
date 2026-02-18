import LoginForm from "./LoginForm"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Juniper</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
