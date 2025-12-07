import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dental-lightBlue via-white to-dental-blue">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-dental-dark mb-4">
            Consultorio Odontológico Laura Bertoni
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Tu sonrisa es nuestra prioridad
          </p>
          
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="bg-dental-dark text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="bg-white text-dental-dark border-2 border-dental-dark px-8 py-3 rounded-lg font-semibold hover:bg-dental-lightBlue transition"
            >
              Registrarse
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">🦷</div>
            <h3 className="text-xl font-bold text-dental-dark mb-2">
              Odontología General
            </h3>
            <p className="text-gray-600">
              Tratamientos completos para el cuidado de tu salud bucal
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-dental-dark mb-2">
              Estética Dental
            </h3>
            <p className="text-gray-600">
              Mejoramos la apariencia de tu sonrisa con tratamientos estéticos
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-dental-dark mb-2">
              Turnos Online
            </h3>
            <p className="text-gray-600">
              Reserva tu turno de forma rápida y sencilla desde cualquier lugar
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}