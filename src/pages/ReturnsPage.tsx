export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-secondary">
        Politica de Devoluciones
      </h1>
      <p className="mt-2 text-sm text-gray-400">
        Ultima actualizacion: Febrero 2026
      </p>

      <div className="mt-8 space-y-8 text-gray-600 leading-relaxed">
        {/* 1 */}
        <section>
          <h2 className="text-xl font-semibold text-secondary">
            1. Plazo de devolucion
          </h2>
          <p className="mt-3">
            En <strong>Bengala Max</strong> aceptamos devoluciones dentro de los{' '}
            <strong>30 dias corridos</strong> a partir de la fecha de recepcion
            del producto. Pasado este plazo, lamentablemente no podremos
            aceptar devoluciones ni emitir reembolsos.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="text-xl font-semibold text-secondary">
            2. Condiciones para la devolucion
          </h2>
          <p className="mt-3">
            Para que una devolucion sea aceptada, el producto debe cumplir las
            siguientes condiciones:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1.5 pl-2">
            <li>
              Estar en su <strong>estado original</strong>, sin uso y sin danos.
            </li>
            <li>
              Conservar el <strong>embalaje original</strong>, etiquetas y
              accesorios incluidos.
            </li>
            <li>
              Incluir el <strong>comprobante de compra</strong> o numero de
              pedido.
            </li>
          </ul>
          <p className="mt-3">
            Nos reservamos el derecho de rechazar devoluciones que no cumplan
            con estas condiciones.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="text-xl font-semibold text-secondary">
            3. Productos no elegibles
          </h2>
          <p className="mt-3">
            Los siguientes productos no son elegibles para devolucion:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1.5 pl-2">
            <li>Ropa interior y trajes de bano.</li>
            <li>Productos de higiene personal abiertos o usados.</li>
            <li>
              Productos personalizados o hechos a medida.
            </li>
            <li>
              Productos en oferta o liquidacion (salvo defecto de fabrica).
            </li>
            <li>
              Tarjetas de regalo y productos digitales.
            </li>
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="text-xl font-semibold text-secondary">
            4. Proceso de devolucion
          </h2>
          <p className="mt-3">
            Para iniciar una devolucion, siga estos pasos:
          </p>
          <ol className="mt-2 list-inside list-decimal space-y-2 pl-2">
            <li>
              <strong>Contactenos</strong> por email a{' '}
              <a
                href="mailto:contacto@bengalamax.uy"
                className="text-primary hover:underline"
              >
                contacto@bengalamax.uy
              </a>{' '}
              o por telefono al +598 99 123 456, indicando su numero de pedido y
              el motivo de la devolucion.
            </li>
            <li>
              Nuestro equipo evaluara su solicitud y le confirmara si la
              devolucion es procedente dentro de las{' '}
              <strong>48 horas habiles</strong>.
            </li>
            <li>
              Una vez aprobada, le indicaremos como enviar el producto de vuelta
              a nuestro deposito en Fray Bentos o Mercedes.
            </li>
            <li>
              Al recibir el producto y verificar su estado, procederemos con el
              reembolso.
            </li>
          </ol>
        </section>

        {/* 5 */}
        <section>
          <h2 className="text-xl font-semibold text-secondary">
            5. Reembolsos
          </h2>
          <p className="mt-3">
            Una vez aprobada la devolucion y recibido el producto en nuestro
            deposito, el reembolso se procesara de la siguiente manera:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1.5 pl-2">
            <li>
              El monto se reembolsara en{' '}
              <strong>Pesos Uruguayos (UYU)</strong> al mismo medio de pago
              utilizado en la compra original.
            </li>
            <li>
              <strong>MercadoPago / dLocal Go:</strong> el reembolso se
              refleja en un plazo de 5 a 10 dias habiles, dependiendo de la
              entidad bancaria.
            </li>
            <li>
              <strong>Transferencia bancaria:</strong> el reembolso se realiza
              dentro de los 5 dias habiles siguientes a la aprobacion.
            </li>
          </ul>
          <p className="mt-3">
            El costo de envio original no es reembolsable, salvo en casos de
            error nuestro o producto defectuoso.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="text-xl font-semibold text-secondary">
            6. Productos defectuosos o con error
          </h2>
          <p className="mt-3">
            Si recibio un producto defectuoso, danado durante el envio o
            diferente al pedido, contactenos de inmediato. En estos casos:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1.5 pl-2">
            <li>
              Nos haremos cargo del costo de envio de la devolucion.
            </li>
            <li>
              Podremos ofrecer un reemplazo del producto o un reembolso
              completo, segun su preferencia y disponibilidad.
            </li>
            <li>
              Le pediremos fotos del producto recibido para documentar el
              inconveniente.
            </li>
          </ul>
        </section>

        {/* 7 */}
        <section>
          <h2 className="text-xl font-semibold text-secondary">
            7. Cambios
          </h2>
          <p className="mt-3">
            Si desea cambiar un producto por otro talle, color o modelo, el
            proceso es similar al de devolucion. Contactenos y coordinaremos el
            cambio sujeto a disponibilidad de stock. Los costos de envio del
            cambio corren por cuenta del comprador, salvo que el cambio se deba
            a un error de nuestra parte.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="text-xl font-semibold text-secondary">
            8. Contacto
          </h2>
          <p className="mt-3">
            Para iniciar una devolucion o resolver cualquier duda, contactenos:
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
            <li>
              Tambien puede escribirle a <strong>Rayitas</strong>, nuestro
              asistente virtual, a traves del chat del sitio.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
