import { useState } from 'react';
import { Settings, CreditCard, Eye, EyeOff, Megaphone } from 'lucide-react';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import {
  useStoreSettings,
  useUpdateStoreSettings,
  usePaymentCredentials,
} from '@/hooks/useAdmin';
import { useAuthStore } from '@/stores/auth.store';

function CredentialInput({
  label,
  maskedValue,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  maskedValue: string | null;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [showField, setShowField] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium text-secondary">
        {label}
      </label>
      {maskedValue && !showField ? (
        <div className="mt-1 flex items-center gap-2">
          <span className="flex-1 rounded-lg border border-border bg-gray-50 px-3 py-2 text-sm font-mono text-gray-400">
            {maskedValue}
          </span>
          <button
            type="button"
            onClick={() => setShowField(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-gray-400 transition-colors hover:bg-gray-50 hover:text-secondary"
            title="Cambiar"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="mt-1 flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {maskedValue && (
            <button
              type="button"
              onClick={() => {
                setShowField(false);
                onChange('');
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-gray-400 transition-colors hover:bg-gray-50 hover:text-secondary"
              title="Cancelar"
            >
              <EyeOff className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  const { data: settings, isLoading, isError } = useStoreSettings();
  const updateMutation = useUpdateStoreSettings();
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const { data: paymentCreds, isLoading: credsLoading } =
    usePaymentCredentials();

  // Announcement bar state
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementDirty, setAnnouncementDirty] = useState(false);

  // MercadoPago form state
  const [mpAccessToken, setMpAccessToken] = useState('');
  const [mpPublicKey, setMpPublicKey] = useState('');
  const [mpWebhookSecret, setMpWebhookSecret] = useState('');

  // dLocal form state
  const [dlApiKey, setDlApiKey] = useState('');
  const [dlSecretKey, setDlSecretKey] = useState('');
  const [dlApiUrl, setDlApiUrl] = useState('');

  const handleToggleHideOutOfStock = () => {
    if (!settings) return;
    updateMutation.mutate({ hideOutOfStock: !settings.hideOutOfStock });
  };

  const handleSaveAnnouncement = () => {
    updateMutation.mutate({ announcementBar: announcementText }, {
      onSuccess: () => setAnnouncementDirty(false),
    });
  };

  const handleSaveMercadoPago = () => {
    const data: Record<string, string> = {};
    if (mpAccessToken) data.mpAccessToken = mpAccessToken;
    if (mpPublicKey) data.mpPublicKey = mpPublicKey;
    if (mpWebhookSecret) data.mpWebhookSecret = mpWebhookSecret;
    if (Object.keys(data).length === 0) return;
    updateMutation.mutate(data, {
      onSuccess: () => {
        setMpAccessToken('');
        setMpPublicKey('');
        setMpWebhookSecret('');
      },
    });
  };

  const handleSaveDLocal = () => {
    const data: Record<string, string> = {};
    if (dlApiKey) data.dlApiKey = dlApiKey;
    if (dlSecretKey) data.dlSecretKey = dlSecretKey;
    if (dlApiUrl) data.dlApiUrl = dlApiUrl;
    if (Object.keys(data).length === 0) return;
    updateMutation.mutate(data, {
      onSuccess: () => {
        setDlApiKey('');
        setDlSecretKey('');
        setDlApiUrl('');
      },
    });
  };

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-error">
          Error al cargar configuracion. Intenta de nuevo.
        </p>
      </div>
    );
  }

  const mpConfigured = paymentCreds?.mercadopago.accessToken != null;
  const dlConfigured = paymentCreds?.dlocal.apiKey != null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary">Configuracion</h1>
        <p className="mt-1 text-sm text-gray-400">
          Configuracion general de la tienda
        </p>
      </div>

      {/* Visibility settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-secondary">
              Visibilidad de productos
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <Skeleton variant="text" className="h-10 w-full" />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-secondary">
                  Ocultar productos sin stock
                </p>
                <p className="mt-0.5 text-sm text-gray-400">
                  Los productos sin stock disponible no se mostraran en la
                  tienda
                </p>
              </div>
              <button
                onClick={handleToggleHideOutOfStock}
                disabled={updateMutation.isPending}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
                  settings?.hideOutOfStock ? 'bg-success' : 'bg-gray-300',
                  updateMutation.isPending && 'cursor-not-allowed opacity-50',
                )}
                role="switch"
                aria-checked={settings?.hideOutOfStock ?? false}
                aria-label="Ocultar productos sin stock"
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                    settings?.hideOutOfStock
                      ? 'translate-x-[22px]'
                      : 'translate-x-[3px]',
                  )}
                />
              </button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Announcement bar */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-secondary">
              Barra de anuncios
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <Skeleton variant="text" className="h-10 w-full" />
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-secondary">
                  Mensaje
                </label>
                <input
                  type="text"
                  value={announcementDirty ? announcementText : (announcementText || settings?.announcementBar || '')}
                  onChange={(e) => {
                    setAnnouncementText(e.target.value);
                    setAnnouncementDirty(true);
                  }}
                  placeholder="Ej: Envio gratis en compras mayores a $3.000"
                  className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Dejar vacio para ocultar la barra
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSaveAnnouncement}
                  disabled={updateMutation.isPending || !announcementDirty}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Payment credentials — SUPER_ADMIN only */}
      {isSuperAdmin && (
        <>
          {/* MercadoPago */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <h2 className="font-semibold text-secondary">MercadoPago</h2>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-medium',
                      mpConfigured
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-500',
                    )}
                  >
                    {mpConfigured ? 'Configurado' : 'Sin configurar'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {settings?.mpEnabled ? 'Activo' : 'Inactivo'}
                  </span>
                  <button
                    onClick={() => updateMutation.mutate({ mpEnabled: !settings?.mpEnabled })}
                    disabled={updateMutation.isPending}
                    className={cn(
                      'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
                      settings?.mpEnabled ? 'bg-success' : 'bg-gray-300',
                      updateMutation.isPending && 'cursor-not-allowed opacity-50',
                    )}
                    role="switch"
                    aria-checked={settings?.mpEnabled ?? false}
                    aria-label="Activar MercadoPago"
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                        settings?.mpEnabled ? 'translate-x-[22px]' : 'translate-x-[3px]',
                      )}
                    />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {credsLoading ? (
                <div className="space-y-3">
                  <Skeleton variant="text" className="h-10 w-full" />
                  <Skeleton variant="text" className="h-10 w-full" />
                  <Skeleton variant="text" className="h-10 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <CredentialInput
                    label="Access Token"
                    maskedValue={paymentCreds?.mercadopago.accessToken ?? null}
                    placeholder="APP_USR-..."
                    value={mpAccessToken}
                    onChange={setMpAccessToken}
                  />
                  <CredentialInput
                    label="Public Key"
                    maskedValue={paymentCreds?.mercadopago.publicKey ?? null}
                    placeholder="APP_USR-..."
                    value={mpPublicKey}
                    onChange={setMpPublicKey}
                  />
                  <CredentialInput
                    label="Webhook Secret"
                    maskedValue={
                      paymentCreds?.mercadopago.webhookSecret ?? null
                    }
                    placeholder="Secreto del webhook"
                    value={mpWebhookSecret}
                    onChange={setMpWebhookSecret}
                  />
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSaveMercadoPago}
                      disabled={
                        updateMutation.isPending ||
                        (!mpAccessToken && !mpPublicKey && !mpWebhookSecret)
                      }
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {updateMutation.isPending
                        ? 'Guardando...'
                        : 'Guardar MercadoPago'}
                    </button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* dLocal Go */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  <h2 className="font-semibold text-secondary">dLocal Go</h2>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-medium',
                      dlConfigured
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-500',
                    )}
                  >
                    {dlConfigured ? 'Configurado' : 'Sin configurar'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {settings?.dlEnabled ? 'Activo' : 'Inactivo'}
                  </span>
                  <button
                    onClick={() => updateMutation.mutate({ dlEnabled: !settings?.dlEnabled })}
                    disabled={updateMutation.isPending}
                    className={cn(
                      'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
                      settings?.dlEnabled ? 'bg-success' : 'bg-gray-300',
                      updateMutation.isPending && 'cursor-not-allowed opacity-50',
                    )}
                    role="switch"
                    aria-checked={settings?.dlEnabled ?? false}
                    aria-label="Activar dLocal Go"
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
                        settings?.dlEnabled ? 'translate-x-[22px]' : 'translate-x-[3px]',
                      )}
                    />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {credsLoading ? (
                <div className="space-y-3">
                  <Skeleton variant="text" className="h-10 w-full" />
                  <Skeleton variant="text" className="h-10 w-full" />
                  <Skeleton variant="text" className="h-10 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <CredentialInput
                    label="API Key"
                    maskedValue={paymentCreds?.dlocal.apiKey ?? null}
                    placeholder="Tu API Key de dLocal Go"
                    value={dlApiKey}
                    onChange={setDlApiKey}
                  />
                  <CredentialInput
                    label="Secret Key"
                    maskedValue={paymentCreds?.dlocal.secretKey ?? null}
                    placeholder="Tu Secret Key de dLocal Go"
                    value={dlSecretKey}
                    onChange={setDlSecretKey}
                  />
                  <div>
                    <label className="block text-sm font-medium text-secondary">
                      API URL
                    </label>
                    <input
                      type="text"
                      value={
                        dlApiUrl || paymentCreds?.dlocal.apiUrl || ''
                      }
                      onChange={(e) => setDlApiUrl(e.target.value)}
                      placeholder="https://api-sbx.dlocalgo.com/v1"
                      className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Sandbox: https://api-sbx.dlocalgo.com/v1 — Produccion:
                      https://api.dlocalgo.com/v1
                    </p>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleSaveDLocal}
                      disabled={
                        updateMutation.isPending ||
                        (!dlApiKey && !dlSecretKey && !dlApiUrl)
                      }
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {updateMutation.isPending
                        ? 'Guardando...'
                        : 'Guardar dLocal Go'}
                    </button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
