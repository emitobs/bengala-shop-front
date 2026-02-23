export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-secondary">
        Politica de Privacidad
      </h1>
      <p className="mt-2 text-sm text-gray-400">
        Ultima actualizacion: Febrero 2026
      </p>

      <div className="mt-8 space-y-8 text-gray-600 leading-relaxed">
        {/* 1 */}
        <section>
          <h2 className="text-xl font-semibold text-secondary">
            1. Introduccion
          </h2>
          <p className="mt-3">
            En <strong>Bengala Max</strong> nos comprometemos a proteger la
            privacidad de nuestros usuarios. Esta Politica de Privacidad
            describe como recopilamos, utilizamos, almacenamos y protegemos su
            informacion personal cuando utiliza nuestro sitio web y servicios.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-xl font-semibold text-secondary">
            2. Datos que recopilamos
          </h2>
          <p className="mt-3">
            Recopilamos los siguientes datos personales cuando usted se registra
            o realiza una compra:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1.5 pl-2">
            <li>
              <strong>Datos de identificacion:</strong> nombre, apellido y
              cedula de identidad (cuando aplica).
            </li>
            <li>
              <strong>Datos de contacto:</strong> direccion de correo
              electronico y numero de telefono.
            </li>
            <li>
              <strong>Datos de envio:</strong> direccion postal, departamento,
              localidad y codigo postal.
            </li>
            <li>
              <strong>Datos de navegacion:</strong> direccion IP, tipo de
              navegador, paginas visitadas y tiempo de permanencia.
            </li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-xl font-semibold text-secondary">
            3. Uso de la informacion
          </h2>
          <p className="mt-3">
            Utilizamos su informacion personal para los siguientes fines:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1.5 pl-2">
            <li>Procesar y gestionar sus pedidos y envios.</li>
            <li>
              Comunicarnos con usted sobre el estado de sus compras y consultas.
            </li>
            <li>
              Enviar notificaciones sobre ofertas, promociones y novedades
              (unicamente si usted ha dado su consentimiento).
            </li>
            <li>
              Mejorar nuestro sitio web y la experiencia de usuario mediante el
              analisis de datos de navegacion.
            </li>
            <li>Prevenir fraudes y garantizar la seguridad del sitio.</li>
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-xl font-semibold text-secondary">
            4. Cookies y tecnologias de seguimiento
          </h2>
          <p className="mt-3">
            Nuestro sitio utiliza cookies y tecnologias similares para mejorar
            la experiencia de navegacion. Las cookies nos permiten recordar sus
            preferencias, mantener su sesion activa y analizar el trafico del
            sitio.
          </p>
          <p className="mt-3">
            Usted puede configurar su navegador para rechazar cookies, aunque
            esto podria limitar algunas funcionalidades del sitio.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-xl font-semibold text-secondary">
            5. Compartir informacion con terceros
          </h2>
          <p className="mt-3">
            No vendemos ni alquilamos su informacion personal a terceros.
            Compartimos datos unicamente con:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1.5 pl-2">
            <li>
              <strong>Procesadores de pago:</strong> MercadoPago y dLocal Go,
              para procesar sus transacciones de forma segura.
            </li>
            <li>
              <strong>Servicios de envio:</strong> empresas de logistica para
              coordinar la entrega de sus pedidos.
            </li>
            <li>
              <strong>Servicios de analytics:</strong> herramientas de analisis
              web para mejorar el rendimiento del sitio (datos anonimizados).
            </li>
          </ul>
          <p className="mt-3">
            Estos terceros estan obligados a proteger su informacion y
            utilizarla unicamente para los fines especificados.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-xl font-semibold text-secondary">
            6. Seguridad de los datos
          </h2>
          <p className="mt-3">
            Implementamos medidas de seguridad tecnicas y organizativas para
            proteger su informacion personal contra acceso no autorizado,
            alteracion, divulgacion o destruccion. Esto incluye el uso de
            encriptacion SSL/TLS para la transmision de datos sensibles.
          </p>
          <p className="mt-3">
            No almacenamos datos de tarjetas de credito ni informacion
            financiera sensible en nuestros servidores. Toda la informacion de
            pago es procesada directamente por nuestros proveedores de pago
            certificados.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="text-xl font-semibold text-secondary">
            7. Sus derechos
          </h2>
          <p className="mt-3">
            De acuerdo con la legislacion uruguaya (Ley N° 18.331 de Proteccion
            de Datos Personales), usted tiene derecho a:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1.5 pl-2">
            <li>
              <strong>Acceso:</strong> solicitar informacion sobre los datos
              personales que tenemos sobre usted.
            </li>
            <li>
              <strong>Rectificacion:</strong> corregir datos personales
              inexactos o incompletos.
            </li>
            <li>
              <strong>Eliminacion:</strong> solicitar la eliminacion de sus
              datos personales cuando ya no sean necesarios.
            </li>
            <li>
              <strong>Oposicion:</strong> oponerse al tratamiento de sus datos
              para fines de marketing directo.
            </li>
          </ul>
          <p className="mt-3">
            Para ejercer estos derechos, contactenos a{' '}
            <a
              href="mailto:contacto@bengalamax.uy"
              className="text-primary hover:underline"
            >
              contacto@bengalamax.uy
            </a>
            .
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="text-xl font-semibold text-secondary">
            8. Retencion de datos
          </h2>
          <p className="mt-3">
            Conservamos su informacion personal durante el tiempo necesario para
            cumplir con los fines descritos en esta politica, o segun lo
            requiera la legislacion aplicable. Los datos de cuenta se conservan
            mientras su cuenta este activa. Los datos de transacciones se
            conservan por el periodo exigido por las normas fiscales y
            contables de Uruguay.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="text-xl font-semibold text-secondary">
            9. Cambios en esta politica
          </h2>
          <p className="mt-3">
            Nos reservamos el derecho de actualizar esta Politica de Privacidad
            en cualquier momento. Cualquier cambio sera publicado en esta pagina
            con la fecha de actualizacion correspondiente. Le recomendamos
            revisar esta politica periodicamente.
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="text-xl font-semibold text-secondary">
            10. Contacto
          </h2>
          <p className="mt-3">
            Si tiene preguntas o inquietudes sobre nuestra Politica de
            Privacidad, puede contactarnos a traves de:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1.5 pl-2">
            <li>
              Email:{' '}
              <a
                href="mailto:contacto@bengalamax.uy"
                className="text-primary hover:underline"
              >
                contacto@bengalamax.uy
              </a>
            </li>
            <li>Telefono: +598 99 123 456</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
